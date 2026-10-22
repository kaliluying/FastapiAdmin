"""持久化供应商调用尝试和用户每日额度，不修改聊天数据。"""
import sqlalchemy as sa
from alembic import op

revision = "20261011_ai_usage"
down_revision = "20261011_document_management"
branch_labels = None
depends_on = None


def upgrade() -> None:
    existing = set(sa.inspect(op.get_bind()).get_table_names())
    if "sys_user" not in existing:
        return
    if "ai_usage_quota" not in existing:
        op.create_table("ai_usage_quota", sa.Column("user_id", sa.Integer(), primary_key=True), sa.Column("daily_limit", sa.Integer(), nullable=True),
            sa.CheckConstraint("daily_limit IS NULL OR daily_limit >= 0", name="ck_ai_usage_quota_limit"))
    if "ai_usage_daily" not in existing:
        op.create_table("ai_usage_daily", sa.Column("user_id", sa.Integer(), primary_key=True), sa.Column("day", sa.Date(), primary_key=True), sa.Column("calls", sa.Integer(), nullable=False))
    if "ai_usage_record" not in existing:
        op.create_table("ai_usage_record",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("user_id", sa.Integer(), nullable=False, index=True),
            sa.Column("started_at", sa.DateTime(), nullable=False, index=True),
            sa.Column("day", sa.Date(), nullable=False, index=True),
            sa.Column("protocol", sa.String(32), nullable=False), sa.Column("model", sa.String(200), nullable=False),
            sa.Column("purpose", sa.String(32), nullable=False), sa.Column("status", sa.String(16), nullable=False),
            sa.Column("latency_ms", sa.Integer(), nullable=True), sa.Column("input_tokens", sa.Integer(), nullable=True),
            sa.Column("output_tokens", sa.Integer(), nullable=True), sa.Column("total_tokens", sa.Integer(), nullable=True))


def downgrade() -> None:
    for table in ("ai_usage_record", "ai_usage_daily", "ai_usage_quota"):
        if table in sa.inspect(op.get_bind()).get_table_names():
            op.drop_table(table)
