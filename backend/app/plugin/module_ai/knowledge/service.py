from __future__ import annotations

import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

import aiofiles
from fastapi import UploadFile

from app.core.base_schema import AuthSchema
from app.core.exceptions import CustomException

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
from .text_splitter import split_text

UPLOAD_DIR = Path("storage") / "knowledge"


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
    ) -> None:
        self.auth = auth
        self.store = store
        self.embedding_client = embedding_client

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
        for item in result.items:
            item["document_count"] = await base_crud.count_documents(item["id"])
            status_counts = await base_crud.count_documents_by_index_status(item["id"])
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
            store.delete_document(doc.id)
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
        for item in result.items:
            item["chunk_count"] = await chunk_crud.count_by_document(item["id"])
        return result.model_dump()

    async def upload_document(self, *, knowledge_base_id: int, file: UploadFile) -> KnowledgeDocumentOutSchema:
        await KnowledgeBaseCRUD(self.auth).get_or_404(id=knowledge_base_id, msg="knowledge base not found")
        saved_path = await self._save_upload_file(file)
        document = await KnowledgeDocumentCRUD(self.auth).create_document(
            knowledge_base_id=knowledge_base_id,
            file_name=file.filename or saved_path.name,
            file_path=str(saved_path),
            file_type=saved_path.suffix.lower().lstrip("."),
            file_size=saved_path.stat().st_size,
        )
        await self.index_document(document.id)
        refreshed = await KnowledgeDocumentCRUD(self.auth).get_or_404(id=document.id)
        return KnowledgeDocumentOutSchema.model_validate(refreshed)

    async def index_document(self, document_id: int) -> KnowledgeDocumentOutSchema:
        document = await KnowledgeDocumentCRUD(self.auth).get_or_404(id=document_id, msg="knowledge document not found")
        if not document.file_path:
            raise CustomException(msg="document file path is empty")
        doc_crud = KnowledgeDocumentCRUD(self.auth)
        try:
            text = extract_text(document.file_path)
            chunks = split_text(text)
            if not chunks:
                raise CustomException(msg="document text is empty")

            now = datetime.now()
            await doc_crud.update_status(document_id, parse_status="success", index_status="indexing", parsed_at=now)
            chroma_ids = [f"kb-{document.knowledge_base_id}-doc-{document.id}-{index}-{uuid.uuid4().hex}" for index in range(len(chunks))]
            embeddings = await self._get_embedding_client().embed_texts(chunks)
            metadatas = [
                build_chroma_metadata(
                    knowledge_base_id=document.knowledge_base_id,
                    document_id=document.id,
                    chunk_index=index,
                    file_name=document.file_name,
                )
                for index in range(len(chunks))
            ]
            self._get_store().delete_document(document.id)
            self._get_store().upsert_chunks(ids=chroma_ids, embeddings=embeddings, documents=chunks, metadatas=metadatas)
            await KnowledgeChunkCRUD(self.auth).replace_chunks(
                knowledge_base_id=document.knowledge_base_id,
                document_id=document.id,
                chunks=chunks,
                chroma_ids=chroma_ids,
            )
            obj = await doc_crud.update_status(document_id, index_status="success", error_message=None, indexed_at=datetime.now())
            return KnowledgeDocumentOutSchema.model_validate(obj)
        except CustomException:
            await doc_crud.update_status(document_id, parse_status="failed", index_status="failed", error_message="index failed")
            raise
        except Exception as exc:
            await doc_crud.update_status(document_id, parse_status="failed", index_status="failed", error_message=str(exc))
            raise CustomException(msg=f"index knowledge document failed: {exc}") from exc

    async def delete_document(self, ids: list[int]) -> None:
        if not ids:
            raise CustomException(msg="document ids cannot be empty")
        for document_id in ids:
            self._get_store().delete_document(document_id)
        chunks = await KnowledgeChunkCRUD(self.auth).get_list(search={"document_id": ("in", ids)})
        chunk_ids = [chunk.id for chunk in chunks]
        if chunk_ids:
            await KnowledgeChunkCRUD(self.auth).delete(ids=chunk_ids)
        await KnowledgeDocumentCRUD(self.auth).delete(ids=ids)

    async def query_retrieval(self, data: RetrievalTestSchema) -> dict[str, Any]:
        if not data.knowledge_base_ids:
            raise CustomException(msg="please select at least one knowledge base")
        embeddings = await self._get_embedding_client().embed_texts([data.query])
        raw = self._get_store().query(
            query_embedding=embeddings[0],
            knowledge_base_ids=data.knowledge_base_ids,
            top_k=data.top_k,
        )
        return {"query": data.query, "results": self._format_chroma_results(raw)}

    async def _save_upload_file(self, file: UploadFile) -> Path:
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        suffix = Path(file.filename or "").suffix.lower()
        if suffix not in {".txt", ".md", ".pdf", ".docx"}:
            raise CustomException(msg="only txt, md, pdf, and docx documents are supported")
        file_path = UPLOAD_DIR / f"{uuid.uuid4().hex}{suffix}"
        async with aiofiles.open(file_path, "wb") as target:
            while content := await file.read(1024 * 1024):
                await target.write(content)
        return file_path

    def _get_store(self) -> ChromaKnowledgeStore:
        if self.store is None:
            self.store = ChromaKnowledgeStore()
        return self.store

    def _get_embedding_client(self) -> EmbeddingClient:
        if self.embedding_client is None:
            self.embedding_client = create_embedding_client()
        return self.embedding_client

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
