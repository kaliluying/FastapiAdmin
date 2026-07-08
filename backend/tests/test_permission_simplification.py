import ast
import json
import re
from collections import defaultdict
from pathlib import Path
from types import SimpleNamespace

import pytest

from app.api.v1.module_system.user import service as user_service
from app.core.base_schema import AuthSchema
from app.core.dependencies import _load_user_from_db
from app.core.permission_catalog import PERMISSION_CODES

SEED_DIR = Path(__file__).resolve().parents[1] / "app" / "scripts" / "data"
APP_DIR = Path(__file__).resolve().parents[1] / "app"


class _FakeScalarResult:
    def __init__(self, user):
        self._user = user

    def first(self):
        return self._user


class _FakeExecuteResult:
    def __init__(self, user):
        self._user = user

    def scalars(self):
        return _FakeScalarResult(self._user)


class _FakeDb:
    def __init__(self, user):
        self._user = user

    async def execute(self, _stmt):
        return _FakeExecuteResult(self._user)


def _menu(**overrides):
    data = {
        "id": 1,
        "name": "用户管理",
        "type": 2,
        "order": 1,
        "permission": "module_system:user:query",
        "route_name": "User",
        "route_path": "user",
        "component_path": "module_system/user/index",
        "title": "用户管理",
        "client": "pc",
        "scope": "single_org",
        "status": 0,
        "parent_id": None,
    }
    data.update(overrides)
    return SimpleNamespace(**data)


def _role(**overrides):
    data = {
        "id": 1,
        "name": "普通用户",
        "code": "USER",
        "order": 1,
        "status": 0,
        "data_scope": 1,
        "menus": [],
        "depts": [],
    }
    data.update(overrides)
    return SimpleNamespace(**data)


def _user(**overrides):
    data = {
        "id": 1,
        "username": "user",
        "name": "普通用户",
        "mobile": None,
        "email": None,
        "gender": "2",
        "avatar": None,
        "is_superuser": False,
        "dept": None,
        "dept_id": None,
        "roles": [],
        "status": 0,
        "description": None,
    }
    data.update(overrides)
    return SimpleNamespace(**data)


@pytest.mark.asyncio
async def test_load_user_from_db_keeps_enabled_roles_and_drops_disabled_roles():
    enabled_role = _role(id=1, code="USER", status=0)
    disabled_role = _role(id=2, code="DISABLED", status=1)
    user = _user(roles=[enabled_role, disabled_role])

    loaded = await _load_user_from_db(_FakeDb(user), "user")

    assert loaded.roles == [enabled_role]


@pytest.mark.asyncio
async def test_current_info_returns_flat_permissions_from_enabled_role_menus(monkeypatch):
    page_menu = _menu(
        id=10,
        permission="module_system:user:query",
        route_name="User",
        route_path="user",
        component_path="module_system/user/index",
    )
    button_menu = _menu(
        id=11,
        name="新增",
        title="新增",
        type=3,
        order=1,
        permission="module_system:user:create",
        route_name=None,
        route_path=None,
        component_path=None,
        parent_id=10,
    )
    disabled_menu = _menu(
        id=12,
        name="停用",
        title="停用",
        type=3,
        order=2,
        permission="module_system:user:delete",
        status=1,
        route_name=None,
        route_path=None,
        component_path=None,
        parent_id=10,
    )
    role = _role(menus=[page_menu, button_menu, disabled_menu])
    current_user = _user(roles=[role])

    class FakeUserCRUD:
        def __init__(self, _auth):
            pass

        async def get(self, id):
            assert id == current_user.id
            return current_user

    class FakeMenuCRUD:
        def __init__(self, _auth):
            pass

        async def tree_list(self, **_kwargs):
            return [page_menu, button_menu]

    monkeypatch.setattr(user_service, "UserCRUD", FakeUserCRUD)
    monkeypatch.setattr(user_service, "MenuCRUD", FakeMenuCRUD)

    result = await user_service.UserService(AuthSchema(user=current_user)).current_info()

    assert result.permissions == [
        "module_system:user:create",
        "module_system:user:query",
    ]


def test_seed_roles_are_single_org_baseline_only():
    roles = json.loads((SEED_DIR / "sys_role.json").read_text(encoding="utf-8"))

    assert [role["code"] for role in roles] == ["SUPER_ADMIN", "ADMIN", "USER"]
    assert not any("tenant_id" in role for role in roles)
    assert not any(role["code"].startswith(("STAR_", "INNO_")) for role in roles)


def test_seed_users_do_not_include_historical_tenant_accounts():
    users = json.loads((SEED_DIR / "sys_user.json").read_text(encoding="utf-8"))
    user_roles = json.loads((SEED_DIR / "sys_user_roles.json").read_text(encoding="utf-8"))

    assert {user["username"] for user in users} == {"super", "admin", "user", "product", "hr"}
    assert not any("tenant_id" in user for user in users)
    assert {item["role_id"] for item in user_roles} <= {1, 2, 3}


def test_seed_data_has_no_historical_org_noise():
    historical_keywords = ("STAR_", "INNO_", "星辰", "创新")

    def walk(value):
        if isinstance(value, dict):
            assert "tenant_id" not in value
            for item in value.values():
                walk(item)
        elif isinstance(value, list):
            for item in value:
                walk(item)

    for path in SEED_DIR.glob("*.json"):
        text = path.read_text(encoding="utf-8")
        assert not any(keyword in text for keyword in historical_keywords), path.name
        walk(json.loads(text))


def test_seed_buttons_are_permission_resources_not_routes():
    menus = json.loads((SEED_DIR / "platform_menu.json").read_text(encoding="utf-8"))
    buttons = []

    def walk(nodes):
        for node in nodes:
            if node.get("type") == 3:
                buttons.append(node)
            walk(node.get("children") or [])

    walk(menus)

    assert buttons
    assert all(button.get("permission") for button in buttons)
    assert all(not button.get("route_path") for button in buttons)
    assert all(not button.get("route_name") for button in buttons)
    assert all(not button.get("component_path") for button in buttons)


def test_permission_codes_are_scoped_and_only_reused_within_same_page():
    menus = json.loads((SEED_DIR / "platform_menu.json").read_text(encoding="utf-8"))
    permissions_by_code = defaultdict(list)

    def walk(nodes, page_key: str | None = None):
        for node in nodes:
            current_page_key = page_key
            if node.get("type") == 2:
                current_page_key = node.get("route_name") or node.get("route_path") or node.get("name")
            if node.get("permission"):
                permissions_by_code[node["permission"]].append(
                    {
                        "type": node.get("type"),
                        "page_key": current_page_key,
                        "name": node.get("name"),
                    }
                )
            walk(node.get("children") or [], current_page_key)

    walk(menus)

    assert all(
        permission.startswith(("module_system:", "module_platform:", "module_ai:", "module_common:"))
        for permission in permissions_by_code
    )

    duplicates = {code: entries for code, entries in permissions_by_code.items() if len(entries) > 1}
    assert duplicates
    assert all(len({entry["page_key"] for entry in entries}) == 1 for entries in duplicates.values())
    assert all({entry["type"] for entry in entries} <= {2, 3} for entries in duplicates.values())


def test_menu_permissions_are_declared_in_permission_catalog():
    menus = json.loads((SEED_DIR / "platform_menu.json").read_text(encoding="utf-8"))
    menu_permissions = set()

    def walk(nodes):
        for node in nodes:
            if node.get("permission"):
                menu_permissions.add(node["permission"])
            walk(node.get("children") or [])

    walk(menus)

    missing = sorted(menu_permissions - PERMISSION_CODES)
    assert not missing


def test_backend_permission_dependencies_are_declared_in_permission_catalog():
    used_permissions = set()
    for path in APP_DIR.rglob("*.py"):
        if "__pycache__" in path.parts:
            continue
        if path.name == "permission_catalog.py":
            continue
        tree = ast.parse(path.read_text(encoding="utf-8-sig"))
        for node in ast.walk(tree):
            if not isinstance(node, ast.Call):
                continue
            if not isinstance(node.func, ast.Name) or node.func.id != "AuthPermission":
                continue
            if not node.args or not isinstance(node.args[0], ast.List):
                continue
            for item in node.args[0].elts:
                if isinstance(item, ast.Constant) and isinstance(item.value, str):
                    used_permissions.add(item.value)

    missing = sorted(used_permissions - PERMISSION_CODES)
    assert not missing


def test_chat_http_routes_use_explicit_permission_dependencies():
    controller = (APP_DIR / "plugin" / "module_ai" / "chat" / "controller.py").read_text(encoding="utf-8")

    assert not re.search(r"Depends\(get_current_user\)", controller)
    for permission in [
        "module_ai:session:detail",
        "module_ai:session:query",
        "module_ai:chat:create",
        "module_ai:chat:update",
        "module_ai:session:delete",
        "module_ai:chat:ws",
        "module_ai:model_config:query",
    ]:
        assert permission in controller
