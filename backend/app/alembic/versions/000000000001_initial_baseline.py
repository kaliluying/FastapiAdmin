"""initial baseline schema

Revision ID: 000000000001
Revises:
Create Date: 2026-07-01 20:20:00.000000

"""

from collections.abc import Sequence

from sqlalchemy import MetaData

from alembic import op
from app.api.v1.module_platform.menu.model import MenuModel
from app.api.v1.module_system.dict.model import DictDataModel, DictTypeModel
from app.api.v1.module_system.log.model import LoginLogModel, OperationLogModel
from app.api.v1.module_system.params.model import ParamsModel
from app.api.v1.module_system.role.model import RoleMenusModel, RoleModel
from app.api.v1.module_system.user.model import UserModel, UserRolesModel

revision: str = "000000000001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


CORE_MODELS = (
    MenuModel,
    DictTypeModel,
    DictDataModel,
    LoginLogModel,
    OperationLogModel,
    ParamsModel,
    RoleMenusModel,
    RoleModel,
    UserRolesModel,
    UserModel,
)


def _baseline_metadata() -> MetaData:
    """Build the stable schema for a core-only installation.

    Returns:
        The metadata for tables that are always part of the admin backend.

    The AI plugin owns its tables and creates them only when enabled during
    application initialization. Keeping plugin models out of this historical
    migration makes a core-only Alembic upgrade independent of optional code.
    """
    metadata = MetaData()

    for model in CORE_MODELS:
        model.__table__.to_metadata(metadata)

    return metadata


def upgrade() -> None:
    metadata = _baseline_metadata()
    metadata.create_all(bind=op.get_bind())


def downgrade() -> None:
    metadata = _baseline_metadata()
    metadata.drop_all(bind=op.get_bind())
