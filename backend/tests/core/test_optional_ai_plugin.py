import json
from pathlib import Path

from app.config.setting import settings
from app.core import discover
from app.scripts.initialize import InitializeData


def test_disabled_ai_plugin_is_not_registered(monkeypatch):
    """禁用 AI 后，动态路由发现不应加载 /ai 路由。"""
    monkeypatch.setattr(settings, "AI_ENABLE", False)

    router = discover._build_dynamic_router()

    assert not any(route.path.startswith("/ai") for route in router.routes)


def test_disabled_ai_plugin_seed_data_excludes_ai_entries(monkeypatch):
    """禁用 AI 后，初始菜单和角色权限不应生成失效入口。"""
    monkeypatch.setattr(settings, "AI_ENABLE", False)
    menu_data = json.loads(Path("app/scripts/data/platform_menu.json").read_text(encoding="utf-8"))
    role_menu_data = json.loads(Path("app/scripts/data/sys_role_menus.json").read_text(encoding="utf-8"))

    filtered_menu = InitializeData._filter_disabled_plugin_seed_data("platform_menu", menu_data)
    filtered_roles = InitializeData._filter_disabled_plugin_seed_data("sys_role_menus", role_menu_data)

    serialized_menu = json.dumps(filtered_menu, ensure_ascii=False)
    serialized_roles = json.dumps(filtered_roles, ensure_ascii=False)
    assert "module_ai" not in serialized_menu
    assert '"route_name": "AI"' not in serialized_roles
