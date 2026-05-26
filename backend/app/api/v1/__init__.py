"""数据模型层 — 统一导入入口

本模块集中导出所有 ORM 模型，方便 Alembic 迁移脚本、
Service 层及其他模块引用。

模型自动发现机制（ImportUtil.find_models）已覆盖以下路径：
- app/api/v1/module_system/*/model.py
- app/plugin/*/model.py
- app/plugin/*/*/model.py

新增模型可直接参考已有文件完成定义。
"""

from app.api.v1.module_system.dept.model import DeptModel
from app.api.v1.module_system.dict.model import DictDataModel, DictTypeModel
from app.api.v1.module_system.log.model import OperationLogModel
from app.api.v1.module_system.menu.model import MenuModel
from app.api.v1.module_system.notice.model import NoticeModel
from app.api.v1.module_system.params.model import ParamsModel
from app.api.v1.module_system.position.model import PositionModel
from app.api.v1.module_system.role.model import RoleDeptsModel, RoleMenusModel, RoleModel
from app.api.v1.module_system.tenant.model import TenantModel, TenantUserModel
from app.api.v1.module_system.user.model import (
    UserModel,
    UserPositionsModel,
    UserRolesModel,
)

__all__ = [
    "DeptModel",
    "DictDataModel",
    "DictTypeModel",
    "MenuModel",
    "NoticeModel",
    "OperationLogModel",
    "ParamsModel",
    "PositionModel",
    "RoleDeptsModel",
    "RoleMenusModel",
    "RoleModel",
    "TenantModel",
    "TenantUserModel",
    "UserModel",
    "UserPositionsModel",
    "UserRolesModel",
]
