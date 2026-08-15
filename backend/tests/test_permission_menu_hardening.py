"""Regression coverage for menu, role, and operation-log security boundaries."""

import json
from types import SimpleNamespace

import pytest
from pydantic import ValidationError

from app.api.v1.module_platform.menu import service as menu_service
from app.api.v1.module_platform.menu.model import MenuModel
from app.api.v1.module_platform.menu.schema import MenuCreateSchema
from app.api.v1.module_system.role.schema import RolePermissionSettingSchema
from app.api.v1.module_system.role.service import RoleService
from app.api.v1.module_system.user import service as user_service
from app.api.v1.module_system.user.schema import UserUpdateSchema
from app.core.base_schema import AuthSchema
from app.core.exceptions import CustomException
from app.core.permission import Permission
from app.core.router_class import _serialize_log_value
from app.utils.common_util import get_child_recursion


def _menu(**overrides):
    """Build the menu fields required by the menu integrity service.

    Args:
        **overrides: Fields used to specialize the in-memory menu.

    Returns:
        A lightweight object with the persisted menu attributes under test.
    """
    data = {
        "id": 1,
        "type": 1,
        "parent_id": None,
        "route_name": "Root",
        "route_path": "/root",
    }
    data.update(overrides)
    return SimpleNamespace(**data)


def _directory(**overrides) -> MenuCreateSchema:
    """Build a valid directory menu request.

    Args:
        **overrides: Valid field replacements for the directory request.

    Returns:
        A validated directory menu request.
    """
    data = {
        "name": "根目录",
        "type": 1,
        "order": 1,
        "route_name": "Root",
        "route_path": "/root",
        "redirect": "/root/child",
    }
    data.update(overrides)
    return MenuCreateSchema(**data)


@pytest.mark.asyncio
async def test_menu_permission_filter_keeps_active_directory_nodes() -> None:
    """Menu data-scope filtering must retain directory nodes without permissions."""
    root = SimpleNamespace(id=1, status=0, permission=None)
    page = SimpleNamespace(id=2, status=0, permission="module:page:query")
    role = SimpleNamespace(id=1, status=0, data_scope=1, menus=[root, page])
    user = SimpleNamespace(is_superuser=False, roles=[role])

    condition = await Permission(
        MenuModel,
        AuthSchema(user=user, permission_map={"module:page:query": page.id}),
    ).permission_condition()

    assert condition is not None
    assert set(condition.right.value) == {root.id, page.id}


def test_menu_schema_rejects_wildcards_unsafe_links_and_button_routes() -> None:
    """Menu definitions must not introduce permissive permissions or unsafe routes."""
    with pytest.raises(ValidationError, match="不支持通配符"):
        MenuCreateSchema(
            name="用户管理",
            type=2,
            order=1,
            permission="module_system:*:query",
            route_name="User",
            route_path="user",
            component_path="module_system/user/index",
        )

    with pytest.raises(ValidationError, match="HTTPS"):
        MenuCreateSchema(
            name="不安全外链",
            type=4,
            order=1,
            route_name="UnsafeLink",
            route_path="unsafe-link",
            link="javascript:alert(1)",
        )

    with pytest.raises(ValidationError, match="HTTPS"):
        MenuCreateSchema(
            name="含凭据外链",
            type=4,
            order=1,
            route_name="CredentialLink",
            route_path="credential-link",
            link="https://admin:secret@example.com",
        )

    with pytest.raises(CustomException, match="不允许填写路由名称"):
        MenuCreateSchema(
            name="按钮",
            type=3,
            order=1,
            permission="module_system:user:create",
            route_name="InvalidButtonRoute",
        )


@pytest.mark.asyncio
async def test_menu_service_rejects_descendant_as_parent(monkeypatch) -> None:
    """Moving a menu under its own descendant must be rejected before persistence."""
    menus = [
        _menu(id=1, route_name="Root", route_path="/root"),
        _menu(id=2, parent_id=1, route_name="Child", route_path="child"),
        _menu(id=3, parent_id=2, route_name="Grandchild", route_path="grandchild"),
    ]

    class FakeMenuCRUD:
        """Return an in-memory menu tree for integrity checks."""

        def __init__(self, _auth) -> None:
            pass

        async def get_list(self):
            """Return the configured menu tree.

            Returns:
                The menu objects participating in this test.
            """
            return menus

    monkeypatch.setattr(menu_service, "MenuCRUD", FakeMenuCRUD)
    service = menu_service.MenuService(AuthSchema(user=SimpleNamespace(is_superuser=True)))

    with pytest.raises(CustomException, match="当前菜单的子菜单"):
        await service._validate_menu_definition(_directory(parent_id=3), existing_id=1)


@pytest.mark.asyncio
async def test_menu_service_rejects_a_type_change_that_orphans_children(monkeypatch) -> None:
    """Changing a directory into a page cannot leave directory children behind."""
    menus = [
        _menu(id=1, route_name="Root", route_path="/root"),
        _menu(id=2, parent_id=1, route_name="Child", route_path="child"),
    ]

    class FakeMenuCRUD:
        """Return an in-memory menu tree for the type-compatibility check."""

        def __init__(self, _auth) -> None:
            pass

        async def get_list(self):
            """Return the configured menu tree.

            Returns:
                The menu objects participating in this test.
            """
            return menus

    monkeypatch.setattr(menu_service, "MenuCRUD", FakeMenuCRUD)
    service = menu_service.MenuService(AuthSchema(user=SimpleNamespace(is_superuser=True)))
    page = MenuCreateSchema(
        name="根页面",
        type=2,
        order=1,
        permission="module_system:root:query",
        route_name="Root",
        route_path="/root",
        component_path="module_system/root/index",
    )

    with pytest.raises(CustomException, match="不兼容的子菜单"):
        await service._validate_menu_definition(page, existing_id=1)


@pytest.mark.asyncio
async def test_system_superadmin_role_cannot_be_reauthorized() -> None:
    """The built-in super-administrator role must stay immutable through services."""
    service = RoleService(AuthSchema(user=SimpleNamespace(is_superuser=True)))
    data = RolePermissionSettingSchema(role_ids=[1], menu_ids=[], data_scope=4)

    with pytest.raises(CustomException, match="系统默认角色不可修改"):
        await service.set_permission(data)


@pytest.mark.asyncio
async def test_non_superadmin_cannot_change_roles_before_user_write(monkeypatch) -> None:
    """Role changes must be rejected before a non-superadmin can update a user."""
    target_user = SimpleNamespace(
        id=2,
        username="target",
        is_superuser=False,
        mobile=None,
        email=None,
    )
    update_called = False

    class FakeUserCRUD:
        """Track whether the update operation is reached by an unauthorized request."""

        def __init__(self, _auth) -> None:
            pass

        async def get_or_404(self, *, id):
            """Return the target user.

            Args:
                id: Requested user ID.

            Returns:
                The in-memory target user.
            """
            assert id == target_user.id
            return target_user

        async def get(self, *, username):
            """Resolve the target user by name.

            Args:
                username: Requested username.

            Returns:
                The in-memory target user.
            """
            assert username == target_user.username
            return target_user

        async def update(self, *, id, data):
            """Fail the test if authorization did not stop the write.

            Args:
                id: User ID requested for update.
                data: Submitted user update data.

            Raises:
                AssertionError: Always, because this operation must not run.
            """
            nonlocal update_called
            update_called = True
            raise AssertionError(f"unauthorized role update reached persistence for user {id}: {data}")

    monkeypatch.setattr(user_service, "UserCRUD", FakeUserCRUD)
    service = user_service.UserService(AuthSchema(user=SimpleNamespace(is_superuser=False)))

    with pytest.raises(CustomException, match="仅超级管理员可以分配用户角色"):
        await service.update(id=target_user.id, data=UserUpdateSchema(username="target", role_ids=[]))

    assert not update_called


def test_operation_log_redacts_camel_case_and_nested_sensitive_values() -> None:
    """Audit serialization must keep credentials out of request and response logs."""
    payload = {
        "accessToken": "access-value",
        "nested": {"apiKey": "api-key", "confirmPassword": "secret"},
        "safe": "visible",
    }

    serialized = json.loads(_serialize_log_value(payload))

    assert serialized == {
        "accessToken": "***",
        "nested": {"apiKey": "***", "confirmPassword": "***"},
        "safe": "visible",
    }


def test_child_recursion_fails_closed_when_the_stored_tree_is_corrupt() -> None:
    """Recursive menu operations must stop instead of looping on corrupt data."""
    with pytest.raises(CustomException, match="循环引用"):
        get_child_recursion(1, {1: [2], 2: [1]})
