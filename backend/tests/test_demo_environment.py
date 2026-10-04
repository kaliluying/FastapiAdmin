"""开发范例的环境隔离：路由、种子与历史授权。"""

from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.v1.module_system.user.service import UserService
from app.common.enums import EnvironmentEnum
from app.config.setting import settings
from app.core.base_schema import AuthSchema
from app.init_app import register_routers
from app.scripts.initialize import InitializeData


@pytest.mark.parametrize("environment", [EnvironmentEnum.DEV, EnvironmentEnum.PROD])
def test_demo_routes_follow_environment(monkeypatch, environment):
    monkeypatch.setattr(settings, "ENVIRONMENT", environment)
    app = FastAPI()
    register_routers(app)
    paths = {route.path for route in app.routes}
    assert ("/demo/category/list" in paths) == (environment == EnvironmentEnum.DEV)
    assert "/system/user/current/info" in paths
    assert "/ai/chat/ai-chat" in paths
    if environment == EnvironmentEnum.PROD:
        with TestClient(app) as client:
            for method, path in [
                ("GET", "/demo/category/list"),
                ("GET", "/demo/category/detail/1"),
                ("POST", "/demo/category/create"),
                ("PUT", "/demo/category/update/1"),
                ("DELETE", "/demo/category/delete"),
            ]:
                assert client.request(method, path).status_code == 404


@pytest.mark.parametrize("environment", [EnvironmentEnum.DEV, EnvironmentEnum.PROD])
async def test_demo_menu_seed_follows_environment(monkeypatch, environment):
    monkeypatch.setattr(settings, "ENVIRONMENT", environment)
    menus = await InitializeData()._InitializeData__load_json("platform_menu")
    names = {menu["route_name"] for menu in menus}
    assert ("Demo" in names) == (environment == EnvironmentEnum.DEV)
    assert len(names - {"Demo"}) > 0


@pytest.mark.parametrize("environment", [EnvironmentEnum.DEV, EnvironmentEnum.PROD])
def test_legacy_demo_grants_are_not_returned_in_production(monkeypatch, environment):
    monkeypatch.setattr(settings, "ENVIRONMENT", environment)
    user = SimpleNamespace(is_superuser=False, roles=[SimpleNamespace(status=0, menus=[
        SimpleNamespace(status=0, permission="module_demo:category:query"),
        SimpleNamespace(status=0, permission="module_system:user:query"),
    ])])
    permissions = UserService(AuthSchema(user=user))._collect_permissions()
    assert ("module_demo:category:query" in permissions) == (environment == EnvironmentEnum.DEV)
    assert "module_system:user:query" in permissions
