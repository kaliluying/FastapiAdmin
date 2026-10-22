"""基于 SQL 的记忆队列：限制工作任务数量、按用户顺序处理并隔离重试。"""

from __future__ import annotations

import asyncio
from contextlib import suppress
from datetime import datetime, timedelta
from uuid import uuid4

from sqlalchemy import delete, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from app.api.v1.module_system.user.model import UserModel
from app.core.database import async_db_session
from app.core.logger import logger
from app.plugin.module_ai.chat.model import ChatSessionModel
from app.plugin.module_ai.chat.usage import usage_context

from .crud import MemoryCRUD
from .extractor import MemoryExtractor
from .model import MemoryExtractionJobModel as Job
from .service import MemoryService

MEMORY_WORKERS = 4
MEMORY_TIMEOUT_SECONDS = 90
MEMORY_LEASE_SECONDS = 120
MEMORY_POLL_SECONDS = 1
_workers: set[asyncio.Task] = set()
_wake: asyncio.Event | None = None
_stopping = False


def wake_memory_worker() -> None:
    if _wake is not None:
        _wake.set()


async def _finish_sql(operation):
    """先等待短 SQL 事务结束，再向上传播工作任务取消。"""
    task = asyncio.create_task(operation)
    try:
        return await asyncio.shield(task)
    except asyncio.CancelledError:
        with suppress(Exception):
            await task
        raise


async def claim_memory_job() -> Job | None:
    now = datetime.now()
    older = aliased(Job)
    # 每个用户仅允许执行最早的未完成轮次，跨进程也遵循此约束。
    no_older = ~select(older.id).where(older.user_id == Job.user_id, older.id < Job.id).exists()
    available = (Job.available_at <= now, or_(Job.lease_until.is_(None), Job.lease_until <= now))
    async with async_db_session() as db, db.begin():
        job = await db.scalar(select(Job).where(*available, no_older).order_by(Job.id).limit(1))
        if job is None:
            return None
        user_id = job.user_id
        # 较晚提交的旧任务可能在新任务已被认领后才可见。
        # 通过用户行锁串行化认领，并使用当前加锁读取，避免读取过期快照。
        await db.execute(update(UserModel).where(UserModel.id == int(user_id)).values(
            id=UserModel.id, updated_time=UserModel.updated_time,
        ))
        job = await db.scalar(select(Job).where(Job.user_id == user_id).order_by(Job.id).limit(1).with_for_update())
        running = await db.scalar(select(Job.id).where(
            Job.user_id == user_id, Job.lease_until > now,
        ).limit(1).with_for_update())
        if job is None or running is not None or job.available_at > now or (job.lease_until is not None and job.lease_until > now):
            return None
        token = uuid4().hex
        claimed = await db.execute(update(Job).where(
            Job.id == job.id, *available,
        ).values(
            token=token, lease_until=now + timedelta(seconds=MEMORY_LEASE_SECONDS),
            attempts=Job.attempts + 1,
        ).execution_options(synchronize_session=False))
        if claimed.rowcount != 1:
            return None
        await db.refresh(job)
        # 即使部署环境在提交时使 ORM 状态过期，此数据对象仍须可读。
        db.expunge(job)
        return job


async def _source_exists(db: AsyncSession, job: Job) -> bool:
    return await db.scalar(select(ChatSessionModel.id).where(
        ChatSessionModel.session_id == job.session_id,
        ChatSessionModel.user_id == job.user_id,
        ChatSessionModel.is_deleted == False,
        select(UserModel.id).where(UserModel.id == int(job.user_id), UserModel.is_deleted == False).exists(),
    )) is not None


async def _apply_job(job: Job, extractor: MemoryExtractor, actions) -> None:
    async with async_db_session() as db, db.begin():
        owned = await db.execute(update(Job).where(
            Job.id == job.id, Job.token == job.token, Job.lease_until > datetime.now(),
        ).values(lease_until=Job.lease_until))
        if owned.rowcount != 1:
            return
        if await _source_exists(db, job):
            await extractor.save_actions(crud=MemoryCRUD(MemoryService.for_user(db, job.user_id).auth), actions=actions)
        # 任务完成与全部记忆写入共用一次提交，避免响应丢失后重复执行操作。
        await db.execute(delete(Job).where(Job.id == job.id, Job.token == job.token))


async def process_memory_job(job: Job) -> None:
    extractor = MemoryExtractor()
    try:
        async with asyncio.timeout(MEMORY_TIMEOUT_SECONDS):
            active, existing = await _finish_sql(_load_memories(job))
            if not active:
                await _finish_sql(_apply_job(job, extractor, []))
                return
            with usage_context(int(job.user_id), "memory"):
                actions = await extractor.extract_actions(
                    user_message=job.user_message, assistant_response=job.assistant_response,
                    existing_memories=existing,
                )
            await _finish_sql(_apply_job(job, extractor, actions))
    except asyncio.CancelledError:
        # 即使关闭时无法连接 SQL 数据库，持久化租约仍支持后续恢复。
        await _finish_sql(_retry_job(job, immediate=True))
        raise
    except Exception:
        logger.warning("记忆提取失败，任务保留待重试: job_id={}", job.id)
        await _finish_sql(_retry_job(job))


async def _load_memories(job: Job):
    async with async_db_session() as db, db.begin():
        owned = await db.scalar(select(Job.id).where(
            Job.id == job.id, Job.token == job.token, Job.lease_until > datetime.now(),
        ))
        if owned is None:
            return False, []
        active = await _source_exists(db, job)
        existing = await MemoryService.for_user(db, job.user_id).get_active_memories() if active else []
        return active, existing


async def _retry_job(job: Job, *, immediate: bool = False) -> None:
    delay = 0 if immediate else min(300, 2 ** min(job.attempts, 8))
    async with async_db_session() as db, db.begin():
        await db.execute(update(Job).where(Job.id == job.id, Job.token == job.token).values(
            token=None, lease_until=None, available_at=datetime.now() + timedelta(seconds=delay),
        ))


async def _run_worker() -> None:
    while not _stopping:
        try:
            claim = asyncio.create_task(claim_memory_job())
            try:
                job = await asyncio.shield(claim)
            except asyncio.CancelledError:
                with suppress(Exception):
                    job = await claim
                    if job is not None:
                        await _finish_sql(_retry_job(job, immediate=True))
                raise
            if job is not None:
                await process_memory_job(job)
                continue
        except Exception:
            logger.warning("记忆任务队列暂不可用，稍后重试")
        try:
            await asyncio.wait_for(_wake.wait(), timeout=MEMORY_POLL_SECONDS)
        except TimeoutError:
            pass
        _wake.clear()


async def initialize_memory_worker() -> None:
    global _wake, _stopping
    if _workers:
        return
    async with async_db_session() as db:
        await db.execute(select(Job.id).limit(1))
    _wake = asyncio.Event()
    _stopping = False
    for index in range(MEMORY_WORKERS):
        task = asyncio.create_task(_run_worker(), name=f"memory-extraction-{index}")
        _workers.add(task)


async def stop_memory_extraction() -> None:
    global _wake, _stopping
    _stopping = True
    tasks = tuple(_workers)
    for task in tasks:
        task.cancel()
    await asyncio.gather(*tasks, return_exceptions=True)
    _workers.clear()
    _wake = None
