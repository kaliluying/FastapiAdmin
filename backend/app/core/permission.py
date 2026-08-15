from typing import Any

from sqlalchemy.sql.elements import ColumnElement

from app.common.enums import PermissionFilterStrategy
from app.core.base_schema import AuthSchema


class Permission:
    """
    为业务模型提供数据权限过滤功能

    使用策略模式，根据模型的 __permission_strategy__ 属性选择合适的过滤策略
    """

    # 数据权限常量定义，提高代码可读性
    DATA_SCOPE_SELF = 1  # 仅本人数据
    DATA_SCOPE_ALL = 4  # 全部数据

    def __init__(self, model: Any, auth: AuthSchema) -> None:
        """
        初始化权限过滤器实例

        Args:
            db: 数据库会话
            model: 数据模型类
            current_user: 当前用户对象
            auth: 认证信息对象
        """
        self.model = model
        self.auth = auth
        self.conditions: list[ColumnElement] = []  # 权限条件列表

    async def filter_query(self, query: Any) -> Any:
        """
        按数据权限为 SQLAlchemy 查询追加 WHERE 条件。

        参数:
        - query (Any): SQLAlchemy 查询对象。

        返回:
        - Any: 附加条件后的查询对象（无权限条件时原样返回）。
        """
        condition = await self.permission_condition()
        return query.where(condition) if condition is not None else query

    async def permission_condition(self) -> ColumnElement | None:
        """Build the current user's data-scope predicate.

        根据模型的权限过滤策略选择合适的过滤方法。

        Returns:
            A SQLAlchemy predicate, or ``None`` when the current context is
            explicitly allowed to access every row.
        """
        # 如果不需要检查数据权限,则不限制
        if not self.auth.user:
            return None

        # 如果检查数据权限为False,则不限制
        if not self.auth.check_data_scope:
            return None

        # 超级管理员可以查看所有数据
        if self.auth.user.is_superuser:
            return None

        # 获取模型的权限过滤策略
        strategy = getattr(
            self.model, "__permission_strategy__", PermissionFilterStrategy.DATA_SCOPE
        )

        # 根据策略选择过滤方法
        if strategy == PermissionFilterStrategy.MENU_AUTH:
            return await self.__filter_by_menu_auth()
        elif strategy == PermissionFilterStrategy.OWN:
            return await self.__filter_by_own()
        elif strategy == PermissionFilterStrategy.USER_BINDING:
            return await self.__filter_by_user_binding()
        else:
            return await self.__filter_by_data_scope()

    async def __filter_by_menu_auth(self) -> ColumnElement | None:
        """
        基于角色-菜单授权的过滤（适用于菜单模型）

        只显示用户角色授权的菜单，不再叠加额外运营级约束。
        """
        roles = [role for role in (getattr(self.auth.user, "roles", []) or []) if role.status == 0]
        if not roles:
            id_attr = getattr(self.model, "id", None)
            if id_attr is not None:
                return id_attr == -1
            return None

        menu_ids = set()
        for role in roles:
            if hasattr(role, "menus") and role.menus:
                menu_ids.update(menu.id for menu in role.menus if menu.status == 0)

        if menu_ids:
            id_attr = getattr(self.model, "id", None)
            if id_attr is not None:
                return id_attr.in_(list(menu_ids))

        id_attr = getattr(self.model, "id", None)
        if id_attr is not None:
            return id_attr == -1
        return None

    async def __filter_by_user_binding(self) -> ColumnElement | None:
        """
        基于当前用户绑定角色的过滤（适用于角色模型）

        只显示当前用户绑定的角色
        """
        roles = [role for role in (getattr(self.auth.user, "roles", []) or []) if role.status == 0]
        if not roles:
            id_attr = getattr(self.model, "id", None)
            if id_attr is not None:
                return id_attr == -1
            return None

        role_ids = [role.id for role in roles]
        id_attr = getattr(self.model, "id", None)
        if id_attr is not None:
            return id_attr.in_(role_ids)
        return None

    async def __filter_by_own(self) -> ColumnElement | None:
        """
        仅本人数据过滤
        """
        created_id_attr = getattr(self.model, "created_id", None)
        if created_id_attr is not None and self.auth.user:
            return created_id_attr == self.auth.user.id
        return None

    async def __filter_by_data_scope(self) -> ColumnElement | None:
        """
        根据角色的数据范围过滤创建人维度的数据。

        单组织版本只保留“仅本人”和“全部”两种范围。
        """
        if not hasattr(self.model, "created_id"):
            return None

        roles = [role for role in (getattr(self.auth.user, "roles", []) or []) if role.status == 0]
        if any(role.data_scope == self.DATA_SCOPE_ALL for role in roles):
            return None

        created_id_attr = getattr(self.model, "created_id", None)
        if created_id_attr is not None and self.auth.user:
            return created_id_attr == self.auth.user.id
        return None
