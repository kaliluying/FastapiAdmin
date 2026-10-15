import asyncio
import json
from contextlib import asynccontextmanager
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.core.base_schema import AuthSchema
from app.plugin.module_ai.chat import rag, service, stream, usage
from app.plugin.module_ai.chat.schema import ChatQuerySchema


def test_sse_auth_validation_and_event_framing(ai_client, auth_headers, monkeypatch):
    called = []

    async def query(self, query, structured=False):
        called.append((self.auth.user.id, structured, self.auth.check_data_scope))
        yield {"type": "chunk", "content": "中文\n回答"}
        yield {"type": "done", "session_id": "saved-session"}

    monkeypatch.setattr(stream.ChatService, "chat_query", query)
    body = {"message": "问题", "request_id": "sse-1"}
    assert ai_client.post("/ai/chat/stream", json=body).status_code == 401
    assert ai_client.post("/ai/chat/stream", headers=auth_headers, json={**body, "message": ""}).status_code == 422
    response = ai_client.post("/ai/chat/stream", headers=auth_headers, json=body)
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")
    assert response.headers["x-accel-buffering"] == "no"
    events = [json.loads(line[6:]) for line in response.text.splitlines() if line.startswith("data: ")]
    assert events == [{"type": "chunk", "content": "中文\n回答", "request_id": "sse-1"}, {"type": "done", "session_id": "saved-session", "request_id": "sse-1"}]
    assert len(called) == 1 and called[0][1:] == (True, True)


@pytest.mark.parametrize("slow", [True, False])
async def test_sse_disconnect_cancels_provider_and_closes_session(monkeypatch, slow):
    closed = []
    chunks = []

    @asynccontextmanager
    async def database():
        try:
            yield object()
        finally:
            closed.append("db")

    async def query(self, query, structured=False):
        try:
            for index in range(1000):
                chunks.append(index)
                yield {"type": "chunk", "content": str(index)}
                if slow:
                    await asyncio.Event().wait()
        finally:
            closed.append("provider")

    monkeypatch.setattr(stream, "async_db_session", database)
    monkeypatch.setattr(stream.ChatService, "chat_query", query)
    incoming = asyncio.Queue()

    async def send(message):
        if message.get("body"):
            await incoming.put({"type": "http.disconnect"})
            await asyncio.Event().wait()

    response = stream.ChatStreamResponse(stream.chat_events(AuthSchema.model_construct(), ChatQuerySchema(message="hello", request_id="cancel")))
    await asyncio.wait_for(response({"type": "http", "asgi": {"spec_version": "2.4"}}, incoming.get, send), timeout=2)
    assert closed == ["provider", "db"]
    assert len(chunks) < 10  # Slow consumers cannot buffer the entire answer.


async def test_sse_heartbeat_does_not_cancel_generation_and_errors_are_redacted(monkeypatch):
    @asynccontextmanager
    async def database():
        yield object()

    async def query(self, query, structured=False):
        await asyncio.sleep(.03)
        yield {"type": "chunk", "content": "still running"}
        raise RuntimeError("private-provider-secret")

    monkeypatch.setattr(stream, "_PING_INTERVAL", .005)
    monkeypatch.setattr(stream, "async_db_session", database)
    monkeypatch.setattr(stream.ChatService, "chat_query", query)
    frames = [frame async for frame in stream.chat_events(AuthSchema.model_construct(), ChatQuerySchema(message="hello"))]
    text = b"".join(frames).decode()
    assert ": ping" in text and "still running" in text
    assert '"type": "error"' in text and "private-provider-secret" not in text


@pytest.mark.parametrize("cleanup_error", [None, RuntimeError("private cleanup error"), stream.CustomException(msg="private cleanup error")])
async def test_disconnect_awaits_nested_model_cleanup_and_usage_ledger(monkeypatch, cleanup_error):
    closed = []
    produced = []

    class Provider:
        async def astream(self, messages):
            try:
                for index in range(1000):
                    produced.append(index)
                    yield SimpleNamespace(content=str(index))
            finally:
                closed.append("sdk")
                if cleanup_error:
                    raise cleanup_error

    async def finish(record_id, started, status, response):
        await asyncio.sleep(.01)
        closed.append(status)

    @asynccontextmanager
    async def database():
        try:
            yield SimpleNamespace(rollback=AsyncMock())
        finally:
            closed.append("db")

    model = rag.LangChainChatModel.__new__(rag.LangChainChatModel)
    model.config = object()
    model.llm = Provider()
    chain = rag.RagChatChain(retriever=None, prompt_builder=None, chat_model=model)
    monkeypatch.setattr(chain, "_build_prompt", AsyncMock(return_value="prompt"))
    monkeypatch.setattr(service, "accessible_knowledge_base_ids", AsyncMock(return_value=[]))
    monkeypatch.setattr(service, "load_runtime_chat_model_config", AsyncMock())
    monkeypatch.setattr(service.ChatService, "_validate_ai_config", staticmethod(lambda: None))
    monkeypatch.setattr(service.ChatService, "_should_persist_session", lambda self: False)
    monkeypatch.setattr(service, "create_rag_chain", lambda **kwargs: chain)
    monkeypatch.setattr(stream, "async_db_session", database)
    monkeypatch.setattr(usage, "reserve_call", AsyncMock(return_value=1))
    monkeypatch.setattr(usage, "finish_call", finish)
    incoming = asyncio.Queue()

    async def send(message):
        if b'"type": "chunk"' in message.get("body", b""):
            await asyncio.sleep(.01)  # Let the producer block on its full queue.
            await incoming.put({"type": "http.disconnect"})
            await asyncio.Event().wait()

    auth = AuthSchema.model_construct(user=SimpleNamespace(id=1, is_superuser=False))
    response = stream.ChatStreamResponse(stream.chat_events(auth, ChatQuerySchema(message="hello")))
    await asyncio.wait_for(response({"type": "http", "asgi": {"spec_version": "2.4"}}, incoming.get, send), timeout=2)
    assert closed == ["sdk", "failed" if cleanup_error else "cancelled", "db"]
    assert 1 < len(produced) < 10
