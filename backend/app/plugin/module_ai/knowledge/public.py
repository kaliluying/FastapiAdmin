"""供不同功能访问和检索知识库的稳定 API。"""

from __future__ import annotations

from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Any, Protocol

from fastapi import UploadFile

from app.core.exceptions import CustomException

from .crud import KnowledgeBaseCRUD, KnowledgeDocumentCRUD
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
        """仅检索传入且已获授权的知识库。"""


async def accessible_knowledge_base_ids(auth: Any, ids: list[int]) -> list[int]:
    """对请求中的 ID 去重，并拒绝调用方无权访问或不存在的知识库。"""
    normalized = list(dict.fromkeys(ids))
    if not normalized or not getattr(auth, "user", None) or not getattr(auth, "db", None):
        return normalized

    visible = await KnowledgeBaseCRUD(auth).get_list(search={"id": ("in", normalized)})
    visible_ids = {item.id for item in visible}
    if visible_ids != set(normalized):
        raise CustomException(msg="知识库不存在或无权访问", status_code=403)
    return normalized


async def validate_document_scope(auth: Any, document_ids: set[int], knowledge_base_ids: list[int]) -> None:
    """校验评测标注的文档可见性及所选知识库归属。"""
    documents = KnowledgeDocumentCRUD(auth)
    for identifier in document_ids:
        document = await documents.get_or_404(id=identifier, msg="标注文档不存在或无权访问")
        if document.knowledge_base_id not in knowledge_base_ids:
            raise CustomException(msg="标注文档必须属于所选知识库", status_code=422)


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
    "validate_document_scope",
]
