from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer, JSON, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.base_model import ModelMixin, TenantMixin, UserMixin

if TYPE_CHECKING:
    from app.api.v1.module_system.user.model import UserModel


class ArbitrationCaseModel(ModelMixin, TenantMixin, UserMixin):
    """Structured arbitration case file."""

    __tablename__ = "ai_case"
    __table_args__ = {"comment": "AI arbitration case file"}
    __loader_options__ = ["drafts"]

    case_title: Mapped[str] = mapped_column(String(200), nullable=False, index=True, comment="案件标题")
    session_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True, comment="关联聊天会话 ID")
    user_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("sys_user.id", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
        index=True,
        comment="案件所属用户 ID",
    )

    applicant_name: Mapped[str | None] = mapped_column(String(64), nullable=True, comment="申请人姓名")
    applicant_gender: Mapped[str | None] = mapped_column(String(16), nullable=True, comment="申请人性别")
    applicant_id_no: Mapped[str | None] = mapped_column(String(32), nullable=True, comment="申请人身份证号")
    applicant_phone: Mapped[str | None] = mapped_column(String(32), nullable=True, comment="申请人联系电话")
    applicant_address: Mapped[str | None] = mapped_column(String(255), nullable=True, comment="申请人住址")

    respondent_name: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True, comment="被申请人名称")
    respondent_credit_code: Mapped[str | None] = mapped_column(String(64), nullable=True, comment="统一社会信用代码")
    respondent_address: Mapped[str | None] = mapped_column(String(255), nullable=True, comment="被申请人住所地")
    respondent_legal_rep: Mapped[str | None] = mapped_column(String(64), nullable=True, comment="法定代表人")
    respondent_phone: Mapped[str | None] = mapped_column(String(32), nullable=True, comment="被申请人联系电话")

    hire_date: Mapped[str | None] = mapped_column(String(32), nullable=True, comment="入职日期")
    leave_date: Mapped[str | None] = mapped_column(String(32), nullable=True, comment="离职日期")
    position_name: Mapped[str | None] = mapped_column(String(64), nullable=True, comment="岗位")
    work_location: Mapped[str | None] = mapped_column(String(128), nullable=True, comment="工作地点")
    monthly_salary: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True, comment="月工资")
    contract_type: Mapped[str | None] = mapped_column(String(32), nullable=True, comment="合同类型")
    social_insurance: Mapped[bool | None] = mapped_column(Boolean, nullable=True, comment="是否缴纳社保")

    dispute_summary: Mapped[str] = mapped_column(Text, nullable=False, comment="争议事实概述")
    claims: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False, comment="仲裁请求")
    evidence_items: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False, comment="证据清单")

    user: Mapped["UserModel | None"] = relationship("UserModel", foreign_keys=[user_id], lazy="selectin")
    drafts: Mapped[list["ArbitrationDraftModel"]] = relationship(
        back_populates="case",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class ArbitrationDraftModel(ModelMixin, TenantMixin, UserMixin):
    """Generated arbitration application draft history."""

    __tablename__ = "ai_arbitration_draft"
    __table_args__ = {"comment": "AI arbitration application draft history"}
    __loader_options__ = ["case"]

    case_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("ai_case.id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
        index=True,
        comment="关联案件 ID",
    )
    session_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True, comment="关联聊天会话 ID")
    title: Mapped[str] = mapped_column(String(200), nullable=False, default="劳动人事争议仲裁申请书", comment="文书标题")
    content: Mapped[str] = mapped_column(Text, nullable=False, comment="文书正文")
    risk_tips: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False, comment="风险提示")
    source_summary: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False, comment="生成来源摘要")
    source_data: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False, comment="生成输入快照")
    used_ai: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, comment="是否使用 AI 润色")
    review_status: Mapped[str] = mapped_column(String(32), default="pending", nullable=False, index=True, comment="复核状态")

    case: Mapped[ArbitrationCaseModel] = relationship(back_populates="drafts", lazy="selectin")
