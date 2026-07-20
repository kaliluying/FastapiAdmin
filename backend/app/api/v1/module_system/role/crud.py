from app.api.v1.module_platform.menu.crud import MenuCRUD
from app.core.base_crud import CRUDBase
from app.core.base_schema import AuthSchema
from app.core.exceptions import CustomException

from .model import RoleModel
from .schema import RoleCreateSchema, RoleUpdateSchema


class RoleCRUD(CRUDBase[RoleModel, RoleCreateSchema, RoleUpdateSchema]):
    """角色模块数据层"""

    def __init__(self, auth: AuthSchema) -> None:
        super().__init__(model=RoleModel, auth=auth)

    async def set_role_menus_crud(self, role_ids: list[int], menu_ids: list[int]) -> None:
        """
        设置角色的菜单权限

        参数:
        - role_ids (list[int]): 角色ID列表
        - menu_ids (list[int]): 菜单ID列表

        返回:
        - None
        """
        requested_role_ids = set(role_ids)
        roles = await self.get_list(search={"id": ("in", list(requested_role_ids))})
        if len(roles) != len(requested_role_ids):
            raise CustomException(msg="设置角色菜单失败，部分角色不存在或无权操作")

        requested_menu_ids = set(menu_ids)
        if requested_menu_ids:
            menus = await MenuCRUD(self.auth).get_list(search={"id": ("in", list(requested_menu_ids))})
            if len(menus) != len(requested_menu_ids):
                raise CustomException(msg="设置角色菜单失败，部分菜单不存在或无权操作")
        else:
            menus = []

        for obj in roles:
            relationship = obj.menus
            relationship.clear()
            relationship.extend(menus)
        await self.auth.db.flush()
