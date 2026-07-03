from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base_model import ModelMixin


class EvidenceFileModel(ModelMixin):
    """Evidence file uploaded for AI analysis."""

    __tablename__ = "ai_evidence_file"
    __table_args__ = {"comment": "AI evidence file"}

    session_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True, comment="Chat session ID")
    user_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey(
            "sys_user.id",
            name="fk_ai_evidence_file_user_id_sys_user",
            ondelete="CASCADE",
            onupdate="CASCADE",
        ),
        nullable=True,
        index=True,
        comment="Owner user ID",
    )
    file_name: Mapped[str] = mapped_column(String(255), nullable=False, comment="Original file name")
    file_type: Mapped[str] = mapped_column(String(32), nullable=False, index=True, comment="File extension (docx/xlsx/pdf/txt/csv/png/jpg)")
    file_path: Mapped[str | None] = mapped_column(String(500), default=None, nullable=True, comment="Storage path")
    file_size: Mapped[int] = mapped_column(Integer, default=0, nullable=False, comment="File size in bytes")
    parse_status: Mapped[str] = mapped_column(String(32), default="pending", nullable=False, index=True, comment="Parse status: pending/parsing/parsed/failed/unsupported")
    analysis_status: Mapped[str] = mapped_column(String(32), default="pending", nullable=False, index=True, comment="Analysis status: pending/analyzing/analyzed/failed")
    parsed_content: Mapped[str | None] = mapped_column(Text, default=None, nullable=True, comment="Parsed text content (truncated)")


class EvidenceAnalysisModel(ModelMixin):
    """AI analysis result for an evidence file."""

    __tablename__ = "ai_evidence_analysis"
    __table_args__ = {"comment": "AI evidence analysis result"}

    evidence_file_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("ai_evidence_file.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
        comment="Evidence file ID",
    )
    evidence_type: Mapped[str | None] = mapped_column(String(64), default=None, nullable=True, comment="Evidence type: 劳动合同/工资记录/考勤记录/聊天记录/解除通知/公司主体信息/其他材料")
    key_facts: Mapped[list[str] | None] = mapped_column(JSON, default=None, nullable=True, comment="Key facts")
    proof_purpose: Mapped[list[str] | None] = mapped_column(JSON, default=None, nullable=True, comment="Proof purpose")
    related_claims: Mapped[list[str] | None] = mapped_column(JSON, default=None, nullable=True, comment="Related claims")
    evidence_strength: Mapped[str | None] = mapped_column(String(16), default=None, nullable=True, comment="Evidence strength: 强/中/弱")
    risks: Mapped[list[str] | None] = mapped_column(JSON, default=None, nullable=True, comment="Risks")
    missing_materials: Mapped[list[str] | None] = mapped_column(JSON, default=None, nullable=True, comment="Suggested missing materials")
    summary: Mapped[str | None] = mapped_column(Text, default=None, nullable=True, comment="One-line summary")
    raw_result: Mapped[str | None] = mapped_column(Text, default=None, nullable=True, comment="Raw AI response")
    model_name: Mapped[str | None] = mapped_column(String(128), default=None, nullable=True, comment="AI model name")
