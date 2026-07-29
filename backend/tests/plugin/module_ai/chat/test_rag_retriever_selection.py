from app.plugin.module_ai.chat.schema import AiChatRequestSchema, ChatQuerySchema


def test_chat_query_accepts_knowledge_base_ids():
    query = ChatQuerySchema(message="制度是什么", knowledge_base_ids=[1, 2])
    assert query.knowledge_base_ids == [1, 2]


def test_non_stream_chat_accepts_knowledge_base_ids():
    query = AiChatRequestSchema(message="制度是什么", knowledge_base_ids=[3])
    assert query.knowledge_base_ids == [3]


def test_bm25_mode_keeps_query_weight_fixed(monkeypatch):
    """纯BM25模式不能被查询类型分析重新切换到向量检索。"""
    from app.plugin.module_ai.chat import rag

    monkeypatch.setattr(rag.settings, "RETRIEVAL_MODE", "bm25")
    monkeypatch.setattr(rag, "LangChainChatModel", lambda: object())

    chain = rag.create_rag_chain()

    assert chain.retriever.base_alpha == 0.0
    assert chain.retriever.auto_adjust_alpha is False
