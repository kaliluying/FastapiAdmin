from typing import Any

from app.core.base_schema import AuthSchema, BatchSetAvailable
from app.core.dependencies import require_superadmin
from app.core.exceptions import CustomException
from app.core.plugins import filter_ai_seed_data
from app.utils.common_util import (
    get_child_id_map,
    get_child_recursion,
    get_parent_id_map,
    get_parent_recursion,
    traversal_to_tree,
)

from .crud import MenuCRUD
from .schema import (
    MenuCreateSchema,
    MenuOutSchema,
    MenuQueryParam,
    MenuTreeOutSchema,
    MenuUpdateSchema,
)

_RESERVED_ROOT_ROUTE_SEGMENTS = frozenset(
    {"auth", "changelog", "home", "login", "outside", "profile", "redirect", "401", "403", "404", "500"}
)


class MenuService:
    """菜单管理服务（查询操作登录用户可见，写操作仅超级管理员可操作）"""

    def __init__(self, auth: AuthSchema) -> None:
        self.auth = auth

    @staticmethod
    def _is_child_type_allowed(parent_type: int | None, child_type: int) -> bool:
        """Return whether a menu type may be placed under the given parent type.

        Args:
            parent_type: Parent menu type, or ``None`` for a root node.
            child_type: Candidate child menu type.

        Returns:
            ``True`` when the tree relation is valid.
        """
        if parent_type is None:
            return child_type in (1, 2, 4)
        if parent_type == 1:
            return child_type in (1, 2, 4)
        return parent_type == 2 and child_type == 3

    async def _validate_menu_definition(
        self,
        data: MenuCreateSchema,
        existing_id: int | None = None,
    ) -> None:
        """Validate tree integrity and route identities before a menu write.

        Args:
            data: Fully materialized menu definition to persist.
            existing_id: Current menu ID during an update, if any.

        Raises:
            CustomException: If the update creates a cycle, invalid hierarchy,
                duplicate routing identity, or invalid child relation.
        """
        menus = await MenuCRUD(self.auth).get_list()
        menu_by_id = {menu.id: menu for menu in menus}

        if data.parent_id is not None:
            parent = menu_by_id.get(data.parent_id)
            if not parent:
                raise CustomException(msg="父级菜单不存在")
            if existing_id is not None and data.parent_id == existing_id:
                raise CustomException(msg="父级菜单不能是当前菜单")
            if not self._is_child_type_allowed(parent.type, data.type):
                raise CustomException(msg="父级菜单不允许当前菜单类型")
        elif not self._is_child_type_allowed(None, data.type):
            raise CustomException(msg="顶级菜单仅允许目录、菜单或外链类型")

        if data.parent_id is None and data.route_path:
            root_segment = data.route_path.strip("/").split("/", 1)[0]
            if root_segment in _RESERVED_ROOT_ROUTE_SEGMENTS:
                raise CustomException(msg="路由路径与系统保留页面冲突")

        # Walk the candidate parent chain. This catches both an attempted move
        # under a descendant and already-corrupt cycles encountered on the path.
        visited: set[int] = set()
        parent_id = data.parent_id
        while parent_id is not None:
            if parent_id in visited:
                raise CustomException(msg="菜单层级存在循环引用")
            if existing_id is not None and parent_id == existing_id:
                raise CustomException(msg="父级菜单不能是当前菜单的子菜单")
            visited.add(parent_id)
            parent = menu_by_id.get(parent_id)
            if not parent:
                raise CustomException(msg="父级菜单不存在")
            parent_id = parent.parent_id

        if data.route_name:
            duplicate_name = next(
                (
                    menu
                    for menu in menus
                    if menu.id != existing_id and menu.route_name == data.route_name
                ),
                None,
            )
            if duplicate_name:
                raise CustomException(msg="路由名称已存在")

        if data.route_path:
            duplicate_path = next(
                (
                    menu
                    for menu in menus
                    if menu.id != existing_id
                    and menu.parent_id == data.parent_id
                    and menu.route_path == data.route_path
                ),
                None,
            )
            if duplicate_path:
                raise CustomException(msg="同级路由路径已存在")

        # Type changes must remain compatible with every existing direct child.
        if existing_id is not None:
            invalid_child = next(
                (
                    menu
                    for menu in menus
                    if menu.parent_id == existing_id and not self._is_child_type_allowed(data.type, menu.type)
                ),
                None,
            )
            if invalid_child:
                raise CustomException(msg="当前菜单仍包含与新类型不兼容的子菜单")

    async def detail(self, id: int) -> MenuOutSchema:
        menu = await MenuCRUD(self.auth).get(id=id, preload=["roles"])
        if not menu:
            raise CustomException(msg="菜单不存在")
        menu_out = MenuOutSchema.model_validate(menu)
        if menu.parent_id:
            parent = await MenuCRUD(self.auth).get(id=menu.parent_id)
            if parent:
                menu_out.parent_name = parent.name
        return menu_out

    async def tree(
        self,
        search: MenuQueryParam | None = None,
        order_by: list[dict] | None = None,
    ) -> list[dict]:
        menu_list = await MenuCRUD(self.auth).tree_list(search=vars(search) if search else None, order_by=order_by)
        menu_dict_list = [MenuTreeOutSchema.model_validate(menu).model_dump() for menu in menu_list]
        # Existing databases can retain AI menus after the optional plugin is disabled.
        menu_dict_list = filter_ai_seed_data("platform_menu", menu_dict_list)
        return traversal_to_tree(menu_dict_list)

    @require_superadmin
    async def create(self, data: MenuCreateSchema) -> MenuOutSchema:
        search: dict[str, Any] = {}
        if data.title is not None:
            search["title"] = data.title
            if data.parent_id is not None:
                search["parent_id"] = data.parent_id
            menu = await MenuCRUD(self.auth).get(**search)
            if menu:
                raise CustomException(msg="创建失败，该菜单已存在")

        await self._validate_menu_definition(data)

        new_menu = await MenuCRUD(self.auth).create(data=data)
        return MenuOutSchema.model_validate(new_menu)

    @require_superadmin
    async def update(self, id: int, data: MenuUpdateSchema) -> MenuOutSchema:
        current = await MenuCRUD(self.auth).get_or_404(id=id, msg="更新失败，该菜单不存在")
        merged = MenuOutSchema.model_validate(current).model_dump()
        merged.update(data.model_dump(exclude_unset=True, exclude={"parent_name"}))
        candidate = MenuCreateSchema(**merged)
        await self._validate_menu_definition(candidate, existing_id=id)

        if {"title", "parent_id"} & data.model_fields_set and candidate.title is not None:
            siblings = await MenuCRUD(self.auth).get_list()
            if any(
                menu.id != id and menu.parent_id == candidate.parent_id and menu.title == candidate.title
                for menu in siblings
            ):
                raise CustomException(msg="更新失败，菜单标题重复")

        new_menu = await MenuCRUD(self.auth).update(id=id, data=candidate)

        if candidate.status != current.status:
            await self.set_available(data=BatchSetAvailable(ids=[id], status=candidate.status))

        menu_out = MenuOutSchema.model_validate(new_menu)
        if menu_out.parent_id:
            parent = await MenuCRUD(self.auth).get(id=menu_out.parent_id)
            if parent:
                menu_out.parent_name = parent.name
        return menu_out

    @require_superadmin
    async def delete(self, ids: list[int]) -> None:
        if len(ids) < 1:
            raise CustomException(msg="删除失败，删除对象不能为空")

        all_menus = await MenuCRUD(self.auth).get_list()
        child_id_map = get_child_id_map(model_list=all_menus)

        delete_ids_set = set()
        for mid in ids:
            all_descendants = get_child_recursion(id=mid, id_map=child_id_map)
            delete_ids_set.update(all_descendants)

        delete_ids = list(delete_ids_set)
        await MenuCRUD(self.auth).delete(ids=delete_ids)

    @require_superadmin
    async def set_available(self, data: BatchSetAvailable) -> None:
        menu_list = await MenuCRUD(self.auth).get_list()
        menu_ids = {menu.id for menu in menu_list}
        missing_ids = set(data.ids) - menu_ids
        if missing_ids:
            raise CustomException(msg="菜单不存在")

        total_ids: set[int] = set()

        if data.status == 0:
            id_map = get_parent_id_map(model_list=menu_list)
            for menu_id in data.ids:
                enable_ids = get_parent_recursion(id=menu_id, id_map=id_map)
                total_ids.update(enable_ids)
        else:
            id_map = get_child_id_map(model_list=menu_list)
            for menu_id in data.ids:
                disable_ids = get_child_recursion(id=menu_id, id_map=id_map)
                total_ids.update(disable_ids)

        await MenuCRUD(self.auth).set(ids=list(total_ids), status=data.status)
