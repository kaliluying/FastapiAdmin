"""Memory schema definitions for AI memory CRUD."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

MEMORY_TYPE_CHOICES = ["user_preference", "fact", "work_rule"]


class MemoryCreateSchema(BaseModel):
    """Create a memory entry."""

    memory_type: str = Field("fact", description="Type: user_preference / fact / work_rule")
    category: str | None = Field(None, max_length=64, description="Optional grouping category")
    key: str = Field(..., min_length=1, max_length=128, description="Short label")
    value: str = Field(..., min_length=1, max_length=5000, description="Memory content")
    priority: int = Field(0, ge=0, le=100, description="Priority (higher = injected first)")
    is_active: bool = Field(True, description="Whether active")

    @field_validator("memory_type")
    @classmethod
    def validate_memory_type(cls, v: str) -> str:
        if v not in MEMORY_TYPE_CHOICES:
            raise ValueError(f"memory_type must be one of: {MEMORY_TYPE_CHOICES}")
        return v


class MemoryUpdateSchema(BaseModel):
    """Update a memory entry."""

    memory_type: str | None = Field(None, description="Type")
    category: str | None = Field(None, max_length=64)
    key: str | None = Field(None, min_length=1, max_length=128)
    value: str | None = Field(None, min_length=1, max_length=5000)
    priority: int | None = Field(None, ge=0, le=100)
    is_active: bool | None = Field(None)

    @field_validator("memory_type")
    @classmethod
    def validate_memory_type(cls, v: str | None) -> str | None:
        if v is not None and v not in MEMORY_TYPE_CHOICES:
            raise ValueError(f"memory_type must be one of: {MEMORY_TYPE_CHOICES}")
        return v


class MemoryQueryParam(BaseModel):
    """Query filter for memory list."""

    memory_type: str | None = Field(None, description="Filter by type")
    category: str | None = Field(None, description="Filter by category")
    key: str | None = Field(None, description="Search by key (fuzzy)")
    is_active: bool | None = Field(None, description="Filter by active status")

    model_config = ConfigDict(extra="allow")


class MemoryOutSchema(BaseModel):
    """Memory entry output."""

    id: int
    user_id: str
    team_id: str | None = None
    memory_type: str
    category: str | None = None
    key: str
    value: str
    priority: int = 0
    is_active: bool = True
    created_time: datetime | None = None
    updated_time: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


# ── 自动记忆提取 Schema ──

class MemoryExtractAction(BaseModel):
    """LLM 输出的单条记忆操作指令."""

    action: str = Field(..., description="create / update / delete / skip")
    memory_id: int | None = Field(None, description="更新或删除时必填的记忆 ID")
    memory_type: str | None = Field(None, description="Type: user_preference / fact / work_rule")
    category: str | None = Field(None, max_length=64)
    key: str | None = Field(None, min_length=1, max_length=128)
    value: str | None = Field(None, max_length=5000)
    priority: int = Field(0, ge=0, le=100)
    confidence: float = Field(0.0, ge=0.0, le=1.0, description="置信度 0-1，低于阈值自动跳过")
    reason: str = Field("", description="操作理由，便于调试")


class MemoryExtractResult(BaseModel):
    """LLM 记忆提取的完整返回."""

    actions: list[MemoryExtractAction] = Field(default_factory=list, description="本轮对话提取的记忆操作列表")
