from __future__ import annotations

from typing import Any

from sqlalchemy import JSON, String, Text
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
