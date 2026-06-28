from app.plugin.module_ai.knowledge.schema import KnowledgeBaseOutSchema
from app.plugin.module_ai.knowledge.service import build_chroma_metadata


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
        owner_dept_id=None,
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
