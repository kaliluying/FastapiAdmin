"""Stable cross-feature API for knowledge access and retrieval."""

from __future__ import annotations

from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Any, Protocol

from fastapi import UploadFile

from app.core.exceptions import CustomException

from .crud import KnowledgeBaseCRUD
from .extractors import extract_text
from .query_analyzer import QueryAnalysis, QueryAnalyzer
from .retrieval import KnowledgeRetriever, KnowledgeSearchResult, RetrievalMode


class KnowledgeSearch(Protocol):
    async def search(
        self,
        *,
        query: str,
        knowledge_base_ids: list[int],
        top_k: int | None = None,
    ) -> list[KnowledgeSearchResult]:
        """Search only the supplied, already-authorized knowledge bases."""


async def accessible_knowledge_base_ids(auth: Any, ids: list[int]) -> list[int]:
    """Deduplicate requested IDs and reject any unavailable to the caller."""
    normalized = list(dict.fromkeys(ids))
    if not normalized or not getattr(auth, "user", None) or not getattr(auth, "db", None):
        return normalized

    visible = await KnowledgeBaseCRUD(auth).get_list(search={"id": ("in", normalized)})
    visible_ids = {item.id for item in visible}
    if visible_ids != set(normalized):
        raise CustomException(msg="知识库不存在或无权访问", status_code=403)
    return normalized


async def extract_chat_attachment(file: UploadFile) -> dict[str, Any]:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in {".txt", ".md", ".pdf", ".docx"}:
        raise CustomException(msg="仅支持 TXT、MD、PDF、DOCX 附件")
    content = await file.read(10 * 1024 * 1024 + 1)
    await file.close()
    if len(content) > 10 * 1024 * 1024:
        raise CustomException(msg="附件大小不能超过 10MB")
    try:
        with TemporaryDirectory(prefix="chat-attachment-") as directory:
            path = Path(directory) / f"document{suffix}"
            path.write_bytes(content)
            text = (await extract_text(path)).strip()
    except Exception as exc:
        raise CustomException(msg="附件解析失败，请检查文件内容；扫描版 PDF 需先转换为可复制文本") from exc
    if not text:
        raise CustomException(msg="附件没有可读取的正文，扫描版 PDF 需先转换为可复制文本")
    return {"name": Path(file.filename or "document").name, "size": len(content), "type": suffix, "content": text[:16_000], "truncated": len(text) > 16_000}


__all__ = [
    "KnowledgeRetriever",
    "KnowledgeSearch",
    "KnowledgeSearchResult",
    "QueryAnalysis",
    "QueryAnalyzer",
    "RetrievalMode",
    "accessible_knowledge_base_ids",
    "extract_chat_attachment",
]
