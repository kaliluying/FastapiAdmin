import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from sqlalchemy import event, select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.config.setting import settings
from app.core.base_schema import AuthSchema
from app.core.exceptions import CustomException
from app.plugin.module_ai.chat import service as chat_service
from app.plugin.module_ai.chat.model import ChatSessionModel, MemoryExtractionJobModel
from app.plugin.module_ai.chat.schema import AiChatRequestSchema
from app.plugin.module_ai.memory import service as memory_service
from app.plugin.module_ai.memory.model import AiMemoryModel


def test_download_never_deletes_the_source(test_client, auth_headers, tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "UPLOAD_FILE_PATH", tmp_path)
    source = tmp_path / "retained.txt"
    source.write_text("keep this file", encoding="utf-8")
    response = test_client.post(
        "/common/file/download", headers=auth_headers,
        json={"file_path": source.name, "delete": True},
    )
    assert response.status_code == 200
    assert response.content == b"keep this file"
    assert source.read_text(encoding="utf-8") == "keep this file"


@pytest.fixture
async def isolated_sessions(tmp_path):
    engine = create_async_engine(
        f"sqlite+aiosqlite:///{tmp_path / 'arch.db'}", pool_size=1, max_overflow=0, pool_timeout=0.1,
    )
    async with engine.begin() as connection:
        await connection.run_sync(AiMemoryModel.__table__.create)
        await connection.run_sync(ChatSessionModel.__table__.create)
        await connection.run_sync(MemoryExtractionJobModel.__table__.create)
    try:
        yield async_sessionmaker(engine, expire_on_commit=False), engine
    finally:
        await engine.dispose()


async def test_memory_releases_connection_during_provider_wait(isolated_sessions, monkeypatch):
    sessions, _ = isolated_sessions
    monkeypatch.setattr(memory_service, "async_db_session", sessions)
    entered, release = asyncio.Event(), asyncio.Event()

    async def complete(_prompt):
        entered.set()
        await release.wait()
        return '{"actions":[{"action":"create","key":"job","value":"engineer","confidence":0.9,"is_long_term":true,"source_quote":"I am an engineer"}]}'

    task = asyncio.create_task(memory_service.extract_conversation_in_background(
        user_id=1, user_message="I am an engineer", assistant_response="ok",
        chat_model=SimpleNamespace(complete=complete),
    ))
    try:
        await asyncio.wait_for(entered.wait(), 1)
        async with sessions() as observer:
            await observer.execute(select(AiMemoryModel))
    finally:
        release.set()
        await task
    async with sessions() as observer:
        assert (await observer.scalars(select(AiMemoryModel.value))).all() == ["engineer"]


def test_chat_wakes_the_persistent_memory_worker(monkeypatch):
    from unittest.mock import Mock

    wake = Mock()
    monkeypatch.setattr(chat_service, "wake_memory_worker", wake)
    chat_service.ChatService(SimpleNamespace(user=SimpleNamespace(id=1)))._trigger_memory_extraction()
    wake.assert_called_once_with()


async def test_chat_paginates_in_sql_before_formatting(isolated_sessions, monkeypatch):
    sessions, engine = isolated_sessions
    async with sessions() as db:
        db.add_all([
            ChatSessionModel(session_id=f"own-{i}", user_id="1", session_data={"session_name": "match"})
            for i in range(5)
        ] + [
            ChatSessionModel(session_id="foreign", user_id="2", session_data={"session_name": "match"}),
            ChatSessionModel(session_id="unmatched", user_id="1", session_data={"session_name": "other"}),
            ChatSessionModel(session_id="deleted", user_id="1", is_deleted=True, session_data={"session_name": "match"}),
        ])
        await db.commit()
    statements = []

    def capture(_conn, _cursor, statement, _parameters, _context, _executemany):
        statements.append(statement)

    event.listen(engine.sync_engine, "before_cursor_execute", capture)
    formatted = AsyncMock(side_effect=lambda session, auth: {"id": session.session_id})
    monkeypatch.setattr(chat_service, "_format_session_data", formatted)
    async with sessions() as db:
        service = chat_service.ChatService(SimpleNamespace(user=SimpleNamespace(id=1), db=db))
        page = await service.page(2, 2, SimpleNamespace(title="match"))
        assert page.total == 5 and page.has_next
        assert [item["id"] for item in page.items] == ["own-2", "own-1"]
        assert formatted.await_count == 2
        assert any("LIMIT" in statement.upper() for statement in statements)
        last = await service.page(3, 2, SimpleNamespace(title="match"))
        assert len(last.items) == 1 and not last.has_next
        assert not (await service.page(4, 2, SimpleNamespace(title="match"))).items
        with pytest.raises(CustomException):
            await service.page(0, 2, None)


async def test_non_streaming_chat_reloads_the_verified_user_id(isolated_sessions, monkeypatch):
    from app.plugin.module_ai.chat import controller

    sessions, _ = isolated_sessions
    monkeypatch.setattr(controller, "async_db_session", sessions)
    verified_user = SimpleNamespace(id=1, username="renamed")
    load_user = AsyncMock(return_value=verified_user)
    monkeypatch.setattr(controller, "_load_user_from_db", load_user)
    service = SimpleNamespace(chat_non_stream=AsyncMock(return_value={"response": "ok", "session_id": ""}))
    received = []
    monkeypatch.setattr(controller, "ChatService", lambda auth: received.append(auth) or service)
    async with sessions() as db:
        auth = AuthSchema(user=SimpleNamespace(id=1, username="reused"), db=db)
        response = await controller.ai_chat_controller(AiChatRequestSchema(message="hello"), auth)
    assert response.status_code == 200
    assert load_user.await_args.kwargs == {"user_id": 1}
    assert received[0].user is verified_user
