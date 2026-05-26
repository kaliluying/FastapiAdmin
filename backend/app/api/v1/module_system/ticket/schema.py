from pydantic import BaseModel, ConfigDict, Field

from app.core.base_schema import CommonSchema
from app.core.validator import DateTimeStr


class TicketCreateSchema(BaseModel):
    """创建工单"""

    title: str = Field(..., max_length=200, description="工单标题")
    ticket_content: str = Field(default="", description="工单内容（富文本）")
    content: str | None = Field(default=None, description="工单内容（纯文本摘要）")
    ticket_type: str = Field(default="suggestion", description="工单类型(suggestion/bug/optimize/other)")
    images: str | None = Field(default=None, description="图片URL列表(JSON数组)")
    description: str | None = Field(default=None, description="工单描述")


class TicketUpdateSchema(BaseModel):
    """更新工单"""

    title: str | None = Field(default=None, max_length=200, description="工单标题")
    ticket_content: str | None = Field(default=None, description="工单内容（富文本）")
    content: str | None = Field(default=None, description="工单内容（纯文本摘要）")
    ticket_type: str | None = Field(default=None, description="工单类型")
    status: str | None = Field(default=None, description="状态(0:待处理 1:处理中 2:已完成 3:已关闭)")
    reply: str | None = Field(default=None, description="回复内容")
    assigned_id: int | None = Field(default=None, description="处理人ID")
    description: str | None = Field(default=None, description="工单描述")


class TicketOutSchema(BaseModel):
    """工单响应"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    ticket_content: str | None = None
    content: str | None = None
    ticket_type: str
    status: str
    images: str | None = None
    reply: str | None = None
    description: str | None = None
    assigned_id: int | None = None
    created_time: DateTimeStr | None = None
    updated_time: DateTimeStr | None = None
    created_by: CommonSchema | None = None
    updated_by: CommonSchema | None = None
    assigned_by: CommonSchema | None = None


class TicketBatchSchema(BaseModel):
    """批量更新工单"""

    ids: list[int] = Field(..., description="工单ID列表")
    status: str = Field(..., description="状态(0:待处理 1:处理中 2:已完成 3:已关闭)")


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
            self.title = ("like", title)
        if ticket_type:
            self.ticket_type = ("eq", ticket_type)
        if status:
            self.status = ("eq", status)
        if created_id:
            self.created_id = ("eq", created_id)
        if assigned_id:
            self.assigned_id = ("eq", assigned_id)
