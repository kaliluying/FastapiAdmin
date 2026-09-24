"""Stable cross-feature API for knowledge access and retrieval."""

from __future__ import annotations

from typing import Any, Protocol

from app.core.exceptions import CustomException

from .crud import KnowledgeBaseCRUD
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


__all__ = [
    "KnowledgeRetriever",
    "KnowledgeSearch",
    "KnowledgeSearchResult",
    "QueryAnalysis",
    "QueryAnalyzer",
    "RetrievalMode",
    "accessible_knowledge_base_ids",
]
