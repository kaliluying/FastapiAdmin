"""Create the optional AI/RAG tables when the plugin is enabled.

Revision ID: 000000000003
Revises: 000000000002
Create Date: 2026-08-01 00:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op
from app.core.base_model import MappedBase
from app.core.plugins import is_ai_plugin_enabled

revision: str = "000000000003"
down_revision: str | None = "000000000002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

AI_TABLE_NAMES = (
    "ai_chat_session",
    "ai_model_config",
    "ai_knowledge_base",
    "ai_knowledge_document",
    "ai_knowledge_chunk",
    "ai_memory",
)


def _loaded_ai_tables() -> list[sa.Table]:
    """Return AI tables already registered by the Alembic model loader.

    返回:
    - list[sa.Table]: 当前进程已加载的可选 AI 表。
    """
    return [
        MappedBase.metadata.tables[name]
        for name in AI_TABLE_NAMES
        if name in MappedBase.metadata.tables
    ]


def upgrade() -> None:
    """Create optional AI tables only for an enabled, dependency-complete plugin."""
    if not is_ai_plugin_enabled():
        return

    tables = _loaded_ai_tables()
    if tables:
        MappedBase.metadata.create_all(bind=op.get_bind(), tables=tables)


def downgrade() -> None:
    """Drop AI tables when rolling back, even if the plugin is now disabled."""
    inspector = sa.inspect(op.get_bind())
    existing_tables = set(inspector.get_table_names())
    for table_name in reversed(AI_TABLE_NAMES):
        if table_name in existing_tables:
            op.drop_table(table_name)
