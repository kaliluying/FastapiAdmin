"""增加__TITLE__业务表，不修改已有业务数据。"""

import sqlalchemy as sa
from alembic import op

revision = "__REVISION__"
down_revision = "__DOWN_REVISION__"
branch_labels = None
depends_on = None


def upgrade() -> None:
    tables = sa.inspect(op.get_bind()).get_table_names()
    # 空数据库由 bootstrap 按 ORM 元数据建表；已有数据库应用这个增量迁移。
    if "sys_user" not in tables or "__MODULE_____RESOURCE__" in tables:
        return
    op.create_table(
        "__MODULE_____RESOURCE__",
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
        sa.UniqueConstraint("created_id", "name", name="uq___MODULE_____RESOURCE___owner_name"),
        sa.CheckConstraint("status IN (0, 1)", name="ck___MODULE_____RESOURCE___status"),
        sa.CheckConstraint(sa.column("order") >= 0, name="ck___MODULE_____RESOURCE___order"),
        comment="__TITLE__管理",
    )


def downgrade() -> None:
    # 升级可能跳过已有表或由 bootstrap 建表，不能据此证明表归本迁移所有。
    if "__MODULE_____RESOURCE__" in sa.inspect(op.get_bind()).get_table_names():
        raise RuntimeError(
            "Refusing automatic downgrade of __MODULE_____RESOURCE__: table ownership cannot be proven. "
            "Back up the data and use a reviewed manual migration if table removal is intended."
        )
