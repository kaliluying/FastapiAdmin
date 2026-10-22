from __future__ import annotations

from functools import lru_cache
from threading import Lock
from typing import Any

import anyio

from app.plugin.module_ai.config import settings

_store_lock = Lock()


class ChromaKnowledgeStore:
    """本地 ChromaDB 集合操作的轻量适配器。"""

    def __init__(
        self,
        *,
        persist_dir: str | None = None,
        collection_name: str | None = None,
    ) -> None:
        try:
            import chromadb
        except ImportError as exc:
            raise RuntimeError("chromadb is required for knowledge-base vector search") from exc

        self.persist_dir = persist_dir or settings.CHROMA_PERSIST_DIR
        self.collection_name = collection_name or settings.CHROMA_COLLECTION_NAME
        self.client = chromadb.PersistentClient(path=self.persist_dir)
        self.collection = self.client.get_or_create_collection(name=self.collection_name)

    @staticmethod
    def build_where_filter(knowledge_base_ids: list[int] | None) -> dict[str, Any] | None:
        if not knowledge_base_ids:
            return None
        if len(knowledge_base_ids) == 1:
            return {"knowledge_base_id": knowledge_base_ids[0]}
        return {"knowledge_base_id": {"$in": knowledge_base_ids}}

    async def upsert_chunks(
        self,
        *,
        ids: list[str],
        embeddings: list[list[float]],
        documents: list[str],
        metadatas: list[dict[str, Any]],
    ) -> None:
        await anyio.to_thread.run_sync(lambda: self.collection.upsert(ids=ids, embeddings=embeddings, documents=documents, metadatas=metadatas))

    async def query(self, *, query_embedding: list[float], knowledge_base_ids: list[int], top_k: int = 5) -> dict[str, Any]:
        return await anyio.to_thread.run_sync(
            lambda: self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                where=self.build_where_filter(knowledge_base_ids),
                include=["documents", "metadatas", "distances"],
            )
        )

    async def get_by_ids(self, ids: list[str]) -> dict[str, Any]:
        if not ids:
            return {"ids": [], "documents": [], "metadatas": []}
        return await anyio.to_thread.run_sync(lambda: self.collection.get(ids=ids, include=["documents", "metadatas"]))

    async def delete_document(self, document_id: int) -> None:
        await anyio.to_thread.run_sync(lambda: self.collection.delete(where={"document_id": document_id}))

    async def delete_chunks(self, ids: list[str]) -> None:
        """仅删除指定代际的分块；空列表不执行操作。"""
        if ids:
            await anyio.to_thread.run_sync(lambda: self.collection.delete(ids=ids))


@lru_cache(maxsize=4)
def _cached_chroma_store(
    persist_dir: str | None = None,
    collection_name: str | None = None,
) -> ChromaKnowledgeStore:
    """每种本地集合配置复用一个 Chroma 客户端。"""
    return ChromaKnowledgeStore(persist_dir=persist_dir, collection_name=collection_name)


def get_cached_chroma_store(
    persist_dir: str | None = None,
    collection_name: str | None = None,
) -> ChromaKnowledgeStore:
    with _store_lock:
        return _cached_chroma_store(persist_dir, collection_name)
