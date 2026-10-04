from __future__ import annotations

import asyncio
import uuid
from contextlib import suppress
from datetime import datetime, timedelta
from pathlib import Path
from types import SimpleNamespace
from typing import Any

import anyio
from fastapi import UploadFile
from sqlalchemy import and_, or_, select, update

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
from .model import KnowledgeBaseModel, KnowledgeDocumentModel
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
INDEX_MAX_ATTEMPTS = 3
INDEX_LEASE_SECONDS = 300
INDEX_RETRY_SECONDS = 60


async def index_document_in_background(document_id: int, user_id: int | None) -> None:
    """Index one uploaded document with an independent database session."""
    async with async_db_session() as db:
        auth = AuthSchema(
            user=SimpleNamespace(id=user_id),
            db=db,
            check_data_scope=False,
        )
        try:
            await KnowledgeService(auth).index_document(document_id, automatic=True)
        except Exception:
            await db.rollback()
            logger.error("后台索引知识库文档失败: document_id={}", document_id)


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

    @staticmethod
    def _automatic_index_conditions(now: datetime) -> list[Any]:
        """Share durable eligibility rules between recovery scans and atomic claims."""
        return [
            KnowledgeDocumentModel.is_deleted == False,
            or_(KnowledgeDocumentModel.index_lease_until.is_(None), KnowledgeDocumentModel.index_lease_until <= now),
            KnowledgeDocumentModel.index_attempts < INDEX_MAX_ATTEMPTS,
            KnowledgeDocumentModel.index_status.in_(("pending", "failed", "indexing")),
        ]

    @classmethod
    async def recover_pending_documents(cls) -> None:
        """Reconcile durable jobs; SQL claims fence competing application workers."""
        now = datetime.now()
        available = or_(KnowledgeDocumentModel.index_lease_until.is_(None), KnowledgeDocumentModel.index_lease_until <= now)
        async with async_db_session() as db:
            await db.execute(
                update(KnowledgeDocumentModel)
                .where(KnowledgeDocumentModel.is_deleted == False, KnowledgeDocumentModel.index_status == "indexing", available, KnowledgeDocumentModel.index_attempts >= INDEX_MAX_ATTEMPTS)
                .values(index_status="failed", index_token=None, index_lease_until=None, error_message="文档处理多次中断，已停止自动重试，请检查服务后手动重建索引。")
            )
            jobs = (
                await db.execute(
                    select(KnowledgeDocumentModel.id, KnowledgeDocumentModel.created_id)
                    .where(*cls._automatic_index_conditions(now))
                    .order_by(KnowledgeDocumentModel.id)
                    .limit(20)
                )
            ).all()
            cleanup_ids = (
                (
                    await db.execute(
                        select(KnowledgeDocumentModel.id)
                        .where(
                            KnowledgeDocumentModel.is_deleted == False,
                            available,
                            KnowledgeDocumentModel.index_cleanup_ids.is_not(None),
                            or_(KnowledgeDocumentModel.index_status == "success", and_(KnowledgeDocumentModel.index_status == "failed", KnowledgeDocumentModel.index_attempts >= INDEX_MAX_ATTEMPTS)),
                        )
                        .order_by(KnowledgeDocumentModel.id)
                        .limit(20)
                    )
                )
                .scalars()
                .all()
            )
            deleted_ids = (
                (
                    await db.execute(
                        select(KnowledgeDocumentModel.id)
                        .where(KnowledgeDocumentModel.is_deleted == True, available, KnowledgeDocumentModel.index_status == "deleting")
                        .order_by(KnowledgeDocumentModel.id)
                        .limit(20)
                    )
                )
                .scalars()
                .all()
            )
            await db.commit()
        for document_id in deleted_ids:
            async with async_db_session() as db:
                try:
                    await cls(AuthSchema(db=db, check_data_scope=False)).cleanup_deleted_document(document_id)
                except Exception:
                    await db.rollback()
                    logger.error("恢复已删除文档清理失败: document_id={}", document_id)
        for document_id in cleanup_ids:
            async with async_db_session() as db:
                try:
                    await cls(AuthSchema(db=db, check_data_scope=False)).cleanup_document_indexes(document_id)
                except Exception:
                    await db.rollback()
                    logger.error("恢复知识索引清理失败: document_id={}", document_id)
        for document_id, user_id in jobs:
            await index_document_in_background(document_id, user_id)

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
        bases = await KnowledgeBaseCRUD(self.auth).get_list(search={"id": ("in", ids)})
        if {base.id for base in bases} != set(ids):
            raise CustomException(msg="知识库不存在或无权访问", status_code=403)
        await self.auth.db.execute(update(KnowledgeBaseModel).where(KnowledgeBaseModel.id.in_(ids)).values(updated_time=datetime.now()))
        docs = await KnowledgeDocumentCRUD(self.auth).get_list(search={"knowledge_base_id": ("in", ids)})
        doc_ids = [doc.id for doc in docs]
        if doc_ids:
            await self.delete_document(doc_ids, knowledge_base_ids=ids)
        else:
            await KnowledgeBaseCRUD(self.auth).delete(ids=ids)
            await self.auth.db.commit()

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
        available = await self.auth.db.execute(update(KnowledgeBaseModel).where(KnowledgeBaseModel.id == knowledge_base_id, KnowledgeBaseModel.is_deleted == False).values(updated_time=datetime.now()))
        if available.rowcount != 1:
            raise CustomException(msg="knowledge base not found", status_code=404)
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

    async def index_document(self, document_id: int, *, automatic: bool = False) -> KnowledgeDocumentOutSchema:
        document = await KnowledgeDocumentCRUD(self.auth).get_or_404(id=document_id, msg="knowledge document not found")
        knowledge_base_id, file_name, file_path = document.knowledge_base_id, document.file_name, document.file_path
        now = datetime.now()
        token = uuid.uuid4().hex
        available = or_(KnowledgeDocumentModel.index_lease_until.is_(None), KnowledgeDocumentModel.index_lease_until <= now)
        conditions = [KnowledgeDocumentModel.id == document_id]
        if automatic:
            conditions.extend(self._automatic_index_conditions(now))
        else:
            conditions.extend([
                KnowledgeDocumentModel.is_deleted == False,
                KnowledgeDocumentModel.index_status != "deleting",
                or_(KnowledgeDocumentModel.index_token.is_(None), available),
                or_(KnowledgeDocumentModel.index_status != "indexing", available),
            ])
        claim = await self.auth.db.execute(
            update(KnowledgeDocumentModel)
            .where(*conditions)
            .values(
                parse_status="parsing",
                index_status="indexing",
                error_message=None,
                index_token=token,
                index_lease_until=now + timedelta(seconds=INDEX_LEASE_SECONDS),
                index_attempts=KnowledgeDocumentModel.index_attempts + 1 if automatic else 1,
            )
        )
        if claim.rowcount != 1:
            raise CustomException(msg="文档正在处理，请稍后刷新状态", status_code=409)
        await self.auth.db.refresh(document)
        await self.auth.db.commit()
        heartbeat = asyncio.create_task(self._renew_index_lease(document_id, token, asyncio.current_task()))
        doc_crud = KnowledgeDocumentCRUD(self.auth)
        stage = "parse"
        failure_message = "无法解析文档，请确认文件未损坏或加密；扫描件请先转为可复制的文字后重新上传。"
        chroma_ids: list[str] = []
        vector_started = bm25_started = False
        completion_started = False
        pending_cleanup = getattr(document, "index_cleanup_ids", None) or []
        try:
            vector, bm25 = self._index_backends_to_clean()
            await self._delete_index_chunks(pending_cleanup, vector=vector, bm25=bm25)
            if not file_path:
                raise FileNotFoundError
            text = await extract_text(self._resolve_knowledge_path(file_path))
            chunks = split_text(text)
            if not chunks:
                failure_message = "未提取到文字，请确认文档包含可复制的文本；扫描件请先识别文字后重新上传。"
                raise CustomException(msg="document text is empty")

            now = datetime.now()
            stage = "index"
            failure_message = "无法读取索引记录，请联系管理员检查数据库连接后重建索引。"
            old_chunks = await KnowledgeChunkCRUD(self.auth).list_by_document(document_id)
            old_ids = [chunk.chroma_id for chunk in old_chunks]
            chroma_ids = [f"kb-{knowledge_base_id}-doc-{document_id}-{index}-{uuid.uuid4().hex}" for index in range(len(chunks))]
            await self._update_index_claim(document_id, token, index_cleanup_ids=chroma_ids)
            await doc_crud.update_status(document_id, parse_status="success", index_status="indexing", parsed_at=now)
            await self.auth.db.commit()
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
                await self._update_index_claim(document_id, token, updated_time=datetime.now())
                vector_started = True
                await self._get_store().upsert_chunks(ids=chroma_ids, embeddings=embeddings, documents=chunks, metadatas=metadatas)
                await self.auth.db.commit()

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
                await self._update_index_claim(document_id, token, updated_time=datetime.now())
                bm25_started = True
                await self._get_bm25_index().add_chunks(bm25_chunks)
                await self.auth.db.commit()

            failure_message = "索引记录保存失败，请稍后重建索引；若仍失败，请联系管理员检查数据库连接。"
            await self._update_index_claim(document_id, token, index_cleanup_ids=old_ids or None, index_token=None, index_lease_until=None)
            await KnowledgeChunkCRUD(self.auth).replace_chunks(
                knowledge_base_id=knowledge_base_id,
                document_id=document_id,
                chunks=chunks,
                chroma_ids=chroma_ids,
            )

            obj = await doc_crud.update_status(document_id, index_status="success", error_message=None, indexed_at=datetime.now())
            output = self._document_output(obj)
            output.chunk_count = len(chunks)
            completion_started = True
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
            cleanup_succeeded = False
            try:
                cleanup_ids = chroma_ids
                if completion_started:
                    committed_chunks = await KnowledgeChunkCRUD(self.auth).list_by_document(document_id)
                    active_ids = {chunk.chroma_id for chunk in committed_chunks}
                    cleanup_ids = [chunk_id for chunk_id in chroma_ids if chunk_id not in active_ids]
                await self._delete_index_chunks(cleanup_ids, vector=vector_started, bm25=bm25_started)
                cleanup_succeeded = len(cleanup_ids) == len(chroma_ids)
            except Exception:
                logger.error("清理本次失败索引的分块失败: document_id={}", document_id)
            try:
                failed = await self.auth.db.execute(
                    update(KnowledgeDocumentModel)
                    .where(KnowledgeDocumentModel.id == document_id, KnowledgeDocumentModel.index_token == token)
                    .values(
                        parse_status="failed" if stage == "parse" else "success",
                        index_status="failed",
                        error_message=failure_message,
                        index_token=None,
                        index_lease_until=datetime.now() + timedelta(seconds=INDEX_RETRY_SECONDS),
                        **({"index_cleanup_ids": None} if cleanup_succeeded and not pending_cleanup else {}),
                    )
                )
                await self.auth.db.commit()
            except Exception:
                if isinstance(exc, asyncio.CancelledError):
                    raise exc from None
                raise
            if isinstance(exc, asyncio.CancelledError):
                raise
            if failed.rowcount != 1:
                raise CustomException(msg="索引任务已被接管，请刷新状态", status_code=409) from None
            logger.error("索引知识库文档失败: document_id={}, stage={}", document_id, stage)
            raise CustomException(msg=failure_message) from None
        finally:
            heartbeat.cancel()
            with suppress(asyncio.CancelledError):
                await heartbeat

        try:
            if old_ids:
                await self.cleanup_document_indexes(document_id)
        except Exception:
            logger.error("清理旧索引分块失败: document_id={}", document_id)
            output.error_message = "文档已可检索，但旧索引清理失败，请联系管理员检查索引存储。"
            await self.auth.db.execute(
                update(KnowledgeDocumentModel)
                .where(KnowledgeDocumentModel.id == document_id, KnowledgeDocumentModel.index_status == "success", KnowledgeDocumentModel.index_cleanup_ids.is_not(None))
                .values(error_message=output.error_message)
            )
            await self.auth.db.commit()
        return output

    async def cleanup_document_indexes(self, document_id: int) -> None:
        token = uuid.uuid4().hex
        claimed = await self.auth.db.execute(
            update(KnowledgeDocumentModel)
            .where(
                KnowledgeDocumentModel.id == document_id,
                KnowledgeDocumentModel.is_deleted == False,
                KnowledgeDocumentModel.index_status.in_(("success", "failed")),
                KnowledgeDocumentModel.index_cleanup_ids.is_not(None),
                or_(KnowledgeDocumentModel.index_token.is_(None), KnowledgeDocumentModel.index_lease_until <= datetime.now()),
            )
            .values(index_token=token, index_lease_until=datetime.now() + timedelta(seconds=INDEX_LEASE_SECONDS))
        )
        if claimed.rowcount != 1:
            await self.auth.db.rollback()
            return
        document = await self.auth.db.get(KnowledgeDocumentModel, document_id, populate_existing=True)
        cleanup_ids = document.index_cleanup_ids or []
        successful = document.index_status == "success"
        await self.auth.db.commit()
        heartbeat = asyncio.create_task(self._renew_index_lease(document_id, token, asyncio.current_task()))
        try:
            vector, bm25 = self._index_backends_to_clean()
            await self._delete_index_chunks(cleanup_ids, vector=vector, bm25=bm25)
            await self._update_index_claim(document_id, token, index_cleanup_ids=None, index_token=None, index_lease_until=None, **({"error_message": None} if successful else {}))
            await self.auth.db.commit()
        except (Exception, asyncio.CancelledError):
            await self.auth.db.rollback()
            await self.auth.db.execute(
                update(KnowledgeDocumentModel)
                .where(KnowledgeDocumentModel.id == document_id, KnowledgeDocumentModel.index_token == token)
                .values(index_token=None, index_lease_until=datetime.now() + timedelta(seconds=INDEX_RETRY_SECONDS))
            )
            await self.auth.db.commit()
            raise
        finally:
            heartbeat.cancel()
            with suppress(asyncio.CancelledError):
                await heartbeat

    async def _update_index_claim(self, document_id: int, token: str, **values: Any) -> None:
        result = await self.auth.db.execute(
            update(KnowledgeDocumentModel)
            .where(KnowledgeDocumentModel.id == document_id, KnowledgeDocumentModel.index_token == token, KnowledgeDocumentModel.index_lease_until > datetime.now())
            .values(**values)
        )
        if result.rowcount != 1:
            raise CustomException(msg="索引任务租约已失效，请刷新状态", status_code=409)

    @staticmethod
    async def _renew_index_lease(document_id: int, token: str, owner: asyncio.Task | None) -> None:
        try:
            while True:
                await asyncio.sleep(30)
                async with async_db_session() as db:
                    now = datetime.now()
                    result = await db.execute(
                        update(KnowledgeDocumentModel)
                        .where(KnowledgeDocumentModel.id == document_id, KnowledgeDocumentModel.index_token == token, KnowledgeDocumentModel.index_lease_until > now)
                        .values(index_lease_until=now + timedelta(seconds=INDEX_LEASE_SECONDS))
                    )
                    await db.commit()
                    if result.rowcount != 1:
                        completed = (await db.execute(select(KnowledgeDocumentModel.index_token, KnowledgeDocumentModel.index_status).where(KnowledgeDocumentModel.id == document_id))).first()
                        if completed is not None and completed.index_token is None and completed.index_status in ("success", "deleted"):
                            return
                        raise RuntimeError("index lease lost")
        except Exception:
            logger.error("知识索引租约续期失败: document_id={}", document_id)
            if owner is not None:
                owner.cancel()

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
            await self._get_store().delete_chunks(ids)
        if bm25:
            await self._get_bm25_index().delete_chunks(ids)

    async def delete_document(self, ids: list[int], *, knowledge_base_ids: list[int] | None = None) -> None:
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

        claimed = await self.auth.db.execute(
            update(KnowledgeDocumentModel)
            .where(
                KnowledgeDocumentModel.id.in_(normalized_ids),
                KnowledgeDocumentModel.is_deleted == False,
                KnowledgeDocumentModel.index_status.not_in(("indexing", "deleting")),
                KnowledgeDocumentModel.index_token.is_(None),
            )
            .values(index_status="deleting")
        )
        if claimed.rowcount != len(normalized_ids):
            await self.auth.db.rollback()
            raise CustomException(msg="文档正在处理，请完成后再删除", status_code=409)

        chunks = await KnowledgeChunkCRUD(self.auth).get_list(search={"document_id": ("in", normalized_ids)})
        chunk_ids = [chunk.id for chunk in chunks]
        if chunk_ids:
            await KnowledgeChunkCRUD(self.auth).delete(ids=chunk_ids)
        await document_crud.delete(ids=normalized_ids)
        if knowledge_base_ids:
            await KnowledgeBaseCRUD(self.auth).delete(ids=knowledge_base_ids)
        await self.auth.db.commit()
        for document_id in normalized_ids:
            try:
                await self.cleanup_deleted_document(document_id)
            except Exception:
                logger.error("文档已删除，等待后台恢复清理: document_id={}", document_id)

    async def cleanup_deleted_document(self, document_id: int) -> None:
        token = uuid.uuid4().hex
        claimed = await self.auth.db.execute(
            update(KnowledgeDocumentModel)
            .where(
                KnowledgeDocumentModel.id == document_id,
                KnowledgeDocumentModel.is_deleted == True,
                KnowledgeDocumentModel.index_status == "deleting",
                or_(KnowledgeDocumentModel.index_lease_until.is_(None), KnowledgeDocumentModel.index_lease_until <= datetime.now()),
            )
            .values(index_token=token, index_lease_until=datetime.now() + timedelta(seconds=INDEX_LEASE_SECONDS))
        )
        if claimed.rowcount != 1:
            await self.auth.db.rollback()
            return
        document = await self.auth.db.get(KnowledgeDocumentModel, document_id, populate_existing=True)
        file_path = document.file_path
        await self.auth.db.commit()
        heartbeat = asyncio.create_task(self._renew_index_lease(document_id, token, asyncio.current_task()))
        try:
            vector, bm25 = self._index_backends_to_clean()
            if vector:
                await self._get_store().delete_document(document_id)
            if bm25:
                await self._get_bm25_index().delete_by_document(document_id)
            if file_path:
                relative_path = self._safe_knowledge_path(file_path)
                if relative_path is None:
                    raise CustomException(msg="知识库文档路径非法")
                await anyio.to_thread.run_sync(lambda: (UPLOAD_DIR / relative_path).unlink(missing_ok=True))
            await self._update_index_claim(document_id, token, file_path=None, index_status="deleted", index_token=None, index_lease_until=None, index_cleanup_ids=None)
            await self.auth.db.commit()
        except (Exception, asyncio.CancelledError):
            await self.auth.db.rollback()
            await self.auth.db.execute(
                update(KnowledgeDocumentModel)
                .where(KnowledgeDocumentModel.id == document_id, KnowledgeDocumentModel.index_token == token)
                .values(index_token=None, index_lease_until=datetime.now() + timedelta(seconds=INDEX_RETRY_SECONDS))
            )
            await self.auth.db.commit()
            raise
        finally:
            heartbeat.cancel()
            with suppress(asyncio.CancelledError):
                await heartbeat

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
