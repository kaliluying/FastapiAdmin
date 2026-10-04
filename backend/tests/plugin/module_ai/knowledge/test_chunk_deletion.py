from types import SimpleNamespace
from unittest.mock import Mock

import pytest

from app.plugin.module_ai.knowledge.bm25_index import BM25KnowledgeIndex
from app.plugin.module_ai.knowledge.chroma_store import ChromaKnowledgeStore


@pytest.mark.parametrize("backend", ["chroma", "bm25"])
async def test_delete_chunks_preserves_other_generations_and_documents(backend, tmp_path, monkeypatch):
    ids = ["old-generation", "current-generation", "other-document"]
    if backend == "chroma":
        monkeypatch.setenv("ANONYMIZED_TELEMETRY", "False")
        store = ChromaKnowledgeStore(persist_dir=str(tmp_path / "chroma"))
        await store.upsert_chunks(
            ids=ids, embeddings=[[0.5, 0.5]] * 3, documents=["共同标记"] * 3,
            metadatas=[{"knowledge_base_id": 1, "document_id": document_id} for document_id in [1, 1, 2]],
        )

        async def remaining_ids():
            return set((await store.get_by_ids(ids))["ids"])
    else:
        store = BM25KnowledgeIndex(index_dir=str(tmp_path / "bm25"), tokenizer="char")
        await store.add_chunks([
            {"id": chunk_id, "content": "共同标记", "knowledge_base_id": 1, "document_id": document_id}
            for chunk_id, document_id in zip(ids, [1, 1, 2], strict=True)
        ])

        async def remaining_ids():
            return {hit["chunk_id"] for hit in await store.search(query="共同标记", knowledge_base_ids=[1])}

    await store.delete_chunks([])
    assert await remaining_ids() == set(ids)
    await store.delete_chunks(["old-generation"])
    await store.delete_chunks(["old-generation", "missing-generation"])
    assert await remaining_ids() == {"current-generation", "other-document"}


async def test_bm25_delete_failure_cancels_writer_and_propagates(monkeypatch, tmp_path):
    store = BM25KnowledgeIndex(index_dir=str(tmp_path), tokenizer="char")
    writer = Mock()
    writer.commit.side_effect = RuntimeError("write failed")
    monkeypatch.setattr(store, "_get_index", lambda: SimpleNamespace(writer=lambda: writer))

    with pytest.raises(RuntimeError, match="write failed"):
        await store.delete_chunks(["old-generation"])
    writer.cancel.assert_called_once()


async def test_empty_chunk_deletion_does_not_open_storage(monkeypatch, tmp_path):
    bm25 = BM25KnowledgeIndex(index_dir=str(tmp_path), tokenizer="char")
    open_index = Mock(side_effect=AssertionError("empty deletion must not open storage"))
    monkeypatch.setattr(bm25, "_get_index", open_index)
    chroma = ChromaKnowledgeStore.__new__(ChromaKnowledgeStore)
    await bm25.delete_chunks([])
    await chroma.delete_chunks([])
    open_index.assert_not_called()
