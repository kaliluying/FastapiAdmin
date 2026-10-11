from typing import Any

from sqlalchemy import JSON, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base_model import ModelMixin


class AnswerFeedbackModel(ModelMixin):
    __tablename__ = "ai_answer_feedback"
    __table_args__ = (UniqueConstraint("user_id", "session_id", "run_id", name="uq_ai_answer_feedback"),)

    user_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    session_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    run_id: Mapped[str] = mapped_column(String(64), nullable=False)
    revision: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    rating: Mapped[str] = mapped_column(String(16), nullable=False)
    comment: Mapped[str] = mapped_column(Text, default="", nullable=False)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    citations: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="pending", nullable=False, index=True)
    resolution: Mapped[str] = mapped_column(Text, default="", nullable=False)
    reviewed_by: Mapped[int | None] = mapped_column(Integer, nullable=True)


class RetrievalEvaluationModel(ModelMixin):
    __tablename__ = "ai_retrieval_evaluation"

    user_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    dataset_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    knowledge_base_ids: Mapped[list[int]] = mapped_column(JSON, nullable=False)
    top_k: Mapped[int] = mapped_column(Integer, nullable=False)
    retrieval_mode: Mapped[str] = mapped_column(String(16), nullable=False)
    dataset: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False)
    report: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
