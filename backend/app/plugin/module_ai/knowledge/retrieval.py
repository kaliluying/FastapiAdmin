"""Knowledge-base retrieval strategies and their storage adapters."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from typing import Any, Literal

from app.core.logger import logger

from .bm25_index import BM25KnowledgeIndex, get_cached_bm25_index
from .chroma_store import ChromaKnowledgeStore, get_cached_chroma_store
from .embedding import EmbeddingClient, get_cached_embedding_client
from .query_analyzer import QueryAnalyzer

RetrievalMode = Literal["vector", "bm25", "hybrid"]


@dataclass(slots=True)
class KnowledgeSearchResult:
    chunk_id: str
    content: str
    metadata: dict[str, Any] = field(default_factory=dict)
    distance: float | None = None
    score: float | None = None


class KnowledgeRetriever:
    """Search authorized knowledge-base IDs without exposing store internals."""

    def __init__(
        self,
        *,
        mode: RetrievalMode = "hybrid",
        chroma_store: ChromaKnowledgeStore | None = None,
        bm25_index: BM25KnowledgeIndex | None = None,
        embedding_client: EmbeddingClient | None = None,
        alpha: float = 0.5,
        top_k: int = 5,
        candidate_multiplier: int = 4,
        auto_adjust_alpha: bool = True,
    ) -> None:
        if mode not in {"vector", "bm25", "hybrid"}:
            raise ValueError(f"unsupported retrieval mode: {mode}")
        self.mode = mode
        self.chroma_store = chroma_store
        self.bm25_index = bm25_index
        self.embedding_client = embedding_client
        self.base_alpha = alpha
        self.top_k = top_k
        self.candidate_multiplier = candidate_multiplier
        self.auto_adjust_alpha = auto_adjust_alpha and mode == "hybrid"
        self.query_analyzer = QueryAnalyzer() if self.auto_adjust_alpha else None

    async def search(
        self,
        *,
        query: str,
        knowledge_base_ids: list[int],
        top_k: int | None = None,
    ) -> list[KnowledgeSearchResult]:
        ids = list(dict.fromkeys(knowledge_base_ids))
        if not ids:
            return []

        limit = self.top_k if top_k is None else top_k
        if self.mode == "vector":
            return await self._vector_results(query, ids, limit)
        if self.mode == "bm25":
            return await self._bm25_results(query, ids, limit)
        return await self._hybrid_results(query, ids, limit)

    async def _vector_results(
        self,
        query: str,
        knowledge_base_ids: list[int],
        top_k: int,
    ) -> list[KnowledgeSearchResult]:
        embeddings = await self._get_embedding_client().embed_texts([query])
        raw = await self._get_chroma_store().query(
            query_embedding=embeddings[0],
            knowledge_base_ids=knowledge_base_ids,
            top_k=top_k,
        )
        return self._build_vector_results(raw)

    async def _bm25_results(
        self,
        query: str,
        knowledge_base_ids: list[int],
        top_k: int,
    ) -> list[KnowledgeSearchResult]:
        raw = await self._get_bm25_index().search(
            query=query,
            knowledge_base_ids=knowledge_base_ids,
            top_k=top_k,
        )
        return [
            KnowledgeSearchResult(
                chunk_id=str(item["chunk_id"]),
                content=item["content"],
                metadata={
                    "knowledge_base_id": item["knowledge_base_id"],
                    "document_id": item["document_id"],
                    "chunk_index": item.get("chunk_index", 0),
                    "file_name": item.get("file_name", ""),
                },
                score=item["score"],
            )
            for item in raw
        ]

    async def _hybrid_results(
        self,
        query: str,
        knowledge_base_ids: list[int],
        top_k: int,
    ) -> list[KnowledgeSearchResult]:
        candidate_top_k = top_k * self.candidate_multiplier
        alpha = self._get_dynamic_alpha(query)
        vector_results: dict[str, Any] = {"ids": [[]], "documents": [[]], "metadatas": [[]], "distances": [[]]}
        bm25_results: list[dict[str, Any]] = []
        searches = []
        if alpha > 0:
            searches.append(("vector", self._vector_search(query, knowledge_base_ids, candidate_top_k)))
        if alpha < 1:
            searches.append(("bm25", self._bm25_search(query, knowledge_base_ids, candidate_top_k)))

        gathered = await asyncio.gather(*(task for _, task in searches))
        for (search_type, _), result in zip(searches, gathered, strict=True):
            if search_type == "vector":
                vector_results = result
            else:
                bm25_results = result

        fused_ids = self._rrf_fusion(vector_results, bm25_results, top_k, alpha)
        return self._build_results(fused_ids, vector_results, bm25_results)

    def _get_dynamic_alpha(self, query: str) -> float:
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
        try:
            embeddings = await self._get_embedding_client().embed_texts([query])
            raw = await self._get_chroma_store().query(
                query_embedding=embeddings[0],
                knowledge_base_ids=knowledge_base_ids,
                top_k=top_k,
            )
            logger.debug(f"向量检索召回: {len((raw.get('ids') or [[]])[0])} 个结果")
            return raw
        except Exception as exc:
            logger.warning(f"向量检索失败，返回空结果: {exc}")
            return {"ids": [[]], "documents": [[]], "metadatas": [[]], "distances": [[]]}

    async def _bm25_search(
        self,
        query: str,
        knowledge_base_ids: list[int],
        top_k: int,
    ) -> list[dict[str, Any]]:
        try:
            results = await self._get_bm25_index().search(
                query=query,
                knowledge_base_ids=knowledge_base_ids,
                top_k=top_k,
            )
            logger.debug(f"BM25检索召回: {len(results)} 个结果")
            return results
        except Exception as exc:
            logger.warning(f"BM25检索失败，返回空结果: {exc}")
            return []

    @staticmethod
    def _rrf_fusion(
        vector_results: dict[str, Any],
        bm25_results: list[dict[str, Any]],
        top_k: int,
        alpha: float,
    ) -> list[str]:
        scores: dict[str, float] = {}
        vector_ids = (vector_results.get("ids") or [[]])[0]
        for rank, chunk_id in enumerate(vector_ids):
            scores[chunk_id] = scores.get(chunk_id, 0.0) + alpha / (60 + rank + 1)
        for rank, result in enumerate(bm25_results):
            chunk_id = result["chunk_id"]
            scores[chunk_id] = scores.get(chunk_id, 0.0) + (1.0 - alpha) / (60 + rank + 1)

        sorted_chunks = sorted(scores.items(), key=lambda item: item[1], reverse=True)
        fused_ids = [chunk_id for chunk_id, _ in sorted_chunks[:top_k]]
        logger.debug(
            f"RRF融合: 向量={len(vector_ids)} BM25={len(bm25_results)} "
            f"去重后={len(scores)} 最终={len(fused_ids)} alpha={alpha:.2f}"
        )
        return fused_ids

    @classmethod
    def _build_vector_results(cls, raw: dict[str, Any]) -> list[KnowledgeSearchResult]:
        ids = (raw.get("ids") or [[]])[0] or []
        documents = (raw.get("documents") or [[]])[0] or []
        metadatas = (raw.get("metadatas") or [[]])[0] or []
        distances = (raw.get("distances") or [[]])[0] or []
        results = []
        for index, content in enumerate(documents):
            results.append(
                KnowledgeSearchResult(
                    chunk_id=str(ids[index]) if index < len(ids) else "",
                    content=str(content),
                    metadata=dict(metadatas[index] or {}) if index < len(metadatas) else {},
                    distance=distances[index] if index < len(distances) else None,
                )
            )
        return results

    @classmethod
    def _build_results(
        cls,
        fused_chunk_ids: list[str],
        vector_results: dict[str, Any],
        bm25_results: list[dict[str, Any]],
    ) -> list[KnowledgeSearchResult]:
        vector_map: dict[str, tuple[str, dict[str, Any], float | None]] = {}
        vector_ids = (vector_results.get("ids") or [[]])[0]
        vector_docs = (vector_results.get("documents") or [[]])[0]
        vector_metas = (vector_results.get("metadatas") or [[]])[0]
        vector_distances = (vector_results.get("distances") or [[]])[0]

        for index, chunk_id in enumerate(vector_ids):
            content = vector_docs[index] if index < len(vector_docs) else ""
            metadata = dict(vector_metas[index]) if index < len(vector_metas) and vector_metas[index] else {}
            distance = vector_distances[index] if index < len(vector_distances) else None
            if distance is not None:
                metadata["vector_distance"] = distance
            vector_map[str(chunk_id)] = (content, metadata, distance)

        bm25_map: dict[str, tuple[str, dict[str, Any], float | None]] = {}
        for result in bm25_results:
            chunk_id = str(result["chunk_id"])
            score = result["score"]
            metadata = {
                "knowledge_base_id": result["knowledge_base_id"],
                "document_id": result["document_id"],
                "chunk_index": result.get("chunk_index", 0),
                "file_name": result.get("file_name", ""),
                "bm25_score": score,
            }
            bm25_map[chunk_id] = (result["content"], metadata, score)

        documents = []
        for chunk_id in fused_chunk_ids:
            vector = vector_map.get(chunk_id)
            bm25 = bm25_map.get(chunk_id)
            if vector:
                content, metadata, distance = vector
                metadata = dict(metadata)
                if bm25:
                    metadata["bm25_score"] = bm25[2]
                documents.append(
                    KnowledgeSearchResult(
                        chunk_id=chunk_id,
                        content=content,
                        metadata=metadata,
                        distance=distance,
                        score=bm25[2] if bm25 else None,
                    )
                )
            elif bm25:
                content, metadata, score = bm25
                documents.append(
                    KnowledgeSearchResult(
                        chunk_id=chunk_id,
                        content=content,
                        metadata=metadata,
                        score=score,
                    )
                )
        return documents

    def _get_chroma_store(self) -> ChromaKnowledgeStore:
        if self.chroma_store is None:
            self.chroma_store = get_cached_chroma_store()
        return self.chroma_store

    def _get_bm25_index(self) -> BM25KnowledgeIndex:
        if self.bm25_index is None:
            self.bm25_index = get_cached_bm25_index()
        return self.bm25_index

    def _get_embedding_client(self) -> EmbeddingClient:
        if self.embedding_client is None:
            self.embedding_client = get_cached_embedding_client()
        return self.embedding_client
