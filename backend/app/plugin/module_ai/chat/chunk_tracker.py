"""引用追踪系统 - 记录chunk使用情况

功能：
1. 追踪哪些chunk被LLM实际引用
2. 统计chunk命中率和质量指标
3. 识别低质量chunk
4. 为优化文档分块策略提供数据支持

模型定义位于 chat/model.py（建表发现机制只扫描 model.py/models.py）。
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import Integer

from app.core.logger import logger
from app.plugin.module_ai.chat.model import ChunkQualityStats, ChunkUsageModel

__all__ = ["ChunkQualityStats", "ChunkUsageModel", "ChunkUsageTracker"]


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
                # 验证chunk_id
                chunk_id = chunk.get("chunk_id") or chunk.get("id")
                if not chunk_id:
                    logger.warning(f"跳过无效chunk（缺少chunk_id）: {chunk.get('content', '')[:50]}")
                    continue

                record = ChunkUsageModel(
                    chunk_id=chunk_id,
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
            from sqlalchemy import case, cast, func, select

            # 查询该chunk的使用统计
            stmt = select(
                func.count(ChunkUsageModel.id).label("retrieval_count"),
                func.sum(cast(ChunkUsageModel.was_cited, Integer)).label("citation_count"),
                func.avg(ChunkUsageModel.retrieval_rank).label("avg_rank"),
                func.avg(ChunkUsageModel.retrieval_score).label("avg_score"),
                func.sum(case((ChunkUsageModel.user_feedback == "helpful", 1), else_=0)).label("helpful"),
                func.sum(case((ChunkUsageModel.user_feedback == "not_helpful", 1), else_=0)).label("not_helpful"),
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

            # 获取chunk的document_id和knowledge_base_id
            chunk_stmt = select(ChunkUsageModel.document_id, ChunkUsageModel.knowledge_base_id).where(ChunkUsageModel.chunk_id == chunk_id).limit(1)
            chunk_info = await session.execute(chunk_stmt)
            chunk_row = chunk_info.one_or_none()

            if not chunk_row:
                return False

            values = {
                "retrieval_count": retrieval_count,
                "citation_count": citation_count,
                "avg_retrieval_rank": row.avg_rank or 0.0,
                "avg_retrieval_score": row.avg_score or 0.0,
                "citation_rate": citation_rate,
                "helpful_count": helpful,
                "not_helpful_count": not_helpful,
                "quality_score": quality_score,
                "last_updated": datetime.now(),
            }

            # 跨数据库兼容的 upsert：先查是否存在，再更新或插入
            existing_stmt = select(ChunkQualityStats).where(ChunkQualityStats.chunk_id == chunk_id).limit(1)
            existing = (await session.execute(existing_stmt)).scalar_one_or_none()

            if existing is not None:
                for key, val in values.items():
                    setattr(existing, key, val)
            else:
                session.add(
                    ChunkQualityStats(
                        chunk_id=chunk_id,
                        document_id=chunk_row.document_id,
                        knowledge_base_id=chunk_row.knowledge_base_id,
                        **values,
                    )
                )

            await session.flush()

            logger.debug(f"更新chunk统计: chunk_id={chunk_id}, quality_score={quality_score:.2f}")
            return True

        except Exception as e:
            logger.warning(f"更新统计失败: {e}")
            return False
