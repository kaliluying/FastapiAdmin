"""Add the copyable category module without changing existing business data."""

import sqlalchemy as sa

from alembic import op

revision = "20261004_demo_category"
down_revision = "20261003_knowledge_recovery"
branch_labels = None
depends_on = None


def upgrade() -> None:
    tables = sa.inspect(op.get_bind()).get_table_names()
    # 空数据库由 bootstrap 按 ORM 元数据建表；已有数据库应用这个增量迁移。
    if "sys_user" not in tables or "demo_category" in tables:
        return
    op.create_table(
        "demo_category",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, index=True),
        sa.Column("uuid", sa.String(64), nullable=False, unique=True, index=True),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, index=True),
        sa.Column("created_time", sa.DateTime(), nullable=False, index=True),
        sa.Column("updated_time", sa.DateTime(), nullable=False, index=True),
        sa.Column("deleted_time", sa.DateTime(), nullable=True, index=True),
        sa.Column("created_id", sa.Integer(), sa.ForeignKey("sys_user.id", ondelete="SET NULL", onupdate="CASCADE"), nullable=True, index=True),
        sa.Column("updated_id", sa.Integer(), sa.ForeignKey("sys_user.id", ondelete="SET NULL", onupdate="CASCADE"), nullable=True, index=True),
        sa.Column("deleted_id", sa.Integer(), sa.ForeignKey("sys_user.id", ondelete="SET NULL", onupdate="CASCADE"), nullable=True, index=True),
        sa.Column("name", sa.String(64), nullable=False),
        sa.Column("order", sa.Integer(), nullable=False),
        sa.Column("status", sa.Integer(), nullable=False),
        sa.Column("description", sa.String(500), nullable=True),
        sa.UniqueConstraint("created_id", "name", name="uq_demo_category_owner_name"),
        sa.CheckConstraint("status IN (0, 1)", name="ck_demo_category_status"),
        sa.CheckConstraint(sa.column("order") >= 0, name="ck_demo_category_order"),
        comment="标准业务模块范例：分类",
    )


def downgrade() -> None:
    # 显式降级会删除范例数据；正常升级不删除或覆盖已有记录。
    if "demo_category" in sa.inspect(op.get_bind()).get_table_names():
        op.drop_table("demo_category")
