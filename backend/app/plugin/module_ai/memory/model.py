"""Memory data model for AI assistant — stores user preferences, facts, and work rules."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base_model import MappedBase, ModelMixin


class MemoryExtractionJobModel(MappedBase):
    """Committed with a chat turn; removed atomically with its memory changes."""

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
    available_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, nullable=False)
    lease_until: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    token: Mapped[str | None] = mapped_column(String(32), nullable=True)


class AiMemoryModel(ModelMixin):
    """Persistent memory entries that the AI can reference across sessions.

    Three memory modes:
    - user_preference: per-user settings (e.g. "回答要简洁")
    - fact: key facts about the user or current work context
    - work_rule: system-wide business rules (e.g. "所有建议必须引用来源")
    """

    __tablename__ = "ai_memory"
    __table_args__ = {"comment": "AI memory — user preferences, facts, and work rules"}

    user_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    team_id: Mapped[str | None] = mapped_column(String(64), default=None, nullable=True, index=True)
    memory_type: Mapped[str] = mapped_column(
        String(32), nullable=False, default="fact", index=True,
        comment="Memory type: user_preference / fact / work_rule",
    )
    category: Mapped[str | None] = mapped_column(
        String(64), default=None, nullable=True,
        comment="Optional category for grouping",
    )
    key: Mapped[str] = mapped_column(
        String(128), nullable=False,
        comment="Short label, e.g. '用户角色'",
    )
    value: Mapped[str] = mapped_column(
        Text, nullable=False,
        comment="Memory content, e.g. '偏好先看执行摘要，再看明细'",
    )
    priority: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0,
        comment="Higher priority memories are injected first (0 = default)",
    )
    is_active: Mapped[bool] = mapped_column(
        default=True, nullable=False,
        comment="Whether this memory entry is currently active",
    )
