"""测试查询分析器和jieba分词

验证短期优化功能：
1. jieba词组分词
2. 查询类型自动识别
3. 动态alpha调整
"""

import pytest

from app.plugin.module_ai.chat.query_analyzer import QueryAnalyzer


class TestQueryAnalyzer:
    """查询分析器测试"""

    def test_exact_query_detection(self):
        """测试精确查询识别"""
        analyzer = QueryAnalyzer()

        # 法条编号
        analysis = analyzer.analyze("第123条")
        assert analysis.query_type == "exact"
        assert analysis.suggested_alpha < 0.5  # BM25权重更高

        # GDPR条款
        analysis = analyzer.analyze("GDPR第17条")
        assert analysis.query_type == "exact"

        # 文档编号
        analysis = analyzer.analyze("文档编号ABC123")
        assert analysis.query_type == "exact"

    def test_semantic_query_detection(self):
        """测试语义查询识别"""
        analyzer = QueryAnalyzer()

        # 自然语言问题
        analysis = analyzer.analyze("如何处理合同违约")
        assert analysis.query_type == "semantic"
        assert analysis.suggested_alpha > 0.5  # 向量权重更高

        # 长句语义查询
        analysis = analyzer.analyze("劳动合同中关于员工加班工资的计算方法是什么")
        assert analysis.query_type == "semantic"

    def test_mixed_query_detection(self):
        """测试混合查询识别"""
        analyzer = QueryAnalyzer()

        # 既有关键词又有语义
        analysis = analyzer.analyze("劳动法关于加班的规定")
        assert analysis.query_type in ("mixed", "semantic")

    def test_alpha_adjustment(self):
        """测试alpha动态调整"""
        analyzer = QueryAnalyzer()

        # 精确查询：建议降低alpha（提高BM25权重）
        alpha_exact = analyzer.adjust_alpha(0.5, "第123条")
        assert alpha_exact < 0.5

        # 语义查询：建议提高alpha（提高向量权重）
        alpha_semantic = analyzer.adjust_alpha(0.5, "如何处理违约")
        assert alpha_semantic > 0.5

    def test_citation_detection(self):
        """测试引用标记识别"""
        analyzer = QueryAnalyzer()

        analysis = analyzer.analyze("《劳动法》第123条")
        assert analysis.query_type == "exact"
        assert "has_citation" in analysis.features


@pytest.mark.asyncio
class TestJiebaTokenizer:
    """jieba分词器测试"""

    async def test_jieba_word_segmentation(self):
        """测试jieba词组分词"""
        try:
            from app.plugin.module_ai.knowledge.jieba_analyzer import create_jieba_analyzer
        except ImportError:
            pytest.skip("jieba未安装")

        analyzer = create_jieba_analyzer()

        # 测试分词结果
        text = "劳动法第123条规定了员工加班工资的计算方法"
        tokens = list(analyzer(text))

        # 验证分词结果包含词组
        token_texts = [t.text for t in tokens]
        assert "劳动法" in token_texts or "劳动" in token_texts
        assert "123" in token_texts
        assert "员工" in token_texts or "加班" in token_texts

    async def test_jieba_vs_char_tokenizer(self):
        """对比jieba和单字分词"""
        from app.plugin.module_ai.knowledge.bm25_index import BM25KnowledgeIndex

        # 使用jieba分词
        index_jieba = BM25KnowledgeIndex(index_dir="./data/test_jieba", tokenizer="jieba")

        # 使用单字分词
        index_char = BM25KnowledgeIndex(index_dir="./data/test_char", tokenizer="char")

        chunks = [
            {
                "id": 1,
                "content": "人工智能技术在医疗领域的应用越来越广泛",
                "knowledge_base_id": 1,
                "document_id": 1,
                "chunk_index": 0,
                "file_name": "ai.txt",
            }
        ]

        # 索引相同内容
        await index_jieba.add_chunks(chunks)
        await index_char.add_chunks(chunks)

        # 查询："人工智能"
        results_jieba = await index_jieba.search("人工智能", knowledge_base_ids=[1], top_k=5)
        results_char = await index_char.search("人工智能", knowledge_base_ids=[1], top_k=5)

        # 两者都应该有结果
        assert len(results_jieba) > 0
        assert len(results_char) > 0

        # 清理
        await index_jieba.clear_index()
        await index_char.clear_index()


@pytest.mark.asyncio
class TestDynamicAlphaRetrieval:
    """测试动态alpha检索"""

    async def test_auto_adjust_enabled(self):
        """测试启用自动调整"""
        from app.plugin.module_ai.chat.hybrid_retriever import HybridKnowledgeRetriever

        retriever = HybridKnowledgeRetriever(
            alpha=0.5,
            auto_adjust_alpha=True,
        )

        # 精确查询应该调整alpha
        alpha_exact = retriever._get_dynamic_alpha("第123条")
        assert alpha_exact != 0.5  # 应该被调整

        # 语义查询应该调整alpha
        alpha_semantic = retriever._get_dynamic_alpha("如何处理违约")
        assert alpha_semantic != 0.5  # 应该被调整

    async def test_auto_adjust_disabled(self):
        """测试禁用自动调整"""
        from app.plugin.module_ai.chat.hybrid_retriever import HybridKnowledgeRetriever

        retriever = HybridKnowledgeRetriever(
            alpha=0.5,
            auto_adjust_alpha=False,
        )

        # 禁用时应该返回基础alpha
        alpha = retriever._get_dynamic_alpha("第123条")
        assert alpha == 0.5

        alpha = retriever._get_dynamic_alpha("如何处理违约")
        assert alpha == 0.5


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
