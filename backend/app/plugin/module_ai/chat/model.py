from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import JSON, DateTime, Index, Integer, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base_model import MappedBase, ModelMixin, UserMixin


class ChatSessionModel(ModelMixin):
    """由应用持久化保存的 AI 聊天会话。"""

    __tablename__ = "ai_chat_session"
    __table_args__ = {"comment": "AI chat session"}

    session_id: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    user_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    team_id: Mapped[str | None] = mapped_column(String(64), default=None, nullable=True, index=True)
    session_data: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    runs: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)


class AiModelConfigModel(ModelMixin, UserMixin):
    """单组织应用持久化保存的全局聊天模型覆盖配置。"""

    __tablename__ = "ai_model_config"
    __table_args__ = {"comment": "AI chat model configuration"}
    __loader_options__: list[str] = ["created_by", "updated_by", "deleted_by"]

    protocol: Mapped[str] = mapped_column(String(32), default="openai", nullable=False)
    openai_base_url: Mapped[str] = mapped_column(String(500), nullable=False)
    openai_model: Mapped[str] = mapped_column(String(200), nullable=False)
    encrypted_api_key: Mapped[str | None] = mapped_column(Text, default=None, nullable=True)


class MemoryExtractionJobModel(MappedBase):
    """随一轮对话提交；与相应记忆变更一起原子化移除。"""

    __tablename__ = "ai_memory_extraction_job"
    __table_args__ = (
        Index("ix_ai_memory_job_user_order", "user_id", "id"),
        Index("ix_ai_memory_job_available", "available_at", "lease_until"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    session_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(64), nullable=False)
    user_message: Mapped[str] = mapped_column(Text, nullable=False)
    assistant_response: Mapped[str] = mapped_column(Text, nullable=False)
    attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="pending", server_default=text("'pending'"), nullable=False, index=True)
    error_message: Mapped[str | None] = mapped_column(Text, default=None, nullable=True)
    available_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, nullable=False)
    lease_until: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    token: Mapped[str | None] = mapped_column(String(32), nullable=True)
