"""Persist memory extraction jobs with their chat turns."""

import sqlalchemy as sa
from alembic import op

revision = "20261022_memory_jobs"
down_revision = "20261011_ai_quality"
branch_labels = None
depends_on = None


def upgrade() -> None:
    tables = sa.inspect(op.get_bind()).get_table_names()
    if "sys_user" not in tables or "ai_memory_extraction_job" in tables:
        return
    op.create_table(
        "ai_memory_extraction_job",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("run_id", sa.String(64), nullable=False, unique=True),
        sa.Column("session_id", sa.String(64), nullable=False),
        sa.Column("user_id", sa.String(64), nullable=False),
        sa.Column("user_message", sa.Text(), nullable=False),
        sa.Column("assistant_response", sa.Text(), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("available_at", sa.DateTime(), nullable=False),
        sa.Column("lease_until", sa.DateTime(), nullable=True),
        sa.Column("token", sa.String(32), nullable=True),
    )
    op.create_index("ix_ai_memory_extraction_job_session_id", "ai_memory_extraction_job", ["session_id"])
    op.create_index("ix_ai_memory_job_user_order", "ai_memory_extraction_job", ["user_id", "id"])
    op.create_index("ix_ai_memory_job_available", "ai_memory_extraction_job", ["available_at", "lease_until"])


def downgrade() -> None:
    if "ai_memory_extraction_job" in sa.inspect(op.get_bind()).get_table_names():
        op.drop_table("ai_memory_extraction_job")
