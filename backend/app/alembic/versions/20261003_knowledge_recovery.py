"""Persist document indexing claims and interrupted-generation cleanup."""

import sqlalchemy as sa

from alembic import op

revision = "20261003_knowledge_recovery"
down_revision = "20260924_remove_params_and_dict"
branch_labels = None
depends_on = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    if "ai_knowledge_document" not in inspector.get_table_names():
        return
    columns = {column["name"] for column in inspector.get_columns("ai_knowledge_document")}
    additions = (
        sa.Column("index_attempts", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("index_token", sa.String(32), nullable=True),
        sa.Column("index_lease_until", sa.DateTime(), nullable=True),
        sa.Column("index_cleanup_ids", sa.JSON(), nullable=True),
    )
    for column in additions:
        if column.name not in columns:
            op.add_column("ai_knowledge_document", column)


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    if "ai_knowledge_document" not in inspector.get_table_names():
        return
    columns = {column["name"] for column in inspector.get_columns("ai_knowledge_document")}
    for name in ("index_cleanup_ids", "index_lease_until", "index_token", "index_attempts"):
        if name in columns:
            op.drop_column("ai_knowledge_document", name)
