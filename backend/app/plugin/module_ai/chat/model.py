from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import JSON, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base_model import ModelMixin, UserMixin


class ChatSessionModel(ModelMixin):
    """AI chat session persisted by the application."""

    __tablename__ = "ai_chat_session"
    __table_args__ = {"comment": "AI chat session"}

    session_id: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    user_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    team_id: Mapped[str | None] = mapped_column(String(64), default=None, nullable=True, index=True)
    session_data: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    runs: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)


class AiModelConfigModel(ModelMixin, UserMixin):
    """Persisted global chat-model override for the single-organization app."""

    __tablename__ = "ai_model_config"
    __table_args__ = {"comment": "AI chat model configuration"}
    __loader_options__: list[str] = ["created_by", "updated_by", "deleted_by"]

    protocol: Mapped[str] = mapped_column(String(32), default="openai", nullable=False)
    openai_base_url: Mapped[str] = mapped_column(String(500), nullable=False)
    openai_model: Mapped[str] = mapped_column(String(200), nullable=False)
    encrypted_api_key: Mapped[str | None] = mapped_column(Text, default=None, nullable=True)


class ChunkUsageModel(ModelMixin):
    """Chunk使用记录 - 追踪检索到的chunk是否被实际引用"""

    __tablename__ = "ai_chunk_usage"
    __table_args__ = {"comment": "AI检索chunk使用追踪"}

    chunk_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True, comment="chunk ID")
    document_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True, comment="文档ID")
    knowledge_base_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True, comment="知识库ID")

    query: Mapped[str] = mapped_column(Text, nullable=False, comment="用户查询")
    retrieval_rank: Mapped[int] = mapped_column(Integer, nullable=False, comment="检索排名（1-based）")
    retrieval_score: Mapped[float] = mapped_column(Float, nullable=False, comment="检索得分")
    retrieval_method: Mapped[str] = mapped_column(String(32), nullable=False, comment="检索方法: vector/bm25/hybrid")

    was_cited: Mapped[bool] = mapped_column(default=False, nullable=False, comment="是否被LLM引用")
    citation_confidence: Mapped[float | None] = mapped_column(Float, nullable=True, comment="引用置信度(0-1)")

    user_feedback: Mapped[str | None] = mapped_column(String(32), nullable=True, comment="用户反馈: helpful/not_helpful")

    session_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True, comment="会话ID")
    user_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True, comment="用户ID")

    extra_data: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False, comment="额外元数据")
    tracked_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.now, comment="追踪时间")


class ChunkQualityStats(ModelMixin):
    """Chunk质量统计（聚合表）"""

    __tablename__ = "ai_chunk_quality_stats"
    __table_args__ = {"comment": "Chunk质量统计"}

    chunk_id: Mapped[int] = mapped_column(Integer, nullable=False, unique=True, index=True, comment="chunk ID")
    document_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True, comment="文档ID")
    knowledge_base_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True, comment="知识库ID")

    retrieval_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False, comment="被检索次数")
    citation_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False, comment="被引用次数")
    avg_retrieval_rank: Mapped[float] = mapped_column(Float, default=0.0, nullable=False, comment="平均检索排名")
    avg_retrieval_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False, comment="平均检索得分")

    citation_rate: Mapped[float] = mapped_column(Float, default=0.0, nullable=False, comment="引用率（citation/retrieval）")
    helpful_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False, comment="有帮助反馈数")
    not_helpful_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False, comment="无帮助反馈数")

    quality_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False, comment="质量评分(0-100)")

    last_updated: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.now, comment="最后更新时间")
