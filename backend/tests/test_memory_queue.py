import asyncio
import json
from datetime import datetime, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.api.v1.module_system.user.model import UserModel
from app.plugin.module_ai.chat.crud import ChatSessionCRUD
from app.plugin.module_ai.chat.model import ChatSessionModel
from app.plugin.module_ai.chat.schema import ChatSessionCreateSchema
from app.plugin.module_ai.memory import worker
from app.plugin.module_ai.memory.extractor import MemoryExtractor
from app.plugin.module_ai.memory.model import AiMemoryModel
from app.plugin.module_ai.memory.model import MemoryExtractionJobModel as Job

RESULT = '{"actions":[{"action":"create","key":"style","value":"concise","confidence":0.9}]}'


@pytest.fixture
async def queue(tmp_path, monkeypatch):
    engine = create_async_engine(
        f"sqlite+aiosqlite:///{tmp_path / 'queue.db'}", pool_size=1, max_overflow=0, pool_timeout=1,
    )
    async with engine.begin() as connection:
        for model in (UserModel, ChatSessionModel, AiMemoryModel, Job):
            await connection.run_sync(model.__table__.create)
        await connection.execute(UserModel.__table__.insert(), [
            {"id": user_id, "username": f"user{user_id}", "name": "test", "password": "unused"}
            for user_id in range(1, 11)
        ])
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    monkeypatch.setattr(worker, "async_db_session", sessions)
    monkeypatch.setattr(worker, "MEMORY_POLL_SECONDS", 0.01)
    model = SimpleNamespace(complete=AsyncMock(return_value=RESULT))
    monkeypatch.setattr(worker, "MemoryExtractor", lambda: MemoryExtractor(chat_model=model))
    try:
        yield sessions, model
    finally:
        await asyncio.wait_for(worker.stop_memory_extraction(), 3)
        await engine.dispose()


async def add_turn(sessions, user_id=1):
    async with sessions() as db:
        crud = ChatSessionCRUD(SimpleNamespace(db=db, user=SimpleNamespace(id=user_id)))
        session = await crud.create_crud(ChatSessionCreateSchema(title="test"))
        assert await crud.append_run_crud(session_id=session.session_id, message="use concise replies", response="ok")
        await db.commit()
        return session.session_id, crud.last_run_id


async def count(sessions, model):
    async with sessions() as db:
        return await db.scalar(select(func.count()).select_from(model))


async def wait_empty(sessions):
    async with asyncio.timeout(5):
        while await count(sessions, Job):
            await asyncio.sleep(0.01)


async def test_turn_and_job_commit_or_rollback_together(queue):
    sessions, _ = queue
    session_id, run_id = await add_turn(sessions)
    async with sessions() as db:
        job = await db.scalar(select(Job))
        assert (job.session_id, job.run_id, job.user_id) == (session_id, run_id, "1")
        crud = ChatSessionCRUD(SimpleNamespace(db=db, user=SimpleNamespace(id=1)))
        assert await crud.append_run_crud(session_id=session_id, message="rolled back", response="discard")
        await db.rollback()
    assert await count(sessions, Job) == 1
    async with sessions() as db:
        session = await db.scalar(select(ChatSessionModel))
        assert len(session.runs) == 1


async def test_saturation_queues_all_turns_and_keeps_only_four_provider_calls(queue):
    sessions, model = queue
    for user_id in range(1, 10):
        await add_turn(sessions, user_id)
    release = asyncio.Event()
    full = asyncio.Event()
    running = maximum = started = 0

    async def complete(_):
        nonlocal running, maximum, started
        running += 1
        started += 1
        maximum = max(maximum, running)
        if running == 4:
            full.set()
        try:
            await release.wait()
            return RESULT
        finally:
            running -= 1

    model.complete.side_effect = complete
    await worker.initialize_memory_worker()
    await worker.initialize_memory_worker()
    await asyncio.wait_for(full.wait(), 3)
    # All turns remain durable while the provider blocks; SQL is still usable.
    assert await count(sessions, Job) == 9
    assert started == 4 and len(worker._workers) == 4
    release.set()
    await wait_empty(sessions)
    assert started == 9 and maximum == 4
    assert await count(sessions, AiMemoryModel) == 9


async def test_user_turns_are_ordered_while_other_users_can_progress(queue):
    sessions, _ = queue
    await add_turn(sessions, 1)
    await add_turn(sessions, 1)
    await add_turn(sessions, 2)
    first = await worker.claim_memory_job()
    other = await worker.claim_memory_job()
    assert (first.user_id, other.user_id) == ("1", "2")
    assert await worker.claim_memory_job() is None
    await worker.process_memory_job(first)
    second = await worker.claim_memory_job()
    assert second.user_id == "1" and second.id > first.id
    await worker.process_memory_job(second)
    await worker.process_memory_job(other)
    assert await count(sessions, Job) == 0
    assert await count(sessions, AiMemoryModel) == 2


async def test_late_visible_older_turn_cannot_overlap_an_existing_user_lease(queue):
    sessions, _ = queue
    session_id, _ = await add_turn(sessions)
    running = await worker.claim_memory_job()
    async with sessions() as db:
        db.add(Job(id=0, user_id="1", session_id=session_id, run_id="late-commit",
                   user_message="earlier", assistant_response="ok"))
        await db.commit()
    assert await worker.claim_memory_job() is None
    await worker.process_memory_job(running)
    assert (await worker.claim_memory_job()).run_id == "late-commit"


@pytest.mark.parametrize("deleted", ["user", "session"])
async def test_deleted_source_finishes_without_sending_content_to_provider(queue, deleted):
    sessions, model = queue
    await add_turn(sessions)
    async with sessions() as db:
        source = UserModel if deleted == "user" else ChatSessionModel
        await db.execute(update(source).values(is_deleted=True))
        await db.commit()
    await worker.process_memory_job(await worker.claim_memory_job())
    assert await count(sessions, Job) == 0
    assert await count(sessions, AiMemoryModel) == 0
    model.complete.assert_not_awaited()


@pytest.mark.parametrize("failure", ["provider", "write", "empty", "json", "schema"])
async def test_failures_keep_jobs_and_retry_without_partial_memory_writes(queue, monkeypatch, failure):
    sessions, model = queue
    await add_turn(sessions)
    job = await worker.claim_memory_job()
    if failure == "provider":
        model.complete.side_effect = RuntimeError("provider unavailable")
    elif failure == "write":
        original = MemoryExtractor.save_actions

        async def fail_after_write(self, **kwargs):
            await original(self, **kwargs)
            raise RuntimeError("write interrupted")

        monkeypatch.setattr(MemoryExtractor, "save_actions", fail_after_write)
    else:
        model.complete.return_value = {"empty": "", "json": "invalid", "schema": "{}"}[failure]
    await worker.process_memory_job(job)
    assert await count(sessions, Job) == 1
    assert await count(sessions, AiMemoryModel) == 0
    async with sessions() as db:
        stored = await db.get(Job, job.id)
        assert stored.attempts == 1 and stored.token is None
        assert stored.available_at > datetime.now()
        stored.available_at = datetime.now() - timedelta(seconds=1)
        await db.commit()
    if failure == "write":
        monkeypatch.setattr(MemoryExtractor, "save_actions", original)
    model.complete.side_effect = None
    model.complete.return_value = RESULT
    retry = await worker.claim_memory_job()
    assert retry.attempts == 2
    await worker.process_memory_job(retry)
    assert await count(sessions, Job) == 0
    assert await count(sessions, AiMemoryModel) == 1


@pytest.mark.parametrize("invalid", [
    {"action": "create", "key": "style"},
    {"action": "update", "key": "  ", "value": "concise"},
    {"action": "create", "key": "style", "value": "  "},
    {"action": "delete"},
    {"action": "delete", "memory_id": 0},
    {"action": "unknown", "key": "style", "value": "concise"},
])
async def test_invalid_action_does_not_complete_job_or_partially_apply_valid_actions(queue, invalid):
    sessions, model = queue
    await add_turn(sessions)
    model.complete.return_value = json.dumps({"actions": [
        {"action": "create", "key": "valid", "value": "must roll back", "confidence": 0.9},
        {**invalid, "confidence": 0.9},
    ]})
    await worker.process_memory_job(await worker.claim_memory_job())
    assert await count(sessions, Job) == 1
    assert await count(sessions, AiMemoryModel) == 0


async def test_ack_loss_after_success_does_not_replay_memory(queue, monkeypatch):
    sessions, model = queue
    await add_turn(sessions)
    job = await worker.claim_memory_job()
    original = worker._apply_job

    async def lose_ack(*args):
        await original(*args)
        raise ConnectionError("commit acknowledgment lost")

    monkeypatch.setattr(worker, "_apply_job", lose_ack)
    await worker.process_memory_job(job)
    assert await count(sessions, Job) == 0
    assert await count(sessions, AiMemoryModel) == 1
    assert await worker.claim_memory_job() is None
    assert model.complete.await_count == 1


async def test_expired_lease_is_reclaimed_and_stale_worker_cannot_write(queue):
    sessions, model = queue
    await add_turn(sessions)
    stale = await worker.claim_memory_job()
    async with sessions() as db:
        await db.execute(update(Job).values(lease_until=datetime.now() - timedelta(seconds=1)))
        await db.commit()
    current = await worker.claim_memory_job()
    assert current.token != stale.token and current.attempts == 2
    await worker.process_memory_job(stale)
    assert await count(sessions, AiMemoryModel) == 0
    assert await count(sessions, Job) == 1
    model.complete.assert_not_awaited()
    await worker.process_memory_job(current)
    assert await count(sessions, AiMemoryModel) == 1
    assert await count(sessions, Job) == 0


async def test_shutdown_retains_and_restart_recovers_all_jobs(queue):
    sessions, model = queue
    for user_id in range(1, 7):
        await add_turn(sessions, user_id)
    entered = asyncio.Event()

    async def blocked(_):
        entered.set()
        await asyncio.Event().wait()

    model.complete.side_effect = blocked
    await worker.initialize_memory_worker()
    await asyncio.wait_for(entered.wait(), 3)
    await asyncio.wait_for(worker.stop_memory_extraction(), 3)
    assert not worker._workers
    assert await count(sessions, Job) == 6
    model.complete.side_effect = None
    await worker.initialize_memory_worker()
    await wait_empty(sessions)
    assert await count(sessions, AiMemoryModel) == 6


async def test_timeout_releases_lease_for_retry(queue, monkeypatch):
    sessions, model = queue
    await add_turn(sessions)
    monkeypatch.setattr(worker, "MEMORY_TIMEOUT_SECONDS", 0.01)

    async def blocked(_):
        await asyncio.Event().wait()

    model.complete.side_effect = blocked
    await worker.process_memory_job(await worker.claim_memory_job())
    async with sessions() as db:
        job = await db.scalar(select(Job))
        assert job is not None and job.token is None and job.lease_until is None
    assert await count(sessions, AiMemoryModel) == 0


async def test_session_deletion_cancels_queued_and_inflight_memory(queue):
    sessions, model = queue
    session_id, _ = await add_turn(sessions)
    entered, release = asyncio.Event(), asyncio.Event()

    async def blocked(_):
        entered.set()
        await release.wait()
        return RESULT

    model.complete.side_effect = blocked
    job = await worker.claim_memory_job()
    task = asyncio.create_task(worker.process_memory_job(job))
    await asyncio.wait_for(entered.wait(), 1)
    try:
        async with sessions() as db:
            crud = ChatSessionCRUD(SimpleNamespace(db=db, user=SimpleNamespace(id=1)))
            assert await crud.delete_crud([session_id])
            await db.commit()
    finally:
        release.set()
        await task
    assert await count(sessions, Job) == 0
    assert await count(sessions, AiMemoryModel) == 0
