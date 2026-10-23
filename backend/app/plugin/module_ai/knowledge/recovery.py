from __future__ import annotations

import asyncio
from contextlib import suppress

from sqlalchemy import select

from app.core.database import async_db_session
from app.core.logger import logger

from . import document_lifecycle
from .model import KnowledgeDocumentModel

_worker: asyncio.Task | None = None


async def recover_document_indexes() -> None:
    """由生命周期工作任务执行知识库模块的恢复流程。"""
    await document_lifecycle.KnowledgeDocumentLifecycle.recover_pending_documents()


async def _run_recovery() -> None:
    async with asyncio.TaskGroup() as tasks:
        tasks.create_task(_run_index_recovery())
        tasks.create_task(_run_upload_recovery())


async def _run_index_recovery() -> None:
    while True:
        try:
            await recover_document_indexes()
        except Exception:
            logger.error("知识索引恢复检查失败")
        await asyncio.sleep(15)


async def _run_upload_recovery() -> None:
    while True:
        try:
            await document_lifecycle.reconcile_orphan_uploads()
        except Exception:
            logger.error("知识库上传文件恢复检查失败")
        await asyncio.sleep(15)


async def initialize_knowledge_recovery() -> None:
    """数据库结构初始化后，启动由模块清单管理的状态核对任务。"""
    global _worker
    if _worker is None or _worker.done():
        async with async_db_session() as db:
            await db.execute(select(KnowledgeDocumentModel.index_attempts).limit(1))
        _worker = asyncio.create_task(_run_recovery(), name="knowledge-index-recovery")


async def stop_knowledge_recovery() -> None:
    global _worker
    if _worker is not None:
        _worker.cancel()
        with suppress(asyncio.CancelledError):
            await _worker
        _worker = None
