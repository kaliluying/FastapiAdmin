from __future__ import annotations

import asyncio
import uuid
from datetime import datetime
from pathlib import Path
from types import SimpleNamespace
from typing import Any

import anyio
from fastapi import UploadFile
from sqlalchemy import update

from app.config.path_conf import BASE_DIR
from app.core.base_schema import AuthSchema
from app.core.database import async_db_session
from app.core.exceptions import CustomException
from app.core.logger import logger
from app.plugin.module_ai.config import settings

from .bm25_index import BM25KnowledgeIndex, get_cached_bm25_index
from .chroma_store import ChromaKnowledgeStore, get_cached_chroma_store
from .crud import KnowledgeBaseCRUD, KnowledgeChunkCRUD, KnowledgeDocumentCRUD
from .embedding import EmbeddingClient, get_cached_embedding_client
from .extractors import extract_text
from .model import KnowledgeDocumentModel
from .public import KnowledgeRetriever, accessible_knowledge_base_ids
from .schema import (
    KnowledgeBaseCreateSchema,
    KnowledgeBaseOutSchema,
    KnowledgeBaseQueryParam,
    KnowledgeBaseUpdateSchema,
    KnowledgeDocumentOutSchema,
    KnowledgeDocumentQueryParam,
    RetrievalTestSchema,
)
from .text_splitter import split_text

UPLOAD_DIR = BASE_DIR / "storage" / "knowledge"


async def index_document_in_background(document_id: int, user_id: int | None) -> None:
    """Index one uploaded document with an independent database session."""
    async with async_db_session() as db:
        auth = AuthSchema(
            user=SimpleNamespace(id=user_id),
            db=db,
            check_data_scope=False,
        )
        try:
            await KnowledgeService(auth).index_document(document_id)
        except Exception:
            await db.rollback()
            logger.exception("后台索引知识库文档失败: document_id=%s", document_id)


def build_chroma_metadata(
    *,
    knowledge_base_id: int,
    document_id: int,
    chunk_index: int,
    file_name: str,
) -> dict[str, int | str]:
    return {
        "knowledge_base_id": knowledge_base_id,
        "document_id": document_id,
        "chunk_index": chunk_index,
        "file_name": file_name,
    }


class KnowledgeService:
    def __init__(
        self,
        auth: AuthSchema,
        *,
        store: ChromaKnowledgeStore | None = None,
        embedding_client: EmbeddingClient | None = None,
        bm25_index: BM25KnowledgeIndex | None = None,
    ) -> None:
        self.auth = auth
        self.store = store
        self.embedding_client = embedding_client
        self.bm25_index = bm25_index

    async def page_knowledge_bases(
        self,
        *,
        page_no: int,
        page_size: int,
        search: KnowledgeBaseQueryParam | None = None,
        order_by: list[dict[str, str]] | None = None,
    ) -> dict[str, Any]:
        query = vars(search) if search else {}
        if query.get("name"):
            query["name"] = ("like", query["name"])
        base_crud = KnowledgeBaseCRUD(self.auth)
        result = await base_crud.page(
            offset=(page_no - 1) * page_size,
            limit=page_size,
            order_by=order_by or [{"id": "desc"}],
            search=query,
            out_schema=KnowledgeBaseOutSchema,
        )
        kb_ids = [item["id"] for item in result.items]
        document_counts = await base_crud.count_documents_bulk(kb_ids)
        status_counts_by_kb = await base_crud.count_documents_by_index_status_bulk(kb_ids)
        for item in result.items:
            status_counts = status_counts_by_kb.get(item["id"], {})
            item["document_count"] = document_counts.get(item["id"], 0)
            item["indexed_document_count"] = status_counts.get("success", 0)
            item["indexing_document_count"] = status_counts.get("pending", 0) + status_counts.get("indexing", 0)
            item["failed_document_count"] = status_counts.get("failed", 0)
        return result.model_dump()

    async def list_enabled_bases(self) -> list[KnowledgeBaseOutSchema]:
        objs = await KnowledgeBaseCRUD(self.auth).get_list(search={"is_enabled": True}, order_by=[{"id": "desc"}])
        return [KnowledgeBaseOutSchema.model_validate(obj) for obj in objs]

    async def create_knowledge_base(self, data: KnowledgeBaseCreateSchema) -> KnowledgeBaseOutSchema:
        obj = await KnowledgeBaseCRUD(self.auth).create(data=data)
        return KnowledgeBaseOutSchema.model_validate(obj)

    async def update_knowledge_base(self, knowledge_base_id: int, data: KnowledgeBaseUpdateSchema) -> KnowledgeBaseOutSchema:
        obj = await KnowledgeBaseCRUD(self.auth).update(id=knowledge_base_id, data=data)
        return KnowledgeBaseOutSchema.model_validate(obj)

    async def delete_knowledge_base(self, ids: list[int]) -> None:
        if not ids:
            raise CustomException(msg="knowledge base ids cannot be empty")
        docs = await KnowledgeDocumentCRUD(self.auth).get_list(search={"knowledge_base_id": ("in", ids)})
        doc_ids = [doc.id for doc in docs]
        if any(doc.index_status == "indexing" for doc in docs):
            raise CustomException(msg="知识库中有文档正在处理，请完成后再删除", status_code=409)
        vector, bm25 = self._index_backends_to_clean()
        for doc in docs:
            if vector:
                await self._get_store().delete_document(doc.id)
            if bm25:
                await self._get_bm25_index().delete_by_document(doc.id)
        if doc_ids:
            chunks = await KnowledgeChunkCRUD(self.auth).get_list(search={"document_id": ("in", doc_ids)})
            chunk_ids = [chunk.id for chunk in chunks]
            if chunk_ids:
                await KnowledgeChunkCRUD(self.auth).delete(ids=chunk_ids)
            await KnowledgeDocumentCRUD(self.auth).delete(ids=doc_ids)
        await KnowledgeBaseCRUD(self.auth).delete(ids=ids)

    async def page_documents(
        self,
        *,
        page_no: int,
        page_size: int,
        search: KnowledgeDocumentQueryParam | None = None,
        order_by: list[dict[str, str]] | None = None,
    ) -> dict[str, Any]:
        query = vars(search) if search else {}
        if query.get("file_name"):
            query["file_name"] = ("like", query["file_name"])
        result = await KnowledgeDocumentCRUD(self.auth).page(
            offset=(page_no - 1) * page_size,
            limit=page_size,
            order_by=order_by or [{"id": "desc"}],
            search=query,
            out_schema=KnowledgeDocumentOutSchema,
        )
        chunk_crud = KnowledgeChunkCRUD(self.auth)
        document_ids = [item["id"] for item in result.items]
        chunk_counts = await chunk_crud.count_by_document_bulk(document_ids)
        for item in result.items:
            item["chunk_count"] = chunk_counts.get(item["id"], 0)
            item["file_path"] = self._safe_knowledge_path(item.get("file_path"))
        return result.model_dump()

    async def upload_document(
        self,
        *,
        knowledge_base_id: int,
        file: UploadFile,
        background_tasks: Any | None = None,
    ) -> KnowledgeDocumentOutSchema:
        await KnowledgeBaseCRUD(self.auth).get_or_404(id=knowledge_base_id, msg="knowledge base not found")
        saved_path = await self._save_upload_file(file)
        document = await KnowledgeDocumentCRUD(self.auth).create_document(
            knowledge_base_id=knowledge_base_id,
            file_name=file.filename or saved_path.name,
            file_path=self._safe_knowledge_path(saved_path),
            file_type=saved_path.suffix.lower().lstrip("."),
            file_size=saved_path.stat().st_size,
        )
        await self.auth.db.commit()
        if background_tasks is None:
            await self.index_document(document.id)
            document = await KnowledgeDocumentCRUD(self.auth).get_or_404(id=document.id)
        else:
            background_tasks.add_task(
                index_document_in_background,
                document.id,
                getattr(getattr(self.auth, "user", None), "id", None),
            )
        return self._document_output(document)

    async def index_document(self, document_id: int) -> KnowledgeDocumentOutSchema:
        document = await KnowledgeDocumentCRUD(self.auth).get_or_404(id=document_id, msg="knowledge document not found")
        knowledge_base_id, file_name, file_path = document.knowledge_base_id, document.file_name, document.file_path
        claim = await self.auth.db.execute(
            update(KnowledgeDocumentModel)
            .where(
                KnowledgeDocumentModel.id == document_id,
                KnowledgeDocumentModel.is_deleted == False,
                KnowledgeDocumentModel.index_status != "indexing",
            )
            .values(parse_status="parsing", index_status="indexing", error_message=None)
        )
        if claim.rowcount != 1:
            raise CustomException(msg="文档正在处理，请稍后刷新状态", status_code=409)
        await self.auth.db.commit()
        doc_crud = KnowledgeDocumentCRUD(self.auth)
        stage = "parse"
        failure_message = "无法解析文档，请确认文件未损坏或加密；扫描件请先转为可复制的文字后重新上传。"
        chroma_ids: list[str] = []
        vector_started = bm25_started = False
        try:
            if not file_path:
                raise FileNotFoundError
            text = await extract_text(self._resolve_knowledge_path(file_path))
            chunks = split_text(text)
            if not chunks:
                failure_message = "未提取到文字，请确认文档包含可复制的文本；扫描件请先识别文字后重新上传。"
                raise CustomException(msg="document text is empty")

            now = datetime.now()
            await doc_crud.update_status(document_id, parse_status="success", index_status="indexing", parsed_at=now)
            await self.auth.db.commit()
            stage = "index"
            failure_message = "无法读取索引记录，请联系管理员检查数据库连接后重建索引。"
            old_chunks = await KnowledgeChunkCRUD(self.auth).list_by_document(document_id)
            old_ids = [chunk.chroma_id for chunk in old_chunks]
            chroma_ids = [f"kb-{knowledge_base_id}-doc-{document_id}-{index}-{uuid.uuid4().hex}" for index in range(len(chunks))]
            retrieval_mode = settings.RETRIEVAL_MODE
            embeddings: list[list[float]] | None = None
            metadatas: list[dict[str, int | str]] | None = None
            if retrieval_mode in ("vector", "hybrid"):
                failure_message = "向量生成失败，请联系管理员检查模型服务配置、连接与额度后重建索引。"
                embeddings = await self._get_embedding_client().embed_texts(chunks)
                metadatas = [
                    build_chroma_metadata(
                        knowledge_base_id=knowledge_base_id,
                        document_id=document_id,
                        chunk_index=index,
                        file_name=file_name,
                    )
                    for index in range(len(chunks))
                ]

            failure_message = "索引写入失败，请稍后重建索引；若仍失败，请联系管理员检查索引存储权限与可用空间。"
            if embeddings is not None and metadatas is not None:
                vector_started = True
                await self._get_store().upsert_chunks(ids=chroma_ids, embeddings=embeddings, documents=chunks, metadatas=metadatas)

            if retrieval_mode in ("hybrid", "bm25"):
                bm25_chunks = [
                    {
                        "id": chroma_ids[index],
                        "content": content,
                        "knowledge_base_id": knowledge_base_id,
                        "document_id": document_id,
                        "chunk_index": index,
                        "file_name": file_name,
                    }
                    for index, content in enumerate(chunks)
                ]
                bm25_started = True
                await self._get_bm25_index().add_chunks(bm25_chunks)

            failure_message = "索引记录保存失败，请稍后重建索引；若仍失败，请联系管理员检查数据库连接。"
            await KnowledgeChunkCRUD(self.auth).replace_chunks(
                knowledge_base_id=knowledge_base_id,
                document_id=document_id,
                chunks=chunks,
                chroma_ids=chroma_ids,
            )

            obj = await doc_crud.update_status(document_id, index_status="success", error_message=None, indexed_at=datetime.now())
            output = self._document_output(obj)
            output.chunk_count = len(chunks)
            await self.auth.db.commit()
        except (Exception, asyncio.CancelledError) as exc:
            await self.auth.db.rollback()
            if isinstance(exc, asyncio.CancelledError):
                failure_message = "文档处理已中断，请重新索引；若仍失败，请联系管理员检查服务状态。"
            elif stage == "parse" and isinstance(exc, FileNotFoundError):
                failure_message = "原文件不存在，请重新上传文档；若仍失败，请联系管理员检查文件存储。"
            elif stage == "parse" and isinstance(exc, PermissionError):
                failure_message = "无法读取原文件，请联系管理员检查文件存储权限后重试。"
            elif stage == "index" and isinstance(exc, TimeoutError):
                failure_message = "索引服务超时，请稍后重建索引；若仍失败，请联系管理员检查模型服务连接。"
            try:
                await self._delete_index_chunks(chroma_ids, vector=vector_started, bm25=bm25_started)
            except Exception:
                logger.exception("清理本次失败索引的分块失败: document_id=%s", document_id)
            await doc_crud.update_status(
                document_id,
                parse_status="failed" if stage == "parse" else "success",
                index_status="failed",
                error_message=failure_message,
            )
            await self.auth.db.commit()
            if isinstance(exc, asyncio.CancelledError):
                raise
            logger.exception("索引知识库文档失败: document_id=%s", document_id)
            raise CustomException(msg=failure_message) from exc

        try:
            vector, bm25 = self._index_backends_to_clean()
            await self._delete_index_chunks(old_ids, vector=vector, bm25=bm25)
        except Exception:
            logger.exception("清理旧索引分块失败: document_id=%s", document_id)
            output.error_message = "文档已可检索，但旧索引清理失败，请联系管理员检查索引存储。"
            await doc_crud.update_status(document_id, error_message=output.error_message)
            await self.auth.db.commit()
        return output

    def _index_backends_to_clean(self) -> tuple[bool, bool]:
        return (
            settings.RETRIEVAL_MODE in ("vector", "hybrid") or self.store is not None or Path(settings.CHROMA_PERSIST_DIR).is_dir(),
            settings.RETRIEVAL_MODE in ("bm25", "hybrid") or self.bm25_index is not None or Path(settings.BM25_INDEX_DIR or BASE_DIR / "data" / "bm25_index").is_dir(),
        )

    async def _delete_index_chunks(self, ids: list[str], *, vector: bool, bm25: bool) -> None:
        """Remove one generation of chunks without deleting other document indexes."""
        if not ids:
            return
        if vector:
            await anyio.to_thread.run_sync(lambda: self._get_store().collection.delete(ids=ids))
        if bm25:

            def delete_chunks() -> None:
                writer = self._get_bm25_index()._get_index().writer()
                try:
                    for chunk_id in ids:
                        writer.delete_by_term("chunk_id", chunk_id)
                    writer.commit()
                except Exception:
                    writer.cancel()
                    raise

            await anyio.to_thread.run_sync(delete_chunks)

    async def delete_document(self, ids: list[int]) -> None:
        if not ids:
            raise CustomException(msg="document ids cannot be empty")

        normalized_ids = list(dict.fromkeys(ids))
        document_crud = KnowledgeDocumentCRUD(self.auth)
        documents = await document_crud.get_list(search={"id": ("in", normalized_ids)})
        accessible_ids = {document.id for document in documents}
        if accessible_ids != set(normalized_ids):
            raise CustomException(msg="知识库文档不存在或无权访问", status_code=403)
        if any(getattr(document, "index_status", None) == "indexing" for document in documents):
            raise CustomException(msg="文档正在处理，请完成后再删除", status_code=409)

        vector, bm25 = self._index_backends_to_clean()
        for document_id in normalized_ids:
            if vector:
                await self._get_store().delete_document(document_id)
            if bm25:
                await self._get_bm25_index().delete_by_document(document_id)
        chunks = await KnowledgeChunkCRUD(self.auth).get_list(search={"document_id": ("in", normalized_ids)})
        chunk_ids = [chunk.id for chunk in chunks]
        if chunk_ids:
            await KnowledgeChunkCRUD(self.auth).delete(ids=chunk_ids)
        await document_crud.delete(ids=normalized_ids)

    async def query_retrieval(self, data: RetrievalTestSchema) -> dict[str, Any]:
        if not data.knowledge_base_ids:
            raise CustomException(msg="please select at least one knowledge base")
        knowledge_base_ids = await accessible_knowledge_base_ids(self.auth, data.knowledge_base_ids)
        retrieval_mode = settings.RETRIEVAL_MODE
        searcher = KnowledgeRetriever(
            mode=retrieval_mode if retrieval_mode in {"vector", "bm25", "hybrid"} else "vector",
            chroma_store=self.store,
            bm25_index=self.bm25_index,
            embedding_client=self.embedding_client,
            alpha=settings.HYBRID_ALPHA,
            top_k=data.top_k,
            candidate_multiplier=settings.RETRIEVAL_CANDIDATE_MULTIPLIER,
            auto_adjust_alpha=getattr(settings, "RETRIEVAL_AUTO_ADJUST_ALPHA", True),
        )
        results = await searcher.search(query=data.query, knowledge_base_ids=knowledge_base_ids)

        if retrieval_mode == "bm25":
            return {
                "query": data.query,
                "retrieval_mode": retrieval_mode,
                "results": [
                    {
                        "content": item.content,
                        "metadata": item.metadata,
                        "score": item.score,
                    }
                    for item in results
                ],
            }

        if retrieval_mode == "hybrid":
            return {
                "query": data.query,
                "retrieval_mode": retrieval_mode,
                "results": [
                    {
                        "content": item.content,
                        "metadata": item.metadata,
                        "distance": item.distance,
                        "score": item.score,
                    }
                    for item in results
                ],
            }

        return {
            "query": data.query,
            "retrieval_mode": retrieval_mode,
            "results": [
                {
                    "content": item.content,
                    "metadata": item.metadata,
                    "distance": item.distance,
                }
                for item in results
            ],
        }

    async def _save_upload_file(self, file: UploadFile) -> Path:
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        suffix = Path(file.filename or "").suffix.lower()
        if suffix not in {".txt", ".md", ".pdf", ".docx"}:
            raise CustomException(msg="only txt, md, pdf, and docx documents are supported")
        file_path = UPLOAD_DIR / f"{uuid.uuid4().hex}{suffix}"
        from app.utils.upload_util import UploadUtil

        await UploadUtil.save_upload_stream(file=file, filepath=file_path)
        return file_path

    @staticmethod
    def _resolve_knowledge_path(file_path: str) -> Path:
        """Resolve a stored document reference under the knowledge root.

        Args:
            file_path: Relative path from the database or a legacy absolute
                path that still points inside the knowledge storage root.

        Returns:
            A resolved existing document path.

        Raises:
            CustomException: If the path escapes storage or is missing.
        """
        root = UPLOAD_DIR.resolve()
        raw_path = Path(file_path)
        candidate = raw_path if raw_path.is_absolute() else root / raw_path
        resolved = candidate.resolve()
        try:
            resolved.relative_to(root)
        except ValueError as exc:
            raise CustomException(msg="知识库文档路径非法") from exc
        if not resolved.is_file():
            raise CustomException(msg="知识库文档文件不存在")
        return resolved

    @staticmethod
    def _safe_knowledge_path(file_path: str | Path | None) -> str | None:
        """Convert an internal document path to a root-relative response value.

        Args:
            file_path: Stored document path.

        Returns:
            A POSIX relative path, or ``None`` when the legacy value is outside
            the controlled knowledge storage root.
        """
        if not file_path:
            return None
        root = UPLOAD_DIR.resolve()
        candidate = Path(file_path)
        if not candidate.is_absolute():
            candidate = root / candidate
        try:
            return candidate.resolve().relative_to(root).as_posix()
        except ValueError:
            return None

    @classmethod
    def _document_output(cls, document: Any) -> KnowledgeDocumentOutSchema:
        """Build a document response without exposing the server filesystem."""
        output = KnowledgeDocumentOutSchema.model_validate(document)
        output.file_path = cls._safe_knowledge_path(output.file_path)
        return output

    def _get_store(self) -> ChromaKnowledgeStore:
        if self.store is None:
            self.store = get_cached_chroma_store()
        return self.store

    def _get_embedding_client(self) -> EmbeddingClient:
        if self.embedding_client is None:
            self.embedding_client = get_cached_embedding_client()
        return self.embedding_client

    def _get_bm25_index(self) -> BM25KnowledgeIndex:
        if self.bm25_index is None:
            self.bm25_index = get_cached_bm25_index()
        return self.bm25_index
