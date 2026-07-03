"""Memory data model for AI assistant — stores user preferences, facts, and work rules."""

from __future__ import annotations

from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base_model import ModelMixin


class AiMemoryModel(ModelMixin):
    """Persistent memory entries that the AI can reference across sessions.

    Three memory modes:
    - user_preference: per-user settings (e.g. "回答要简洁")
    - fact: key facts about the user or case (e.g. "用户是劳动争议调解员")
    - work_rule: system-wide business rules (e.g. "所有建议必须引用法条")
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
        comment="Memory content, e.g. '劳动仲裁调解员，主要负责工伤类案件'",
    )
    priority: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0,
        comment="Higher priority memories are injected first (0 = default)",
    )
    is_active: Mapped[bool] = mapped_column(
        default=True, nullable=False,
        comment="Whether this memory entry is currently active",
    )
