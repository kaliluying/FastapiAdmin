"""将知识库检索结果转换为提示词上下文文档的聊天适配器。"""

from __future__ import annotations

from typing import Any

from app.plugin.module_ai.knowledge.public import KnowledgeRetriever, KnowledgeSearch, RetrievalMode

from .rag import KeywordKnowledgeRetriever, RagDocument


class KnowledgeBaseChatRetriever:
    """将知识库模块 API 适配为聊天模块的 RAG 协议，并支持文件回退。"""

    def __init__(
        self,
        *,
        mode: RetrievalMode = "hybrid",
        knowledge_search: KnowledgeSearch | None = None,
        alpha: float = 0.5,
        top_k: int = 5,
        candidate_multiplier: int = 4,
        auto_adjust_alpha: bool = True,
    ) -> None:
        self.mode = mode
        self.knowledge_search = (
            knowledge_search
            if knowledge_search is not None
            else KnowledgeRetriever(
                mode=mode,
                alpha=alpha,
                top_k=top_k,
                candidate_multiplier=candidate_multiplier,
                auto_adjust_alpha=auto_adjust_alpha,
            )
        )
        self.file_retriever = KeywordKnowledgeRetriever(documents=[], top_k=top_k)
        self.auto_adjust_alpha = auto_adjust_alpha and mode == "hybrid"

    async def retrieve(
        self,
        *,
        query: str,
        user_id: str,
        scope_id: str,
        session_id: str | None,
        knowledge_base_ids: list[int] | None = None,
        files: list[dict[str, Any]] | None = None,
    ) -> list[RagDocument]:
        attachments = self.file_retriever._documents_from_files(files)
        if not knowledge_base_ids:
            if attachments:
                return attachments
            return await self.file_retriever.retrieve(
                query=query,
                user_id=user_id,
                scope_id=scope_id,
                session_id=session_id,
                files=files,
            )

        results = await self.knowledge_search.search(
            query=query,
            knowledge_base_ids=knowledge_base_ids,
        )
        documents = attachments
        for result in results:
            metadata = dict(result.metadata)
            if self.mode == "vector" and result.distance is not None:
                metadata["distance"] = result.distance
            elif self.mode == "bm25" and result.score is not None:
                metadata["bm25_score"] = result.score
            documents.append(RagDocument(content=result.content, metadata=metadata))
        return documents
