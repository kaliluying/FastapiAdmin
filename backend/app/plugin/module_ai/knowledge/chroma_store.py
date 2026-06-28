from __future__ import annotations

from typing import Any

from app.config.setting import settings


class ChromaKnowledgeStore:
    """Thin adapter around local ChromaDB collection operations."""

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

    def upsert_chunks(
        self,
        *,
        ids: list[str],
        embeddings: list[list[float]],
        documents: list[str],
        metadatas: list[dict[str, Any]],
    ) -> None:
        self.collection.upsert(ids=ids, embeddings=embeddings, documents=documents, metadatas=metadatas)

    def query(self, *, query_embedding: list[float], knowledge_base_ids: list[int], top_k: int = 5) -> dict[str, Any]:
        return self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=self.build_where_filter(knowledge_base_ids),
            include=["documents", "metadatas", "distances"],
        )

    def delete_document(self, document_id: int) -> None:
        self.collection.delete(where={"document_id": document_id})
