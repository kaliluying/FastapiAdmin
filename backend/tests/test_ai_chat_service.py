from types import SimpleNamespace

from app.plugin.module_ai.chat.schema import ChatQuerySchema
from app.plugin.module_ai.chat.service import ChatService


async def test_chat_query_returns_config_message_for_placeholder_api_key(monkeypatch) -> None:
    from app.plugin.module_ai.chat import service

    monkeypatch.setattr(service.settings, "OPENAI_API_KEY", "your_api_key")
    monkeypatch.setattr(service.settings, "OPENAI_MODEL", "MiniMax-M3")
    monkeypatch.setattr(service.settings, "OPENAI_BASE_URL", "https://api.minimaxi.com/v1")

    auth = SimpleNamespace(user=SimpleNamespace(username="admin", dept_id=1))
    chunks = [
        chunk
        async for chunk in ChatService(auth).chat_query(
            ChatQuerySchema(message="hello", session_id="test_session")
        )
    ]

    assert len(chunks) == 1
    assert "OPENAI_API_KEY" in chunks[0]


async def test_chat_query_returns_message_when_stream_has_no_content(monkeypatch) -> None:
    from app.plugin.module_ai.chat import service

    class FakeCrud:
        db = object()

        def __init__(self, auth) -> None:
            self.auth = auth

    class FakeAgent:
        async def arun(self, input: str, stream: bool):
            if False:
                yield None

    class FakeFactory:
        def create_agent(self, **kwargs):
            return FakeAgent()

    monkeypatch.setattr(service.settings, "OPENAI_API_KEY", "test_key")
    monkeypatch.setattr(service.settings, "OPENAI_MODEL", "MiniMax-M3")
    monkeypatch.setattr(service.settings, "OPENAI_BASE_URL", "https://api.minimaxi.com/v1")
    monkeypatch.setattr(service, "ChatSessionCRUD", FakeCrud)
    monkeypatch.setattr(service, "AgnoFactory", FakeFactory)

    auth = SimpleNamespace(user=SimpleNamespace(username="admin", dept_id=1))
    chunks = [
        chunk
        async for chunk in ChatService(auth).chat_query(
            ChatQuerySchema(message="hello", session_id="test_session")
        )
    ]

    assert len(chunks) == 1
    assert "AI 服务没有返回内容" in chunks[0]
