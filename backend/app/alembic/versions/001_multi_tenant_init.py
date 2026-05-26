"""multi-tenant: migrate remaining single-column unique indexes to composite

Revision ID: 001
Revises:
Create Date: 2026-05-23

大多数表的 (tenant_id, field) 组合唯一索引已由 ORM (TenantMixin + UniqueConstraint)
通过 create_tables() 自动创建。本迁移仅处理剩下两个尚未迁移的索引。
"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

UNIQUE_RECREATE = [
    ("task_workflow", "code", "uq_task_workflow_code", "uq_task_workflow_tenant_code"),
    ("task_workflow_node_type", "code", "code", "ix_task_workflow_node_type_tenant_code"),
]


def upgrade() -> None:
    for table_name, field, old_name, new_name in UNIQUE_RECREATE:
        op.execute(sa.text(f"ALTER TABLE {table_name} DROP INDEX {old_name}"))
        op.execute(sa.text(f"ALTER TABLE {table_name} ADD UNIQUE INDEX {new_name} (tenant_id, {field})"))


def downgrade() -> None:
    for table_name, field, old_name, new_name in reversed(UNIQUE_RECREATE):
        op.execute(sa.text(f"ALTER TABLE {table_name} DROP INDEX {new_name}"))
        op.execute(sa.text(f"ALTER TABLE {table_name} ADD UNIQUE INDEX {old_name} ({field})"))
