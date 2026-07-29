"""混合检索器：向量检索 + BM25关键词检索

使用RRF (Reciprocal Rank Fusion) 融合两路召回结果。
"""

from __future__ import annotations

from typing import Any

from app.core.logger import logger
from app.plugin.module_ai.knowledge.bm25_index import BM25KnowledgeIndex
from app.plugin.module_ai.knowledge.chroma_store import ChromaKnowledgeStore
from app.plugin.module_ai.knowledge.embedding import EmbeddingClient, create_embedding_client

from .query_analyzer import QueryAnalyzer
from .rag import KeywordKnowledgeRetriever, RagDocument


class HybridKnowledgeRetriever:
    """混合检索器：向量 + BM25

    工作流程：
    1. 向量检索：ChromaDB cosine similarity → top_k*4 候选
    2. BM25检索：Whoosh关键词匹配 → top_k*4 候选
    3. RRF融合：Reciprocal Rank Fusion → top_k 最终结果

    优势：
    - 向量检索：语义相似（"违约赔偿" → "合同解除条款"）
    - BM25检索：精确匹配（"第123条"、专有名词、ID）
    - RRF融合：平衡两者权重，提升召回率和准确率
    """

    def __init__(
        self,
        *,
        chroma_store: ChromaKnowledgeStore | None = None,
        bm25_index: BM25KnowledgeIndex | None = None,
        embedding_client: EmbeddingClient | None = None,
        alpha: float = 0.5,
        top_k: int = 5,
        candidate_multiplier: int = 4,
        auto_adjust_alpha: bool = True,
    ) -> None:
        """初始化混合检索器

        Args:
            chroma_store: 向量存储
            bm25_index: BM25索引
            embedding_client: 向量化客户端
            alpha: 向量检索权重（0-1），1-alpha为BM25权重。默认0.5表示各占50%
            top_k: 最终返回结果数
            candidate_multiplier: 粗召回倍数，top_k * candidate_multiplier = 候选数
            auto_adjust_alpha: 是否自动根据查询类型调整alpha
        """
        self.chroma_store = chroma_store
        self.bm25_index = bm25_index
        self.embedding_client = embedding_client
        self.base_alpha = alpha  # 保存基础alpha
        self.top_k = top_k
        self.candidate_multiplier = candidate_multiplier
        self.auto_adjust_alpha = auto_adjust_alpha
        self.file_retriever = KeywordKnowledgeRetriever(documents=[], top_k=top_k)
        self.query_analyzer = QueryAnalyzer() if auto_adjust_alpha else None

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
        """混合检索入口

        Args:
            query: 用户查询
            user_id: 用户ID
            scope_id: 数据范围标识
            session_id: 会话ID
            knowledge_base_ids: 知识库ID列表
            files: 临时上传文件

        Returns:
            RagDocument列表
        """
        # 降级场景：没有知识库时使用简单关键词检索
        if not knowledge_base_ids:
            return await self.file_retriever.retrieve(
                query=query,
                user_id=user_id,
                scope_id=scope_id,
                session_id=session_id,
                files=files,
            )

        # 混合检索
        candidate_top_k = self.top_k * self.candidate_multiplier

        # 动态调整alpha
        alpha = self._get_dynamic_alpha(query)

        vector_results = {"ids": [[]], "documents": [[]], "metadatas": [[]], "distances": [[]]}
        bm25_results: list[dict[str, Any]] = []
        if alpha > 0:
            vector_results = await self._vector_search(query, knowledge_base_ids, candidate_top_k)
        if alpha < 1:
            bm25_results = await self._bm25_search(query, knowledge_base_ids, candidate_top_k)

        # 3. RRF融合
        fused_chunk_ids = self._rrf_fusion(vector_results, bm25_results, self.top_k, alpha)

        # 4. 根据融合后的chunk_id顺序重建RagDocument
        return await self._build_documents(fused_chunk_ids, vector_results, bm25_results)

    def _get_dynamic_alpha(self, query: str) -> float:
        """根据查询类型动态调整alpha

        Args:
            query: 用户查询

        Returns:
            调整后的alpha值
        """
        if not self.auto_adjust_alpha or not self.query_analyzer:
            return self.base_alpha

        adjusted_alpha = self.query_analyzer.adjust_alpha(self.base_alpha, query)

        if adjusted_alpha != self.base_alpha:
            analysis = self.query_analyzer.analyze(query)
            logger.info(
                f"查询类型识别: {analysis.query_type} "
                f"(置信度={analysis.confidence:.2f}), "
                f"alpha调整: {self.base_alpha:.2f} → {adjusted_alpha:.2f}"
            )

        return adjusted_alpha

    async def _vector_search(
        self,
        query: str,
        knowledge_base_ids: list[int],
        top_k: int,
    ) -> dict[str, Any]:
        """向量检索"""
        try:
            embeddings = await self._get_embedding_client().embed_texts([query])
            raw = await self._get_chroma_store().query(
                query_embedding=embeddings[0],
                knowledge_base_ids=knowledge_base_ids,
                top_k=top_k,
            )
            logger.debug(f"向量检索召回: {len((raw.get('ids') or [[]])[0])} 个结果")
            return raw
        except Exception as e:
            logger.warning(f"向量检索失败，返回空结果: {e}")
            return {"ids": [[]], "documents": [[]], "metadatas": [[]], "distances": [[]]}

    async def _bm25_search(
        self,
        query: str,
        knowledge_base_ids: list[int],
        top_k: int,
    ) -> list[dict[str, Any]]:
        """BM25关键词检索"""
        try:
            results = await self._get_bm25_index().search(
                query=query,
                knowledge_base_ids=knowledge_base_ids,
                top_k=top_k,
            )
            logger.debug(f"BM25检索召回: {len(results)} 个结果")
            return results
        except Exception as e:
            logger.warning(f"BM25检索失败，返回空结果: {e}")
            return []

    def _rrf_fusion(
        self,
        vector_results: dict[str, Any],
        bm25_results: list[dict[str, Any]],
        top_k: int,
        alpha: float,
    ) -> list[str]:
        """RRF (Reciprocal Rank Fusion) 融合算法

        公式: score(doc) = alpha * (1 / (k + rank_vector)) + (1-alpha) * (1 / (k + rank_bm25))

        Args:
            vector_results: 向量检索结果
            bm25_results: BM25检索结果
            top_k: 最终返回数量
            alpha: 向量权重（动态调整后的值）

        Returns:
            融合后的chunk_id列表（按得分降序）
        """
        scores: dict[str, float] = {}
        k = 60  # RRF常数，通常取60

        # 向量结果打分
        vector_ids = (vector_results.get("ids") or [[]])[0]
        for rank, chunk_id in enumerate(vector_ids):
            scores[chunk_id] = scores.get(chunk_id, 0.0) + alpha / (k + rank + 1)

        # BM25结果打分
        for rank, result in enumerate(bm25_results):
            chunk_id = result["chunk_id"]
            scores[chunk_id] = scores.get(chunk_id, 0.0) + (1.0 - alpha) / (k + rank + 1)

        # 排序并返回top_k
        sorted_chunks = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        fused_ids = [chunk_id for chunk_id, _ in sorted_chunks[:top_k]]

        logger.debug(
            f"RRF融合: 向量={len(vector_ids)} BM25={len(bm25_results)} "
            f"去重后={len(scores)} 最终={len(fused_ids)} alpha={alpha:.2f}"
        )

        return fused_ids

    async def _build_documents(
        self,
        fused_chunk_ids: list[str],
        vector_results: dict[str, Any],
        bm25_results: list[dict[str, Any]],
    ) -> list[RagDocument]:
        """根据融合后的chunk_id列表构建RagDocument

        优先从向量结果中获取（包含完整metadata），BM25作为补充
        """
        documents: list[RagDocument] = []

        # 构建向量结果的快速查找字典
        vector_map: dict[str, tuple[str, dict[str, Any]]] = {}
        vector_ids = (vector_results.get("ids") or [[]])[0]
        vector_docs = (vector_results.get("documents") or [[]])[0]
        vector_metas = (vector_results.get("metadatas") or [[]])[0]
        vector_distances = (vector_results.get("distances") or [[]])[0]

        for idx, chunk_id in enumerate(vector_ids):
            content = vector_docs[idx] if idx < len(vector_docs) else ""
            metadata = dict(vector_metas[idx]) if idx < len(vector_metas) and vector_metas[idx] else {}
            if idx < len(vector_distances):
                metadata["vector_distance"] = vector_distances[idx]
            vector_map[chunk_id] = (content, metadata)

        # 构建BM25结果的快速查找字典
        bm25_map: dict[str, tuple[str, dict[str, Any]]] = {}
        for result in bm25_results:
            chunk_id = result["chunk_id"]
            content = result["content"]
            metadata = {
                "knowledge_base_id": result["knowledge_base_id"],
                "document_id": result["document_id"],
                "chunk_index": result.get("chunk_index", 0),
                "file_name": result.get("file_name", ""),
                "bm25_score": result["score"],
            }
            bm25_map[chunk_id] = (content, metadata)

        # 按融合后的顺序构建文档
        for chunk_id in fused_chunk_ids:
            if chunk_id in vector_map:
                content, metadata = vector_map[chunk_id]
                # 如果BM25也有，合并BM25得分
                if chunk_id in bm25_map:
                    metadata["bm25_score"] = bm25_map[chunk_id][1].get("bm25_score")
                documents.append(RagDocument(content=content, metadata=metadata))
            elif chunk_id in bm25_map:
                content, metadata = bm25_map[chunk_id]
                documents.append(RagDocument(content=content, metadata=metadata))

        return documents

    def _get_chroma_store(self) -> ChromaKnowledgeStore:
        """延迟加载ChromaDB存储"""
        if self.chroma_store is None:
            self.chroma_store = ChromaKnowledgeStore()
        return self.chroma_store

    def _get_bm25_index(self) -> BM25KnowledgeIndex:
        """延迟加载BM25索引"""
        if self.bm25_index is None:
            self.bm25_index = BM25KnowledgeIndex()
        return self.bm25_index

    def _get_embedding_client(self) -> EmbeddingClient:
        """延迟加载embedding客户端"""
        if self.embedding_client is None:
            self.embedding_client = create_embedding_client()
        return self.embedding_client
