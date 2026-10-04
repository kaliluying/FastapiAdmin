import asyncio
import json
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.plugin.module_ai.chat import service as chat_service
from app.plugin.module_ai.chat.rag import RagChatChain, RagPromptBuilder
from app.plugin.module_ai.memory import service as memory_service
from app.plugin.module_ai.memory.model import AiMemoryModel
from app.plugin.module_ai.memory.schema import MemoryCreateSchema, MemoryUpdateSchema
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
        await own.create(MemoryCreateSchema(key="职责", value="OWN_EXISTING"))
        foreign = await MemoryService.for_user(db, 2).create(MemoryCreateSchema(key="职责", value="FOREIGN_SECRET"))
        await db.commit()
        model = SimpleNamespace(complete=AsyncMock(return_value=json.dumps({"actions": [
            {"action": "update", "key": "职责", "value": "OWN_UPDATED", "confidence": 0.9},
            {"action": "create", "key": "猜测", "value": "LOW_CONFIDENCE", "confidence": 0.1},
            {"action": "delete", "memory_id": foreign["id"], "confidence": 0.9},
        ]})))
        saved = await own.extract_from_conversation(user_message="更新我的职责", assistant_response="已了解", chat_model=model)
        # The existing extractor counts a successful idempotent delete as an action.
        assert saved == 2
        await db.commit()
        assert [item["value"] for item in await own.get_active_memories()] == ["OWN_UPDATED"]
        assert [item["value"] for item in await MemoryService.for_user(db, 2).get_active_memories()] == ["FOREIGN_SECRET"]
        assert "OWN_EXISTING" in model.complete.call_args.args[0]
        assert "FOREIGN_SECRET" not in model.complete.call_args.args[0]


async def test_background_extraction_commits_independently_of_chat_session(memory_sessions):
    model = SimpleNamespace(complete=AsyncMock(return_value=json.dumps({"actions": [
        {"action": "create", "key": "职责", "value": "BACKGROUND_MEMORY", "confidence": 0.9},
    ]})))
    async with memory_sessions() as request_db:
        await extract_conversation_in_background(user_id=1, user_message="我的职责", assistant_response="已了解", chat_model=model)
        await request_db.rollback()
    async with memory_sessions() as observer:
        assert [item["value"] for item in await MemoryService.for_user(observer, 1).get_active_memories()] == ["BACKGROUND_MEMORY"]


async def test_background_database_failure_is_nonfatal(monkeypatch):
    def unavailable_database():
        raise RuntimeError("database unavailable")

    monkeypatch.setattr(memory_service, "async_db_session", unavailable_database)
    await extract_conversation_in_background(user_id=1, user_message="问题", assistant_response="回答")


async def test_chat_schedules_memory_use_case_without_waiting(monkeypatch):
    finished = asyncio.Event()

    async def extract(**kwargs):
        assert kwargs == {"user_id": 7, "user_message": "问题", "assistant_response": "回答"}
        finished.set()

    monkeypatch.setattr(chat_service, "extract_conversation_in_background", extract)
    chat_service.ChatService(SimpleNamespace(user=SimpleNamespace(id=7)))._trigger_memory_extraction("问题", "回答")
    assert not finished.is_set()
    await asyncio.wait_for(finished.wait(), timeout=1)
