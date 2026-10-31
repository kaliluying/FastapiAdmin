import json
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.plugin.module_ai.chat import service as chat_service
from app.plugin.module_ai.chat.rag import RagChatChain, RagPromptBuilder
from app.plugin.module_ai.memory import service as memory_service
from app.plugin.module_ai.memory.crud import MemoryCRUD
from app.plugin.module_ai.memory.model import AiMemoryModel
from app.plugin.module_ai.memory.schema import MemoryCreateSchema, MemoryExtractAction, MemoryUpdateSchema
from app.plugin.module_ai.memory.service import MemoryService, extract_conversation_in_background


@pytest.fixture
async def memory_sessions(tmp_path, monkeypatch):
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'memories.db'}")
    async with engine.begin() as connection:
        await connection.run_sync(AiMemoryModel.__table__.create)
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    monkeypatch.setattr(memory_service, "async_db_session", sessions)
    try:
        yield sessions
    finally:
        await engine.dispose()


async def test_rag_reads_only_current_users_active_memories(memory_sessions):
    async with memory_sessions() as db:
        own = MemoryService.for_user(db, "1")
        await own.create(MemoryCreateSchema(key="职责", value="OWN_ACTIVE_MEMORY"))
        inactive = await own.create(MemoryCreateSchema(key="停用", value="OWN_INACTIVE_MEMORY"))
        await own.update(inactive["id"], MemoryUpdateSchema(is_active=False))
        deleted = await own.create(MemoryCreateSchema(key="删除", value="OWN_DELETED_MEMORY"))
        await own.delete([deleted["id"]])
        await MemoryService.for_user(db, 2).create(MemoryCreateSchema(key="职责", value="OTHER_USERS_MEMORY"))
        await db.commit()
        model = SimpleNamespace(complete=AsyncMock(return_value="answer"))
        chain = RagChatChain(
            retriever=SimpleNamespace(retrieve=AsyncMock(return_value=[])),
            prompt_builder=RagPromptBuilder(), chat_model=model, db=db, user_id="1",
        )
        assert await chain.ainvoke(message="我负责什么", user_id="1", scope_id="1", session_id=None) == "answer"
        prompt = model.complete.call_args.args[0]
        assert "OWN_ACTIVE_MEMORY" in prompt
        assert all(marker not in prompt for marker in ["OWN_INACTIVE_MEMORY", "OWN_DELETED_MEMORY", "OTHER_USERS_MEMORY"])


async def test_extraction_respects_confidence_and_user_ownership(memory_sessions):
    async with memory_sessions() as db:
        own = MemoryService.for_user(db, 1)
        existing = await own.create(MemoryCreateSchema(key="职责", value="OWN_EXISTING"))
        foreign = await MemoryService.for_user(db, 2).create(MemoryCreateSchema(key="职责", value="FOREIGN_SECRET"))
        await db.commit()
        model = SimpleNamespace(complete=AsyncMock(return_value=json.dumps({"actions": [
            {"action": "update", "memory_id": existing["id"], "key": "职责", "value": "OWN_UPDATED", "confidence": 0.9, "is_long_term": True, "source_quote": "我的职责是 OWN_UPDATED"},
            {"action": "create", "key": "猜测", "value": "LOW_CONFIDENCE", "confidence": 0.1, "is_long_term": True, "source_quote": "我的职责是 OWN_UPDATED"},
            {"action": "delete", "memory_id": foreign["id"], "confidence": 0.9, "is_long_term": True, "source_quote": "忘记原职责"},
        ]})))
        saved = await own.extract_from_conversation(user_message="我的职责是 OWN_UPDATED。忘记原职责", assistant_response="已了解", chat_model=model)
        # The existing extractor counts a successful idempotent delete as an action.
        assert saved == 2
        await db.commit()
        assert [item["value"] for item in await own.get_active_memories()] == ["OWN_UPDATED"]
        assert [item["value"] for item in await MemoryService.for_user(db, 2).get_active_memories()] == ["FOREIGN_SECRET"]
        assert "OWN_EXISTING" in model.complete.call_args.args[0]
        assert "FOREIGN_SECRET" not in model.complete.call_args.args[0]


async def test_background_extraction_commits_independently_of_chat_session(memory_sessions):
    model = SimpleNamespace(complete=AsyncMock(return_value=json.dumps({"actions": [
        {"action": "create", "key": "职责", "value": "BACKGROUND_MEMORY", "confidence": 0.9, "is_long_term": True, "source_quote": "我的职责是 BACKGROUND_MEMORY"},
    ]})))
    async with memory_sessions() as request_db:
        await extract_conversation_in_background(user_id=1, user_message="我的职责是 BACKGROUND_MEMORY", assistant_response="已了解", chat_model=model)
        await request_db.rollback()
    async with memory_sessions() as observer:
        assert [item["value"] for item in await MemoryService.for_user(observer, 1).get_active_memories()] == ["BACKGROUND_MEMORY"]


async def test_background_database_failure_is_nonfatal(monkeypatch):
    def unavailable_database():
        raise RuntimeError("database unavailable")

    monkeypatch.setattr(memory_service, "async_db_session", unavailable_database)
    await extract_conversation_in_background(user_id=1, user_message="问题", assistant_response="回答", chat_model=SimpleNamespace(complete=AsyncMock()))


@pytest.mark.parametrize("target", ["own", "foreign", "missing", "absent"])
@pytest.mark.parametrize("active", [False, True])
async def test_extracted_update_targets_owned_id_without_creating_memory(memory_sessions, target, active):
    async with memory_sessions() as db:
        own = MemoryService.for_user(db, 1)
        original = await own.create(MemoryCreateSchema(key="职业", value="律师", category="profile", is_active=active))
        foreign = await MemoryService.for_user(db, 2).create(MemoryCreateSchema(key="职业", value="FOREIGN"))
        identifiers = {"own": original["id"], "foreign": foreign["id"], "missing": 99999, "absent": None}
        saved = await own.apply_extracted_actions([MemoryExtractAction(
            action="update", memory_id=identifiers[target], key="用户身份", value="后端工程师",
        )])
        await db.commit()
        assert saved == (1 if target == "own" else 0)
        memories = [entry.to_dict() for entry in await MemoryCRUD(own.auth).list_crud()]
        assert len(memories) == 1
        assert memories[0]["id"] == original["id"]
        assert memories[0]["key"] == ("用户身份" if target == "own" else "职业")
        assert memories[0]["value"] == ("后端工程师" if target == "own" else "律师")
        assert memories[0]["category"] == "profile"
        assert memories[0]["is_active"] is active
        assert [entry["value"] for entry in await MemoryService.for_user(db, 2).get_active_memories()] == ["FOREIGN"]


def test_chat_only_wakes_workers_without_calling_the_provider(monkeypatch):
    from unittest.mock import Mock

    wake = Mock()
    monkeypatch.setattr(chat_service, "wake_memory_worker", wake)
    chat_service.ChatService(SimpleNamespace(user=SimpleNamespace(id=7)))._trigger_memory_extraction()
    wake.assert_called_once_with()
