"""为记忆提取任务增加失败终态。"""

import sqlalchemy as sa
from alembic import op

revision = "20261022_memory_job_terminal"
down_revision = "20261022_memory_jobs"
branch_labels = None
depends_on = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    if "ai_memory_extraction_job" not in inspector.get_table_names():
        return
    columns = {column["name"] for column in inspector.get_columns("ai_memory_extraction_job")}
    if "status" not in columns:
        op.add_column(
            "ai_memory_extraction_job",
            sa.Column("status", sa.String(16), server_default=sa.text("'pending'"), nullable=False),
        )
        op.create_index("ix_ai_memory_extraction_job_status", "ai_memory_extraction_job", ["status"])
    if "error_message" not in columns:
        op.add_column("ai_memory_extraction_job", sa.Column("error_message", sa.Text(), nullable=True))


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    if "ai_memory_extraction_job" not in inspector.get_table_names():
        return
    columns = {column["name"] for column in inspector.get_columns("ai_memory_extraction_job")}
    if "error_message" in columns:
        op.drop_column("ai_memory_extraction_job", "error_message")
    if "status" in columns:
        op.drop_index("ix_ai_memory_extraction_job_status", table_name="ai_memory_extraction_job")
        op.drop_column("ai_memory_extraction_job", "status")
