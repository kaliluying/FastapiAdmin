from __future__ import annotations

from datetime import datetime

from fastapi import Query
from pydantic import BaseModel, Field

from app.core.base_params import BaseQueryParam
from app.core.base_schema import BaseSchema


# ── Evidence analysis result (returned to frontend) ──

class EvidenceAnalysisOutSchema(BaseModel):
    evidence_id: int = Field(description="Evidence file ID")
    user_id: int | None = Field(None, description="Owner user ID")
    file_name: str = Field(description="Original file name")
    file_type: str = Field(description="File extension")
    file_size: int = Field(0, description="File size")
    parse_status: str = Field(description="Parse status")
    analysis_status: str = Field(description="Analysis status")
    evidence_type: str | None = Field(None, description="Evidence type")
    key_facts: list[str] | None = Field(None, description="Key facts")
    proof_purpose: list[str] | None = Field(None, description="Proof purpose")
    related_claims: list[str] | None = Field(None, description="Related claims")
    evidence_strength: str | None = Field(None, description="Evidence strength")
    risks: list[str] | None = Field(None, description="Risks")
    missing_materials: list[str] | None = Field(None, description="Suggested missing materials")
    summary: str | None = Field(None, description="One-line summary")
    created_at: datetime | None = Field(None, description="Created time")


class EvidenceListOutSchema(BaseModel):
    evidence_id: int = Field(description="Evidence file ID")
    user_id: int | None = Field(None, description="Owner user ID")
    file_name: str = Field(description="Original file name")
    file_type: str = Field(description="File extension")
    file_size: int = Field(0, description="File size")
    parse_status: str = Field(description="Parse status")
    analysis_status: str = Field(description="Analysis status")
    evidence_type: str | None = Field(None, description="Evidence type")
    summary: str | None = Field(None, description="One-line summary")
    created_at: datetime | None = Field(None, description="Created time")


# ── Query params ──

class EvidenceQueryParam(BaseQueryParam):
    session_id: str | None = Query(None, description="Session ID")
    parse_status: str | None = Query(None, description="Parse status filter")
    analysis_status: str | None = Query(None, description="Analysis status filter")
