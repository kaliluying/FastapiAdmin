import asyncio
from datetime import timedelta
from types import SimpleNamespace

import pytest
from langchain_core.messages import AIMessage, AIMessageChunk
from sqlalchemy import select

from app.core.exceptions import CustomException
from app.plugin.module_ai.chat import rag, usage
from app.plugin.module_ai.chat.model_config_service import ChatModelRuntimeConfig
from app.plugin.module_ai.chat.schema import AiUsageQuotaUpdateSchema
from app.plugin.module_ai.chat.usage_model import AiUsageRecordModel

pytest_plugins = ("ai_usage_fixtures",)

CONFIG = ChatModelRuntimeConfig("openai", "https://fixture.invalid/v1", "fixture", "synthetic-key")


async def test_atomic_daily_allowance_and_independent_durable_ledger(usage_storage):
    await usage.set_quota(1, 3)
    async def attempt():
        try:
            return await usage.reserve_call(CONFIG, "tools")
        except CustomException as exc:
            assert exc.status_code == 429
            return None
    ids = await asyncio.gather(*[attempt() for _ in range(20)])
    assert len([value for value in ids if value]) == 3
    summary = await usage.usage_summary(1, usage.usage_day())
    assert summary["calls"] == 3 and summary["remaining"] == 0
    assert sum(row["calls"] for row in summary["items"]) == 3
    assert summary["items"][0]["status"] == "pending"
    # Another user's calls, unlimited default, and the next day do not share the quota.
    with usage.usage_context(2):
        await usage.reserve_call(CONFIG, "chat")
    assert (await usage.usage_summary(2, usage.usage_day()))["daily_limit"] is None
    assert (await usage.usage_summary(1, usage.usage_day() + timedelta(days=1)))["calls"] == 0


async def test_zero_quota_and_missing_identity_never_reach_provider(usage_storage, monkeypatch):
    called = []
    model = object.__new__(rag.LangChainChatModel)
    model.config = CONFIG
    async def invoke(*args):
        called.append(args)
    model.llm = SimpleNamespace(ainvoke=invoke)
    await usage.set_quota(1, 0)
    with pytest.raises(CustomException, match="额度"):
        await model.complete("test")
    assert called == []
    monkeypatch.setattr(usage, "_usage_owner", usage.ContextVar("missing_owner", default=None))
    with pytest.raises(CustomException, match="身份"):
        await model.complete("test")
    assert called == []


async def test_success_failure_cancellation_stream_and_tools_each_count(usage_storage):
    class Client:
        async def ainvoke(self, messages):
            if messages[0].content == "fail":
                raise RuntimeError("synthetic provider failure")
            if messages[0].content == "cancel":
                raise asyncio.CancelledError
            return AIMessage(content="ok", usage_metadata={"input_tokens": 2, "output_tokens": 3, "total_tokens": 5})
        async def astream(self, _messages):
            yield AIMessageChunk(content="one")
            yield AIMessageChunk(content="two")
            yield AIMessageChunk(content="", usage_metadata={"input_tokens": 4, "output_tokens": 6, "total_tokens": 10})
        def bind_tools(self, tools):
            return self
    model = object.__new__(rag.LangChainChatModel)
    model.config, model.llm = CONFIG, Client()
    assert await model.complete("ok") == "ok"
    with pytest.raises(RuntimeError):
        await model.complete("fail")
    with pytest.raises(asyncio.CancelledError):
        await model.complete("cancel")
    assert [text async for text in model.stream("ok")] == ["one", "two"]
    await model.request_tools([SimpleNamespace(content="ok")], [])
    await model.request_tools([SimpleNamespace(content="ok")], [])
    iterator = model.stream("stop early")
    assert await anext(iterator) == "one"
    await iterator.aclose()
    with usage.usage_context(1, "memory"):
        assert await model.complete("extract") == "ok"
    async with usage_storage() as db:
        rows = list((await db.scalars(select(AiUsageRecordModel).order_by(AiUsageRecordModel.id))).all())
    assert [row.status for row in rows] == ["succeeded", "failed", "cancelled", "succeeded", "succeeded", "succeeded", "cancelled", "succeeded"]
    assert rows[3].total_tokens == 10
    assert rows[1].total_tokens is None and rows[6].total_tokens is None
    assert rows[-1].purpose == "memory"
    assert (await usage.usage_summary(1, usage.usage_day()))["calls"] == 8


async def test_final_write_failure_retains_pending_without_failing_answer(usage_storage, monkeypatch):
    original = usage.async_db_session
    async with usage.provider_call(CONFIG, "chat") as outcome:
        outcome["response"] = AIMessage(content="answer")
        monkeypatch.setattr(usage, "async_db_session", lambda: (_ for _ in ()).throw(RuntimeError("synthetic storage failure")))
    monkeypatch.setattr(usage, "async_db_session", original)
    summary = await usage.usage_summary(1, usage.usage_day())
    assert summary["calls"] == 1 and summary["items"][0]["status"] == "pending"


@pytest.mark.parametrize("metadata,expected", [
    ({"token_usage": {"prompt_tokens": 3, "completion_tokens": 5, "total_tokens": 8}}, (3, 5, 8)),
    ({"usage": {"input_tokens": 4, "output_tokens": 6}}, (4, 6, None)),
    ({"usage": {"input_tokens": False, "output_tokens": -1, "total_tokens": "3"}}, (None, None, None)),
    ({}, (None, None, None)),
])
def test_provider_token_metadata_only_uses_reported_numbers(metadata, expected):
    assert tuple(usage.provider_tokens(SimpleNamespace(response_metadata=metadata)).values()) == expected


@pytest.mark.parametrize("value", [-1, 1.5, True, "2", 1000001])
def test_quota_rejects_invalid_values(value):
    with pytest.raises(ValueError):
        AiUsageQuotaUpdateSchema(daily_limit=value)


def test_usage_migration_existing_database_is_idempotent_and_keeps_quota(monkeypatch):
    from importlib import import_module

    import sqlalchemy as sa
    from alembic.migration import MigrationContext
    from alembic.operations import Operations
    migration = import_module("app.alembic.versions.20261011_ai_usage")
    engine = sa.create_engine("sqlite:///:memory:")
    with engine.begin() as connection:
        connection.execute(sa.text("CREATE TABLE sys_user (id INTEGER PRIMARY KEY)"))
        monkeypatch.setattr(migration, "op", Operations(MigrationContext.configure(connection)))
        migration.upgrade()
        connection.execute(sa.text("INSERT INTO ai_usage_quota (user_id, daily_limit) VALUES (1, 3)"))
        migration.upgrade()
        assert connection.scalar(sa.text("SELECT daily_limit FROM ai_usage_quota WHERE user_id=1")) == 3
        assert {"ai_usage_record", "ai_usage_daily", "ai_usage_quota"} <= set(sa.inspect(connection).get_table_names())
        migration.downgrade()
        assert sa.inspect(connection).get_table_names() == ["sys_user"]
    engine.dispose()
