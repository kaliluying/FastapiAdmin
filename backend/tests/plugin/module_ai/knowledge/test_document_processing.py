import asyncio
import io
import json
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import pytest
from fastapi import BackgroundTasks, UploadFile
from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.base_model import MappedBase
from app.core.base_schema import AuthSchema
from app.core.exceptions import CustomException
from app.plugin.module_ai.knowledge import service as service_module
from app.plugin.module_ai.knowledge.bm25_index import BM25KnowledgeIndex
from app.plugin.module_ai.knowledge.chroma_store import ChromaKnowledgeStore
from app.plugin.module_ai.knowledge.controller import reindex_document_controller, upload_document_controller
from app.plugin.module_ai.knowledge.model import KnowledgeBaseModel, KnowledgeChunkModel, KnowledgeDocumentModel
from app.plugin.module_ai.knowledge.service import KnowledgeService


@pytest.fixture
async def processing(monkeypatch, tmp_path):
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'processing.db'}")
    async with engine.begin() as connection:
        await connection.run_sync(MappedBase.metadata.create_all)
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    monkeypatch.setattr(service_module, "async_db_session", sessions)
    monkeypatch.setattr(service_module, "UPLOAD_DIR", tmp_path)
    monkeypatch.setattr(service_module.settings, "RETRIEVAL_MODE", "hybrid")
    path = tmp_path / "guide.txt"
    path.write_text("可检索的文档内容", encoding="utf-8")
    vectors = {"old-chunk": "原有内容"}
    keywords = {"old-chunk": "原有内容"}

    async def upsert_chunks(**kwargs):
        vectors.update(zip(kwargs["ids"], kwargs["documents"], strict=True))

    async def add_chunks(chunks):
        keywords.update({chunk["id"]: chunk["content"] for chunk in chunks})

    def delete_vectors(*, ids):
        for chunk_id in ids:
            vectors.pop(chunk_id, None)

    class Writer:
        def __init__(self):
            self.ids = []

        def delete_by_term(self, field, chunk_id):
            assert field == "chunk_id"
            self.ids.append(chunk_id)

        def commit(self):
            for chunk_id in self.ids:
                keywords.pop(chunk_id, None)

        def cancel(self):
            self.ids.clear()

    store = SimpleNamespace(
        upsert_chunks=AsyncMock(side_effect=upsert_chunks),
        collection=SimpleNamespace(delete=Mock(side_effect=delete_vectors)),
        delete_document=AsyncMock(side_effect=AssertionError("Never delete all existing vectors before replacement")),
    )
    bm25 = SimpleNamespace(
        add_chunks=AsyncMock(side_effect=add_chunks),
        _get_index=lambda: SimpleNamespace(writer=Writer),
        delete_by_document=AsyncMock(side_effect=AssertionError("Never delete the original keyword index before replacement")),
    )
    embeddings = SimpleNamespace(embed_texts=AsyncMock(return_value=[[0.5, 0.5]]))
    monkeypatch.setattr(KnowledgeService, "_get_store", lambda _self: store)
    monkeypatch.setattr(KnowledgeService, "_get_bm25_index", lambda _self: bm25)
    monkeypatch.setattr(KnowledgeService, "_get_embedding_client", lambda _self: embeddings)

    async with sessions() as db:
        base = KnowledgeBaseModel(name="测试知识库")
        db.add(base)
        await db.flush()
        document = KnowledgeDocumentModel(
            knowledge_base_id=base.id,
            file_name="guide.txt",
            file_path=path.name,
            file_type="txt",
            file_size=path.stat().st_size,
            parse_status="success",
            index_status="success",
        )
        db.add(document)
        await db.flush()
        db.add(
            KnowledgeChunkModel(
                knowledge_base_id=base.id,
                document_id=document.id,
                chunk_index=0,
                content="原有内容",
                chroma_id="old-chunk",
            )
        )
        await db.commit()
        yield SimpleNamespace(
            service=KnowledgeService(AuthSchema(db=db, check_data_scope=False)),
            db=db,
            sessions=sessions,
            document_id=document.id,
            base_id=base.id,
            path=path,
            store=store,
            bm25=bm25,
            embeddings=embeddings,
            vectors=vectors,
            keywords=keywords,
        )
    await engine.dispose()


async def document_snapshot(processing, document_id=None):
    async with processing.sessions() as observer:
        document = await observer.get(KnowledgeDocumentModel, document_id or processing.document_id)
        chunks = (await observer.execute(select(KnowledgeChunkModel).where(KnowledgeChunkModel.document_id == document.id))).scalars().all()
        return document, chunks


async def test_rebuild_stages_visible_in_independent_sessions_and_duplicate_rejected(processing, monkeypatch):
    async def extract(_path):
        document, chunks = await document_snapshot(processing)
        assert (document.parse_status, document.index_status) == ("parsing", "indexing")
        assert chunks[0].chroma_id == "old-chunk"
        async with processing.sessions() as competing:
            with pytest.raises(CustomException) as error:
                await KnowledgeService(AuthSchema(db=competing)).index_document(processing.document_id)
            assert error.value.status_code == 409
        return "新的可检索内容"

    async def embed(_chunks):
        document, chunks = await document_snapshot(processing)
        assert (document.parse_status, document.index_status) == ("success", "indexing")
        assert chunks[0].chroma_id == "old-chunk"
        return [[0.5, 0.5]]

    monkeypatch.setattr(service_module, "extract_text", extract)
    processing.embeddings.embed_texts.side_effect = embed
    response = await reindex_document_controller(processing.document_id, processing.service.auth)
    assert "重建完成" in response.body.decode()
    document, chunks = await document_snapshot(processing)
    assert (document.parse_status, document.index_status, document.error_message) == ("success", "success", None)
    assert document.parsed_at and document.indexed_at
    assert [chunk.content for chunk in chunks] == ["新的可检索内容"]
    assert set(processing.vectors) == set(processing.keywords) == {chunks[0].chroma_id}
    assert processing.path.exists()


@pytest.mark.parametrize("failure", ["empty", "corrupt", "missing"])
async def test_parse_failure_is_actionable_redacted_and_persisted(processing, monkeypatch, failure):
    if failure == "missing":
        processing.path.unlink()
    else:
        monkeypatch.setattr(
            service_module,
            "extract_text",
            AsyncMock(
                return_value="" if failure == "empty" else None,
                side_effect=ValueError("/secret/path?token=do-not-return") if failure == "corrupt" else None,
            ),
        )
    with pytest.raises(CustomException) as error:
        await processing.service.index_document(processing.document_id)
    await processing.db.rollback()
    document, chunks = await document_snapshot(processing)
    assert (document.parse_status, document.index_status) == ("failed", "failed")
    assert document.error_message == error.value.msg
    assert any(action in document.error_message for action in ("上传", "管理员"))
    assert "secret" not in document.error_message and "token" not in document.error_message
    assert chunks[0].content == "原有内容"
    assert processing.vectors == processing.keywords == {"old-chunk": "原有内容"}
    if failure != "missing":
        assert processing.path.exists()


@pytest.mark.parametrize("failure", ["embedding", "vector", "keyword", "database", "commit"])
async def test_index_failure_preserves_original_chunks_indexes_and_file(processing, monkeypatch, failure):
    secret_error = RuntimeError("https://provider.invalid?token=do-not-return /private/path")
    if failure == "embedding":
        processing.embeddings.embed_texts.side_effect = secret_error
    elif failure == "vector":

        async def fail_after_partial_upsert(**kwargs):
            processing.vectors[kwargs["ids"][0]] = "未完成内容"
            raise secret_error

        processing.store.upsert_chunks.side_effect = fail_after_partial_upsert
    elif failure == "keyword":

        async def fail_after_partial_add(chunks):
            processing.keywords[chunks[0]["id"]] = "未完成内容"
            raise secret_error

        processing.bm25.add_chunks.side_effect = fail_after_partial_add
    elif failure == "database":

        async def fail_after_sql_delete(chunk_crud, **_kwargs):
            await chunk_crud.db.execute(delete(KnowledgeChunkModel).where(KnowledgeChunkModel.document_id == processing.document_id))
            raise secret_error

        monkeypatch.setattr(service_module.KnowledgeChunkCRUD, "replace_chunks", fail_after_sql_delete)
    else:
        original_commit = processing.db.commit
        attempts = 0

        async def fail_final_commit():
            nonlocal attempts
            attempts += 1
            if attempts == 3:
                raise secret_error
            await original_commit()

        monkeypatch.setattr(processing.db, "commit", fail_final_commit)

    with pytest.raises(CustomException) as error:
        await processing.service.index_document(processing.document_id)
    await processing.db.rollback()
    document, chunks = await document_snapshot(processing)
    assert (document.parse_status, document.index_status) == ("success", "failed")
    assert document.error_message == error.value.msg and "重建索引" in document.error_message
    assert "token" not in document.error_message and "private" not in document.error_message
    assert chunks[0].content == "原有内容"
    assert processing.vectors == processing.keywords == {"old-chunk": "原有内容"}
    assert processing.path.exists()


async def test_interrupted_processing_is_retryable_and_preserves_original_data(processing, monkeypatch):
    monkeypatch.setattr(service_module, "extract_text", AsyncMock(side_effect=asyncio.CancelledError()))
    with pytest.raises(asyncio.CancelledError):
        await processing.service.index_document(processing.document_id)
    document, chunks = await document_snapshot(processing)
    assert document.index_status == "failed"
    assert "处理已中断" in document.error_message
    assert chunks[0].chroma_id == "old-chunk"
    assert processing.vectors == processing.keywords == {"old-chunk": "原有内容"}
    monkeypatch.setattr(service_module, "extract_text", AsyncMock(return_value="可恢复内容"))
    result = await processing.service.index_document(processing.document_id)
    assert result.index_status == "success" and result.error_message is None
    assert processing.path.exists()


async def test_processing_document_cannot_be_deleted(processing):
    await processing.db.execute(update(KnowledgeDocumentModel).where(KnowledgeDocumentModel.id == processing.document_id).values(index_status="indexing"))
    await processing.db.commit()
    with pytest.raises(CustomException) as error:
        await processing.service.delete_document([processing.document_id])
    assert error.value.status_code == 409
    with pytest.raises(CustomException) as error:
        await processing.service.delete_knowledge_base([processing.base_id])
    assert error.value.status_code == 409
    assert processing.vectors == processing.keywords == {"old-chunk": "原有内容"}
    assert processing.path.exists()


async def test_upload_is_committed_before_background_task_and_failure_remains_visible(processing, monkeypatch):
    monkeypatch.setattr(service_module, "extract_text", AsyncMock(return_value=""))
    background = BackgroundTasks()
    upload = UploadFile(filename="new.txt", file=io.BytesIO(b"new document"))
    response = await upload_document_controller(processing.base_id, upload, background, processing.service.auth)
    payload = json.loads(response.body)
    assert "等待后台处理" in payload["msg"]
    uploaded_id = payload["data"]["id"]
    document, _chunks = await document_snapshot(processing, uploaded_id)
    assert (document.parse_status, document.index_status) == ("pending", "pending")
    await background()
    document, _chunks = await document_snapshot(processing, uploaded_id)
    assert (document.parse_status, document.index_status) == ("failed", "failed")
    assert "未提取到文字" in document.error_message
    assert (processing.path.parent / document.file_path).exists()


async def test_background_upload_reaches_searchable_status_without_real_indexes(processing):
    background = BackgroundTasks()
    uploaded = await processing.service.upload_document(
        knowledge_base_id=processing.base_id,
        file=UploadFile(filename="new.txt", file=io.BytesIO("新的文档内容".encode())),
        background_tasks=background,
    )
    assert uploaded.index_status == "pending"
    await background()
    document, chunks = await document_snapshot(processing, uploaded.id)
    assert (document.parse_status, document.index_status) == ("success", "success")
    assert [chunk.content for chunk in chunks] == ["新的文档内容"]
    assert chunks[0].chroma_id in processing.vectors and chunks[0].chroma_id in processing.keywords
    assert processing.vectors["old-chunk"] == processing.keywords["old-chunk"] == "原有内容"


async def test_old_index_cleanup_failure_keeps_new_index_and_exposes_safe_warning(processing):
    processing.store.collection.delete.side_effect = RuntimeError("private storage detail")
    result = await processing.service.index_document(processing.document_id)
    assert result.index_status == "success"
    assert "旧索引清理失败" in result.error_message
    document, chunks = await document_snapshot(processing)
    assert document.error_message == result.error_message
    assert chunks[0].chroma_id in processing.vectors and chunks[0].chroma_id in processing.keywords
    assert "old-chunk" in processing.vectors
    assert "private" not in document.error_message


@pytest.mark.parametrize(
    ("modes", "deletion"),
    [(("bm25", "vector", "hybrid"), "document"), (("vector", "bm25", "hybrid"), "knowledge_base")],
)
async def test_mode_switches_clean_real_indexes_and_delete_inactive_stores(processing, monkeypatch, tmp_path, modes, deletion):
    monkeypatch.setenv("ANONYMIZED_TELEMETRY", "False")
    monkeypatch.setattr(service_module.settings, "CHROMA_PERSIST_DIR", str(tmp_path / "chroma"))
    monkeypatch.setattr(service_module.settings, "BM25_INDEX_DIR", str(tmp_path / "bm25"))
    store = ChromaKnowledgeStore()
    bm25 = BM25KnowledgeIndex(tokenizer="char")
    monkeypatch.setattr(KnowledgeService, "_get_store", lambda _self: store)
    monkeypatch.setattr(KnowledgeService, "_get_bm25_index", lambda _self: bm25)
    await store.upsert_chunks(
        ids=["old-chunk", "unrelated-chunk"],
        embeddings=[[0.5, 0.5], [0.5, 0.5]],
        documents=["原有内容", "其他文档"],
        metadatas=[
            {"knowledge_base_id": processing.base_id, "document_id": processing.document_id},
            {"knowledge_base_id": 999, "document_id": 999},
        ],
    )
    await bm25.add_chunks(
        [
            {"id": "old-chunk", "content": "原有内容", "knowledge_base_id": processing.base_id, "document_id": processing.document_id},
            {"id": "unrelated-chunk", "content": "其他文档", "knowledge_base_id": 999, "document_id": 999},
        ]
    )

    def keyword_ids():
        with bm25._get_index().searcher() as searcher:
            return {chunk["chunk_id"] for chunk in searcher.all_stored_fields()}

    for mode in modes:
        monkeypatch.setattr(service_module.settings, "RETRIEVAL_MODE", mode)
        result = await processing.service.index_document(processing.document_id)
        assert result.index_status == "success" and result.error_message is None
        _document, chunks = await document_snapshot(processing)
        active_ids = {chunk.chroma_id for chunk in chunks}
        assert set(store.collection.get()["ids"]) == {"unrelated-chunk"} | (active_ids if mode != "bm25" else set())
        assert keyword_ids() == {"unrelated-chunk"} | (active_ids if mode != "vector" else set())

    monkeypatch.setattr(service_module.settings, "RETRIEVAL_MODE", modes[0])
    if deletion == "document":
        await processing.service.delete_document([processing.document_id])
    else:
        await processing.service.delete_knowledge_base([processing.base_id])
    await processing.db.commit()
    assert set(store.collection.get()["ids"]) == keyword_ids() == {"unrelated-chunk"}


@pytest.mark.parametrize("mode", ["bm25", "vector"])
async def test_failed_mode_switch_preserves_both_original_indexes(processing, monkeypatch, mode):
    monkeypatch.setattr(service_module.settings, "RETRIEVAL_MODE", mode)
    monkeypatch.setattr(service_module.KnowledgeChunkCRUD, "replace_chunks", AsyncMock(side_effect=RuntimeError("database failure")))
    with pytest.raises(CustomException):
        await processing.service.index_document(processing.document_id)
    document, chunks = await document_snapshot(processing)
    assert document.index_status == "failed" and chunks[0].chroma_id == "old-chunk"
    assert processing.vectors == processing.keywords == {"old-chunk": "原有内容"}
