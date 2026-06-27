from app.plugin.module_ai.knowledge.model import KnowledgeBaseModel, KnowledgeChunkModel, KnowledgeDocumentModel


def test_knowledge_model_table_names():
    assert KnowledgeBaseModel.__tablename__ == "ai_knowledge_base"
    assert KnowledgeDocumentModel.__tablename__ == "ai_knowledge_document"
    assert KnowledgeChunkModel.__tablename__ == "ai_knowledge_chunk"
