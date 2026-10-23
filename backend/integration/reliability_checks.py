"""Disposable MySQL checks; model responses are deterministic and never sent externally."""

import asyncio
import io
import json
import os
import signal
import subprocess
import sys
import time
import uuid
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock

RESULT = '{"actions":[{"action":"create","key":"reliability","value":"restart-survived","confidence":0.9}]}'


async def verify_reliability() -> dict:
    import httpx
    from fastapi import BackgroundTasks, UploadFile
    from sqlalchemy import func, select, update

    from app.api.v1.module_system.user.model import UserModel
    from app.config.setting import settings
    from app.core.base_schema import AuthSchema
    from app.core.database import async_db_session, async_engine
    from app.plugin.module_ai.chat import service as chat
    from app.plugin.module_ai.knowledge import _upload_recovery as uploads
    from app.plugin.module_ai.knowledge import document_lifecycle as knowledge
    from app.plugin.module_ai.knowledge.model import KnowledgeBaseModel, KnowledgeDocumentModel
    from app.plugin.module_ai.memory import worker
    from app.plugin.module_ai.memory.extractor import MemoryExtractor
    from app.plugin.module_ai.memory.model import AiMemoryModel
    from app.plugin.module_ai.memory.model import MemoryExtractionJobModel as Job
    from app.utils.hash_bcrpy_util import PwdUtil
    from main import create_app

    release = asyncio.Event()
    entered = asyncio.Event()
    full = asyncio.Event()
    concurrent = maximum = calls = 0

    async def complete(_):
        nonlocal concurrent, maximum, calls
        calls += 1
        concurrent += 1
        maximum = max(maximum, concurrent)
        entered.set()
        if concurrent == 4:
            full.set()
        try:
            await release.wait()
            return RESULT
        finally:
            concurrent -= 1

    async def ordinary_routing(*_args, **_kwargs):
        if False:
            yield

    worker.MemoryExtractor = lambda: MemoryExtractor(chat_model=SimpleNamespace(complete=complete))
    chat.ChatService._validate_ai_config = staticmethod(AsyncMock(return_value=None))
    chat.ChatService._stream_log_analysis = ordinary_routing
    chat.create_rag_chain = lambda **_: SimpleNamespace(ainvoke=AsyncMock(return_value="accepted"))
    settings.CAPTCHA_ENABLE = False
    settings.RATE_LIMITER_TIMES = 100
    uploads.UPLOAD_RECOVERY_DELAY_SECONDS = 0
    async with async_db_session() as db:
        user_id = await db.scalar(select(UserModel.id).where(UserModel.username == "admin"))
        await db.execute(update(UserModel).where(UserModel.id == user_id).values(password=PwdUtil.hash_password("isolated-acceptance")))
        await db.commit()

    async def job_count():
        async with async_db_session() as db:
            return await db.scalar(select(func.count()).select_from(Job))

    async def drained():
        async with asyncio.timeout(15):
            while await job_count():
                await asyncio.sleep(0.05)

    app = create_app()
    try:
        async with app.router.lifespan_context(app):
            assert len(worker._workers) == 4
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://127.0.0.1") as client:
                login = await client.post("/system/auth/login", data={"username": "admin", "password": "isolated-acceptance"})
                assert login.status_code == 200
                headers = {"Authorization": "Bearer " + login.json()["data"]["access_token"]}
                for _ in range(7):
                    response = await client.post("/ai/chat/ai-chat", json={"message": "use concise replies"}, headers=headers)
                    assert response.status_code == 200 and response.json()["data"]["response"] == "accepted"
                await asyncio.wait_for(entered.wait(), 5)
                assert await job_count() == 7
            release.set()
            await drained()
            assert calls == 7
            async with async_db_session() as db:
                assert await db.scalar(select(func.count()).select_from(AiMemoryModel).where(AiMemoryModel.user_id == str(user_id))) == 1

            # Different users fill all four slots; the fifth and sixth remain in SQL.
            from app.plugin.module_ai.chat.crud import ChatSessionCRUD
            from app.plugin.module_ai.chat.schema import ChatSessionCreateSchema

            release.clear()
            for index in range(6):
                async with async_db_session() as db:
                    user = UserModel(username=f"queue-{index}", name="isolated", password="unused")
                    db.add(user)
                    await db.flush()
                    crud = ChatSessionCRUD(SimpleNamespace(db=db, user=user))
                    session = await crud.create_crud(ChatSessionCreateSchema(title="queue"))
                    assert await crud.append_run_crud(session_id=session.session_id, message="preference", response="ack")
                    await db.commit()
                worker.wake_memory_worker()
            await asyncio.wait_for(full.wait(), 5)
            assert await job_count() == 6
            release.set()
            await drained()
            assert maximum == 4 and calls == 13

            for operation in ("upload", "replace"):
                for committed in (False, True):
                    async with async_db_session() as db:
                        base = KnowledgeBaseModel(name="commit reconciliation", created_id=user_id)
                        db.add(base)
                        await db.flush()
                        base_id = base.id
                        old = knowledge.UPLOAD_DIR / f"kb-{base_id}-{uuid.uuid4().hex}.txt"
                        old.parent.mkdir(parents=True, exist_ok=True)
                        old.write_bytes(b"original")
                        document = KnowledgeDocumentModel(
                            knowledge_base_id=base.id, file_name="old.txt", file_path=old.name,
                            file_type="txt", file_size=8, parse_status="success", index_status="success", created_id=user_id,
                        )
                        db.add(document)
                        await db.commit()
                        document_id = document.id
                        service = knowledge.KnowledgeDocumentLifecycle(AuthSchema(db=db, user=SimpleNamespace(id=user_id), check_data_scope=False))
                        before = set(knowledge.UPLOAD_DIR.iterdir())
                        commit = db.commit

                        async def lose_ack(committed=committed, commit=commit):
                            if committed:
                                await commit()
                            else:
                                await db.rollback()
                            raise ConnectionError("isolated commit acknowledgment loss")

                        db.commit = lose_ack
                        try:
                            file = UploadFile(filename="new.txt", file=io.BytesIO(b"replacement"))
                            if operation == "upload":
                                await service.upload_document(knowledge_base_id=base_id, file=file, background_tasks=BackgroundTasks())
                            else:
                                await service.replace_document(document_id, file, BackgroundTasks())
                        except ConnectionError:
                            pass
                        else:
                            raise AssertionError("the commit fault did not execute")
                    new_files = set(knowledge.UPLOAD_DIR.iterdir()) - before
                    assert len(new_files) == 1
                    new_file = new_files.pop()
                    await knowledge.reconcile_orphan_uploads(knowledge.UPLOAD_DIR)
                    assert new_file.exists() == committed
                    assert old.read_bytes() == b"original"

                    # The MySQL row lock must protect an aged file even before commit resolves.
                    async with async_db_session() as db:
                        owner_model = KnowledgeBaseModel if operation == "upload" else KnowledgeDocumentModel
                        owner_id = base_id if operation == "upload" else document_id
                        owner_kind = "kb" if operation == "upload" else "doc"
                        await db.execute(update(owner_model).where(owner_model.id == owner_id).values(updated_time=owner_model.updated_time))
                        orphan = knowledge.UPLOAD_DIR / f"{owner_kind}-{owner_id}-{uuid.uuid4().hex}.txt"
                        orphan.write_bytes(b"unfinished")
                        os.utime(orphan, (1, 1))
                        await asyncio.wait_for(knowledge.reconcile_orphan_uploads(knowledge.UPLOAD_DIR), 3)
                        assert orphan.exists()
                        await db.rollback()
                    await knowledge.reconcile_orphan_uploads(knowledge.UPLOAD_DIR)
                    assert not orphan.exists()

            # Verify the production lifecycle loop itself eventually performs cleanup.
            orphan = knowledge.UPLOAD_DIR / f"kb-{base_id}-{uuid.uuid4().hex}.txt"
            orphan.write_bytes(b"periodic orphan")
            async with asyncio.timeout(20):
                while orphan.exists():
                    await asyncio.sleep(0.1)
        assert not worker._workers
        return {
            "passed": True, "model": "deterministic local stand-in; no provider request",
            "checks": ["authenticated HTTP chat persists seven queued turns", "real SQL queue drains without lost turns",
                       "six users saturate four workers without skipping", "upload and replacement commit/rollback acknowledgment loss",
                       "MySQL busy transaction is skipped, then orphan removed after rollback",
                       "production recovery loop deletes orphan", "production shutdown drains memory workers"],
        }
    finally:
        release.set()
        await async_engine.dispose()


async def memory_restart_phase(phase: str) -> dict:
    from fastapi import BackgroundTasks, UploadFile
    from sqlalchemy import func, select

    from app.api.v1.module_system.user.model import UserModel
    from app.core.base_schema import AuthSchema
    from app.core.database import async_db_session, async_engine
    from app.plugin.module_ai.chat.crud import ChatSessionCRUD
    from app.plugin.module_ai.chat.schema import ChatSessionCreateSchema
    from app.plugin.module_ai.knowledge import document_lifecycle as knowledge
    from app.plugin.module_ai.knowledge.model import KnowledgeBaseModel
    from app.plugin.module_ai.memory import worker
    from app.plugin.module_ai.memory.extractor import MemoryExtractor
    from app.plugin.module_ai.memory.model import AiMemoryModel
    from app.plugin.module_ai.memory.model import MemoryExtractionJobModel as Job
    from main import create_app

    root = Path(os.environ["FASTCORE_INTEGRATION_ROOT"])
    upload_task = None
    try:
        if phase == "prepare-memory":
            async with async_db_session() as db:
                user = UserModel(username="crash-memory", name="isolated", password="unused")
                db.add(user)
                await db.flush()
                crud = ChatSessionCRUD(SimpleNamespace(db=db, user=user))
                session = await crud.create_crud(ChatSessionCreateSchema(title="crash recovery"))
                assert await crud.append_run_crud(session_id=session.session_id, message="remember", response="ack")
                base = KnowledgeBaseModel(name="upload process crash", created_id=user.id)
                db.add(base)
                await db.flush()
                fixture = {"user_id": user.id, "run_id": crud.last_run_id, "base_id": base.id}
                await db.commit()
                (root / "memory-fixture.json").write_text(json.dumps(fixture))
            return {"prepared": True}

        fixture = json.loads((root / "memory-fixture.json").read_text())
        upload_ready = asyncio.Event()

        async def unfinished_upload():
            async with async_db_session() as db:
                async def pause_commit():
                    (orphan,) = knowledge.UPLOAD_DIR.glob(f"kb-{fixture['base_id']}-*.txt")
                    os.utime(orphan, (1, 1))
                    fixture["orphan_file"] = orphan.name
                    (root / "memory-fixture.json").write_text(json.dumps(fixture))
                    upload_ready.set()
                    await asyncio.Event().wait()

                db.commit = pause_commit
                await knowledge.KnowledgeDocumentLifecycle(AuthSchema(db=db, user=SimpleNamespace(id=fixture["user_id"]), check_data_scope=False)).upload_document(
                    knowledge_base_id=fixture["base_id"],
                    file=UploadFile(filename="crashed.txt", file=io.BytesIO(b"uncommitted process crash")),
                    background_tasks=BackgroundTasks(),
                )

        async def complete(_):
            if phase == "crash-memory":
                await upload_ready.wait()
                (root / "memory-claimed").write_text("SQL lease committed; provider barrier entered")
                await asyncio.Event().wait()
            return RESULT

        worker.MemoryExtractor = lambda: MemoryExtractor(chat_model=SimpleNamespace(complete=complete))
        if phase == "crash-memory":
            worker.MEMORY_LEASE_SECONDS = 2
        app = create_app()
        async with app.router.lifespan_context(app):
            if phase == "crash-memory":
                upload_task = asyncio.create_task(unfinished_upload())
                await asyncio.Event().wait()
            async with asyncio.timeout(15):
                while True:
                    async with async_db_session() as db:
                        pending = await db.scalar(select(Job.id).where(Job.run_id == fixture["run_id"]))
                        orphan_exists = (knowledge.UPLOAD_DIR / fixture["orphan_file"]).exists()
                        if pending is None and not orphan_exists:
                            assert await db.scalar(select(func.count()).select_from(AiMemoryModel).where(
                                AiMemoryModel.user_id == str(fixture["user_id"]), AiMemoryModel.value == "restart-survived",
                            )) == 1
                            break
                    await asyncio.sleep(0.1)
        return {"passed": True, "phase": phase, "pid": os.getpid()}
    finally:
        if upload_task is not None:
            upload_task.cancel()
            await asyncio.gather(upload_task, return_exceptions=True)
        await async_engine.dispose()


def verify_memory_process_restart(environment: dict, artifacts: Path, script: Path) -> dict:
    for phase in ("prepare-memory", "crash-memory", "recover-memory", "recover-memory"):
        with (artifacts / f"{phase}-{time.monotonic_ns()}.log").open("w") as log:
            process = subprocess.Popen([sys.executable, str(script), "--phase", phase], env=environment, stdout=log, stderr=log)
            try:
                if phase == "crash-memory":
                    deadline = time.monotonic() + 30
                    while not (artifacts / "memory-claimed").exists():
                        assert process.poll() is None and time.monotonic() < deadline, "memory claim barrier was not reached"
                        time.sleep(0.1)
                    process.kill()
                    assert process.wait(timeout=5) == -signal.SIGKILL
                    time.sleep(2.2)
                else:
                    assert process.wait(timeout=60) == 0, f"memory restart acceptance failed: {phase}"
            finally:
                if process.poll() is None:
                    process.kill()
                    process.wait(timeout=5)
    return {"passed": True, "checks": ["real SIGKILL after durable memory claim", "new process recovers expired SQL lease",
                                     "uncommitted uploaded file is reclaimed after process death",
                                     "second process restart does not duplicate memory"]}
