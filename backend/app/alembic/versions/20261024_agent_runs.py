"""Add durable read-only diagnostic runs; retain history on downgrade."""

import sqlalchemy as sa
from alembic import op

revision = "20261024_agent_runs"
down_revision = "20261022_memory_job_terminal"
branch_labels = None
depends_on = None


def upgrade() -> None:
    existing = set(sa.inspect(op.get_bind()).get_table_names())
    if "sys_user" not in existing:
        return
    if "ai_agent_run" not in existing:
        op.create_table(
            "ai_agent_run",
            sa.Column("run_id", sa.String(32), primary_key=True),
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column("session_id", sa.String(64), nullable=False),
            sa.Column("request_id", sa.String(64), nullable=False),
            sa.Column("goal", sa.Text(), nullable=False),
            sa.Column("knowledge_base_ids", sa.JSON(), nullable=False),
            sa.Column("use_runtime_logs", sa.Boolean(), nullable=False),
            sa.Column("status", sa.String(16), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.Column("result", sa.Text(), nullable=True),
            sa.Column("error", sa.String(300), nullable=True),
            sa.Column("citations", sa.JSON(), nullable=False),
            sa.Column("messages", sa.JSON(), nullable=False),
            sa.Column("model_calls", sa.Integer(), nullable=False),
            sa.Column("tool_calls", sa.Integer(), nullable=False),
            sa.Column("attempts", sa.Integer(), nullable=False),
            sa.Column("last_seq", sa.Integer(), nullable=False),
            sa.Column("token", sa.String(32), nullable=True),
            sa.Column("lease_until", sa.DateTime(), nullable=True),
            sa.UniqueConstraint("user_id", "request_id", name="uq_ai_agent_run_request"),
        )
        op.create_index("ix_ai_agent_run_owner", "ai_agent_run", ["user_id", "created_at"])
        op.create_index("ix_ai_agent_run_claim", "ai_agent_run", ["status", "lease_until"])
    if "ai_agent_event" not in existing:
        op.create_table(
            "ai_agent_event",
            sa.Column("run_id", sa.String(32), sa.ForeignKey("ai_agent_run.run_id", ondelete="CASCADE"), primary_key=True),
            sa.Column("seq", sa.Integer(), primary_key=True),
            sa.Column("type", sa.String(32), nullable=False),
            sa.Column("message", sa.String(300), nullable=False),
            sa.Column("data", sa.JSON(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
        )


def downgrade() -> None:
    if {"ai_agent_run", "ai_agent_event"} & set(sa.inspect(op.get_bind()).get_table_names()):
        raise RuntimeError("诊断任务及证据需要保留；请先备份并显式处理 Agent 数据表后再降级")
