"""Upload reconciliation against temporary SQLite transactions and filesystem state."""

import asyncio
import io
import os
import subprocess
import sys
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock

import anyio
import pytest
from fastapi import BackgroundTasks, UploadFile
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.base_model import MappedBase
from app.core.base_schema import AuthSchema
from app.plugin.module_ai.knowledge import _upload_recovery as uploads
from app.plugin.module_ai.knowledge import document_lifecycle as knowledge
from app.plugin.module_ai.knowledge import recovery
from app.plugin.module_ai.knowledge.document_lifecycle import KnowledgeDocumentLifecycle
from app.plugin.module_ai.knowledge.model import KnowledgeBaseModel, KnowledgeDocumentModel


@pytest.fixture
async def upload_db(tmp_path, monkeypatch):
    root = tmp_path / "knowledge"
    root.mkdir()
    database = tmp_path / "uploads.db"
    engine = create_async_engine(f"sqlite+aiosqlite:///{database}", connect_args={"timeout": 0.05})
    async with engine.begin() as connection:
        await connection.run_sync(MappedBase.metadata.create_all)
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    monkeypatch.setattr(knowledge, "UPLOAD_DIR", root)
    monkeypatch.setattr(uploads, "async_db_session", sessions)
    monkeypatch.setattr(uploads, "UPLOAD_RECOVERY_DELAY_SECONDS", 0)
    monkeypatch.setattr(KnowledgeDocumentLifecycle, "index_document", AsyncMock(side_effect=AssertionError("No model/index calls")))
    async with sessions() as db:
        base = KnowledgeBaseModel(name="upload recovery")
        db.add(base)
        await db.flush()
        old = root / f"kb-{base.id}-{uuid.uuid4().hex}.txt"
        old.write_bytes(b"old contents")
        document = KnowledgeDocumentModel(
            knowledge_base_id=base.id,
            file_name="old.txt",
            file_path=old.name,
            file_type="txt",
            file_size=old.stat().st_size,
            parse_status="success",
            index_status="success",
        )
        db.add(document)
        await db.commit()
        case = SimpleNamespace(root=root, database=database, sessions=sessions, base_id=base.id, document_id=document.id, old=old)
    yield case
    await engine.dispose()


async def invoke(case, db, operation, file=None):
    service = KnowledgeDocumentLifecycle(AuthSchema(db=db, check_data_scope=False))
    file = file or UploadFile(filename="new.txt", file=io.BytesIO(b"new contents"))
    if operation == "upload":
        return await service.upload_document(knowledge_base_id=case.base_id, file=file, background_tasks=BackgroundTasks())
    return await service.replace_document(case.document_id, file, BackgroundTasks())


async def document_snapshot(case):
    async with case.sessions() as db:
        return (await db.execute(select(KnowledgeDocumentModel).order_by(KnowledgeDocumentModel.id.desc()))).scalars().first()


@pytest.mark.parametrize("operation", ["upload", "replace"])
@pytest.mark.parametrize("committed", [False, True], ids=["rollback", "lost-commit-ack"])
async def test_uncertain_commit_reconciles_from_database(upload_db, monkeypatch, operation, committed):
    case = upload_db
    async with case.sessions() as db:
        commit = db.commit

        async def uncertain_commit():
            if committed:
                await commit()
            else:
                await db.rollback()
            raise RuntimeError("commit reply lost")

        monkeypatch.setattr(db, "commit", uncertain_commit)
        with pytest.raises(RuntimeError, match="reply lost"):
            await invoke(case, db, operation)
    (new_file,) = set(case.root.iterdir()) - {case.old}
    await knowledge.reconcile_orphan_uploads(case.root)
    assert new_file.exists() is committed
    assert case.old.read_bytes() == b"old contents"
    document = await document_snapshot(case)
    if committed:
        assert (document.pending_file["file_path"] if operation == "replace" else document.file_path) == new_file.name
    else:
        assert document.id == case.document_id and document.pending_file is None
    await knowledge.reconcile_orphan_uploads(case.root)
    assert new_file.exists() is committed


@pytest.mark.parametrize("operation", ["upload", "replace"])
@pytest.mark.parametrize("stage", ["stream", "commit"])
async def test_long_transaction_and_cancellation_are_fenced(upload_db, monkeypatch, operation, stage):
    case = upload_db
    entered = asyncio.Event()
    release = asyncio.Event()
    async with case.sessions() as db:
        if stage == "commit":

            async def pause_commit():
                entered.set()
                await release.wait()

            monkeypatch.setattr(db, "commit", pause_commit)
            file = None
        else:

            class PausedFile(UploadFile):
                async def read(self, size=-1):
                    entered.set()
                    await release.wait()
                    return await super().read(size)

            file = PausedFile(filename="new.txt", file=io.BytesIO(b"partial stream"))
        task = asyncio.create_task(invoke(case, db, operation, file))
        try:
            await asyncio.wait_for(entered.wait(), 3)
            (new_file,) = set(case.root.iterdir()) - {case.old}
            # Ignore wall-clock age entirely: the SQL barrier must still protect the file.
            os.utime(new_file, (1, 1))
            await asyncio.wait_for(knowledge.reconcile_orphan_uploads(case.root), 3)
            assert new_file.exists()
        finally:
            task.cancel()
            with pytest.raises(asyncio.CancelledError):
                await task
            await db.rollback()
    await knowledge.reconcile_orphan_uploads(case.root)
    assert not new_file.exists()
    assert case.old.exists()


@pytest.mark.parametrize("owner", ["kb", "doc"])
async def test_another_process_crash_releases_upload_barrier(upload_db, owner):
    case = upload_db
    owner_id = case.base_id if owner == "kb" else case.document_id
    filename = f"{owner}-{owner_id}-{uuid.uuid4().hex}.txt"
    script = """
import pathlib, sqlite3, sys
db_path, table, owner_id, path = sys.argv[1:]
db = sqlite3.connect(db_path)
db.execute(f"UPDATE {table} SET updated_time=updated_time WHERE id=?", (int(owner_id),))
pathlib.Path(path).write_bytes(b"partial upload from a different process")
print("ready", flush=True)
sys.stdin.read()
"""
    process = subprocess.Popen(
        [sys.executable, "-c", script, str(case.database), "ai_knowledge_base" if owner == "kb" else "ai_knowledge_document", str(owner_id), str(case.root / filename)],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    try:
        ready = await asyncio.wait_for(anyio.to_thread.run_sync(process.stdout.readline), 5)
        assert ready.strip() == "ready"
        await knowledge.reconcile_orphan_uploads(case.root)
        assert (case.root / filename).exists()
    finally:
        process.kill()
        await anyio.to_thread.run_sync(process.wait)
        process.stdin.close()
        process.stdout.close()
        process.stderr.close()
    await knowledge.reconcile_orphan_uploads(case.root)
    assert not (case.root / filename).exists()
    assert case.old.exists()


@pytest.mark.parametrize("deleted", [False, True])
async def test_all_reference_columns_and_legacy_absolute_paths_protect_files(upload_db, deleted):
    case = upload_db
    pending = case.root / f"doc-{case.document_id}-{uuid.uuid4().hex}.md"
    cleanup = case.root / f"kb-{case.base_id}-{uuid.uuid4().hex}.pdf"
    pending.write_bytes(b"pending")
    cleanup.write_bytes(b"cleanup pending")
    alias = case.root / "alias.txt"
    alias.symlink_to(case.old.name)
    async with case.sessions() as db:
        await db.execute(
            update(KnowledgeDocumentModel)
            .where(KnowledgeDocumentModel.id == case.document_id)
            .values(
                is_deleted=deleted,
                file_path=str(alias),
                pending_file={"file_path": pending.name},
                file_cleanup_paths=[str(cleanup)],
            )
        )
        # The owning KB may also have been soft-deleted.
        await db.execute(update(KnowledgeBaseModel).where(KnowledgeBaseModel.id == case.base_id).values(is_deleted=deleted))
        await db.commit()
    await knowledge.reconcile_orphan_uploads(case.root)
    assert all(path.exists() for path in (case.old, pending, cleanup, alias))


async def test_successful_replacement_keeps_original_and_pending_files(upload_db):
    case = upload_db
    async with case.sessions() as db:
        await invoke(case, db, "replace")
    document = await document_snapshot(case)
    pending = case.root / document.pending_file["file_path"]
    await knowledge.reconcile_orphan_uploads(case.root)
    assert pending.read_bytes() == b"new contents" and case.old.read_bytes() == b"old contents"


async def test_references_in_another_deleted_document_are_included(upload_db):
    case = upload_db
    files = [case.root / f"doc-{case.document_id}-{uuid.uuid4().hex}.txt" for _ in range(3)]
    for path in files:
        path.write_bytes(b"referenced elsewhere")
    async with case.sessions() as db:
        other_base = KnowledgeBaseModel(name="another KB")
        db.add(other_base)
        await db.flush()
        db.add(
            KnowledgeDocumentModel(
                knowledge_base_id=other_base.id,
                file_name="foreign.txt",
                file_type="txt",
                is_deleted=True,
                file_path=files[0].name,
                pending_file={"file_path": str(files[1])},
                file_cleanup_paths=[files[2].name],
            )
        )
        await db.commit()
    await knowledge.reconcile_orphan_uploads(case.root)
    assert all(path.exists() for path in files)


async def test_age_unknown_owner_and_legacy_names_are_conservative(upload_db, monkeypatch):
    case = upload_db
    recent = case.root / f"kb-{case.base_id}-{uuid.uuid4().hex}.txt"
    unknown = case.root / f"kb-987654-{uuid.uuid4().hex}.txt"
    legacy = case.root / f"{uuid.uuid4().hex}.txt"
    for path in (recent, unknown, legacy):
        path.write_bytes(b"keep")
    monkeypatch.setattr(uploads, "UPLOAD_RECOVERY_DELAY_SECONDS", 3600)
    os.utime(unknown, (1, 1))
    os.utime(legacy, (1, 1))
    await knowledge.reconcile_orphan_uploads(case.root)
    assert all(path.exists() for path in (recent, unknown, legacy))


async def test_symlinks_traversal_and_nested_files_are_never_deleted(upload_db):
    case = upload_db
    outside = case.root.parent / "outside.txt"
    outside.write_bytes(b"outside")
    link = case.root / f"kb-{case.base_id}-{uuid.uuid4().hex}.txt"
    link.symlink_to(outside)
    nested = case.root / "nested"
    nested.mkdir()
    nested_file = nested / f"kb-{case.base_id}-{uuid.uuid4().hex}.txt"
    nested_file.write_bytes(b"nested")
    async with case.sessions() as db:
        await db.execute(update(KnowledgeDocumentModel).values(file_cleanup_paths=["../outside.txt", str(outside)]))
        await db.commit()
    await knowledge.reconcile_orphan_uploads(case.root)
    assert link.is_symlink() and outside.read_bytes() == b"outside" and nested_file.exists()
    root_alias = case.root.parent / "root-alias"
    root_alias.symlink_to(case.root, target_is_directory=True)
    assert uploads._scan_uploads(root_alias) == {}


async def test_file_replaced_by_symlink_between_scan_and_unlink_is_safe(upload_db, monkeypatch):
    case = upload_db
    orphan = case.root / f"kb-{case.base_id}-{uuid.uuid4().hex}.txt"
    orphan.write_bytes(b"orphan")
    outside = case.root.parent / "outside.txt"
    outside.write_bytes(b"keep")
    unlink = uploads._unlink_upload

    def swap_then_unlink(root, name, info):
        orphan.unlink()
        orphan.symlink_to(outside)
        unlink(root, name, info)

    monkeypatch.setattr(uploads, "_unlink_upload", swap_then_unlink)
    await knowledge.reconcile_orphan_uploads(case.root)
    assert orphan.is_symlink() and outside.read_bytes() == b"keep"


async def test_root_replaced_by_symlink_after_scan_cannot_escape(upload_db, monkeypatch):
    case = upload_db
    filename = f"kb-{case.base_id}-{uuid.uuid4().hex}.txt"
    (case.root / filename).write_bytes(b"orphan")
    outside = case.root.parent / "outside"
    outside.mkdir()
    (outside / filename).write_bytes(b"outside contents")
    moved = case.root.parent / "original-root"
    unlink = uploads._unlink_upload

    def swap_root_then_unlink(root, name, info):
        root.rename(moved)
        root.symlink_to(outside, target_is_directory=True)
        unlink(root, name, info)

    monkeypatch.setattr(uploads, "_unlink_upload", swap_root_then_unlink)
    await knowledge.reconcile_orphan_uploads(case.root)
    assert (outside / filename).read_bytes() == b"outside contents"
    assert (moved / filename).exists()


async def test_partial_failed_save_is_recovered_when_immediate_unlink_fails(upload_db, monkeypatch):
    case = upload_db
    from app.utils.upload_util import UploadUtil

    async def crash_after_partial_write(*, file, filepath):
        filepath.write_bytes(b"partial write")
        raise PermissionError("stream failed and unlink failed")

    monkeypatch.setattr(UploadUtil, "save_upload_stream", crash_after_partial_write)
    async with case.sessions() as db:
        with pytest.raises(PermissionError):
            await invoke(case, db, "upload")
        (partial_file,) = set(case.root.iterdir()) - {case.old}
        await knowledge.reconcile_orphan_uploads(case.root)
        assert partial_file.exists()
        await db.rollback()
    await knowledge.reconcile_orphan_uploads(case.root)
    assert not partial_file.exists() and case.old.exists()


async def test_unlink_failure_retries_and_does_not_block_other_files(upload_db, monkeypatch):
    case = upload_db
    orphan = case.root / f"kb-{case.base_id}-{uuid.uuid4().hex}.txt"
    other = case.root / f"doc-{case.document_id}-{uuid.uuid4().hex}.txt"
    orphan.write_bytes(b"retry")
    other.write_bytes(b"delete")
    unlink = uploads._unlink_upload

    def fail_one(root, name, info):
        if name == orphan.name:
            raise PermissionError("temporary deletion failure")
        unlink(root, name, info)

    monkeypatch.setattr(uploads, "_unlink_upload", fail_one)
    await knowledge.reconcile_orphan_uploads(case.root)
    assert orphan.exists() and not other.exists()
    monkeypatch.setattr(uploads, "_unlink_upload", unlink)
    await knowledge.reconcile_orphan_uploads(case.root)
    assert not orphan.exists() and case.old.exists()


async def test_competing_recovery_workers_are_idempotent(upload_db):
    case = upload_db
    orphan = case.root / f"kb-{case.base_id}-{uuid.uuid4().hex}.txt"
    orphan.write_bytes(b"orphan")
    await asyncio.gather(*(knowledge.reconcile_orphan_uploads(case.root) for _ in range(3)))
    await knowledge.reconcile_orphan_uploads(case.root)
    assert not orphan.exists() and case.old.exists()


@pytest.mark.parametrize("blocked", ["indexes", "uploads"])
async def test_worker_loops_run_independently_and_cancel_cleanly(monkeypatch, blocked):
    calls = {"indexes": 0, "uploads": 0}
    progressed = asyncio.Event()

    async def run(kind):
        calls[kind] += 1
        if kind == blocked:
            await asyncio.Event().wait()
        if calls[kind] >= 2:
            progressed.set()
        raise RuntimeError("independent recovery failure")

    sleep = asyncio.sleep

    async def tick(_seconds):
        await sleep(0)

    monkeypatch.setattr(recovery.asyncio, "sleep", tick)
    monkeypatch.setattr(recovery, "recover_document_indexes", lambda: run("indexes"))
    monkeypatch.setattr(recovery.document_lifecycle, "reconcile_orphan_uploads", lambda: run("uploads"))
    worker = asyncio.create_task(recovery._run_recovery())
    try:
        await asyncio.wait_for(progressed.wait(), 2)
        assert calls[blocked] == 1
        assert calls["uploads" if blocked == "indexes" else "indexes"] >= 2
    finally:
        worker.cancel()
        with pytest.raises(asyncio.CancelledError):
            await worker
    assert worker.done()
