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

    def test_models_declared_for_plugin_table_creation(self, monkeypatch):
        """插件清单必须声明包含所有 AI ORM 模型的模块。"""
        from app.core.plugins import load_enabled_plugin_models

        monkeypatch.setenv("AI_ENABLE", "true")
        table_names = {model.__tablename__ for model in load_enabled_plugin_models()}
        assert "ai_chunk_usage" in table_names
        assert "ai_chunk_quality_stats" in table_names


class TestChunkTrackingIntegration:
    """在真实（SQLite）数据库上跑通追踪全流程，验证跨库 SQL 兼容性"""

    @pytest.mark.asyncio
    async def test_track_mark_and_update_stats(self, _api_client):
        """track_retrieval → mark_cited → update_stats 全链路"""
        from app.core.database import async_db_session
        from app.plugin.module_ai.chat.chunk_tracker import ChunkQualityStats, ChunkUsageTracker

        chunks = [
            {"chunk_id": 9001, "document_id": 1, "knowledge_base_id": 1, "score": 0.9},
            {"chunk_id": 9002, "document_id": 1, "knowledge_base_id": 1, "score": 0.7},
        ]

        async with async_db_session() as db:
            usage_ids = await ChunkUsageTracker.track_retrieval(
                session=db,
                chunks=chunks,
                query="劳动法相关规定",
                retrieval_method="vector",
                session_id="sess-test",
                user_id="user-test",
            )
            assert len(usage_ids) == 2

            marked = await ChunkUsageTracker.mark_cited(
                session=db,
                usage_ids=usage_ids,
                cited_chunk_ids=[9001],
            )
            assert marked == 1

            ok = await ChunkUsageTracker.update_stats(session=db, chunk_id=9001)
            assert ok is True

            from sqlalchemy import select

            stat = (await db.execute(select(ChunkQualityStats).where(ChunkQualityStats.chunk_id == 9001))).scalar_one()
            assert stat.retrieval_count == 1
            assert stat.citation_count == 1
            assert stat.citation_rate == 1.0

            # 再次调用 update_stats 应走 upsert 更新分支，不报错
            ok2 = await ChunkUsageTracker.update_stats(session=db, chunk_id=9001)
            assert ok2 is True
            await db.commit()


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
