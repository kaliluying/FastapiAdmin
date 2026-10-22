"""持久化回答反馈和检索评估记录。"""

import sqlalchemy as sa
from alembic import op

revision = "20261011_ai_quality"
down_revision = "20261011_ai_usage"
branch_labels = None
depends_on = None


def base_columns() -> list[sa.Column]:
    return [
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, index=True),
        sa.Column("uuid", sa.String(64), nullable=False, unique=True, index=True),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, index=True),
        sa.Column("created_time", sa.DateTime(), nullable=False, index=True),
        sa.Column("updated_time", sa.DateTime(), nullable=False, index=True),
        sa.Column("deleted_time", sa.DateTime(), nullable=True, index=True),
    ]


def upgrade() -> None:
    tables = sa.inspect(op.get_bind()).get_table_names()
    if "sys_user" not in tables:
        return
    if "ai_answer_feedback" not in tables:
        op.create_table(
            "ai_answer_feedback",
            *base_columns(),
            sa.Column("user_id", sa.Integer(), nullable=False, index=True),
            sa.Column("session_id", sa.String(64), nullable=False, index=True),
            sa.Column("run_id", sa.String(64), nullable=False),
            sa.Column("revision", sa.Integer(), nullable=False),
            sa.Column("rating", sa.String(16), nullable=False),
            sa.Column("comment", sa.Text(), nullable=False),
            sa.Column("question", sa.Text(), nullable=False),
            sa.Column("answer", sa.Text(), nullable=False),
            sa.Column("citations", sa.JSON(), nullable=False),
            sa.Column("status", sa.String(16), nullable=False, index=True),
            sa.Column("resolution", sa.Text(), nullable=False),
            sa.Column("reviewed_by", sa.Integer(), nullable=True),
            sa.UniqueConstraint("user_id", "session_id", "run_id", name="uq_ai_answer_feedback"),
        )
    if "ai_retrieval_evaluation" not in tables:
        op.create_table(
            "ai_retrieval_evaluation",
            *base_columns(),
            sa.Column("user_id", sa.Integer(), nullable=False, index=True),
            sa.Column("name", sa.String(100), nullable=False),
            sa.Column("dataset_hash", sa.String(64), nullable=False, index=True),
            sa.Column("knowledge_base_ids", sa.JSON(), nullable=False),
            sa.Column("top_k", sa.Integer(), nullable=False),
            sa.Column("retrieval_mode", sa.String(16), nullable=False),
            sa.Column("dataset", sa.JSON(), nullable=False),
            sa.Column("report", sa.JSON(), nullable=False),
        )


def downgrade() -> None:
    tables = sa.inspect(op.get_bind()).get_table_names()
    for table in ("ai_retrieval_evaluation", "ai_answer_feedback"):
        if table in tables:
            op.drop_table(table)
