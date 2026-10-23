"""AI 助手的记忆数据模型，存储用户偏好、事实和工作规则。"""

from __future__ import annotations

from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base_model import ModelMixin


class AiMemoryModel(ModelMixin):
    """AI 可跨会话引用的持久化记忆条目。

    三种记忆模式：
    - user_preference: 用户个人设置（例如 "回答要简洁"）
    - fact: 关于用户或当前工作上下文的关键事实
    - work_rule: 系统级业务规则（例如 "所有建议必须引用来源"）
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
