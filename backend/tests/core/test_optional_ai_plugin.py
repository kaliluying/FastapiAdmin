import json
import tomllib
from pathlib import Path

from app.core import plugins
from app.core.plugins import filter_ai_seed_data, get_ai_routers


def test_disabled_ai_plugin_is_not_registered(monkeypatch):
    """禁用 AI 后，清单注册器不应加载 /ai 路由。"""
    monkeypatch.setenv("AI_ENABLE", "false")

    routers = get_ai_routers()

    assert not any(route.path.startswith("/ai") for router in routers for route in router.routes)


def test_core_application_excludes_ai_routes_when_disabled(monkeypatch):
    """核心应用在 AI 关闭时不应注册任何 AI 路由。"""
    from main import create_app

    monkeypatch.setenv("AI_ENABLE", "false")
    app = create_app()

    assert not any(route.path.startswith("/ai") for route in app.routes)


def test_disabled_ai_plugin_seed_data_excludes_ai_entries(monkeypatch):
    """禁用 AI 后，初始菜单和角色权限不应生成失效入口。"""
    monkeypatch.setenv("AI_ENABLE", "false")
    menu_data = json.loads(Path("app/scripts/data/platform_menu.json").read_text(encoding="utf-8"))
    role_menu_data = json.loads(Path("app/scripts/data/sys_role_menus.json").read_text(encoding="utf-8"))

    filtered_menu = filter_ai_seed_data("platform_menu", menu_data)
    filtered_roles = filter_ai_seed_data("sys_role_menus", role_menu_data)

    serialized_menu = json.dumps(filtered_menu, ensure_ascii=False)
    serialized_roles = json.dumps(filtered_roles, ensure_ascii=False)
    assert "module_ai" not in serialized_menu
    assert '"route_name": "AI"' not in serialized_roles


def test_ai_dependencies_are_an_optional_extra():
    """AI packages must not be installed with the core backend profile."""
    pyproject_path = Path(__file__).parents[2] / "pyproject.toml"
    pyproject = tomllib.loads(pyproject_path.read_text(encoding="utf-8"))
    required_modules = {
        "chromadb",
        "fastembed",
        "jieba",
        "langchain-anthropic",
        "langchain-core",
        "langchain-openai",
        "openai",
        "pypdf",
        "python-docx",
        "whoosh",
    }
    base_dependencies = {dependency.split("=", maxsplit=1)[0].split(">", maxsplit=1)[0].split("<", maxsplit=1)[0] for dependency in pyproject["project"]["dependencies"]}
    ai_dependencies = {dependency.split("=", maxsplit=1)[0].split(">", maxsplit=1)[0].split("<", maxsplit=1)[0] for dependency in pyproject["project"]["optional-dependencies"]["ai"]}

    assert required_modules <= ai_dependencies
    assert not base_dependencies & required_modules
    manifest = tomllib.loads((Path(__file__).parents[2] / "app/plugin/module_ai/plugin.toml").read_text(encoding="utf-8"))
    assert manifest["optional"] is True
    assert manifest["enabled_env"] == "AI_ENABLE"


def test_enabled_ai_plugin_skips_when_optional_dependencies_are_missing(monkeypatch):
    """AI enabled without its extra must degrade to the core backend safely."""
    original_find_spec = plugins.importlib.util.find_spec

    def find_spec(module_name: str):
        if module_name == "chromadb":
            return None
        return original_find_spec(module_name)

    monkeypatch.setenv("AI_ENABLE", "true")
    monkeypatch.setattr(plugins.importlib.util, "find_spec", find_spec)
    assert not plugins.is_ai_plugin_enabled()
