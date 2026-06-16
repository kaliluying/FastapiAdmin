from dataclasses import dataclass

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.common.enums import QueueEnum
from app.core.base_schema import BaseSchema, CommonSchema


class TicketCreateSchema(BaseModel):
    """创建工单"""

    title: str = Field(..., min_length=1, max_length=200, description="工单标题")
    ticket_content: str = Field(default="", description="工单内容（富文本）")
    summary: str | None = Field(default=None, description="工单内容（纯文本摘要）")
    ticket_type: str = Field(
        default="suggestion", max_length=20, description="工单类型(suggestion/bug/optimize/other)"
    )
    images: str | None = Field(default=None, description="图片URL列表(JSON数组)")
    description: str | None = Field(default=None, max_length=255, description="工单描述")

    @field_validator("ticket_type")
    @classmethod
    def _validate_ticket_type(cls, v: str) -> str:
        allowed = {"suggestion", "bug", "optimize", "other"}
        if v not in allowed:
            raise ValueError(f"工单类型仅支持 suggestion、bug、optimize、other，当前值: {v}")
        return v

    @field_validator("title")
    @classmethod
    def _validate_title(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("工单标题不能为空")
        return v


class TicketUpdateSchema(BaseModel):
    """更新工单"""

    title: str | None = Field(default=None, max_length=200, description="工单标题")
    ticket_content: str | None = Field(default=None, description="工单内容（富文本）")
    summary: str | None = Field(default=None, description="工单内容（纯文本摘要）")
    ticket_type: str | None = Field(default=None, max_length=20, description="工单类型")
    status: int | None = Field(
        default=None, ge=0, le=3, description="状态(0:待处理 1:处理中 2:已完成 3:已关闭)"
    )
    reply: str | None = Field(default=None, description="回复内容")
    assigned_id: int | None = Field(default=None, gt=0, description="处理人ID")
    description: str | None = Field(default=None, max_length=255, description="工单描述")

    @field_validator("ticket_type")
    @classmethod
    def _validate_ticket_type(cls, v: str | None) -> str | None:
        if v is None:
            return v
        allowed = {"suggestion", "bug", "optimize", "other"}
        if v not in allowed:
            raise ValueError(f"工单类型仅支持 suggestion、bug、optimize、other，当前值: {v}")
        return v

    @field_validator("status")
    @classmethod
    def _validate_status(cls, v: int | None) -> int | None:
        if v is None:
            return v
        if v not in {0, 1, 2, 3}:
            raise ValueError("工单状态仅支持 0(待处理)、1(处理中)、2(已完成)、3(已关闭)")
        return v


class TicketOutSchema(BaseSchema):
    """工单响应"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    ticket_content: str | None = None
    summary: str | None = None
    ticket_type: str
    status: int
    images: str | None = None
    reply: str | None = None
    assigned_id: int | None = None
    created_by: CommonSchema | None = None
    updated_by: CommonSchema | None = None
    assigned_by: CommonSchema | None = None


class TicketBatchSchema(BaseModel):
    """批量更新工单"""

    ids: list[int] = Field(..., min_length=1, description="工单ID列表")
    status: int = Field(..., ge=0, le=3, description="状态(0:待处理 1:处理中 2:已完成 3:已关闭)")

    @field_validator("status")
    @classmethod
    def _validate_status(cls, v: int) -> int:
        if v not in {0, 1, 2, 3}:
            raise ValueError("工单状态仅支持 0(待处理)、1(处理中)、2(已完成)、3(已关闭)")
        return v


@dataclass
class TicketQueryParam:
    """工单查询参数"""

    def __init__(
        self,
        title: str | None = None,
        ticket_type: str | None = None,
        status: str | None = None,
        created_id: int | None = None,
        assigned_id: int | None = None,
    ) -> None:
        if title:
            self.title = (QueueEnum.like.value, title)
        if ticket_type:
            self.ticket_type = (QueueEnum.eq.value, ticket_type)
        if status:
            self.status = (QueueEnum.eq.value, status)
        if created_id:
            self.created_id = (QueueEnum.eq.value, created_id)
        if assigned_id:
            self.assigned_id = (QueueEnum.eq.value, assigned_id)
