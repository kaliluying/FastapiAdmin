"""Count each provider attempt independently of chat/session transactions."""
from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager, contextmanager, nullcontext
from contextvars import ContextVar
from datetime import UTC, date, datetime
from functools import wraps
from time import monotonic
from typing import Any
from zoneinfo import ZoneInfo

from sqlalchemy import func, or_, select, update
from sqlalchemy.exc import IntegrityError

from app.core.database import async_db_session
from app.core.exceptions import CustomException
from app.core.logger import logger

from .usage_model import AiUsageDailyModel, AiUsageQuotaModel, AiUsageRecordModel

_usage_owner: ContextVar[tuple[int, str] | None] = ContextVar("ai_usage_owner", default=None)


@contextmanager
def usage_context(user_id: int, purpose: str = "chat"):
    token = _usage_owner.set((int(user_id), purpose))
    try:
        yield
    finally:
        _usage_owner.reset(token)


def track_chat_usage(function):
    @wraps(function)
    async def wrapped(self, *args, **kwargs):
        with usage_context(self.auth.user.id) if getattr(getattr(self.auth, "user", None), "id", None) is not None else nullcontext():
            return await function(self, *args, **kwargs)
    return wrapped


def track_stream_usage(function):
    @wraps(function)
    async def wrapped(self, *args, **kwargs):
        with usage_context(self.auth.user.id) if getattr(getattr(self.auth, "user", None), "id", None) is not None else nullcontext():
            iterator = function(self, *args, **kwargs)
            try:
                async for item in iterator:
                    yield item
            finally:
                await iterator.aclose()
    return wrapped


def usage_day() -> date:
    return datetime.now(ZoneInfo("Asia/Shanghai")).date()


async def reserve_call(config: Any, purpose: str) -> int:
    owner = _usage_owner.get()
    if owner is None:
        raise CustomException(msg="模型调用缺少用户身份", status_code=403)
    user_id, scope = owner
    day = usage_day()
    async with async_db_session() as db, db.begin():
        # Create once under a savepoint; the unique key serializes competing first calls.
        try:
            async with db.begin_nested():
                db.add(AiUsageDailyModel(user_id=user_id, day=day, calls=0))
                await db.flush()
        except IntegrityError:
            pass
        limit = select(AiUsageQuotaModel.daily_limit).where(AiUsageQuotaModel.user_id == user_id).scalar_subquery()
        result = await db.execute(update(AiUsageDailyModel).where(
            AiUsageDailyModel.user_id == user_id, AiUsageDailyModel.day == day,
            or_(limit.is_(None), AiUsageDailyModel.calls < limit),
        ).values(calls=AiUsageDailyModel.calls + 1))
        if result.rowcount != 1:
            raise CustomException(msg="今日 AI 调用额度已用完，请联系管理员", status_code=429, data={"error_code": "ai_daily_quota_exceeded"})
        record = AiUsageRecordModel(user_id=user_id, day=day, started_at=datetime.now(UTC).replace(tzinfo=None),
            protocol=config.protocol, model=config.model, purpose=scope if scope != "chat" else purpose, status="pending")
        db.add(record)
        await db.flush()
        return record.id


def provider_tokens(message: Any) -> dict[str, int | None]:
    """Use SDK normalized metadata or provider totals; absent values stay unknown."""
    usage = getattr(message, "usage_metadata", None)
    if not usage:
        metadata = getattr(message, "response_metadata", {}) or {}
        usage = metadata.get("token_usage") or metadata.get("usage") or {}
    def token(*names):
        for name in names:
            value = usage.get(name)
            if isinstance(value, int) and not isinstance(value, bool) and value >= 0:
                return value
        return None
    return {"input_tokens": token("input_tokens", "prompt_tokens"),
        "output_tokens": token("output_tokens", "completion_tokens"), "total_tokens": token("total_tokens")}


async def finish_call(record_id: int, started: float, status: str, response: Any) -> None:
    try:
        async with asyncio.timeout(3), async_db_session() as db, db.begin():
            await db.execute(update(AiUsageRecordModel).where(AiUsageRecordModel.id == record_id).values(
                status=status, latency_ms=max(0, round((monotonic() - started) * 1000)), **provider_tokens(response)))
    except Exception:
        # Reservation survives; pending is visible instead of losing the billed attempt.
        logger.warning("AI 用量结果写入失败，已保留预留记录；不记录模型响应或认证信息")


@asynccontextmanager
async def provider_call(config: Any, purpose: str):
    record_id = await reserve_call(config, purpose)
    started = monotonic()
    outcome = {"response": None}
    status = "failed"
    try:
        yield outcome
        status = "succeeded"
    except (asyncio.CancelledError, GeneratorExit):
        status = "cancelled"
        raise
    finally:
        task = asyncio.create_task(finish_call(record_id, started, status, outcome["response"]))
        try:
            await asyncio.shield(task)
        except asyncio.CancelledError:
            await task
            raise


async def usage_summary(user_id: int, day: date) -> dict[str, Any]:
    async with async_db_session() as db:
        limit = await db.scalar(select(AiUsageQuotaModel.daily_limit).where(AiUsageQuotaModel.user_id == user_id))
        calls = await db.scalar(select(AiUsageDailyModel.calls).where(AiUsageDailyModel.user_id == user_id, AiUsageDailyModel.day == day)) or 0
        rows = (await db.execute(select(AiUsageRecordModel.model, AiUsageRecordModel.protocol, AiUsageRecordModel.purpose, AiUsageRecordModel.status,
            func.count().label("calls"), func.sum(AiUsageRecordModel.input_tokens).label("input_tokens"),
            func.sum(AiUsageRecordModel.output_tokens).label("output_tokens"), func.sum(AiUsageRecordModel.total_tokens).label("total_tokens"),
            func.count(AiUsageRecordModel.total_tokens).label("known_usage_calls"), func.avg(AiUsageRecordModel.latency_ms).label("latency_ms"))
            .where(AiUsageRecordModel.user_id == user_id, AiUsageRecordModel.day == day)
            .group_by(AiUsageRecordModel.model, AiUsageRecordModel.protocol, AiUsageRecordModel.purpose, AiUsageRecordModel.status))).mappings().all()
        return {"user_id": user_id, "day": day.isoformat(), "timezone": "Asia/Shanghai", "calls": calls, "daily_limit": limit,
            "remaining": max(0, limit - calls) if limit is not None else None, "items": [dict(row) for row in rows]}


async def set_quota(user_id: int, daily_limit: int | None) -> None:
    async with async_db_session() as db, db.begin():
        try:
            async with db.begin_nested():
                db.add(AiUsageQuotaModel(user_id=user_id, daily_limit=daily_limit))
                await db.flush()
        except IntegrityError:
            await db.execute(update(AiUsageQuotaModel).where(AiUsageQuotaModel.user_id == user_id).values(daily_limit=daily_limit))
