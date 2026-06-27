from __future__ import annotations

from typing import Any

from sqlalchemy import JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base_model import ModelMixin


class ChatSessionModel(ModelMixin):
    """AI chat session persisted by the application."""

    __tablename__ = "ai_chat_session"
    __table_args__ = {"comment": "AI chat session"}

    session_id: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    user_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    team_id: Mapped[str | None] = mapped_column(String(64), default=None, nullable=True, index=True)
    session_data: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    runs: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
