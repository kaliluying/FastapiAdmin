"""Harden menu configuration invariants and remove unused fields.

Revision ID: 000000000002
Revises: 000000000001
Create Date: 2026-07-30 21:20:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "000000000002"
down_revision: str | None = "000000000001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _schema_state() -> tuple[set[str], set[str], set[str]]:
    """Read current menu-table columns and named constraints.

    Returns:
        Tuple of column names, unique-constraint names, and check-constraint
        names, so the migration works with the live-model baseline on fresh
        installations as well as existing databases.
    """
    inspector = sa.inspect(op.get_bind())
    columns = {column["name"] for column in inspector.get_columns("platform_menu")}
    unique_constraints = {
        constraint["name"]
        for constraint in inspector.get_unique_constraints("platform_menu")
        if constraint.get("name")
    }
    check_constraints = {
        constraint["name"]
        for constraint in inspector.get_check_constraints("platform_menu")
        if constraint.get("name")
    }
    return columns, unique_constraints, check_constraints


def upgrade() -> None:
    columns, unique_constraints, check_constraints = _schema_state()
    with op.batch_alter_table("platform_menu") as batch:
        if "params" in columns:
            batch.drop_column("params")
        if "always_show" in columns:
            batch.drop_column("always_show")
        if "uq_platform_menu_route_name" not in unique_constraints:
            batch.create_unique_constraint("uq_platform_menu_route_name", ["route_name"])
        if "uq_platform_menu_parent_route_path" not in unique_constraints:
            batch.create_unique_constraint("uq_platform_menu_parent_route_path", ["parent_id", "route_path"])
        if "ck_platform_menu_type" not in check_constraints:
            batch.create_check_constraint("ck_platform_menu_type", "type IN (1, 2, 3, 4)")


def downgrade() -> None:
    columns, unique_constraints, check_constraints = _schema_state()
    with op.batch_alter_table("platform_menu") as batch:
        if "ck_platform_menu_type" in check_constraints:
            batch.drop_constraint("ck_platform_menu_type", type_="check")
        if "uq_platform_menu_parent_route_path" in unique_constraints:
            batch.drop_constraint("uq_platform_menu_parent_route_path", type_="unique")
        if "uq_platform_menu_route_name" in unique_constraints:
            batch.drop_constraint("uq_platform_menu_route_name", type_="unique")
        if "always_show" not in columns:
            batch.add_column(sa.Column("always_show", sa.Boolean(), nullable=False, server_default=sa.false()))
        if "params" not in columns:
            batch.add_column(sa.Column("params", sa.JSON(), nullable=True))
