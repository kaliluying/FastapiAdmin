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
