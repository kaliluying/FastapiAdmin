from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import pytest
from langchain_core.messages import AIMessage, ToolMessage

from app.core.exceptions import CustomException
from app.plugin.module_ai.chat import log_context, rag, service
from app.plugin.module_ai.chat.runtime_logs import RuntimeLogQuerySchema
from app.plugin.module_ai.chat.schema import ChatQuerySchema
from tests.test_ai_log_analysis import log_chat as log_chat_fixture

log_chat = log_chat_fixture


async def test_context_is_shared_private_expiring_and_filters_only():
    from tests.test_auth_session import FakeRedis

    redis = FakeRedis()
    first_worker = log_context.LogQueryContexts(ttl=10)
    other_worker = log_context.LogQueryContexts(ttl=10)
    owner = (7, "session-a")
    query = RuntimeLogQuerySchema(keyword="timeout")
    token = await first_worker.put(redis, owner, query)
    query.keyword = "changed"
    assert (await other_worker.get(redis, token, owner)).keyword == "timeout"
    assert list(redis.expires.values()) == [10]
    for foreign in [(8, "session-a"), (7, "session-b")]:
        with pytest.raises(CustomException) as exc:
            await other_worker.get(redis, token, foreign)
        assert exc.value.data["error_code"] == "log_context_expired"
    (await other_worker.get(redis, token, owner)).levels.clear()
    assert (await first_worker.get(redis, token, owner)).levels
    redis.values.clear()  # Simulate Redis TTL expiry.
    with pytest.raises(CustomException):
        await other_worker.get(redis, token, owner)


async def collect(auth, **kwargs):
    return [event async for event in service.ChatService(auth).chat_query(ChatQuerySchema(message="缩小到15分钟", **kwargs), structured=True)]


async def test_immediate_followup_is_not_blocked_by_local_cooldown(log_chat):
    auth, _ = log_chat
    first = await collect(auth)
    assert first[-1]["type"] == "done"
    followup = await collect(auth, log_context_id=first[-1]["log_context_id"])
    assert followup[-1]["type"] == "done"
    assert all(not call.kwargs.get("nx") for call in auth.redis.set.await_args_list)


async def test_followup_uses_only_previous_filters_and_reads_fresh_logs(log_chat, monkeypatch):
    auth, _ = log_chat
    owner = (auth.user.id, auth.session_id)
    token = await service.log_query_contexts.put(auth.redis, owner, RuntimeLogQuerySchema(minutes=60, keyword="LOG-ACCEPTANCE-42", correlation_id="abcd1234"))
    initial_messages = []

    class Model:
        async def request_tools(self, messages, tools):
            if isinstance(messages[-1], ToolMessage):
                assert "[REDACTED]" in messages[-1].content
                return AIMessage(content="本轮证据 [1]")
            initial_messages.extend(messages)
            return AIMessage(content="", tool_calls=[{"name": "query_runtime_logs", "id": "followup", "args": {"minutes": 15, "keyword": "LOG-ACCEPTANCE-42", "correlation_id": "abcd1234"}}])

    monkeypatch.setattr(rag, "get_cached_chat_model", Model)
    persistence = Mock(side_effect=AssertionError("Followup must remain ephemeral"))
    monkeypatch.setattr(service, "ChatSessionCRUD", persistence)
    events = await collect(auth, log_context_id=token)
    assert events[-1]["type"] == "done"
    assert events[-1]["log_context_id"] != token
    assert "fixture-secret" not in str(initial_messages)
    assert "retrieval failed" not in str(initial_messages)
    assert "非日志证据" in initial_messages[-1].content
    result = next(event for event in events if event["type"] == "log_result")
    assert result["query"]["minutes"] == 15
    assert result["returned_count"] == 1
    assert (await service.log_query_contexts.get(auth.redis, events[-1]["log_context_id"], owner)).minutes == 15
    persistence.assert_not_called()


@pytest.mark.parametrize("scenario", ["foreign-user", "foreign-session", "expired", "revoked", "mixed"])
async def test_invalid_followup_never_routes_or_reads(log_chat, monkeypatch, scenario):
    auth, captured = log_chat
    token = await service.log_query_contexts.put(auth.redis, (auth.user.id, auth.session_id), RuntimeLogQuerySchema())
    if scenario == "foreign-user":
        auth.user.id += 1
    elif scenario == "foreign-session":
        auth.session_id = "other-session"
    elif scenario == "expired":
        auth.redis.values.clear()
    elif scenario == "revoked":
        auth.db.scalar.return_value = None
    reader = AsyncMock()
    monkeypatch.setattr(service, "query_runtime_logs", reader)
    events = await collect(auth, log_context_id=token, knowledge_base_ids=[1] if scenario == "mixed" else [])
    assert events[-1]["type"] == "error"
    assert captured["calls"] == 0
    reader.assert_not_called()


@pytest.mark.parametrize("with_context", [False, True])
async def test_tool_failure_falls_back_only_without_log_context(log_chat, monkeypatch, with_context):
    auth, _ = log_chat
    token = await service.log_query_contexts.put(auth.redis, (auth.user.id, auth.session_id), RuntimeLogQuerySchema()) if with_context else None
    model = SimpleNamespace(request_tools=AsyncMock(side_effect=NotImplementedError("private-provider-secret")))
    monkeypatch.setattr(rag, "get_cached_chat_model", lambda: model)
    persistence = Mock(side_effect=AssertionError("Degraded answers must not persist"))
    monkeypatch.setattr(service, "ChatSessionCRUD", persistence)
    memory = Mock()
    monkeypatch.setattr(service.ChatService, "_trigger_memory_extraction", memory)

    class Chain:
        async def astream(self, **kwargs):
            assert kwargs["session_id"] != "saved-session"
            yield "普通排查建议，不是日志结论"

        async def ainvoke(self, **kwargs):
            return "普通排查建议"

    factory = Mock(return_value=Chain())
    monkeypatch.setattr(service, "create_rag_chain", factory)
    events = await collect(auth, log_context_id=token, session_id="saved-session")
    assert "private-provider-secret" not in str(events)
    if with_context:
        assert events[-1]["type"] == "error"
        factory.assert_not_called()
    else:
        assert any(event["type"] == "warning" for event in events)
        assert events[-1] == {"type": "done"}
        result = await service.ChatService(auth).chat_non_stream("普通问题", "saved-session")
        assert "未读取运行日志" in result["response"]
        assert result["session_id"] == ""
    persistence.assert_not_called()
    memory.assert_not_called()


async def test_no_tool_followup_never_enters_saved_chat(log_chat, monkeypatch):
    auth, _ = log_chat
    token = await service.log_query_contexts.put(auth.redis, (auth.user.id, auth.session_id), RuntimeLogQuerySchema())
    model = SimpleNamespace(request_tools=AsyncMock(return_value=AIMessage(content="cannot use stale answer")))
    monkeypatch.setattr(rag, "get_cached_chat_model", lambda: model)
    factory = Mock()
    monkeypatch.setattr(service, "create_rag_chain", factory)
    assert (await collect(auth, log_context_id=token))[-1]["type"] == "error"
    factory.assert_not_called()


@pytest.mark.parametrize("status", [401, 403, 429])
async def test_provider_auth_and_rate_errors_never_fall_back(log_chat, monkeypatch, status):
    auth, _ = log_chat
    failure = RuntimeError("provider-secret")
    failure.status_code = status
    model = SimpleNamespace(request_tools=AsyncMock(side_effect=failure))
    monkeypatch.setattr(rag, "get_cached_chat_model", lambda: model)
    factory = Mock()
    monkeypatch.setattr(service, "create_rag_chain", factory)
    events = await collect(auth)
    assert events[-1]["error_code"] == ("model_rate_limited" if status == 429 else "model_auth_error")
    assert "provider-secret" not in str(events)
    factory.assert_not_called()


async def test_error_after_log_read_never_falls_back_or_caches(log_chat, monkeypatch):
    auth, _ = log_chat

    class Model:
        async def request_tools(self, messages, tools):
            if isinstance(messages[-1], ToolMessage):
                raise RuntimeError("provider-secret")
            return AIMessage(content="", tool_calls=[{"name": "query_runtime_logs", "id": "read", "args": {}}])

    monkeypatch.setattr(rag, "get_cached_chat_model", Model)
    factory = Mock()
    monkeypatch.setattr(service, "create_rag_chain", factory)
    events = await collect(auth)
    assert any(event["type"] == "log_result" for event in events)
    assert events[-1]["type"] == "error"
    assert not any(key.startswith("ai:log-context:") for key in auth.redis.values)
    factory.assert_not_called()


async def test_revoked_during_failed_routing_never_degrades(log_chat, monkeypatch):
    auth, _ = log_chat

    async def fail(*args):
        auth.db.scalar.return_value = None
        raise RuntimeError("provider-secret")

    model = SimpleNamespace(request_tools=AsyncMock(side_effect=fail))
    monkeypatch.setattr(rag, "get_cached_chat_model", lambda: model)
    events = await collect(auth)
    assert events[-1]["error_code"] == "permission_denied"
    assert not any(event["type"] == "warning" for event in events)


async def test_ai_http_audit_retains_metadata_not_content(monkeypatch):
    import httpx
    from fastapi import APIRouter, FastAPI

    from app.core import router_class
    from app.plugin.module_ai.chat.controller import ChatRouter

    actual_route = next(route for route in ChatRouter.routes if route.name == "ai_chat_controller")
    assert actual_route.openapi_extra["x-audit-payload"] is False
    monkeypatch.setattr(router_class.settings, "OPERATION_LOG_RECORD", True)
    monkeypatch.setattr(router_class.settings, "OPERATION_RECORD_METHOD", ["POST"])
    writer = AsyncMock()
    monkeypatch.setattr(router_class, "_write_operation_log_async", writer)
    router = APIRouter(route_class=router_class.OperationLogRoute)

    @router.post("/test", openapi_extra={"x-audit-payload": False})
    async def respond(body: dict):
        return {"response": "fixture-private-log-content", "log_context_id": "private-context-id"}

    application = FastAPI()
    application.include_router(router)
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=application), base_url="http://test") as client:
        response = await client.post("/test", json={"message": "fixture-private-query"})
    assert response.status_code == 200
    assert writer.await_count == 1
    record = writer.await_args.args[0]
    assert record["request_path"] == "/test"
    assert record["request_payload"] == '{"omitted": true}'
    assert record["response_json"] == '{"omitted": true}'
    assert "private" not in str(record)
