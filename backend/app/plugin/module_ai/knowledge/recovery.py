from __future__ import annotations

import asyncio
from contextlib import suppress

from sqlalchemy import select

from app.core.database import async_db_session
from app.core.logger import logger

from .model import KnowledgeDocumentModel
from .service import KnowledgeService

_worker: asyncio.Task | None = None


async def recover_document_indexes() -> None:
    """Run the Knowledge module's recovery use case from the lifecycle worker."""
    await KnowledgeService.recover_pending_documents()


async def _run_recovery() -> None:
    while True:
        try:
            await recover_document_indexes()
        except Exception:
            logger.error("知识索引恢复检查失败")
        await asyncio.sleep(15)


async def initialize_knowledge_recovery() -> None:
    """Start manifest-managed reconciliation after schema initialization."""
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
