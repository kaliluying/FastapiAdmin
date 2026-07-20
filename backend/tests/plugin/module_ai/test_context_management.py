"""测试对话记忆优化和引用追踪

测试功能：
1. 实体关系提取
2. 对话总结
3. chunk使用追踪
"""

import pytest

from app.plugin.module_ai.chat.conversation_summarizer import ConversationSummarizer
from app.plugin.module_ai.chat.entity_extractor import EntityRelationExtractor


class TestEntityExtraction:
    """测试实体关系提取"""

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="需要真实OpenAI API key")
    async def test_extract_entities_from_text(self):
        """测试从文本提取实体"""
        extractor = EntityRelationExtractor(confidence_threshold=0.5)

        text = """
        张三是某公司的项目经理，负责劳动法合规项目。
        该项目需要遵守劳动法第123条和GDPR第17条的规定。
        项目截止日期是2026年12月31日。
        """

        result = await extractor.extract(text)

        # 验证提取结果
        assert len(result.entities) > 0, "应该提取到实体"
        assert len(result.summary) > 0, "应该有总结"

        # 检查实体类型
        entity_types = {e.type for e in result.entities}
        assert len(entity_types) > 0, "应该有不同类型的实体"

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="需要真实OpenAI API key")
    async def test_extract_relations(self):
        """测试提取实体关系"""
        extractor = EntityRelationExtractor(confidence_threshold=0.5)

        text = """
        合同条款5.2引用了劳动法第123条。
        该法条属于劳动法第五章。
        """

        result = await extractor.extract(text)

        # 验证关系提取
        if len(result.relations) > 0:
            assert result.relations[0].source is not None
            assert result.relations[0].target is not None
            assert result.relations[0].relation_type is not None


class TestConversationSummarizer:
    """测试对话总结"""

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="需要真实OpenAI API key")
    async def test_summarize_conversation(self):
        """测试对话总结"""
        summarizer = ConversationSummarizer(summary_interval=3)

        conversation = [
            {"role": "user", "content": "你好，我想了解劳动法关于加班的规定"},
            {"role": "assistant", "content": "劳动法规定，加班需要支付不低于平时工资150%的加班费"},
            {"role": "user", "content": "周末加班呢？"},
            {"role": "assistant", "content": "周末加班需要支付200%的加班费"},
            {"role": "user", "content": "谢谢"},
            {"role": "assistant", "content": "不客气，还有其他问题吗？"},
        ]

        result = await summarizer.summarize(conversation)

        # 验证总结结果
        assert len(result.summary) > 0, "应该有总结"
        assert len(result.key_points) > 0, "应该有关键要点"
        assert len(result.topics) > 0, "应该识别出主题"

    def test_should_summarize(self):
        """测试总结触发条件"""
        summarizer = ConversationSummarizer(summary_interval=10)

        assert not summarizer.should_summarize(0)
        assert not summarizer.should_summarize(5)
        assert summarizer.should_summarize(10)
        assert not summarizer.should_summarize(11)
        assert summarizer.should_summarize(20)


class TestChunkTracking:
    """测试chunk追踪（无需数据库的单元测试）"""

    def test_chunk_usage_model_fields(self):
        """测试ChunkUsageModel字段定义"""
        from app.plugin.module_ai.chat.chunk_tracker import ChunkUsageModel

        # 验证模型有必要的字段
        assert hasattr(ChunkUsageModel, "chunk_id")
        assert hasattr(ChunkUsageModel, "document_id")
        assert hasattr(ChunkUsageModel, "knowledge_base_id")
        assert hasattr(ChunkUsageModel, "query")
        assert hasattr(ChunkUsageModel, "retrieval_rank")
        assert hasattr(ChunkUsageModel, "was_cited")
        assert hasattr(ChunkUsageModel, "session_id")

    def test_chunk_quality_stats_fields(self):
        """测试ChunkQualityStats字段定义"""
        from app.plugin.module_ai.chat.chunk_tracker import ChunkQualityStats

        # 验证统计模型字段
        assert hasattr(ChunkQualityStats, "chunk_id")
        assert hasattr(ChunkQualityStats, "retrieval_count")
        assert hasattr(ChunkQualityStats, "citation_count")
        assert hasattr(ChunkQualityStats, "citation_rate")
        assert hasattr(ChunkQualityStats, "quality_score")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
