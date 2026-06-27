from types import SimpleNamespace

from app.plugin.module_ai.chat.schema import ChatQuerySchema
from app.plugin.module_ai.chat.service import ChatService


async def test_rag_chain_injects_retrieved_context_into_model_prompt() -> None:
    from app.plugin.module_ai.chat.rag import RagChatChain, RagDocument, RagPromptBuilder

    class FakeRetriever:
        async def retrieve(self, **kwargs):
            return [
                RagDocument(
                    content="用户管理页面路径是 /system/user",
                    metadata={"source": "menu"},
                )
            ]

    class FakeModel:
        prompt: str | None = None

        async def complete(self, prompt: str) -> str:
            self.prompt = prompt
            return "ok"

    model = FakeModel()
    chain = RagChatChain(
        retriever=FakeRetriever(),
        prompt_builder=RagPromptBuilder(),
        chat_model=model,
    )

    result = await chain.ainvoke(
        message="用户管理在哪",
        user_id="admin",
        dept_id="1",
        session_id="test_session",
        files=None,
    )

    assert result == "ok"
    assert model.prompt
    assert "/system/user" in model.prompt
    assert "用户管理在哪" in model.prompt
    assert "source=menu" in model.prompt


def test_ai_chat_stack_uses_langchain_not_legacy_agent_framework() -> None:
    from pathlib import Path

    backend_dir = Path(__file__).resolve().parents[1]
    scanned_paths = [
        backend_dir / "pyproject.toml",
        backend_dir / "requirements.txt",
        backend_dir / "app" / "plugin" / "module_ai" / "chat",
    ]
    offenders: list[str] = []
    for path in scanned_paths:
        files = path.rglob("*.py") if path.is_dir() else [path]
        for file in files:
            text = file.read_text(encoding="utf-8")
            lowered = text.lower()
            if ("ag" + "no") in lowered:
                offenders.append(str(file.relative_to(backend_dir)))

    assert offenders == []


async def test_langchain_chat_model_invokes_and_streams_messages(monkeypatch) -> None:
    from app.plugin.module_ai.chat import rag

    captured: dict[str, object] = {}

    class FakeMessage:
        def __init__(self, content: str) -> None:
            self.content = content

    class FakeChatOpenAI:
        def __init__(self, **kwargs) -> None:
            captured["init"] = kwargs

        async def ainvoke(self, messages):
            captured["invoke_messages"] = messages
            return FakeMessage("full answer")

        async def astream(self, messages):
            captured["stream_messages"] = messages
            yield FakeMessage("part ")
            yield FakeMessage("two")
            yield FakeMessage("")

    monkeypatch.setattr(rag, "ChatOpenAI", FakeChatOpenAI)
    monkeypatch.setattr(rag.settings, "OPENAI_API_KEY", "test_key")
    monkeypatch.setattr(rag.settings, "OPENAI_BASE_URL", "https://example.test/v1")
    monkeypatch.setattr(rag.settings, "OPENAI_MODEL", "test-model")

    model = rag.LangChainChatModel()

    assert await model.complete("hello") == "full answer"
    assert [chunk async for chunk in model.stream("hello")] == ["part ", "two"]
    assert captured["init"] == {
        "api_key": "test_key",
        "base_url": "https://example.test/v1",
        "model": "test-model",
        "temperature": 0.7,
    }
    assert captured["invoke_messages"][0].content == "hello"
    assert captured["stream_messages"][0].content == "hello"


async def test_chat_session_crud_persists_session_messages_with_sqlalchemy() -> None:
    from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

    from app.core.base_model import MappedBase
    from app.plugin.module_ai.chat.crud import ChatSessionCRUD
    from app.plugin.module_ai.chat.model import ChatSessionModel
    from app.plugin.module_ai.chat.schema import ChatSessionCreateSchema, ChatSessionUpdateSchema

    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(ChatSessionModel.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as db:
        auth = SimpleNamespace(
            db=db,
            tenant_id=1,
            user=SimpleNamespace(id=1, username="admin", dept_id=2, tenant_id=1, is_superuser=True),
        )
        crud = ChatSessionCRUD(auth)
        session = await crud.create_crud(ChatSessionCreateSchema(title="First chat"))
        assert session is not None
        assert session.user_id == "admin"
        assert session.team_id == "2"

        await crud.append_run_crud(session_id=session.session_id, message="hi", response="hello")
        await crud.update_crud(session.session_id, ChatSessionUpdateSchema(title="Renamed"))

        stored = await crud.get_by_id_crud(session.session_id)
        assert stored is not None
        assert stored.session_data == {"session_name": "Renamed"}
        assert stored.runs[0]["messages"] == [
            {"role": "user", "content": "hi"},
            {"role": "assistant", "content": "hello"},
        ]

        listed = await crud.list_crud()
        assert [item.session_id for item in listed] == [session.session_id]

        await crud.delete_crud([session.session_id])
        assert await crud.get_by_id_crud(session.session_id) is None

    await engine.dispose()
    MappedBase.metadata.remove(ChatSessionModel.__table__)


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

    class FakeChain:
        async def astream(self, **kwargs):
            if False:
                yield None

    class FakeFactory:
        def create_chain(self, db=None):
            return FakeChain()

    monkeypatch.setattr(service.settings, "OPENAI_API_KEY", "test_key")
    monkeypatch.setattr(service.settings, "OPENAI_MODEL", "MiniMax-M3")
    monkeypatch.setattr(service.settings, "OPENAI_BASE_URL", "https://api.minimaxi.com/v1")
    monkeypatch.setattr(service, "ChatSessionCRUD", FakeCrud)
    monkeypatch.setattr(service, "RagChainFactory", FakeFactory)

    auth = SimpleNamespace(user=SimpleNamespace(username="admin", dept_id=1))
    chunks = [
        chunk
        async for chunk in ChatService(auth).chat_query(
            ChatQuerySchema(message="hello", session_id="test_session")
        )
    ]

    assert len(chunks) == 1
    assert "AI 服务没有返回内容" in chunks[0]


async def test_chat_query_passes_context_to_rag_chain(monkeypatch) -> None:
    from app.plugin.module_ai.chat import service

    captured: dict[str, object] = {}
    stored_runs: list[tuple[str, str]] = []

    class FakeCrud:
        db = object()

        def __init__(self, auth) -> None:
            self.auth = auth

        async def append_run_crud(self, *, session_id: str, message: str, response: str) -> None:
            stored_runs.append((message, response))

    class FakeChain:
        async def astream(self, **kwargs):
            captured.update(kwargs)
            yield "pong"

    class FakeFactory:
        def create_chain(self, db=None):
            captured["db"] = db
            return FakeChain()

    monkeypatch.setattr(service.settings, "OPENAI_API_KEY", "test_key")
    monkeypatch.setattr(service.settings, "OPENAI_MODEL", "MiniMax-M3")
    monkeypatch.setattr(service.settings, "OPENAI_BASE_URL", "https://api.minimaxi.com/v1")
    monkeypatch.setattr(service, "ChatSessionCRUD", FakeCrud)
    monkeypatch.setattr(service, "RagChainFactory", FakeFactory)

    files = [{"name": "manual.md", "content": "用户管理路径是 /system/user"}]
    auth = SimpleNamespace(user=SimpleNamespace(username="admin", dept_id=1))
    chunks = [
        chunk
        async for chunk in ChatService(auth).chat_query(
            ChatQuerySchema(message="hello", session_id="test_session", files=files)
        )
    ]

    assert chunks == ["pong"]
    assert captured["message"] == "hello"
    assert captured["user_id"] == "admin"
    assert captured["dept_id"] == "1"
    assert captured["session_id"] == "test_session"
    assert captured["files"] == files
    assert captured["db"] is FakeCrud.db
    assert stored_runs == [("hello", "pong")]
