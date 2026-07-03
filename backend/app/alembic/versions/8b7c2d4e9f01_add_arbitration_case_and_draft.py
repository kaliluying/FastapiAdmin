"""add arbitration case and draft tables

Revision ID: 8b7c2d4e9f01
Revises: 16d2aa16594e
Create Date: 2026-07-01 12:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "8b7c2d4e9f01"
down_revision: Union[str, None] = "16d2aa16594e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "ai_case",
        sa.Column("case_title", sa.String(length=200), nullable=False, comment="案件标题"),
        sa.Column("session_id", sa.String(length=64), nullable=True, comment="关联聊天会话 ID"),
        sa.Column("user_id", sa.Integer(), nullable=True, comment="案件所属用户 ID"),
        sa.Column("applicant_name", sa.String(length=64), nullable=True, comment="申请人姓名"),
        sa.Column("applicant_gender", sa.String(length=16), nullable=True, comment="申请人性别"),
        sa.Column("applicant_id_no", sa.String(length=32), nullable=True, comment="申请人身份证号"),
        sa.Column("applicant_phone", sa.String(length=32), nullable=True, comment="申请人联系电话"),
        sa.Column("applicant_address", sa.String(length=255), nullable=True, comment="申请人住址"),
        sa.Column("respondent_name", sa.String(length=128), nullable=True, comment="被申请人名称"),
        sa.Column("respondent_credit_code", sa.String(length=64), nullable=True, comment="统一社会信用代码"),
        sa.Column("respondent_address", sa.String(length=255), nullable=True, comment="被申请人住所地"),
        sa.Column("respondent_legal_rep", sa.String(length=64), nullable=True, comment="法定代表人"),
        sa.Column("respondent_phone", sa.String(length=32), nullable=True, comment="被申请人联系电话"),
        sa.Column("hire_date", sa.String(length=32), nullable=True, comment="入职日期"),
        sa.Column("leave_date", sa.String(length=32), nullable=True, comment="离职日期"),
        sa.Column("position_name", sa.String(length=64), nullable=True, comment="岗位"),
        sa.Column("work_location", sa.String(length=128), nullable=True, comment="工作地点"),
        sa.Column("monthly_salary", sa.Numeric(precision=10, scale=2), nullable=True, comment="月工资"),
        sa.Column("contract_type", sa.String(length=32), nullable=True, comment="合同类型"),
        sa.Column("social_insurance", sa.Boolean(), nullable=True, comment="是否缴纳社保"),
        sa.Column("dispute_summary", sa.Text(), nullable=False, comment="争议事实概述"),
        sa.Column("claims", sa.JSON(), nullable=False, comment="仲裁请求"),
        sa.Column("evidence_items", sa.JSON(), nullable=False, comment="证据清单"),
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False, comment="主键ID"),
        sa.Column("uuid", sa.String(length=64), nullable=False, comment="UUID全局唯一标识"),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, comment="是否已删除(0:未删除 1:已删除)"),
        sa.Column("created_time", sa.DateTime(), nullable=False, comment="创建时间"),
        sa.Column("updated_time", sa.DateTime(), nullable=False, comment="更新时间"),
        sa.Column("deleted_time", sa.DateTime(), nullable=True, comment="删除时间"),
        sa.Column("tenant_id", sa.Integer(), nullable=False, comment="单组织ID"),
        sa.Column("created_id", sa.Integer(), nullable=True, comment="创建人ID"),
        sa.Column("updated_id", sa.Integer(), nullable=True, comment="更新人ID"),
        sa.Column("deleted_id", sa.Integer(), nullable=True, comment="删除人ID"),
        sa.ForeignKeyConstraint(["created_id"], ["sys_user.id"], onupdate="CASCADE", ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["deleted_id"], ["sys_user.id"], onupdate="CASCADE", ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["updated_id"], ["sys_user.id"], onupdate="CASCADE", ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["sys_user.id"], onupdate="CASCADE", ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        comment="AI arbitration case file",
    )
    op.create_index(op.f("ix_ai_case_case_title"), "ai_case", ["case_title"], unique=False)
    op.create_index(op.f("ix_ai_case_created_id"), "ai_case", ["created_id"], unique=False)
    op.create_index(op.f("ix_ai_case_created_time"), "ai_case", ["created_time"], unique=False)
    op.create_index(op.f("ix_ai_case_deleted_id"), "ai_case", ["deleted_id"], unique=False)
    op.create_index(op.f("ix_ai_case_deleted_time"), "ai_case", ["deleted_time"], unique=False)
    op.create_index(op.f("ix_ai_case_id"), "ai_case", ["id"], unique=False)
    op.create_index(op.f("ix_ai_case_is_deleted"), "ai_case", ["is_deleted"], unique=False)
    op.create_index(op.f("ix_ai_case_respondent_name"), "ai_case", ["respondent_name"], unique=False)
    op.create_index(op.f("ix_ai_case_session_id"), "ai_case", ["session_id"], unique=False)
    op.create_index(op.f("ix_ai_case_tenant_id"), "ai_case", ["tenant_id"], unique=False)
    op.create_index(op.f("ix_ai_case_updated_id"), "ai_case", ["updated_id"], unique=False)
    op.create_index(op.f("ix_ai_case_updated_time"), "ai_case", ["updated_time"], unique=False)
    op.create_index(op.f("ix_ai_case_user_id"), "ai_case", ["user_id"], unique=False)
    op.create_index(op.f("ix_ai_case_uuid"), "ai_case", ["uuid"], unique=True)

    op.create_table(
        "ai_arbitration_draft",
        sa.Column("case_id", sa.Integer(), nullable=False, comment="关联案件 ID"),
        sa.Column("session_id", sa.String(length=64), nullable=True, comment="关联聊天会话 ID"),
        sa.Column("title", sa.String(length=200), nullable=False, comment="文书标题"),
        sa.Column("content", sa.Text(), nullable=False, comment="文书正文"),
        sa.Column("risk_tips", sa.JSON(), nullable=False, comment="风险提示"),
        sa.Column("source_summary", sa.JSON(), nullable=False, comment="生成来源摘要"),
        sa.Column("source_data", sa.JSON(), nullable=False, comment="生成输入快照"),
        sa.Column("used_ai", sa.Boolean(), nullable=False, comment="是否使用 AI 润色"),
        sa.Column("review_status", sa.String(length=32), nullable=False, comment="复核状态"),
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False, comment="主键ID"),
        sa.Column("uuid", sa.String(length=64), nullable=False, comment="UUID全局唯一标识"),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, comment="是否已删除(0:未删除 1:已删除)"),
        sa.Column("created_time", sa.DateTime(), nullable=False, comment="创建时间"),
        sa.Column("updated_time", sa.DateTime(), nullable=False, comment="更新时间"),
        sa.Column("deleted_time", sa.DateTime(), nullable=True, comment="删除时间"),
        sa.Column("tenant_id", sa.Integer(), nullable=False, comment="单组织ID"),
        sa.Column("created_id", sa.Integer(), nullable=True, comment="创建人ID"),
        sa.Column("updated_id", sa.Integer(), nullable=True, comment="更新人ID"),
        sa.Column("deleted_id", sa.Integer(), nullable=True, comment="删除人ID"),
        sa.ForeignKeyConstraint(["case_id"], ["ai_case.id"], onupdate="CASCADE", ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["created_id"], ["sys_user.id"], onupdate="CASCADE", ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["deleted_id"], ["sys_user.id"], onupdate="CASCADE", ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["updated_id"], ["sys_user.id"], onupdate="CASCADE", ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        comment="AI arbitration application draft history",
    )
    op.create_index(op.f("ix_ai_arbitration_draft_case_id"), "ai_arbitration_draft", ["case_id"], unique=False)
    op.create_index(op.f("ix_ai_arbitration_draft_created_id"), "ai_arbitration_draft", ["created_id"], unique=False)
    op.create_index(op.f("ix_ai_arbitration_draft_created_time"), "ai_arbitration_draft", ["created_time"], unique=False)
    op.create_index(op.f("ix_ai_arbitration_draft_deleted_id"), "ai_arbitration_draft", ["deleted_id"], unique=False)
    op.create_index(op.f("ix_ai_arbitration_draft_deleted_time"), "ai_arbitration_draft", ["deleted_time"], unique=False)
    op.create_index(op.f("ix_ai_arbitration_draft_id"), "ai_arbitration_draft", ["id"], unique=False)
    op.create_index(op.f("ix_ai_arbitration_draft_is_deleted"), "ai_arbitration_draft", ["is_deleted"], unique=False)
    op.create_index(op.f("ix_ai_arbitration_draft_review_status"), "ai_arbitration_draft", ["review_status"], unique=False)
    op.create_index(op.f("ix_ai_arbitration_draft_session_id"), "ai_arbitration_draft", ["session_id"], unique=False)
    op.create_index(op.f("ix_ai_arbitration_draft_tenant_id"), "ai_arbitration_draft", ["tenant_id"], unique=False)
    op.create_index(op.f("ix_ai_arbitration_draft_updated_id"), "ai_arbitration_draft", ["updated_id"], unique=False)
    op.create_index(op.f("ix_ai_arbitration_draft_updated_time"), "ai_arbitration_draft", ["updated_time"], unique=False)
    op.create_index(op.f("ix_ai_arbitration_draft_uuid"), "ai_arbitration_draft", ["uuid"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_ai_arbitration_draft_uuid"), table_name="ai_arbitration_draft")
    op.drop_index(op.f("ix_ai_arbitration_draft_updated_time"), table_name="ai_arbitration_draft")
    op.drop_index(op.f("ix_ai_arbitration_draft_updated_id"), table_name="ai_arbitration_draft")
    op.drop_index(op.f("ix_ai_arbitration_draft_tenant_id"), table_name="ai_arbitration_draft")
    op.drop_index(op.f("ix_ai_arbitration_draft_session_id"), table_name="ai_arbitration_draft")
    op.drop_index(op.f("ix_ai_arbitration_draft_review_status"), table_name="ai_arbitration_draft")
    op.drop_index(op.f("ix_ai_arbitration_draft_is_deleted"), table_name="ai_arbitration_draft")
    op.drop_index(op.f("ix_ai_arbitration_draft_id"), table_name="ai_arbitration_draft")
    op.drop_index(op.f("ix_ai_arbitration_draft_deleted_time"), table_name="ai_arbitration_draft")
    op.drop_index(op.f("ix_ai_arbitration_draft_deleted_id"), table_name="ai_arbitration_draft")
    op.drop_index(op.f("ix_ai_arbitration_draft_created_time"), table_name="ai_arbitration_draft")
    op.drop_index(op.f("ix_ai_arbitration_draft_created_id"), table_name="ai_arbitration_draft")
    op.drop_index(op.f("ix_ai_arbitration_draft_case_id"), table_name="ai_arbitration_draft")
    op.drop_table("ai_arbitration_draft")

    op.drop_index(op.f("ix_ai_case_uuid"), table_name="ai_case")
    op.drop_index(op.f("ix_ai_case_user_id"), table_name="ai_case")
    op.drop_index(op.f("ix_ai_case_updated_time"), table_name="ai_case")
    op.drop_index(op.f("ix_ai_case_updated_id"), table_name="ai_case")
    op.drop_index(op.f("ix_ai_case_tenant_id"), table_name="ai_case")
    op.drop_index(op.f("ix_ai_case_session_id"), table_name="ai_case")
    op.drop_index(op.f("ix_ai_case_respondent_name"), table_name="ai_case")
    op.drop_index(op.f("ix_ai_case_is_deleted"), table_name="ai_case")
    op.drop_index(op.f("ix_ai_case_id"), table_name="ai_case")
    op.drop_index(op.f("ix_ai_case_deleted_time"), table_name="ai_case")
    op.drop_index(op.f("ix_ai_case_deleted_id"), table_name="ai_case")
    op.drop_index(op.f("ix_ai_case_created_time"), table_name="ai_case")
    op.drop_index(op.f("ix_ai_case_created_id"), table_name="ai_case")
    op.drop_index(op.f("ix_ai_case_case_title"), table_name="ai_case")
    op.drop_table("ai_case")
