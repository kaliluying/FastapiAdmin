from datetime import datetime

from app.api.v1.module_system.role.crud import RoleCRUD
from app.core.base_crud import CRUDBase
from app.core.base_schema import AuthSchema
from app.core.exceptions import CustomException

from .model import UserModel
from .schema import (
    UserCreateSchema,
    UserUpdateSchema,
)


class UserCRUD(CRUDBase[UserModel, UserCreateSchema, UserUpdateSchema]):
    """用户模块数据层"""

    def __init__(self, auth: AuthSchema) -> None:
        super().__init__(model=UserModel, auth=auth)

    async def update_last_login(self, id: int) -> None:
        """
        更新用户最后登录时间

        参数:
        - id (int): 用户ID
        """
        await self.set([id], last_login=datetime.now())

    async def set_user_roles(self, user_ids: list[int], role_ids: list[int]) -> None:
        """
        批量设置用户角色

        参数:
        - user_ids (list[int]): 用户ID列表
        - role_ids (list[int]): 角色ID列表

        返回:
        - None
        """
        requested_user_ids = set(user_ids)
        user_objs = await self.get_list(search={"id": ("in", list(requested_user_ids))})
        if len(user_objs) != len(requested_user_ids):
            raise CustomException(msg="设置用户角色失败，部分用户不存在或无权操作")

        requested_role_ids = set(role_ids)
        if requested_role_ids:
            role_objs = await RoleCRUD(self.auth).get_list(search={"id": ("in", list(requested_role_ids))})
            if len(role_objs) != len(requested_role_ids):
                raise CustomException(msg="设置用户角色失败，部分角色不存在或无权操作")
            if any(role.status != 0 for role in role_objs):
                raise CustomException(msg="设置用户角色失败，不能分配已禁用角色")
        else:
            role_objs = []

        for obj in user_objs:
            relationship = obj.roles
            relationship.clear()
            relationship.extend(role_objs)
        await self.auth.db.flush()

    async def change_password(self, id: int, password_hash: str) -> UserModel:
        """
        修改用户密码

        参数:
        - id (int): 用户ID
        - password_hash (str): 密码哈希值

        返回:
        - UserModel: 更新后的用户信息
        """
        user = await self.get_or_404(id=id)
        user.password = password_hash
        if self.auth.user:
            user.updated_id = self.auth.user.id
        await self.auth.db.flush()
        await self.auth.db.refresh(user)
        return user
