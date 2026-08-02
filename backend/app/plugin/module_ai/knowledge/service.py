from __future__ import annotations

import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

from fastapi import UploadFile

from app.config.path_conf import BASE_DIR
from app.core.base_schema import AuthSchema
from app.core.exceptions import CustomException
from app.core.logger import logger
from app.plugin.module_ai.config import settings

from .bm25_index import BM25KnowledgeIndex
from .chroma_store import ChromaKnowledgeStore
from .crud import KnowledgeBaseCRUD, KnowledgeChunkCRUD, KnowledgeDocumentCRUD
from .embedding import EmbeddingClient, create_embedding_client
from .extractors import extract_text
from .schema import (
    KnowledgeBaseCreateSchema,
    KnowledgeBaseOutSchema,
    KnowledgeBaseQueryParam,
    KnowledgeBaseUpdateSchema,
    KnowledgeDocumentOutSchema,
    KnowledgeDocumentQueryParam,
    RetrievalTestSchema,
)
from .text_splitter import split_legal_text
from .text_splitter import split_text as split_text_fallback

UPLOAD_DIR = BASE_DIR / "storage" / "knowledge"


def build_chroma_metadata(
    *,
    knowledge_base_id: int,
    document_id: int,
    chunk_index: int,
    file_name: str,
    extra: dict[str, Any] | None = None,
) -> dict[str, int | str]:
    base = {
        "knowledge_base_id": knowledge_base_id,
        "document_id": document_id,
        "chunk_index": chunk_index,
        "file_name": file_name,
    }
    if extra:
        # Merge legal metadata, converting list values to strings for ChromaDB compatibility.
        for key, value in extra.items():
            if isinstance(value, list):
                base[key] = ",".join(str(v) for v in value)
            elif value is not None:
                base[key] = str(value)
    return base


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
        store = self._get_store()
        for doc in docs:
            await store.delete_document(doc.id)
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

    async def upload_document(self, *, knowledge_base_id: int, file: UploadFile) -> KnowledgeDocumentOutSchema:
        await KnowledgeBaseCRUD(self.auth).get_or_404(id=knowledge_base_id, msg="knowledge base not found")
        saved_path = await self._save_upload_file(file)
        document = await KnowledgeDocumentCRUD(self.auth).create_document(
            knowledge_base_id=knowledge_base_id,
            file_name=file.filename or saved_path.name,
            file_path=self._safe_knowledge_path(saved_path),
            file_type=saved_path.suffix.lower().lstrip("."),
            file_size=saved_path.stat().st_size,
        )
        await self.index_document(document.id)
        refreshed = await KnowledgeDocumentCRUD(self.auth).get_or_404(id=document.id)
        return self._document_output(refreshed)

    async def index_document(self, document_id: int) -> KnowledgeDocumentOutSchema:
        document = await KnowledgeDocumentCRUD(self.auth).get_or_404(id=document_id, msg="knowledge document not found")
        if not document.file_path:
            raise CustomException(msg="document file path is empty")
        doc_crud = KnowledgeDocumentCRUD(self.auth)
        try:
            text = await extract_text(self._resolve_knowledge_path(document.file_path))
            legal_chunks = split_legal_text(text)

            if legal_chunks:
                # Legal document: use article-aware chunks with rich metadata.
                chunks = [c.content for c in legal_chunks]
                chunk_metas = legal_chunks
            else:
                # Non-legal document: fall back to character-based splitting.
                raw_chunks = split_text_fallback(text)
                if not raw_chunks:
                    raise CustomException(msg="document text is empty")
                chunks = raw_chunks
                chunk_metas = None

            now = datetime.now()
            await doc_crud.update_status(document_id, parse_status="success", index_status="indexing", parsed_at=now)
            chroma_ids = [f"kb-{document.knowledge_base_id}-doc-{document.id}-{index}-{uuid.uuid4().hex}" for index in range(len(chunks))]
            retrieval_mode = settings.RETRIEVAL_MODE
            embeddings: list[list[float]] | None = None
            metadatas: list[dict[str, int | str]] | None = None
            if retrieval_mode in ("vector", "hybrid"):
                embeddings = await self._get_embedding_client().embed_texts(chunks)
                metadatas = [
                    build_chroma_metadata(
                        knowledge_base_id=document.knowledge_base_id,
                        document_id=document.id,
                        chunk_index=index,
                        file_name=document.file_name,
                        extra=chunk_metas[index].metadata if chunk_metas else None,
                    )
                    for index in range(len(chunks))
                ]

            chunk_models = await KnowledgeChunkCRUD(self.auth).replace_chunks(
                knowledge_base_id=document.knowledge_base_id,
                document_id=document.id,
                chunks=chunks,
                chroma_ids=chroma_ids,
            )

            if embeddings is not None and metadatas is not None:
                await self._get_store().delete_document(document.id)
                await self._get_store().upsert_chunks(ids=chroma_ids, embeddings=embeddings, documents=chunks, metadatas=metadatas)

            if retrieval_mode in ("hybrid", "bm25"):
                bm25_chunks = [
                    {
                        "id": chunk_model.chroma_id,
                        "content": chunk_model.content,
                        "knowledge_base_id": chunk_model.knowledge_base_id,
                        "document_id": chunk_model.document_id,
                        "chunk_index": chunk_model.chunk_index,
                        "file_name": document.file_name,
                    }
                    for chunk_model in chunk_models
                ]
                bm25_index = self._get_bm25_index()
                await bm25_index.delete_by_document(document.id)
                await bm25_index.add_chunks(bm25_chunks)
                logger.info(f"BM25索引同步完成: document_id={document.id}, chunks={len(bm25_chunks)}")

            obj = await doc_crud.update_status(document_id, index_status="success", error_message=None, indexed_at=datetime.now())
            return self._document_output(obj)
        except CustomException:
            await doc_crud.update_status(document_id, parse_status="failed", index_status="failed", error_message="index failed")
            raise
        except Exception as exc:
            await doc_crud.update_status(document_id, parse_status="failed", index_status="failed", error_message="index failed")
            logger.exception("索引知识库文档失败: document_id=%s", document_id)
            raise CustomException(msg="索引知识库文档失败，请稍后重试") from exc

    async def delete_document(self, ids: list[int]) -> None:
        if not ids:
            raise CustomException(msg="document ids cannot be empty")

        normalized_ids = list(dict.fromkeys(ids))
        document_crud = KnowledgeDocumentCRUD(self.auth)
        documents = await document_crud.get_list(search={"id": ("in", normalized_ids)})
        accessible_ids = {document.id for document in documents}
        if accessible_ids != set(normalized_ids):
            raise CustomException(msg="知识库文档不存在或无权访问", status_code=403)

        retrieval_mode = settings.RETRIEVAL_MODE
        for document_id in normalized_ids:
            if retrieval_mode in ("vector", "hybrid"):
                await self._get_store().delete_document(document_id)
            if retrieval_mode in ("hybrid", "bm25"):
                await self._get_bm25_index().delete_by_document(document_id)
        chunks = await KnowledgeChunkCRUD(self.auth).get_list(search={"document_id": ("in", normalized_ids)})
        chunk_ids = [chunk.id for chunk in chunks]
        if chunk_ids:
            await KnowledgeChunkCRUD(self.auth).delete(ids=chunk_ids)
        await document_crud.delete(ids=normalized_ids)

    async def query_retrieval(self, data: RetrievalTestSchema) -> dict[str, Any]:
        if not data.knowledge_base_ids:
            raise CustomException(msg="please select at least one knowledge base")
        knowledge_base_ids = await self._accessible_knowledge_base_ids(data.knowledge_base_ids)

        retrieval_mode = settings.RETRIEVAL_MODE
        if retrieval_mode == "bm25":
            results = await self._get_bm25_index().search(
                query=data.query,
                knowledge_base_ids=knowledge_base_ids,
                top_k=data.top_k,
            )
            return {
                "query": data.query,
                "retrieval_mode": retrieval_mode,
                "results": self._format_bm25_results(results),
            }

        if retrieval_mode == "hybrid":
            from app.plugin.module_ai.chat.hybrid_retriever import HybridKnowledgeRetriever

            retriever = HybridKnowledgeRetriever(
                chroma_store=self._get_store(),
                bm25_index=self._get_bm25_index(),
                embedding_client=self._get_embedding_client(),
                alpha=settings.HYBRID_ALPHA,
                top_k=data.top_k,
                candidate_multiplier=settings.RETRIEVAL_CANDIDATE_MULTIPLIER,
                auto_adjust_alpha=settings.RETRIEVAL_AUTO_ADJUST_ALPHA,
            )
            documents = await retriever.retrieve(
                query=data.query,
                user_id="retrieval-test",
                scope_id="retrieval-test",
                session_id=None,
                knowledge_base_ids=knowledge_base_ids,
            )
            return {
                "query": data.query,
                "retrieval_mode": retrieval_mode,
                "results": [
                    {
                        "content": document.content,
                        "metadata": document.metadata,
                        "distance": document.metadata.get("vector_distance"),
                        "score": document.metadata.get("bm25_score"),
                    }
                    for document in documents
                ],
            }

        embeddings = await self._get_embedding_client().embed_texts([data.query])
        raw = await self._get_store().query(
            query_embedding=embeddings[0],
            knowledge_base_ids=knowledge_base_ids,
            top_k=data.top_k,
        )
        return {
            "query": data.query,
            "retrieval_mode": retrieval_mode,
            "results": self._format_chroma_results(raw),
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

    async def _accessible_knowledge_base_ids(self, ids: list[int]) -> list[int]:
        """Validate that retrieval IDs belong to the current user's scope."""
        normalized = list(dict.fromkeys(ids))
        if not normalized or not self.auth.user or not self.auth.db:
            return normalized
        visible = await KnowledgeBaseCRUD(self.auth).get_list(search={"id": ("in", normalized)})
        visible_ids = {item.id for item in visible}
        if visible_ids != set(normalized):
            raise CustomException(msg="知识库不存在或无权访问", status_code=403)
        return normalized

    def _get_store(self) -> ChromaKnowledgeStore:
        if self.store is None:
            self.store = ChromaKnowledgeStore()
        return self.store

    def _get_embedding_client(self) -> EmbeddingClient:
        if self.embedding_client is None:
            self.embedding_client = create_embedding_client()
        return self.embedding_client

    def _get_bm25_index(self) -> BM25KnowledgeIndex:
        if self.bm25_index is None:
            self.bm25_index = BM25KnowledgeIndex()
        return self.bm25_index

    @staticmethod
    def _format_chroma_results(raw: dict[str, Any]) -> list[dict[str, Any]]:
        documents = (raw.get("documents") or [[]])[0] or []
        metadatas = (raw.get("metadatas") or [[]])[0] or []
        distances = (raw.get("distances") or [[]])[0] or []
        results = []
        for index, content in enumerate(documents):
            results.append(
                {
                    "content": content,
                    "metadata": metadatas[index] if index < len(metadatas) else {},
                    "distance": distances[index] if index < len(distances) else None,
                }
            )
        return results

    @staticmethod
    def _format_bm25_results(raw: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Format BM25 search hits for the retrieval test response.

        Args:
            raw: Raw BM25 hits returned by the index adapter.

        Returns:
            Hits with the same content/metadata shape used by vector retrieval.
        """
        return [
            {
                "content": item["content"],
                "metadata": {
                    "knowledge_base_id": item["knowledge_base_id"],
                    "document_id": item["document_id"],
                    "chunk_index": item.get("chunk_index", 0),
                    "file_name": item.get("file_name", ""),
                },
                "score": item["score"],
            }
            for item in raw
        ]
