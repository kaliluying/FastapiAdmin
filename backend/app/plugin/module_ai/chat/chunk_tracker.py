"""引用追踪系统 - 记录chunk使用情况

功能：
1. 追踪哪些chunk被LLM实际引用
2. 统计chunk命中率和质量指标
3. 识别低质量chunk
4. 为优化文档分块策略提供数据支持
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import JSON, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base_model import ModelMixin
from app.core.logger import logger


class ChunkUsageModel(ModelMixin):
    """Chunk使用记录"""

    __tablename__ = "ai_chunk_usage"
    __table_args__ = {"comment": "AI检索chunk使用追踪"}

    chunk_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True, comment="chunk ID")
    document_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True, comment="文档ID")
    knowledge_base_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True, comment="知识库ID")

    # 检索信息
    query: Mapped[str] = mapped_column(Text, nullable=False, comment="用户查询")
    retrieval_rank: Mapped[int] = mapped_column(Integer, nullable=False, comment="检索排名（1-based）")
    retrieval_score: Mapped[float] = mapped_column(Float, nullable=False, comment="检索得分")
    retrieval_method: Mapped[str] = mapped_column(String(32), nullable=False, comment="检索方法: vector/bm25/hybrid")

    # 使用情况
    was_cited: Mapped[bool] = mapped_column(default=False, nullable=False, comment="是否被LLM引用")
    citation_confidence: Mapped[float | None] = mapped_column(Float, nullable=True, comment="引用置信度(0-1)")

    # 用户反馈
    user_feedback: Mapped[str | None] = mapped_column(String(32), nullable=True, comment="用户反馈: helpful/not_helpful")

    # 会话信息
    session_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True, comment="会话ID")
    user_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True, comment="用户ID")

    # 元数据
    extra_data: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False, comment="额外元数据")
    tracked_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, comment="追踪时间")


class ChunkQualityStats(ModelMixin):
    """Chunk质量统计（聚合表）"""

    __tablename__ = "ai_chunk_quality_stats"
    __table_args__ = {"comment": "Chunk质量统计"}

    chunk_id: Mapped[int] = mapped_column(Integer, nullable=False, unique=True, index=True, comment="chunk ID")
    document_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True, comment="文档ID")
    knowledge_base_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True, comment="知识库ID")

    # 检索统计
    retrieval_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False, comment="被检索次数")
    citation_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False, comment="被引用次数")
    avg_retrieval_rank: Mapped[float] = mapped_column(Float, default=0.0, nullable=False, comment="平均检索排名")
    avg_retrieval_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False, comment="平均检索得分")

    # 质量指标
    citation_rate: Mapped[float] = mapped_column(Float, default=0.0, nullable=False, comment="引用率（citation/retrieval）")
    helpful_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False, comment="有帮助反馈数")
    not_helpful_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False, comment="无帮助反馈数")

    # 质量评分（综合指标）
    quality_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False, comment="质量评分(0-100)")

    # 更新时间
    last_updated: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, comment="最后更新时间")


class ChunkUsageTracker:
    """Chunk使用追踪器"""

    @staticmethod
    async def track_retrieval(
        *,
        session,
        chunks: list[dict[str, Any]],
        query: str,
        retrieval_method: str,
        session_id: str,
        user_id: str,
    ) -> list[int]:
        """记录检索结果

        Args:
            session: 数据库会话
            chunks: 检索到的chunks列表
            query: 用户查询
            retrieval_method: 检索方法
            session_id: 会话ID
            user_id: 用户ID

        Returns:
            创建的记录ID列表
        """
        if not chunks:
            return []

        try:
            records = []
            for rank, chunk in enumerate(chunks, 1):
                record = ChunkUsageModel(
                    chunk_id=chunk.get("chunk_id") or chunk.get("id"),
                    document_id=chunk.get("document_id", 0),
                    knowledge_base_id=chunk.get("knowledge_base_id", 0),
                    query=query,
                    retrieval_rank=rank,
                    retrieval_score=chunk.get("score", 0.0),
                    retrieval_method=retrieval_method,
                    session_id=session_id,
                    user_id=user_id,
                )
                records.append(record)

            session.add_all(records)
            await session.flush()

            logger.debug(f"追踪检索: {len(records)}个chunk")
            return [r.id for r in records]

        except Exception as e:
            logger.warning(f"追踪检索失败: {e}")
            return []

    @staticmethod
    async def mark_cited(
        *,
        session,
        usage_ids: list[int],
        cited_chunk_ids: list[int],
        citation_confidence: float = 1.0,
    ) -> int:
        """标记被引用的chunks

        Args:
            session: 数据库会话
            usage_ids: 使用记录ID列表
            cited_chunk_ids: 被引用的chunk ID列表
            citation_confidence: 引用置信度

        Returns:
            更新的记录数
        """
        try:
            from sqlalchemy import update

            stmt = (
                update(ChunkUsageModel)
                .where(ChunkUsageModel.id.in_(usage_ids), ChunkUsageModel.chunk_id.in_(cited_chunk_ids))
                .values(was_cited=True, citation_confidence=citation_confidence)
            )
            result = await session.execute(stmt)
            await session.flush()

            updated = result.rowcount
            logger.debug(f"标记引用: {updated}个chunk")
            return updated

        except Exception as e:
            logger.warning(f"标记引用失败: {e}")
            return 0

    @staticmethod
    async def update_stats(*, session, chunk_id: int) -> bool:
        """更新chunk质量统计

        Args:
            session: 数据库会话
            chunk_id: chunk ID

        Returns:
            是否成功
        """
        try:
            from sqlalchemy import func, select

            # 查询该chunk的使用统计
            stmt = select(
                func.count(ChunkUsageModel.id).label("retrieval_count"),
                func.sum(func.cast(ChunkUsageModel.was_cited, Integer)).label("citation_count"),
                func.avg(ChunkUsageModel.retrieval_rank).label("avg_rank"),
                func.avg(ChunkUsageModel.retrieval_score).label("avg_score"),
                func.sum(func.case((ChunkUsageModel.user_feedback == "helpful", 1), else_=0)).label("helpful"),
                func.sum(func.case((ChunkUsageModel.user_feedback == "not_helpful", 1), else_=0)).label("not_helpful"),
            ).where(ChunkUsageModel.chunk_id == chunk_id)

            result = await session.execute(stmt)
            row = result.one_or_none()

            if not row or not row.retrieval_count:
                return False

            # 计算质量指标
            retrieval_count = row.retrieval_count or 0
            citation_count = row.citation_count or 0
            citation_rate = citation_count / retrieval_count if retrieval_count > 0 else 0.0

            # 质量评分公式：引用率 * 50 + (helpful - not_helpful) / retrieval_count * 50
            helpful = row.helpful or 0
            not_helpful = row.not_helpful or 0
            feedback_score = ((helpful - not_helpful) / retrieval_count * 50) if retrieval_count > 0 else 0.0
            quality_score = citation_rate * 50 + feedback_score

            # 更新或创建统计记录
            from sqlalchemy.dialects.mysql import insert as mysql_insert

            # 获取chunk的document_id和knowledge_base_id
            chunk_stmt = select(ChunkUsageModel.document_id, ChunkUsageModel.knowledge_base_id).where(ChunkUsageModel.chunk_id == chunk_id).limit(1)
            chunk_info = await session.execute(chunk_stmt)
            chunk_row = chunk_info.one_or_none()

            if not chunk_row:
                return False

            # MySQL/MariaDB使用ON DUPLICATE KEY UPDATE
            insert_stmt = mysql_insert(ChunkQualityStats).values(
                chunk_id=chunk_id,
                document_id=chunk_row.document_id,
                knowledge_base_id=chunk_row.knowledge_base_id,
                retrieval_count=retrieval_count,
                citation_count=citation_count,
                avg_retrieval_rank=row.avg_rank or 0.0,
                avg_retrieval_score=row.avg_score or 0.0,
                citation_rate=citation_rate,
                helpful_count=helpful,
                not_helpful_count=not_helpful,
                quality_score=quality_score,
                last_updated=datetime.utcnow(),
            )

            update_dict = {
                "retrieval_count": retrieval_count,
                "citation_count": citation_count,
                "avg_retrieval_rank": row.avg_rank or 0.0,
                "avg_retrieval_score": row.avg_score or 0.0,
                "citation_rate": citation_rate,
                "helpful_count": helpful,
                "not_helpful_count": not_helpful,
                "quality_score": quality_score,
                "last_updated": datetime.utcnow(),
            }

            stmt = insert_stmt.on_duplicate_key_update(**update_dict)
            await session.execute(stmt)
            await session.flush()

            logger.debug(f"更新chunk统计: chunk_id={chunk_id}, quality_score={quality_score:.2f}")
            return True

        except Exception as e:
            logger.warning(f"更新统计失败: {e}")
            return False
