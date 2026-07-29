"""混合检索测试用例

测试BM25索引、混合检索器、RRF融合算法
"""

import pytest

from app.plugin.module_ai.chat.hybrid_retriever import HybridKnowledgeRetriever
from app.plugin.module_ai.knowledge.bm25_index import BM25KnowledgeIndex


@pytest.mark.asyncio
class TestBM25Index:
    """BM25索引功能测试"""

    async def test_add_and_search(self):
        """测试添加文档和搜索"""
        index = BM25KnowledgeIndex(index_dir="./data/test_bm25")

        # 添加测试数据
        chunks = [
            {
                "id": 1,
                "content": "合同违约责任条款规定，违约方应支付违约金。",
                "knowledge_base_id": 1,
                "document_id": 1,
                "chunk_index": 0,
                "file_name": "contract.pdf",
            },
            {
                "id": 2,
                "content": "劳动法第123条规定了员工加班工资的计算方法。",
                "knowledge_base_id": 1,
                "document_id": 1,
                "chunk_index": 1,
                "file_name": "labor_law.pdf",
            },
            {
                "id": 3,
                "content": "关于GDPR第17条数据删除权的详细说明。",
                "knowledge_base_id": 1,
                "document_id": 2,
                "chunk_index": 0,
                "file_name": "gdpr.pdf",
            },
        ]

        await index.add_chunks(chunks)

        # 测试精确关键词匹配
        results = await index.search("第123条", knowledge_base_ids=[1], top_k=5)
        assert len(results) > 0
        assert any("123条" in r["content"] for r in results)

        # 测试语义查询
        results = await index.search("违约金", knowledge_base_ids=[1], top_k=5)
        assert len(results) > 0
        assert any("违约" in r["content"] for r in results)

        # 清理
        await index.clear_index()

    async def test_delete_document(self):
        """测试删除文档"""
        index = BM25KnowledgeIndex(index_dir="./data/test_bm25_delete")

        chunks = [
            {
                "id": 1,
                "content": "测试文档1",
                "knowledge_base_id": 1,
                "document_id": 100,
                "chunk_index": 0,
                "file_name": "test1.txt",
            },
            {
                "id": 2,
                "content": "测试文档2",
                "knowledge_base_id": 1,
                "document_id": 200,
                "chunk_index": 0,
                "file_name": "test2.txt",
            },
        ]

        await index.add_chunks(chunks)

        # 删除document_id=100
        await index.delete_by_document(100)

        # 搜索应该只返回document_id=200的结果
        results = await index.search("测试", knowledge_base_ids=[1], top_k=5)
        assert all(r["document_id"] == 200 for r in results)

        await index.clear_index()


@pytest.mark.asyncio
class TestHybridRetriever:
    """混合检索器测试"""

    async def test_rrf_fusion(self):
        """测试RRF融合算法"""
        retriever = HybridKnowledgeRetriever(alpha=0.5, top_k=3)

        # 模拟向量检索结果
        vector_results = {
            "ids": [["chunk1", "chunk2", "chunk3", "chunk4"]],
            "documents": [["向量doc1", "向量doc2", "向量doc3", "向量doc4"]],
            "metadatas": [[{"kb": 1}, {"kb": 1}, {"kb": 1}, {"kb": 1}]],
            "distances": [[0.1, 0.2, 0.3, 0.4]],
        }

        # 模拟BM25检索结果
        bm25_results = [
            {"chunk_id": "chunk3", "content": "BM25 doc3", "score": 10.0, "knowledge_base_id": 1, "document_id": 1},
            {"chunk_id": "chunk5", "content": "BM25 doc5", "score": 8.0, "knowledge_base_id": 1, "document_id": 2},
            {"chunk_id": "chunk1", "content": "BM25 doc1", "score": 6.0, "knowledge_base_id": 1, "document_id": 1},
        ]

        # 执行RRF融合（传入alpha参数）
        fused_ids = retriever._rrf_fusion(vector_results, bm25_results, top_k=3, alpha=0.5)

        # chunk1和chunk3同时出现在两路结果，应该得分更高
        assert "chunk1" in fused_ids[:2] or "chunk3" in fused_ids[:2]
        assert len(fused_ids) == 3

    async def test_build_documents(self):
        """测试文档构建"""
        retriever = HybridKnowledgeRetriever()

        vector_results = {
            "ids": [["chunk1", "chunk2"]],
            "documents": [["向量内容1", "向量内容2"]],
            "metadatas": [[{"file": "test1.pdf"}, {"file": "test2.pdf"}]],
            "distances": [[0.1, 0.2]],
        }

        bm25_results = [
            {"chunk_id": "chunk1", "content": "BM25内容1", "score": 10.0, "knowledge_base_id": 1, "document_id": 1},
            {"chunk_id": "chunk3", "content": "BM25内容3", "score": 8.0, "knowledge_base_id": 1, "document_id": 2},
        ]

        fused_ids = ["chunk1", "chunk3", "chunk2"]
        documents = await retriever._build_documents(fused_ids, vector_results, bm25_results)

        assert len(documents) == 3
        # chunk1应该包含向量距离和BM25得分
        assert "vector_distance" in documents[0].metadata
        assert "bm25_score" in documents[0].metadata
        # chunk3只有BM25结果
        assert "bm25_score" in documents[1].metadata


@pytest.mark.asyncio
class TestRetrievalModes:
    """测试不同检索模式"""

    async def test_vector_only_mode(self):
        """测试纯向量检索模式"""
        retriever = HybridKnowledgeRetriever(alpha=1.0, top_k=5)  # alpha=1.0 纯向量
        # 实际测试需要真实数据和索引
        assert retriever.base_alpha == 1.0

    async def test_bm25_only_mode(self):
        """测试纯BM25检索模式"""
        retriever = HybridKnowledgeRetriever(alpha=0.0, top_k=5)  # alpha=0.0 纯BM25
        assert retriever.base_alpha == 0.0

    async def test_hybrid_mode(self):
        """测试混合检索模式"""
        retriever = HybridKnowledgeRetriever(alpha=0.5, top_k=5)  # alpha=0.5 混合
        assert retriever.base_alpha == 0.5

    async def test_bm25_mode_accepts_rag_scope_and_skips_vector_search(self):
        """纯BM25必须兼容RAG协议，且不触发向量化。"""
        class FailingEmbeddingClient:
            async def embed_texts(self, _texts):
                raise AssertionError("pure BM25 retrieval must not create embeddings")

        class Bm25Index:
            async def search(self, **_kwargs):
                return [
                    {
                        "chunk_id": "kb-1-doc-1-0",
                        "content": "第123条规定",
                        "score": 5.0,
                        "knowledge_base_id": 1,
                        "document_id": 1,
                        "chunk_index": 0,
                        "file_name": "law.md",
                    }
                ]

        retriever = HybridKnowledgeRetriever(
            embedding_client=FailingEmbeddingClient(),
            bm25_index=Bm25Index(),
            alpha=0.0,
            auto_adjust_alpha=False,
        )

        documents = await retriever.retrieve(
            query="第123条",
            user_id="user-1",
            scope_id="user-1",
            session_id=None,
            knowledge_base_ids=[1],
        )

        assert [document.content for document in documents] == ["第123条规定"]


@pytest.mark.asyncio
class TestChineseTokenization:
    """测试中文分词"""

    async def test_chinese_search(self):
        """测试中文分词和搜索"""
        index = BM25KnowledgeIndex(index_dir="./data/test_chinese")

        chunks = [
            {
                "id": 1,
                "content": "人工智能技术在医疗领域的应用越来越广泛",
                "knowledge_base_id": 1,
                "document_id": 1,
                "chunk_index": 0,
                "file_name": "ai_medical.txt",
            },
            {
                "id": 2,
                "content": "深度学习模型在图像识别方面取得了突破性进展",
                "knowledge_base_id": 1,
                "document_id": 1,
                "chunk_index": 1,
                "file_name": "deep_learning.txt",
            },
        ]

        await index.add_chunks(chunks)

        # 测试中文查询 - 词组匹配（jieba会将"人工智能"分为完整词）
        results = await index.search("人工智能", knowledge_base_ids=[1], top_k=5)
        assert len(results) > 0
        assert any("人工智能" in r["content"] for r in results)

        # 测试单个词匹配
        results = await index.search("医疗", knowledge_base_ids=[1], top_k=5)
        assert len(results) > 0
        assert any("医疗" in r["content"] for r in results)

        await index.clear_index()


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
