from __future__ import annotations

import asyncio
import uuid
from contextlib import suppress
from datetime import datetime, timedelta
from functools import partial
from io import BytesIO
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

from ._upload_recovery import recover_orphan_uploads as _recover_orphan_uploads
from .bm25_index import BM25KnowledgeIndex, get_cached_bm25_index
from .chroma_store import ChromaKnowledgeStore, get_cached_chroma_store
from .crud import KnowledgeBaseCRUD, KnowledgeChunkCRUD, KnowledgeDocumentCRUD
from .embedding import EmbeddingClient, get_cached_embedding_client
from .extractors import DocumentExtractionError, extract_text
from .model import KnowledgeBaseModel, KnowledgeDocumentModel
from .schema import KnowledgeDocumentOutSchema
from .text_splitter import split_text

UPLOAD_DIR = BASE_DIR / "storage" / "knowledge"
INDEX_MAX_ATTEMPTS = 3
INDEX_LEASE_SECONDS = 300
INDEX_RETRY_SECONDS = 60


def build_chroma_metadata(*, knowledge_base_id: int, document_id: int, chunk_index: int, file_name: str) -> dict[str, int | str]:
    return {"knowledge_base_id": knowledge_base_id, "document_id": document_id, "chunk_index": chunk_index, "file_name": file_name}


async def index_document_in_background(document_id: int, user_id: int | None) -> None:
    """使用独立数据库会话为单个上传文档建立索引。"""
    async with async_db_session() as db:
        auth = AuthSchema(user=SimpleNamespace(id=user_id), db=db, check_data_scope=False)
        try:
            await KnowledgeDocumentLifecycle(auth).index_document(document_id, automatic=True)
        except Exception:
            await db.rollback()
            logger.error("后台索引知识库文档失败: document_id={}", document_id)


def resolve_knowledge_path(file_path: str) -> Path:
    """在知识库存储根目录内解析已保存的文档引用。"""
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


def safe_knowledge_path(file_path: str | Path | None) -> str | None:
    """将内部文档路径转换为相对于存储根目录的响应值。"""
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


def document_output(document: Any) -> KnowledgeDocumentOutSchema:
    """构建文档响应，不暴露服务器文件系统。"""
    output = KnowledgeDocumentOutSchema.model_validate(document)
    output.file_path = safe_knowledge_path(output.file_path)
    output.replacement_pending = bool(getattr(document, "pending_file", None))
    return output


class KnowledgeDocumentLifecycle:
    """集中处理文档写入、索引状态、恢复与跨存储清理。"""

    def __init__(self, auth: AuthSchema, *, store: ChromaKnowledgeStore | None = None, embedding_client: EmbeddingClient | None = None, bm25_index: BM25KnowledgeIndex | None = None) -> None:
        self.auth = auth
        self.store = store
        self.embedding_client = embedding_client
        self.bm25_index = bm25_index

    @staticmethod
    def _automatic_index_conditions(now: datetime) -> list[Any]:
        """恢复扫描和原子任务认领共用持久化状态的资格判定规则。"""
        return [
            KnowledgeDocumentModel.is_deleted == False,
            or_(KnowledgeDocumentModel.index_lease_until.is_(None), KnowledgeDocumentModel.index_lease_until <= now),
            KnowledgeDocumentModel.index_attempts < INDEX_MAX_ATTEMPTS,
            KnowledgeDocumentModel.index_status.in_(("pending", "failed", "indexing")),
        ]

    @classmethod
    async def recover_pending_documents(cls) -> None:
        """核对持久化任务状态；通过 SQL 认领隔离相互竞争的应用工作进程。"""
        now = datetime.now()
        available = or_(KnowledgeDocumentModel.index_lease_until.is_(None), KnowledgeDocumentModel.index_lease_until <= now)
        async with async_db_session() as db:
            await db.execute(
                update(KnowledgeDocumentModel)
                .where(KnowledgeDocumentModel.is_deleted == False, KnowledgeDocumentModel.index_status == "indexing", available, KnowledgeDocumentModel.index_attempts >= INDEX_MAX_ATTEMPTS)
                .values(index_status="failed", index_token=None, index_lease_until=None, error_message="文档处理多次中断，已停止自动重试，请检查服务后手动重建索引。")
            )
            jobs = (
                await db.execute(select(KnowledgeDocumentModel.id, KnowledgeDocumentModel.created_id).where(*cls._automatic_index_conditions(now)).order_by(KnowledgeDocumentModel.id).limit(20))
            ).all()
            cleanup_ids = (
                (
                    await db.execute(
                        select(KnowledgeDocumentModel.id)
                        .where(
                            KnowledgeDocumentModel.is_deleted == False,
                            available,
                            or_(KnowledgeDocumentModel.index_cleanup_ids.is_not(None), KnowledgeDocumentModel.file_cleanup_paths.is_not(None)),
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

    async def update_document_content(self, document_id: int, content: str, background_tasks: Any) -> KnowledgeDocumentOutSchema:
        if not content.strip():
            raise CustomException(msg="文档内容不能为空")
        document = await KnowledgeDocumentCRUD(self.auth).get_or_404(id=document_id)
        filename = f"{Path(document.file_name).stem}.txt"
        return await self.replace_document(document_id, UploadFile(filename=filename, file=BytesIO(content.encode("utf-8"))), background_tasks)

    async def replace_document(self, document_id: int, file: UploadFile, background_tasks: Any) -> KnowledgeDocumentOutSchema:
        document = await KnowledgeDocumentCRUD(self.auth).get_or_404(id=document_id)
        saved = None
        commit_started = False
        try:
            # 创建文件前先阻止恢复任务介入，流尚未传输完成时也保持隔离。
            locked = await self.auth.db.execute(
                update(KnowledgeDocumentModel).where(KnowledgeDocumentModel.id == document_id, KnowledgeDocumentModel.is_deleted == False).values(updated_time=KnowledgeDocumentModel.updated_time)
            )
            if locked.rowcount != 1:
                raise CustomException(msg="文档正在处理，请完成后再替换", status_code=409)
            saved = await self._save_upload_file(file, upload_owner=f"doc-{document_id}")
            pending = {
                "file_path": safe_knowledge_path(saved),
                "file_name": Path((file.filename or saved.name).replace("\\", "/")).name,
                "file_type": saved.suffix.lstrip("."),
                "file_size": saved.stat().st_size,
            }
            previous_pending = document.pending_file
            cleanup_paths = list(document.file_cleanup_paths or [])
            if previous_pending:
                cleanup_paths.append(previous_pending["file_path"])
            claimed = await self.auth.db.execute(
                update(KnowledgeDocumentModel)
                .where(
                    KnowledgeDocumentModel.id == document_id,
                    KnowledgeDocumentModel.is_deleted == False,
                    KnowledgeDocumentModel.index_status.not_in(("indexing", "deleting", "pending")),
                    KnowledgeDocumentModel.index_token.is_(None),
                )
                .values(pending_file=pending, file_cleanup_paths=cleanup_paths or None, parse_status="pending", index_status="pending", index_attempts=0, index_lease_until=None, error_message=None)
            )
            if claimed.rowcount != 1:
                raise CustomException(msg="文档正在处理，请完成后再替换", status_code=409)
            commit_started = True
            await self.auth.db.commit()
        except (Exception, asyncio.CancelledError):
            if not commit_started:
                await asyncio.shield(self._discard_uncommitted_upload(saved))
            raise
        await self.auth.db.refresh(document)
        background_tasks.add_task(index_document_in_background, document_id, getattr(getattr(self.auth, "user", None), "id", None))
        return document_output(document)

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
        saved_path = await self._save_upload_file(file, upload_owner=f"kb-{knowledge_base_id}")
        commit_started = False
        try:
            document = await KnowledgeDocumentCRUD(self.auth).create_document(
                knowledge_base_id=knowledge_base_id,
                file_name=file.filename or saved_path.name,
                file_path=safe_knowledge_path(saved_path),
                file_type=saved_path.suffix.lower().lstrip("."),
                file_size=saved_path.stat().st_size,
            )
            commit_started = True
            await self.auth.db.commit()
        except (Exception, asyncio.CancelledError):
            # 提交报错也可能表示服务端已提交，但响应丢失。
            if not commit_started:
                await asyncio.shield(self._discard_uncommitted_upload(saved_path))
            raise
        if background_tasks is None:
            await self.index_document(document.id)
            document = await KnowledgeDocumentCRUD(self.auth).get_or_404(id=document.id)
        else:
            background_tasks.add_task(
                index_document_in_background,
                document.id,
                getattr(getattr(self.auth, "user", None), "id", None),
            )
        return document_output(document)

    async def index_document(self, document_id: int, *, automatic: bool = False) -> KnowledgeDocumentOutSchema:
        document = await KnowledgeDocumentCRUD(self.auth).get_or_404(id=document_id, msg="knowledge document not found")
        now = datetime.now()
        token = uuid.uuid4().hex
        available = or_(KnowledgeDocumentModel.index_lease_until.is_(None), KnowledgeDocumentModel.index_lease_until <= now)
        conditions = [KnowledgeDocumentModel.id == document_id]
        if automatic:
            conditions.extend(self._automatic_index_conditions(now))
        else:
            conditions.extend(
                [
                    KnowledgeDocumentModel.is_deleted == False,
                    KnowledgeDocumentModel.index_status != "deleting",
                    or_(KnowledgeDocumentModel.index_token.is_(None), available),
                    or_(KnowledgeDocumentModel.index_status != "indexing", available),
                ]
            )
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
        knowledge_base_id = document.knowledge_base_id
        original_file_path = document.file_path
        pending_file = document.pending_file
        file_name = pending_file["file_name"] if pending_file else document.file_name
        file_path = pending_file["file_path"] if pending_file else document.file_path
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
            text = await extract_text(resolve_knowledge_path(file_path))
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
                embedding_client = await anyio.to_thread.run_sync(self._get_embedding_client)
                embeddings = await embedding_client.embed_texts(chunks)
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
                store = await anyio.to_thread.run_sync(self._get_store)
                await store.upsert_chunks(ids=chroma_ids, embeddings=embeddings, documents=chunks, metadatas=metadatas)
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
                bm25_index = await anyio.to_thread.run_sync(self._get_bm25_index)
                await bm25_index.add_chunks(bm25_chunks)
                await self.auth.db.commit()

            failure_message = "索引记录保存失败，请稍后重建索引；若仍失败，请联系管理员检查数据库连接。"
            file_changes = {}
            if pending_file:
                cleanup_paths = list(document.file_cleanup_paths or [])
                if original_file_path:
                    cleanup_paths.append(original_file_path)
                file_changes = {**pending_file, "pending_file": None, "file_cleanup_paths": cleanup_paths or None}
            await self._update_index_claim(document_id, token, index_cleanup_ids=old_ids or None, index_token=None, index_lease_until=None, **file_changes)
            await KnowledgeChunkCRUD(self.auth).replace_chunks(
                knowledge_base_id=knowledge_base_id,
                document_id=document_id,
                chunks=chunks,
                chroma_ids=chroma_ids,
            )

            obj = await doc_crud.update_status(document_id, index_status="success", error_message=None, indexed_at=datetime.now())
            output = document_output(obj)
            output.chunk_count = len(chunks)
            completion_started = True
            await self.auth.db.commit()
        except (Exception, asyncio.CancelledError) as exc:
            await self.auth.db.rollback()
            if isinstance(exc, asyncio.CancelledError):
                failure_message = "文档处理已中断，请重新索引；若仍失败，请联系管理员检查服务状态。"
            elif stage == "parse" and isinstance(exc, DocumentExtractionError):
                failure_message = str(exc)
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
            if old_ids or pending_file or document.file_cleanup_paths:
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
                or_(KnowledgeDocumentModel.index_cleanup_ids.is_not(None), KnowledgeDocumentModel.file_cleanup_paths.is_not(None)),
                or_(KnowledgeDocumentModel.index_token.is_(None), KnowledgeDocumentModel.index_lease_until <= datetime.now()),
            )
            .values(index_token=token, index_lease_until=datetime.now() + timedelta(seconds=INDEX_LEASE_SECONDS))
        )
        if claimed.rowcount != 1:
            await self.auth.db.rollback()
            return
        document = await self.auth.db.get(KnowledgeDocumentModel, document_id, populate_existing=True)
        cleanup_ids = document.index_cleanup_ids or []
        file_cleanup_paths = document.file_cleanup_paths or []
        successful = document.index_status == "success"
        await self.auth.db.commit()
        heartbeat = asyncio.create_task(self._renew_index_lease(document_id, token, asyncio.current_task()))
        try:
            vector, bm25 = self._index_backends_to_clean()
            await self._delete_index_chunks(cleanup_ids, vector=vector, bm25=bm25)
            for path in file_cleanup_paths:
                safe = safe_knowledge_path(path)
                if safe is None:
                    raise CustomException(msg="知识库文档路径非法")
                await anyio.to_thread.run_sync(partial((UPLOAD_DIR / safe).unlink, missing_ok=True))
            await self._update_index_claim(
                document_id, token, file_cleanup_paths=None, index_cleanup_ids=None, index_token=None, index_lease_until=None, **({"error_message": None} if successful else {})
            )
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
        """删除一个代际的分块，不删除文档的其他索引。"""
        if not ids:
            return
        if vector:
            store = await anyio.to_thread.run_sync(self._get_store)
            await store.delete_chunks(ids)
        if bm25:
            bm25_index = await anyio.to_thread.run_sync(self._get_bm25_index)
            await bm25_index.delete_chunks(ids)

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
            .values(index_status="deleting", index_lease_until=None)
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
        file_paths = list(document.file_cleanup_paths or [])
        if document.file_path:
            file_paths.append(document.file_path)
        if document.pending_file:
            file_paths.append(document.pending_file["file_path"])
        await self.auth.db.commit()
        heartbeat = asyncio.create_task(self._renew_index_lease(document_id, token, asyncio.current_task()))
        try:
            vector, bm25 = self._index_backends_to_clean()
            if vector:
                store = await anyio.to_thread.run_sync(self._get_store)
                await store.delete_document(document_id)
            if bm25:
                bm25_index = await anyio.to_thread.run_sync(self._get_bm25_index)
                await bm25_index.delete_by_document(document_id)
            for file_path in file_paths:
                relative_path = safe_knowledge_path(file_path)
                if relative_path is None:
                    raise CustomException(msg="知识库文档路径非法")
                await anyio.to_thread.run_sync(partial((UPLOAD_DIR / relative_path).unlink, missing_ok=True))
            await self._update_index_claim(
                document_id, token, file_path=None, pending_file=None, file_cleanup_paths=None, index_status="deleted", index_token=None, index_lease_until=None, index_cleanup_ids=None
            )
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

    async def _discard_uncommitted_upload(self, path: Path | None) -> None:
        try:
            if path is not None:
                await anyio.to_thread.run_sync(partial(path.unlink, missing_ok=True))
        except Exception:
            logger.error("清理未提交的知识库上传文件失败")
        try:
            await self.auth.db.rollback()
        except Exception:
            logger.error("回滚知识库上传事务失败")

    async def _save_upload_file(self, file: UploadFile, *, upload_owner: str) -> Path:
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        suffix = Path(file.filename or "").suffix.lower()
        if suffix not in {".txt", ".md", ".pdf", ".docx"}:
            raise CustomException(msg="only txt, md, pdf, and docx documents are supported")
        # 文件名记录持久化上传意图；所属记录行保持锁定直至提交或回滚。
        file_path = UPLOAD_DIR / f"{upload_owner}-{uuid.uuid4().hex}{suffix}"
        from app.utils.upload_util import UploadUtil

        await UploadUtil.save_upload_stream(file=file, filepath=file_path)
        return file_path

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


async def reconcile_orphan_uploads(root: Path | None = None) -> None:
    """锁定上传所属事务后，核对文件引用并回收孤儿文件。"""
    await _recover_orphan_uploads(root or UPLOAD_DIR)
