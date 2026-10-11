from contextvars import ContextVar

import pytest
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.plugin.module_ai.chat import usage
from app.plugin.module_ai.chat.usage_model import AiUsageDailyModel, AiUsageQuotaModel, AiUsageRecordModel


@pytest.fixture
async def usage_storage(monkeypatch, tmp_path):
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'usage.db'}")
    async with engine.begin() as connection:
        for model in (AiUsageDailyModel, AiUsageQuotaModel, AiUsageRecordModel):
            await connection.run_sync(model.__table__.create)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    monkeypatch.setattr(usage, "async_db_session", factory)
    monkeypatch.setattr(usage, "_usage_owner", ContextVar("test_ai_owner", default=(1, "chat")))
    yield factory
    await engine.dispose()
