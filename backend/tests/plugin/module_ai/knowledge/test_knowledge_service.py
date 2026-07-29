from types import SimpleNamespace

import pytest

from app.core.base_schema import AuthSchema
from app.plugin.module_ai.knowledge.schema import KnowledgeBaseOutSchema, RetrievalTestSchema
from app.plugin.module_ai.knowledge.service import KnowledgeService, build_chroma_metadata


def test_build_chroma_metadata_contains_required_filters():
    metadata = build_chroma_metadata(
        knowledge_base_id=3,
        document_id=9,
        chunk_index=2,
        file_name="handbook.md",
    )
    assert metadata == {
        "knowledge_base_id": 3,
        "document_id": 9,
        "chunk_index": 2,
        "file_name": "handbook.md",
    }


def test_knowledge_base_output_exposes_index_status_counts():
    data = KnowledgeBaseOutSchema(
        id=1,
        name="产品资料",
        description=None,
        is_enabled=True,
        document_count=4,
        indexed_document_count=2,
        indexing_document_count=1,
        failed_document_count=1,
    )

    assert data.model_dump(include={"document_count", "indexed_document_count", "indexing_document_count", "failed_document_count"}) == {
        "document_count": 4,
        "indexed_document_count": 2,
        "indexing_document_count": 1,
        "failed_document_count": 1,
    }


@pytest.mark.asyncio
async def test_bm25_indexing_skips_vector_dependencies_and_uses_chroma_ids(monkeypatch):
    """Verify BM25-only indexing avoids embeddings and retains shared chunk IDs."""
    from app.plugin.module_ai.knowledge import service as service_module

    document = SimpleNamespace(
        id=9,
        knowledge_base_id=7,
        file_name="handbook.md",
        file_path="/tmp/handbook.md",
        file_type="md",
        file_size=12,
        parse_status="pending",
        index_status="pending",
        error_message=None,
    )

    class DocumentCrud:
        async def get_or_404(self, **_kwargs):
            return document

        async def update_status(self, _document_id, **kwargs):
            for field in ("parse_status", "index_status", "error_message", "parsed_at", "indexed_at"):
                if field in kwargs:
                    setattr(document, field, kwargs[field])
            return document

    class ChunkCrud:
        def __init__(self):
            self.chroma_ids = []

        async def replace_chunks(self, *, knowledge_base_id, document_id, chunks, chroma_ids):
            self.chroma_ids = chroma_ids
            return [
                SimpleNamespace(
                    chroma_id=chroma_id,
                    content=content,
                    knowledge_base_id=knowledge_base_id,
                    document_id=document_id,
                    chunk_index=index,
                )
                for index, (content, chroma_id) in enumerate(zip(chunks, chroma_ids, strict=True))
            ]

    class VectorDependency:
        async def embed_texts(self, _texts):
            raise AssertionError("BM25-only indexing must not create embeddings")

        async def delete_document(self, _document_id):
            raise AssertionError("BM25-only indexing must not access Chroma")

        async def upsert_chunks(self, **_kwargs):
            raise AssertionError("BM25-only indexing must not access Chroma")

    class Bm25Index:
        def __init__(self):
            self.operations = []

        async def delete_by_document(self, document_id):
            self.operations.append(("delete", document_id))

        async def add_chunks(self, chunks):
            self.operations.append(("add", chunks))

    document_crud = DocumentCrud()
    chunk_crud = ChunkCrud()
    bm25_index = Bm25Index()

    async def extract_document_text(_file_path):
        return "第一段\n第二段"

    monkeypatch.setattr(service_module, "KnowledgeDocumentCRUD", lambda _auth: document_crud)
    monkeypatch.setattr(service_module, "KnowledgeChunkCRUD", lambda _auth: chunk_crud)
    monkeypatch.setattr(service_module, "extract_text", extract_document_text)
    monkeypatch.setattr(service_module, "split_legal_text", lambda _text: [])
    monkeypatch.setattr(service_module, "split_text_fallback", lambda _text: ["第一段", "第二段"])
    monkeypatch.setattr(service_module.settings, "RETRIEVAL_MODE", "bm25")

    result = await KnowledgeService(
        AuthSchema(),
        store=VectorDependency(),
        embedding_client=VectorDependency(),
        bm25_index=bm25_index,
    ).index_document(document.id)

    assert result.id == document.id
    assert bm25_index.operations[0] == ("delete", document.id)
    assert [chunk["id"] for chunk in bm25_index.operations[1][1]] == chunk_crud.chroma_ids


@pytest.mark.asyncio
async def test_bm25_retrieval_test_skips_vector_dependencies(monkeypatch):
    """Verify the retrieval test endpoint uses the configured BM25 index directly."""
    from app.plugin.module_ai.knowledge import service as service_module

    class VectorDependency:
        async def embed_texts(self, _texts):
            raise AssertionError("BM25-only querying must not create embeddings")

    class Bm25Index:
        async def search(self, **_kwargs):
            return [
                {
                    "chunk_id": "kb-1-doc-2-0",
                    "content": "考勤制度规定",
                    "score": 8.5,
                    "knowledge_base_id": 1,
                    "document_id": 2,
                    "chunk_index": 0,
                    "file_name": "attendance.md",
                }
            ]

    monkeypatch.setattr(service_module.settings, "RETRIEVAL_MODE", "bm25")
    result = await KnowledgeService(
        AuthSchema(),
        store=VectorDependency(),
        embedding_client=VectorDependency(),
        bm25_index=Bm25Index(),
    ).query_retrieval(RetrievalTestSchema(query="考勤制度", knowledge_base_ids=[1]))

    assert result == {
        "query": "考勤制度",
        "retrieval_mode": "bm25",
        "results": [
            {
                "content": "考勤制度规定",
                "metadata": {
                    "knowledge_base_id": 1,
                    "document_id": 2,
                    "chunk_index": 0,
                    "file_name": "attendance.md",
                },
                "score": 8.5,
            }
        ],
    }
