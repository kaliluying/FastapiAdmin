from typing import Any

from app.core.base_schema import AuthSchema, BatchSetAvailable
from app.core.dependencies import require_superadmin
from app.core.exceptions import CustomException
from app.utils.excel_util import ExcelUtil

from .crud import RoleCRUD
from .schema import (
    RoleCreateSchema,
    RoleOutSchema,
    RolePermissionSettingSchema,
    RoleQueryParam,
    RoleUpdateSchema,
)


class RoleService:
    """角色管理服务。

    提供角色 CRUD、权限配置、数据权限范围设置、批量启/禁用、Excel 导出等业务能力。
    """

    def __init__(self, auth: AuthSchema) -> None:
        self.auth = auth

    @staticmethod
    def _ensure_system_role_protected(role_ids: list[int]) -> None:
        """拒绝修改内置超级管理员角色。

        Args:
            role_ids: 本次写操作涉及的角色 ID。

        Raises:
            CustomException: 目标包含内置角色。
        """
        if 1 in role_ids:
            raise CustomException(msg="系统默认角色不可修改、停用、删除或重新授权")

    async def detail(self, id: int) -> RoleOutSchema:
        """获取角色详情。

        Args:
            id (int): 角色ID

        Returns:
            RoleOutSchema: 角色详情响应模型
        """
        return await RoleCRUD(self.auth).get_or_404(id=id, out_schema=RoleOutSchema)

    async def get_list(
        self,
        search: RoleQueryParam | None = None,
        order_by: list[dict[str, str]] | None = None,
    ) -> list[RoleOutSchema]:
        """获取角色列表。

        Args:
            search (RoleQueryParam | None): 查询参数模型
            order_by (list[dict[str, str]] | None): 排序参数列表

        Returns:
            list[RoleOutSchema]: 角色响应模型列表
        """
        role_list = await RoleCRUD(self.auth).get_list(search=vars(search) if search else None, order_by=order_by)
        return [RoleOutSchema.model_validate(role) for role in role_list]

    async def page(
        self,
        page_no: int,
        page_size: int,
        search: RoleQueryParam | None = None,
        order_by: list[dict[str, str]] | None = None,
    ) -> dict:
        """分页查询角色（数据库 OFFSET/LIMIT）。

        Args:
            page_no (int): 页码（从 1 开始）
            page_size (int): 每页条数
            search (RoleQueryParam | None): 查询条件
            order_by (list[dict[str, str]] | None): 排序字段列表

        Returns:
            dict: 分页结果（结构由 ``CRUD.page`` 返回约定）
        """
        offset = (page_no - 1) * page_size
        return await RoleCRUD(self.auth).page(
            offset=offset,
            limit=page_size,
            order_by=order_by or [{"id": "asc"}],
            search=vars(search) if search else None,
            out_schema=RoleOutSchema,
        )

    @require_superadmin
    async def create(self, data: RoleCreateSchema) -> RoleOutSchema:
        """创建角色。

        Args:
            data (RoleCreateSchema): 创建角色模型

        Returns:
            RoleOutSchema: 新创建的角色响应模型
        """
        role = await RoleCRUD(self.auth).get(name=data.name)
        if role:
            raise CustomException(msg="创建失败，该数据已存在")
        obj = await RoleCRUD(self.auth).get(code=data.code)
        if obj:
            raise CustomException(msg="创建失败，编码已存在")

        new_role = await RoleCRUD(self.auth).create(data=data)
        return RoleOutSchema.model_validate(new_role)

    @require_superadmin
    async def update(self, id: int, data: RoleUpdateSchema) -> RoleOutSchema:
        """更新角色。

        Args:
            id (int): 角色ID
            data (RoleUpdateSchema): 更新角色模型

        Returns:
            RoleOutSchema: 更新后的角色响应模型
        """
        self._ensure_system_role_protected([id])
        _ = await RoleCRUD(self.auth).get_or_404(id=id, msg="更新失败，该数据不存在")
        exist_role = await RoleCRUD(self.auth).get(name=data.name)
        if exist_role and exist_role.id != id:
            raise CustomException(msg="更新失败，名称已存在")
        exist_code = await RoleCRUD(self.auth).get(code=data.code)
        if exist_code and exist_code.id != id:
            raise CustomException(msg="更新失败，角色编码已存在")
        updated_role = await RoleCRUD(self.auth).update(id=id, data=data)
        return RoleOutSchema.model_validate(updated_role)

    @require_superadmin
    async def delete(self, ids: list[int]) -> None:
        """删除角色。

        Args:
            ids (list[int]): 角色ID列表
        """
        if len(ids) < 1:
            raise CustomException(msg="删除失败，删除对象不能为空")
        self._ensure_system_role_protected(ids)

        # 批量校验角色存在性
        roles = await RoleCRUD(self.auth).get_list(search={"id": ("in", ids)})
        if len(roles) != len(ids):
            raise CustomException(msg="删除失败，部分ID不存在")

        await RoleCRUD(self.auth).delete(ids=ids)

    @require_superadmin
    async def set_permission(self, data: RolePermissionSettingSchema) -> None:
        """设置角色权限。

        Args:
            data (RolePermissionSettingSchema): 角色权限设置模型
        """
        self._ensure_system_role_protected(data.role_ids)
        roles = await RoleCRUD(self.auth).get_list(search={"id": ("in", data.role_ids)})
        if len(roles) != len(data.role_ids):
            raise CustomException(msg="授权失败，部分角色不存在或无权操作")

        role_ids = [role.id for role in roles]
        await RoleCRUD(self.auth).set_role_menus_crud(role_ids=role_ids, menu_ids=data.menu_ids)
        await RoleCRUD(self.auth).set(ids=role_ids, data_scope=data.data_scope)

    @require_superadmin
    async def set_available(self, data: BatchSetAvailable) -> None:
        """设置角色可用状态。

        Args:
            data (BatchSetAvailable): 批量设置可用状态模型
        """
        self._ensure_system_role_protected(data.ids)
        roles = await RoleCRUD(self.auth).get_list(search={"id": ("in", data.ids)})
        role_map = {r.id: r for r in roles}
        for rid in data.ids:
            if rid not in role_map:
                raise CustomException(msg="该数据不存在")
        await RoleCRUD(self.auth).set(ids=data.ids, status=data.status)

    @staticmethod
    def export_list(role_list: list[RoleOutSchema | dict[str, Any]]) -> bytes:
        """导出角色列表。

        Args:
            role_list (list[dict[str, Any]]): 角色详情字典列表

        Returns:
            bytes: Excel文件字节流
        """
        # 字段映射配置
        mapping_dict = {
            "id": "角色编号",
            "name": "角色名称",
            "order": "显示顺序",
            "data_scope": "数据权限",
            "status": "状态",
            "description": "备注",
            "created_time": "创建时间",
            "updated_time": "更新时间",
            "created_id": "创建者ID",
            "updated_id": "更新者ID",
        }

        # 数据权限映射
        data_scope_map = {
            1: "仅本人数据权限",
            2: "仅本人数据权限",
            3: "仅本人数据权限",
            4: "全部数据权限",
            5: "仅本人数据权限",
        }

        # 处理数据
        data = [item.model_dump() if isinstance(item, RoleOutSchema) else item.copy() for item in role_list]
        for item in data:
            item["status"] = "启用" if item.get("status") == 0 else "停用"
            item["data_scope"] = data_scope_map.get(item.get("data_scope", 1), "")

        return ExcelUtil.export_list2excel(list_data=data, mapping_dict=mapping_dict)
