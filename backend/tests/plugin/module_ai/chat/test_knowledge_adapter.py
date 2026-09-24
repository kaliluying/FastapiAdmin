from app.plugin.module_ai.chat.hybrid_retriever import KnowledgeBaseChatRetriever
from app.plugin.module_ai.knowledge.public import KnowledgeSearchResult


async def test_chat_adapter_converts_knowledge_hits_to_rag_documents():
    class KnowledgeSearchFake:
        async def search(self, *, query, knowledge_base_ids, top_k=None):
            assert query == "第123条"
            assert knowledge_base_ids == [4]
            assert top_k is None
            return [KnowledgeSearchResult(
                chunk_id="chunk-1",
                content="第123条的知识库内容",
                metadata={
                    "knowledge_base_id": 4,
                    "document_id": 9,
                    "chunk_index": 2,
                    "file_name": "law.md",
                },
                score=8.5,
            )]

    retriever = KnowledgeBaseChatRetriever(
        mode="bm25",
        knowledge_search=KnowledgeSearchFake(),
        top_k=5,
        candidate_multiplier=4,
        auto_adjust_alpha=False,
    )
    documents = await retriever.retrieve(
        query="第123条",
        user_id="user-1",
        scope_id="user-1",
        session_id=None,
        knowledge_base_ids=[4],
    )

    assert len(documents) == 1
    assert documents[0].content == "第123条的知识库内容"
    assert documents[0].metadata == {
        "knowledge_base_id": 4,
        "document_id": 9,
        "chunk_index": 2,
        "file_name": "law.md",
        "bm25_score": 8.5,
    }


async def test_chat_adapter_keeps_ephemeral_file_fallback_outside_knowledge_search():
    class UnexpectedKnowledgeSearch:
        async def search(self, **_kwargs):
            raise AssertionError("empty knowledge-base selection must not call persistent search")

    retriever = KnowledgeBaseChatRetriever(mode="bm25", knowledge_search=UnexpectedKnowledgeSearch())
    documents = await retriever.retrieve(
        query="临时文件独特标记",
        user_id="user-1",
        scope_id="user-1",
        session_id=None,
        files=[{"name": "temporary.md", "content": "包含临时文件独特标记的内容"}],
    )

    assert documents
    assert documents[0].metadata == {"source": "uploaded-file", "name": "temporary.md"}
