"""add client column to sys_menu

Revision ID: 002
Revises: 001
Create Date: 2026-05-23
"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "002"
down_revision: str | None = "001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "sys_menu",
        sa.Column(
            "client",
            sa.String(20),
            nullable=False,
            server_default="pc",
            comment="终端(pc:管理端桌面 app:移动端)",
        ),
    )


def downgrade() -> None:
    op.drop_column("sys_menu", "client")
