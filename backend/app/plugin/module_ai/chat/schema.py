from dataclasses import dataclass
from typing import Any

from fastapi import Query
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.base_params import BaseQueryParam, UserByQueryParam


class ChatQuerySchema(BaseModel):
    """WebSocket chat request."""

    message: str = Field(..., min_length=1, description="Message content")
    session_id: str | None = Field(None, description="Session ID")
    files: list[dict[str, Any]] | None = Field(None, description="Ad-hoc file context")
    knowledge_base_ids: list[int] = Field(default_factory=list, description="Knowledge base IDs")


class ChatSessionCreateSchema(BaseModel):
    """Create chat session request."""

    title: str = Field(..., min_length=1, max_length=200, description="Session title")

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 1 or len(value) > 200:
            raise ValueError("会话标题长度必须在 1-200 个字符之间")
        return value


class ChatSessionUpdateSchema(BaseModel):
    """Update chat session request."""

    title: str = Field(..., min_length=1, max_length=200, description="Session title")

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 1 or len(value) > 200:
            raise ValueError("会话标题长度必须在 1-200 个字符之间")
        return value


class ChatSessionMessageSchema(BaseModel):
    """Chat session message."""

    id: str = Field(..., description="Message ID")
    role: str = Field(..., description="Message role")
    content: str = Field(..., description="Message content")
    created_at: int | None = Field(None, description="Created Unix timestamp")

    model_config = ConfigDict(from_attributes=True)


@dataclass
class ChatSessionQueryParam(BaseQueryParam, UserByQueryParam):
    """Chat session list query."""

    title: str | None = Query(None, description="Session title")


class AiChatRequestSchema(BaseModel):
    """Non-streaming AI chat request."""

    message: str = Field(..., min_length=1, description="User message")
    session_id: str | None = Field(None, description="Session ID; creates a new session when omitted")
    knowledge_base_ids: list[int] = Field(default_factory=list, description="Knowledge base IDs")

    @field_validator("message")
    @classmethod
    def validate_message(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 1:
            raise ValueError("用户消息内容不能为空")
        return value


class AiChatResponseSchema(BaseModel):
    """Non-streaming AI chat response."""

    response: str = Field(..., description="AI response content")
    session_id: str = Field(..., description="Session ID")
    function_calls: list[dict[str, Any]] | None = Field(None, description="Function call metadata")
    action: dict[str, Any] | None = Field(None, description="Suggested action")


class AiModelConfigOutSchema(BaseModel):
    """Safe AI runtime configuration status."""

    openai_base_url: str
    openai_model: str
    openai_embedding_model: str
    openai_api_key_configured: bool
    chroma_host: str
    chroma_port: int
    chroma_ssl: bool
    chroma_collection_name: str
