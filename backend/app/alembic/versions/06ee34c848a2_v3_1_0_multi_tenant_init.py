"""v3_1_0_multi_tenant_init

多租户 SaaS 改造：基础设施层数据模型变更。

变更内容：
1. sys_tenant 表新增联系人、域名、Logo 等字段
2. 新建 sys_user_tenant 用户-租户关联表
3. 将已有业务数据关联到默认租户（优先使用已有的 system 租户）

Revision ID: 06ee34c848a2
Revises: 002
Create Date: 2026-05-23 17:18:11.762659
"""
from collections.abc import Sequence
from datetime import datetime
from typing import Union
from uuid import uuid4

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "06ee34c848a2"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# 需要批量更新 tenant_id 的业务表（已通过 TenantMixin 包含 tenant_id 列的表）
_TENANT_AWARE_TABLES: list[str] = [
    "app_portal",
    "sys_dept",
    "sys_dict_data",
    "sys_dict_type",
    "sys_log",
    "sys_menu",
    "sys_notice",
    "sys_param",
    "sys_position",
    "sys_role",
    "sys_user",
]


def _get_default_tenant_id() -> int:
    """获取默认租户 ID（优先使用已存在的 system 租户，否则创建 default）。

    返回:
        int: 默认租户的主键 ID。
    """
    connection = op.get_bind()

    # 1. 优先使用已有的 system 租户
    result = connection.execute(
        sa.text("SELECT id FROM sys_tenant WHERE code = 'system' LIMIT 1")
    )
    row = result.fetchone()
    if row is not None:
        return int(row[0])

    # 2. 尝试 code='default'
    result = connection.execute(
        sa.text("SELECT id FROM sys_tenant WHERE code = 'default' LIMIT 1")
    )
    row = result.fetchone()
    if row is not None:
        return int(row[0])

    # 3. 创建默认租户
    now = datetime.now()
    result = connection.execute(
        sa.text(
            "INSERT INTO sys_tenant "
            "(uuid, name, code, status, sort, is_deleted, created_time, updated_time) "
            "VALUES (:uuid, :name, :code, :status, :sort, :is_deleted, :now, :now)"
        ),
        {
            "uuid": str(uuid4()),
            "name": "默认租户",
            "code": "default",
            "status": "0",
            "sort": 1,
            "is_deleted": 0,
            "now": now,
        },
    )
    last_id = connection.execute(sa.text("SELECT LAST_INSERT_ID()")).scalar()
    return int(last_id)


def upgrade() -> None:
    # ========== 1. sys_tenant 新增字段 ==========
    op.add_column(
        "sys_tenant",
        sa.Column("contact_name", sa.String(length=64), nullable=True, comment="联系人姓名"),
    )
    op.add_column(
        "sys_tenant",
        sa.Column("contact_phone", sa.String(length=20), nullable=True, comment="联系人电话"),
    )
    op.add_column(
        "sys_tenant",
        sa.Column("contact_email", sa.String(length=128), nullable=True, comment="联系人邮箱"),
    )
    op.add_column(
        "sys_tenant",
        sa.Column("address", sa.String(length=255), nullable=True, comment="地址"),
    )
    op.add_column(
        "sys_tenant",
        sa.Column("domain", sa.String(length=255), nullable=True, comment="域名"),
    )
    op.add_column(
        "sys_tenant",
        sa.Column("logo_url", sa.String(length=500), nullable=True, comment="Logo URL"),
    )
    op.add_column(
        "sys_tenant",
        sa.Column("sort", sa.Integer(), nullable=False, server_default=sa.text("0"), comment="排序"),
    )

    # ========== 2. sys_user_tenant 新建 ==========
    op.create_table(
        "sys_user_tenant",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False, comment="主键ID"),
        sa.Column("user_id", sa.Integer(), nullable=False, comment="用户ID"),
        sa.Column("tenant_id", sa.Integer(), nullable=False, comment="租户ID"),
        sa.Column(
            "role",
            sa.String(length=20),
            nullable=False,
            server_default=sa.text("'member'"),
            comment="租户内角色(owner:拥有者 admin:管理员 member:成员)",
        ),
        sa.Column(
            "is_default",
            sa.SmallInteger(),
            nullable=False,
            server_default=sa.text("0"),
            comment="是否默认租户(0:否 1:是)",
        ),
        sa.Column("create_time", sa.DateTime(), nullable=False, comment="创建时间"),
        sa.ForeignKeyConstraint(["tenant_id"], ["sys_tenant.id"], onupdate="CASCADE", ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["sys_user.id"], onupdate="CASCADE", ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "tenant_id", name="uq_user_tenant"),
        comment="用户租户关联表",
    )
    op.create_index(
        op.f("ix_sys_user_tenant_tenant_id"), "sys_user_tenant", ["tenant_id"], unique=False
    )
    op.create_index(
        op.f("ix_sys_user_tenant_user_id"), "sys_user_tenant", ["user_id"], unique=False
    )

    # ========== 3. 数据迁移：将已有数据关联到默认租户 ==========
    default_tenant_id = _get_default_tenant_id()
    now = datetime.now()

    connection = op.get_bind()

    # 将已有业务数据的 tenant_id 批量更新为默认租户 ID
    for table_name in _TENANT_AWARE_TABLES:
        connection.execute(
            sa.text(
                f"UPDATE {table_name} SET tenant_id = :tid "
                "WHERE tenant_id IS NULL OR tenant_id = 0"
            ),
            {"tid": default_tenant_id},
        )

    # 为所有已有用户创建 sys_user_tenant 关联（默认租户，owner 角色）
    users = connection.execute(
        sa.text("SELECT id FROM sys_user WHERE is_deleted = 0")
    ).fetchall()

    for (user_id,) in users:
        existing = connection.execute(
            sa.text(
                "SELECT id FROM sys_user_tenant WHERE user_id = :uid AND tenant_id = :tid"
            ),
            {"uid": user_id, "tid": default_tenant_id},
        ).fetchone()
        if existing is None:
            connection.execute(
                sa.text(
                    "INSERT INTO sys_user_tenant "
                    "(user_id, tenant_id, role, is_default, create_time) "
                    "VALUES (:uid, :tid, :role, :is_default, :now)"
                ),
                {
                    "uid": user_id,
                    "tid": default_tenant_id,
                    "role": "owner",
                    "is_default": 1,
                    "now": now,
                },
            )


def downgrade() -> None:
    # ========== 回滚顺序（与 upgrade 相反） ==========

    connection = op.get_bind()

    # 3. 数据回滚
    # 清空 sys_user_tenant 表
    try:
        connection.execute(sa.text("DELETE FROM sys_user_tenant"))
    except Exception:
        pass

    # 删除迁移创建的默认租户（仅删除 code='default' 的）
    try:
        connection.execute(
            sa.text("DELETE FROM sys_tenant WHERE code = 'default'")
        )
    except Exception:
        pass

    # 将业务数据 tenant_id 清空
    for table_name in reversed(_TENANT_AWARE_TABLES):
        try:
            connection.execute(
                sa.text(f"UPDATE {table_name} SET tenant_id = NULL")
            )
        except Exception:
            pass

    # 2. sys_user_tenant 删除
    op.drop_index(op.f("ix_sys_user_tenant_user_id"), table_name="sys_user_tenant")
    op.drop_index(op.f("ix_sys_user_tenant_tenant_id"), table_name="sys_user_tenant")
    op.drop_table("sys_user_tenant")

    # 1. sys_tenant 删除字段
    op.drop_column("sys_tenant", "sort")
    op.drop_column("sys_tenant", "logo_url")
    op.drop_column("sys_tenant", "domain")
    op.drop_column("sys_tenant", "address")
    op.drop_column("sys_tenant", "contact_email")
    op.drop_column("sys_tenant", "contact_phone")
    op.drop_column("sys_tenant", "contact_name")
