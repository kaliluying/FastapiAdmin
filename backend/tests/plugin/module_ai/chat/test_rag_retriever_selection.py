from app.plugin.module_ai.chat.schema import AiChatRequestSchema, ChatQuerySchema


def test_chat_query_accepts_knowledge_base_ids():
    query = ChatQuerySchema(message="制度是什么", knowledge_base_ids=[1, 2])
    assert query.knowledge_base_ids == [1, 2]


def test_non_stream_chat_accepts_knowledge_base_ids():
    query = AiChatRequestSchema(message="制度是什么", knowledge_base_ids=[3])
    assert query.knowledge_base_ids == [3]
