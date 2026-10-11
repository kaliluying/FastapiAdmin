"""Persist staged document replacement and recoverable file cleanup."""

import sqlalchemy as sa
from alembic import op

revision = "20261011_document_management"
down_revision = "20261004_demo_category"
branch_labels = None
depends_on = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    if "ai_knowledge_document" not in inspector.get_table_names():
        return
    columns = {column["name"] for column in inspector.get_columns("ai_knowledge_document")}
    for name in ("pending_file", "file_cleanup_paths"):
        if name not in columns:
            op.add_column("ai_knowledge_document", sa.Column(name, sa.JSON(none_as_null=True), nullable=True))


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    if "ai_knowledge_document" not in inspector.get_table_names():
        return
    columns = {column["name"] for column in inspector.get_columns("ai_knowledge_document")}
    for name in ("file_cleanup_paths", "pending_file"):
        if name in columns:
            op.drop_column("ai_knowledge_document", name)
