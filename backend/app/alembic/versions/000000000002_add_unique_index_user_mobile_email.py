"""add unique index to user mobile and email

Revision ID: 000000000002
Revises: 000000000001
Create Date: 2026-07-09 09:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "000000000002"
down_revision: str | None = "000000000001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_index(op.f("ix_sys_user_mobile"), "sys_user", ["mobile"], unique=True)
    op.create_index(op.f("ix_sys_user_email"), "sys_user", ["email"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_sys_user_email"), table_name="sys_user")
    op.drop_index(op.f("ix_sys_user_mobile"), table_name="sys_user")
