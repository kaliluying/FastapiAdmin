"""Read-only diagnostic runs and their ordered, durable progress."""

from datetime import datetime
from typing import Any

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base_model import MappedBase


class AgentRunModel(MappedBase):
    __tablename__ = "ai_agent_run"
    __table_args__ = (
        UniqueConstraint("user_id", "request_id", name="uq_ai_agent_run_request"),
        Index("ix_ai_agent_run_owner", "user_id", "created_at"),
        Index("ix_ai_agent_run_claim", "status", "lease_until"),
    )

    run_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    session_id: Mapped[str] = mapped_column(String(64), nullable=False)
    request_id: Mapped[str] = mapped_column(String(64), nullable=False)
    goal: Mapped[str] = mapped_column(Text, nullable=False)
    knowledge_base_ids: Mapped[list[int]] = mapped_column(JSON, nullable=False)
    use_runtime_logs: Mapped[bool] = mapped_column(Boolean, nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="pending", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, nullable=False)
    result: Mapped[str | None] = mapped_column(Text, nullable=True)
    error: Mapped[str | None] = mapped_column(String(300), nullable=True)
    citations: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    messages: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    model_calls: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    tool_calls: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_seq: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    token: Mapped[str | None] = mapped_column(String(32), nullable=True)
    lease_until: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class AgentEventModel(MappedBase):
    __tablename__ = "ai_agent_event"

    run_id: Mapped[str] = mapped_column(String(32), ForeignKey("ai_agent_run.run_id", ondelete="CASCADE"), primary_key=True)
    seq: Mapped[int] = mapped_column(Integer, primary_key=True)
    type: Mapped[str] = mapped_column(String(32), nullable=False)
    message: Mapped[str] = mapped_column(String(300), nullable=False)
    data: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, nullable=False)
