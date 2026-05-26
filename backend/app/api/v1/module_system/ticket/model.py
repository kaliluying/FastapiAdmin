from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates

from app.core.base_model import ModelMixin, TenantMixin, UserMixin

if TYPE_CHECKING:
    from app.api.v1.module_system.user.model import UserModel


class TicketModel(ModelMixin, TenantMixin, UserMixin):
    """工单模型 — 用户提交的建议和反馈"""

    __tablename__: str = "sys_ticket"
    __table_args__: dict[str, str] = {"comment": "工单表"}
    __loader_options__: list[str] = ["created_by", "updated_by", "assigned_by"]

    title: Mapped[str] = mapped_column(String(200), nullable=False, comment="工单标题")
    ticket_content: Mapped[str | None] = mapped_column(Text, nullable=True, comment="工单内容（富文本）")
    content: Mapped[str | None] = mapped_column(Text, nullable=True, comment="工单内容（纯文本摘要）")
    ticket_type: Mapped[str] = mapped_column(
        String(20), nullable=False, default="suggestion", comment="工单类型(suggestion:建议 bug:缺陷 optimize:优化 other:其他)"
    )
    status: Mapped[str] = mapped_column(
        String(10), nullable=False, default="0", comment="状态(0:待处理 1:处理中 2:已完成 3:已关闭)"
    )
    images: Mapped[str | None] = mapped_column(Text, nullable=True, comment="图片URL列表(JSON数组)")
    reply: Mapped[str | None] = mapped_column(Text, nullable=True, comment="回复内容")
    description: Mapped[str | None] = mapped_column(Text, nullable=True, comment="工单描述")
    assigned_id: Mapped[int | None] = mapped_column(
        ForeignKey("sys_user.id", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
        index=True,
        comment="处理人ID",
    )

    # 处理人关联关系
    assigned_by: Mapped["UserModel | None"] = relationship(
        "UserModel",
        foreign_keys=[assigned_id],
        lazy="selectin",
        uselist=False,
    )

    @validates("title")
    def validate_title(self, key: str, title: str) -> str:
        if not title or not title.strip():
            raise ValueError("工单标题不能为空")
        return title.strip()

    @validates("content", "ticket_content")
    def validate_content(self, key: str, content: str | None) -> str | None:
        if content and content.strip():
            return content.strip()
        return content
