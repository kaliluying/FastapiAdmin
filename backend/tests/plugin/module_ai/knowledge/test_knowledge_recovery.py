import asyncio
import importlib.util
from datetime import datetime, timedelta
from pathlib import Path
from unittest.mock import AsyncMock

import pytest
import test_document_processing as processing_tests
from alembic.migration import MigrationContext
from alembic.operations import Operations
from sqlalchemy import create_engine, inspect, text, update

from app.core.base_schema import AuthSchema
from app.core.exceptions import CustomException
from app.core.plugins import get_ai_plugin_manifest
from app.plugin.module_ai.knowledge import recovery, retrieval
from app.plugin.module_ai.knowledge import service as service_module
from app.plugin.module_ai.knowledge.model import KnowledgeDocumentModel
from app.plugin.module_ai.knowledge.retrieval import KnowledgeRetriever, KnowledgeSearchResult
from app.plugin.module_ai.knowledge.service import KnowledgeService

processing = processing_tests.processing
document_snapshot = processing_tests.document_snapshot
pytestmark = pytest.mark.asyncio


@pytest.fixture(autouse=True)
def recovery_sessions(processing, monkeypatch):
    monkeypatch.setattr(recovery, "async_db_session", processing.sessions)
    monkeypatch.setattr(retrieval, "async_db_session", processing.sessions)


async def set_document(processing, **values):
    async with processing.sessions() as db:
        await db.execute(update(KnowledgeDocumentModel).where(KnowledgeDocumentModel.id == processing.document_id).values(**values))
        await db.commit()


async def test_pending_upload_recovers_without_background_tasks(processing):
    await set_document(processing, index_status="pending", index_attempts=0)
    await recovery.recover_document_indexes()
    document, chunks = await document_snapshot(processing)
    assert document.index_status == "success"
    assert document.index_attempts == 1
    assert document.index_token is None and document.index_lease_until is None
    assert {chunk.chroma_id for chunk in chunks} == set(processing.vectors) == set(processing.keywords)


async def test_expired_run_cleans_staged_chunks_and_preserves_source(processing):
    processing.vectors["abandoned-generation"] = "未提交内容"
    processing.keywords["abandoned-generation"] = "未提交内容"
    await set_document(
        processing,
        index_status="indexing",
        index_attempts=1,
        index_token="dead-process",
        index_lease_until=datetime.now() - timedelta(seconds=1),
        index_cleanup_ids=["abandoned-generation"],
    )
    await recovery.recover_document_indexes()
    document, chunks = await document_snapshot(processing)
    assert document.index_status == "success" and document.index_attempts == 2
    assert document.index_cleanup_ids is None
    assert set(processing.vectors) == set(processing.keywords) == {chunk.chroma_id for chunk in chunks}
    assert processing.path.exists()


async def test_competing_recovery_claims_only_once(processing, monkeypatch):
    await set_document(processing, index_status="pending")
    started = asyncio.Event()
    release = asyncio.Event()

    async def delayed_extract(_path):
        started.set()
        await release.wait()
        return "单一索引任务"

    monkeypatch.setattr(service_module, "extract_text", delayed_extract)
    first = asyncio.create_task(recovery.recover_document_indexes())
    await asyncio.wait_for(started.wait(), timeout=2)
    await recovery.recover_document_indexes()
    release.set()
    await first
    document, _chunks = await document_snapshot(processing)
    assert document.index_attempts == 1 and document.index_status == "success"
    assert processing.embeddings.embed_texts.await_count == 1


async def test_old_run_cannot_write_or_overwrite_new_generation(processing):
    async def expire_and_replace(_chunks):
        processing.embeddings.embed_texts.side_effect = None
        await set_document(processing, index_lease_until=datetime.now() - timedelta(seconds=1))
        async with processing.sessions() as db:
            await KnowledgeService(AuthSchema(db=db, check_data_scope=False)).index_document(processing.document_id, automatic=True)
        return [[0.5, 0.5]]

    processing.embeddings.embed_texts.side_effect = expire_and_replace
    with pytest.raises(CustomException) as error:
        await processing.service.index_document(processing.document_id)
    assert error.value.status_code == 409
    document, chunks = await document_snapshot(processing)
    assert document.index_status == "success" and document.index_attempts == 2
    assert document.error_message is None
    assert processing.store.upsert_chunks.await_count == 1
    assert processing.bm25.add_chunks.await_count == 1
    assert set(processing.vectors) == set(processing.keywords) == {chunk.chroma_id for chunk in chunks}


async def test_retry_backoff_is_persistent_and_bounded(processing):
    processing.embeddings.embed_texts.side_effect = RuntimeError("unavailable")
    await set_document(processing, index_status="pending")
    await recovery.recover_document_indexes()
    document, _chunks = await document_snapshot(processing)
    assert document.index_status == "failed" and document.index_attempts == 1
    assert document.index_lease_until > datetime.now()
    await recovery.recover_document_indexes()
    assert processing.embeddings.embed_texts.await_count == 1
    for _attempt in range(2):
        await set_document(processing, index_lease_until=datetime.now() - timedelta(seconds=1))
        await recovery.recover_document_indexes()
    await set_document(processing, index_lease_until=None)
    await recovery.recover_document_indexes()
    document, _chunks = await document_snapshot(processing)
    assert document.index_attempts == 3 and document.index_status == "failed"
    assert processing.embeddings.embed_texts.await_count == 3
    processing.embeddings.embed_texts.side_effect = None
    await processing.service.index_document(processing.document_id)
    document, _chunks = await document_snapshot(processing)
    assert document.index_status == "success" and document.index_attempts == 1


async def test_exhausted_crashed_run_does_not_remain_indexing(processing):
    await set_document(processing, index_status="indexing", index_attempts=3, index_token="dead", index_lease_until=None)
    await recovery.recover_document_indexes()
    document, _chunks = await document_snapshot(processing)
    assert document.index_status == "failed" and document.index_token is None
    assert "停止自动重试" in document.error_message
    assert processing.embeddings.embed_texts.await_count == 0


@pytest.mark.parametrize(("status", "attempts", "active_lease"), [
    ("pending", 0, True),
    ("failed", 3, False),
    ("success", 0, False),
    ("indexing", 1, True),
])
async def test_recovery_scan_and_automatic_claim_share_eligibility(processing, status, attempts, active_lease):
    await set_document(
        processing, index_status=status, index_attempts=attempts,
        index_lease_until=datetime.now() + timedelta(minutes=1) if active_lease else None,
    )
    await KnowledgeService.recover_pending_documents()
    assert processing.embeddings.embed_texts.await_count == 0
    with pytest.raises(CustomException) as error:
        await processing.service.index_document(processing.document_id, automatic=True)
    assert error.value.status_code == 409
    await processing.db.rollback()
    document, chunks = await document_snapshot(processing)
    assert document.index_status == status and document.index_attempts == attempts
    assert chunks[0].chroma_id == "old-chunk"


async def test_deletion_race_rejects_claim_before_external_cleanup(processing, monkeypatch):
    original_list = service_module.KnowledgeDocumentCRUD.get_list
    started = asyncio.Event()
    release = asyncio.Event()
    index_task = None

    async def delayed_extract(_path):
        started.set()
        await release.wait()
        return "正在索引"

    async def competing_index():
        async with processing.sessions() as db:
            await KnowledgeService(AuthSchema(db=db, check_data_scope=False)).index_document(processing.document_id)

    async def stale_list(crud, **kwargs):
        nonlocal index_task
        documents = await original_list(crud, **kwargs)
        if kwargs.get("search") == {"id": ("in", [processing.document_id])}:
            index_task = asyncio.create_task(competing_index())
            await asyncio.wait_for(started.wait(), timeout=2)
        return documents

    monkeypatch.setattr(service_module, "extract_text", delayed_extract)
    monkeypatch.setattr(service_module.KnowledgeDocumentCRUD, "get_list", stale_list)
    try:
        with pytest.raises(CustomException) as error:
            await processing.service.delete_document([processing.document_id])
        assert error.value.status_code == 409
        assert processing.store.delete_document.await_count == 0
        assert processing.path.exists()
    finally:
        release.set()
        if index_task:
            await index_task


async def test_deleted_document_cleanup_recovers_after_partial_failure(processing):
    processing.store.delete_document.side_effect = lambda _document_id: processing.vectors.clear()
    processing.bm25.delete_by_document.side_effect = RuntimeError("temporary keyword-store failure")
    await processing.service.delete_document([processing.document_id])
    document, _chunks = await document_snapshot(processing)
    assert document.is_deleted and document.index_status == "deleting"
    assert processing.path.exists()
    processing.bm25.delete_by_document.side_effect = lambda _document_id: processing.keywords.clear()
    await set_document(processing, index_lease_until=datetime.now() - timedelta(seconds=1))
    await recovery.recover_document_indexes()
    document, _chunks = await document_snapshot(processing)
    assert document.index_status == "deleted" and document.file_path is None
    assert not processing.path.exists()
    assert processing.vectors == processing.keywords == {}


async def test_uncertain_commit_never_deletes_committed_generation(processing, monkeypatch):
    original_commit = processing.db.commit
    interrupted = False

    async def commit_then_disconnect():
        nonlocal interrupted
        document = await processing.db.get(KnowledgeDocumentModel, processing.document_id)
        completed = document.index_status == "success" and document.index_cleanup_ids == ["old-chunk"]
        await original_commit()
        if completed and not interrupted:
            interrupted = True
            raise ConnectionError("commit acknowledgement lost")

    monkeypatch.setattr(processing.db, "commit", commit_then_disconnect)
    with pytest.raises(CustomException):
        await processing.service.index_document(processing.document_id)
    document, chunks = await document_snapshot(processing)
    assert document.index_status == "success"
    active_ids = {chunk.chroma_id for chunk in chunks}
    assert active_ids <= set(processing.vectors) and active_ids <= set(processing.keywords)
    await recovery.recover_document_indexes()
    assert active_ids == set(processing.vectors) == set(processing.keywords)


async def test_manifest_worker_starts_once_and_stops_cleanly(processing, monkeypatch):
    assert "knowledge.recovery:initialize_knowledge_recovery" in get_ai_plugin_manifest().startup_hooks
    monkeypatch.setattr(recovery, "_worker", None)
    monkeypatch.setattr(recovery, "recover_document_indexes", AsyncMock())
    await recovery.initialize_knowledge_recovery()
    worker = recovery._worker
    await recovery.initialize_knowledge_recovery()
    assert recovery._worker is worker
    await recovery.stop_knowledge_recovery()
    assert recovery._worker is None and worker.done()


async def test_retrieval_hides_uncommitted_deleted_and_foreign_chunks(processing):
    results = [
        KnowledgeSearchResult(chunk_id="old-chunk", content="已提交内容"),
        KnowledgeSearchResult(chunk_id="not-committed", content="未提交内容"),
    ]
    assert await KnowledgeRetriever._filter_persisted_results(results, [processing.base_id]) == results[:1]
    assert await KnowledgeRetriever._filter_persisted_results(results, [999]) == []
    await set_document(processing, is_deleted=True)
    assert await KnowledgeRetriever._filter_persisted_results(results, [processing.base_id]) == []


async def test_recovery_logs_never_include_provider_exception(processing, monkeypatch):
    logged = []
    monkeypatch.setattr(service_module.logger, "error", lambda message, *arguments: logged.append(message.format(*arguments)))
    processing.embeddings.embed_texts.side_effect = RuntimeError("https://provider.invalid?api_key=secret /private/path")
    await set_document(processing, index_status="pending")
    await recovery.recover_document_indexes()
    assert logged
    assert not any("secret" in message or "private" in message or "api_key" in message for message in logged)


async def test_lease_loss_cancels_old_owner_without_overwriting_new_claim(processing, monkeypatch):
    await set_document(processing, index_status="indexing", index_token="new-owner", index_lease_until=datetime.now() + timedelta(seconds=300))
    owner = asyncio.create_task(asyncio.Event().wait())
    monkeypatch.setattr(service_module.asyncio, "sleep", AsyncMock())
    await KnowledgeService._renew_index_lease(processing.document_id, "old-owner", owner)
    with pytest.raises(asyncio.CancelledError):
        await owner
    document, _chunks = await document_snapshot(processing)
    assert document.index_status == "indexing" and document.index_token == "new-owner"


async def test_exhausted_failure_recovers_cleanup_without_new_index_attempt(processing):
    processing.vectors["abandoned-generation"] = "未提交内容"
    processing.keywords["abandoned-generation"] = "未提交内容"
    await set_document(processing, index_status="failed", index_attempts=3, index_cleanup_ids=["abandoned-generation"], error_message="已停止重试")
    await recovery.recover_document_indexes()
    document, _chunks = await document_snapshot(processing)
    assert document.index_status == "failed" and document.error_message == "已停止重试"
    assert document.index_cleanup_ids is None and document.index_attempts == 3
    assert processing.vectors == processing.keywords == {"old-chunk": "原有内容"}


async def test_recovery_migration_upgrades_legacy_schema_idempotently(tmp_path, monkeypatch):
    path = Path(__file__).resolve().parents[4] / "app" / "alembic" / "versions" / "20261003_knowledge_recovery.py"
    spec = importlib.util.spec_from_file_location("knowledge_recovery_migration", path)
    migration = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(migration)
    engine = create_engine(f"sqlite:///{tmp_path / 'legacy.db'}")
    try:
        with engine.begin() as connection:
            connection.execute(text("CREATE TABLE ai_knowledge_document (id INTEGER PRIMARY KEY)"))
            connection.execute(text("INSERT INTO ai_knowledge_document (id) VALUES (1)"))
            monkeypatch.setattr(migration, "op", Operations(MigrationContext.configure(connection)))
            migration.upgrade()
            migration.upgrade()
            columns = {column["name"] for column in inspect(connection).get_columns("ai_knowledge_document")}
            assert {"id", "index_attempts", "index_token", "index_lease_until", "index_cleanup_ids"} == columns
            assert connection.execute(text("SELECT index_attempts FROM ai_knowledge_document WHERE id=1")).scalar_one() == 0
    finally:
        engine.dispose()


async def test_shutdown_cancellation_survives_claim_replacement(processing, monkeypatch):
    started = asyncio.Event()

    async def delayed_extract(_path):
        started.set()
        await asyncio.Event().wait()

    monkeypatch.setattr(service_module, "extract_text", delayed_extract)
    monkeypatch.setattr(recovery, "_worker", None)
    await set_document(processing, index_status="pending")
    await recovery.initialize_knowledge_recovery()
    try:
        await asyncio.wait_for(started.wait(), timeout=2)
        await set_document(processing, index_token="replacement", index_lease_until=datetime.now() + timedelta(seconds=300))
        await asyncio.wait_for(recovery.stop_knowledge_recovery(), timeout=2)
        document, chunks = await document_snapshot(processing)
        assert recovery._worker is None
        assert document.index_status == "indexing" and document.index_token == "replacement"
        assert [chunk.chroma_id for chunk in chunks] == ["old-chunk"]
    finally:
        await recovery.stop_knowledge_recovery()


async def test_completed_generation_does_not_cancel_owner_on_late_heartbeat(processing, monkeypatch):
    await set_document(processing, index_status="success", index_token=None)
    owner = asyncio.create_task(asyncio.Event().wait())
    monkeypatch.setattr(service_module.asyncio, "sleep", AsyncMock())
    await KnowledgeService._renew_index_lease(processing.document_id, "completed-token", owner)
    assert not owner.cancelled() and not owner.cancelling()
    owner.cancel()
    with pytest.raises(asyncio.CancelledError):
        await owner
