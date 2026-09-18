import json
import tomllib
from pathlib import Path

import pytest

from app.core import plugins
from app.core.plugins import get_ai_routers


def test_ai_routes_are_registered_even_when_legacy_switch_is_false(monkeypatch):
    """The former AI_ENABLE switch must not disable the core AI routes."""
    monkeypatch.setenv("AI_ENABLE", "false")

    routers = get_ai_routers()

    assert any(route.path.startswith("/ai") for router in routers for route in router.routes)


def test_core_application_always_registers_ai_routes(monkeypatch):
    """The main application always exposes the AI module routes."""
    from main import create_app

    monkeypatch.setenv("AI_ENABLE", "false")
    app = create_app()

    assert any(route.path.startswith("/ai") for route in app.routes)


def test_ai_seed_data_is_part_of_the_core_runtime():
    """AI menus and role grants remain in the seed data without a runtime filter."""
    menu_data = json.loads(Path("app/scripts/data/platform_menu.json").read_text(encoding="utf-8"))
    role_menu_data = json.loads(Path("app/scripts/data/sys_role_menus.json").read_text(encoding="utf-8"))

    serialized_menu = json.dumps(menu_data, ensure_ascii=False)
    serialized_roles = json.dumps(role_menu_data, ensure_ascii=False)
    assert "module_ai" in serialized_menu
    assert '"route_name": "AI"' in serialized_roles


def test_ai_dependencies_are_core_dependencies():
    """AI packages and manifest metadata are no longer optional."""
    pyproject_path = Path(__file__).parents[2] / "pyproject.toml"
    pyproject = tomllib.loads(pyproject_path.read_text(encoding="utf-8"))
    required_dependencies = {
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

    assert required_dependencies <= base_dependencies
    assert "optional-dependencies" not in pyproject["project"]

    manifest = tomllib.loads((Path(__file__).parents[2] / "app/plugin/module_ai/plugin.toml").read_text(encoding="utf-8"))
    assert "optional" not in manifest
    assert "enabled_env" not in manifest


def test_missing_core_ai_dependency_fails_fast(monkeypatch):
    """A missing core AI package must stop startup instead of degrading silently."""
    original_find_spec = plugins.importlib.util.find_spec

    def find_spec(module_name: str):
        if module_name == "chromadb":
            return None
        return original_find_spec(module_name)

    monkeypatch.setattr(plugins.importlib.util, "find_spec", find_spec)

    with pytest.raises(RuntimeError, match="核心依赖缺失"):
        plugins.ensure_ai_dependencies()
