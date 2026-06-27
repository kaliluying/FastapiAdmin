from app.plugin.module_ai.knowledge.chroma_store import ChromaKnowledgeStore


def test_build_metadata_filter_for_one_knowledge_base():
    assert ChromaKnowledgeStore.build_where_filter([3]) == {"knowledge_base_id": 3}


def test_build_metadata_filter_for_multiple_knowledge_bases():
    assert ChromaKnowledgeStore.build_where_filter([1, 2]) == {
        "knowledge_base_id": {"$in": [1, 2]}
    }


def test_build_metadata_filter_without_knowledge_base():
    assert ChromaKnowledgeStore.build_where_filter([]) is None
