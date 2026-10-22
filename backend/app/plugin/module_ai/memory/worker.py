"""SQL-backed memory queue: bounded workers, ordered users and fenced retries."""

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
    """Let a short SQL transaction close before propagating worker cancellation."""
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
    # Only the oldest unfinished turn for a user may run, including across processes.
    no_older = ~select(older.id).where(older.user_id == Job.user_id, older.id < Job.id).exists()
    available = (Job.available_at <= now, or_(Job.lease_until.is_(None), Job.lease_until <= now))
    async with async_db_session() as db, db.begin():
        job = await db.scalar(select(Job).where(*available, no_older).order_by(Job.id).limit(1))
        if job is None:
            return None
        user_id = job.user_id
        # A late commit can reveal an older job after a newer one was claimed.
        # Serialize claims on the user row and use current locking reads, not a stale snapshot.
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
        # This value object must remain readable when installations expire ORM state on commit.
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
        # Completion and all memory writes share one commit; a lost reply cannot replay actions.
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
        # The durable lease recovers even if shutdown itself cannot reach SQL.
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
