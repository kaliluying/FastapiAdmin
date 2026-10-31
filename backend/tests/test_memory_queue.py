import asyncio
import json
import socket
from contextvars import ContextVar
from datetime import datetime, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from langchain_core.messages import AIMessage
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.api.v1.module_system.user.model import UserModel
from app.core.modules import resolve_entrypoint
from app.plugin.module_ai.chat import memory_worker as worker
from app.plugin.module_ai.chat import rag, usage
from app.plugin.module_ai.chat.crud import ChatSessionCRUD
from app.plugin.module_ai.chat.model import ChatSessionModel
from app.plugin.module_ai.chat.model import MemoryExtractionJobModel as Job
from app.plugin.module_ai.chat.model_config_service import ChatModelRuntimeConfig
from app.plugin.module_ai.chat.schema import ChatSessionCreateSchema
from app.plugin.module_ai.chat.usage_model import AiUsageDailyModel, AiUsageQuotaModel, AiUsageRecordModel
from app.plugin.module_ai.config import async_validate_model_base_url
from app.plugin.module_ai.config import settings as ai_settings
from app.plugin.module_ai.memory.model import AiMemoryModel
from app.plugin.module_ai.memory.public import MemoryService
from app.plugin.module_ai.module import get_module

RESULT = '{"actions":[{"action":"create","key":"style","value":"concise","confidence":0.9,"is_long_term":true,"source_quote":"Always use concise replies"}]}'


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
    monkeypatch.setattr(worker, "get_cached_chat_model", lambda: model)
    monkeypatch.setattr(worker, "async_validate_model_base_url", AsyncMock())
    try:
        yield sessions, model
    finally:
        await asyncio.wait_for(worker.stop_memory_extraction(), 3)
        await engine.dispose()


async def add_turn(sessions, user_id=1):
    async with sessions() as db:
        crud = ChatSessionCRUD(SimpleNamespace(db=db, user=SimpleNamespace(id=user_id)))
        session = await crud.create_crud(ChatSessionCreateSchema(title="test"))
        assert await crud.append_run_crud(session_id=session.session_id, message="Always use concise replies", response="ok")
        await db.commit()
        return session.session_id, crud.last_run_id


async def count(sessions, model):
    async with sessions() as db:
        return await db.scalar(select(func.count()).select_from(model))


async def test_memory_worker_revalidates_dns_before_provider_call(queue, monkeypatch):
    sessions, model = queue
    monkeypatch.setattr(worker, "async_validate_model_base_url", async_validate_model_base_url)
    monkeypatch.setattr(worker, "get_active_chat_model_config", lambda: SimpleNamespace(base_url="https://model.fixture.invalid/v1"))
    monkeypatch.setattr(ai_settings, "MODEL_ALLOWED_HOSTS", [])
    monkeypatch.setattr(socket, "getaddrinfo", lambda *a, **kw: [(socket.AF_INET, socket.SOCK_STREAM, 6, "", ("127.0.0.1", 443))])
    await add_turn(sessions)
    await worker.process_memory_job(await worker.claim_memory_job())
    model.complete.assert_not_awaited()
    assert await count(sessions, AiMemoryModel) == 0
    async with sessions() as db:
        job = (await db.scalars(select(Job))).one()
        assert job.status == "pending" and job.token is None and job.attempts == 1


async def wait_empty(sessions):
    async with asyncio.timeout(5):
        while await count(sessions, Job):
            await asyncio.sleep(0.01)


@pytest.mark.parametrize("limit", [0, 1])
async def test_registered_worker_injects_model_and_keeps_memory_usage_and_quota(queue, monkeypatch, limit):
    sessions, _ = queue
    async with sessions() as db:
        async with db.bind.begin() as connection:
            for model in (AiUsageDailyModel, AiUsageQuotaModel, AiUsageRecordModel):
                await connection.run_sync(model.__table__.create)
    monkeypatch.setattr(usage, "async_db_session", sessions)
    monkeypatch.setattr(usage, "_usage_owner", ContextVar("worker_usage_owner", default=None))
    model = object.__new__(rag.LangChainChatModel)
    model.config = ChatModelRuntimeConfig("openai", "https://fixture.invalid/v1", "fixture", "synthetic")
    model.llm = SimpleNamespace(ainvoke=AsyncMock(return_value=AIMessage(
        content=RESULT, usage_metadata={"input_tokens": 2, "output_tokens": 3, "total_tokens": 5},
    )))
    monkeypatch.setattr(worker, "get_cached_chat_model", lambda: model)
    await usage.set_quota(1, limit)
    await add_turn(sessions)
    spec = get_module()
    start = next(entry for entry in spec.startup_hooks if entry.endswith(":initialize_memory_worker"))
    stop = next(entry for entry in spec.shutdown_hooks if entry.endswith(":stop_memory_extraction"))
    await resolve_entrypoint(start)()
    try:
        if limit:
            await wait_empty(sessions)
            assert await count(sessions, AiMemoryModel) == 1
            model.llm.ainvoke.assert_awaited_once()
            async with sessions() as db:
                record = (await db.scalars(select(AiUsageRecordModel))).one()
                assert (record.user_id, record.purpose, record.status, record.total_tokens) == (1, "memory", "succeeded", 5)
        else:
            async with asyncio.timeout(3):
                while True:
                    async with sessions() as db:
                        job = (await db.scalars(select(Job))).one()
                        if job.attempts and job.token is None:
                            break
                    await asyncio.sleep(0.01)
            model.llm.ainvoke.assert_not_awaited()
            assert await count(sessions, AiMemoryModel) == 0
            assert await count(sessions, AiUsageRecordModel) == 0
        assert usage._usage_owner.get() is None
    finally:
        await resolve_entrypoint(stop)()
    assert not worker._workers


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
        original = MemoryService.apply_extracted_actions

        async def fail_after_write(self, actions):
            await original(self, actions)
            raise RuntimeError("write interrupted")

        monkeypatch.setattr(MemoryService, "apply_extracted_actions", fail_after_write)
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
        monkeypatch.setattr(MemoryService, "apply_extracted_actions", original)
    model.complete.side_effect = None
    model.complete.return_value = RESULT
    retry = await worker.claim_memory_job()
    assert retry.attempts == 2
    await worker.process_memory_job(retry)
    assert await count(sessions, Job) == 0
    assert await count(sessions, AiMemoryModel) == 1


async def test_permanent_failure_becomes_dead_and_does_not_block_later_turn(queue, monkeypatch):
    sessions, model = queue
    monkeypatch.setattr(worker, "MEMORY_MAX_ATTEMPTS", 1)
    first_session_id, _ = await add_turn(sessions)
    async with sessions() as db:
        crud = ChatSessionCRUD(SimpleNamespace(db=db, user=SimpleNamespace(id=1)))
        assert await crud.append_run_crud(session_id=first_session_id, message="Always use concise replies", response="ok")
        await db.commit()
    model.complete.side_effect = RuntimeError("provider unavailable")

    first = await worker.claim_memory_job()
    await worker.process_memory_job(first)

    async with sessions() as db:
        dead = await db.get(Job, first.id)
        assert dead.status == "dead"
        assert dead.token is None and dead.lease_until is None
        assert dead.error_message == "记忆提取失败，已达到最大重试次数"

    model.complete.side_effect = None
    model.complete.return_value = RESULT
    second = await worker.claim_memory_job()
    assert second is not None and second.session_id == first_session_id
    await worker.process_memory_job(second)
    assert await count(sessions, Job) == 1


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
