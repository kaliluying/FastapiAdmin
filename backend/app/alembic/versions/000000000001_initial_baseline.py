"""initial baseline schema

Revision ID: 000000000001
Revises:
Create Date: 2026-07-01 20:20:00.000000

"""
from collections.abc import Sequence

from sqlalchemy import MetaData

from alembic import op
from app.core.base_model import MappedBase
from app.utils.import_util import ImportUtil

revision: str = "000000000001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


BASELINE_TABLES = {
    "platform_menu",
    "sys_dept",
    "sys_dict_data",
    "sys_dict_type",
    "sys_login_log",
    "sys_operation_log",
    "sys_param",
    "sys_role",
    "sys_role_depts",
    "sys_role_menus",
    "sys_user",
    "sys_user_roles",
    "ai_chat_session",
    "ai_knowledge_base",
    "ai_knowledge_document",
    "ai_knowledge_chunk",
    "ai_memory",
}

EXCLUDED_COLUMNS = {}


def _baseline_metadata() -> MetaData:
    """Build the schema that existed before later business migrations."""
    ImportUtil.find_models(MappedBase)
    metadata = MetaData()

    for table in MappedBase.metadata.tables.values():
        if table.name in BASELINE_TABLES:
            table.to_metadata(metadata)

    for table_name, column_names in EXCLUDED_COLUMNS.items():
        table = metadata.tables.get(table_name)
        if table is None:
            continue

        for constraint in list(table.constraints):
            if any(column_name in constraint.columns for column_name in column_names):
                table.constraints.discard(constraint)

        for index in list(table.indexes):
            if any(column_name in index.columns for column_name in column_names):
                table.indexes.discard(index)

        for column_name in column_names:
            if column_name in table.c:
                table._columns.remove(table.c[column_name])

    return metadata


def upgrade() -> None:
    metadata = _baseline_metadata()
    metadata.create_all(bind=op.get_bind())


def downgrade() -> None:
    metadata = _baseline_metadata()
    metadata.drop_all(bind=op.get_bind())
