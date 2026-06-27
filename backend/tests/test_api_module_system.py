"""
module_system API route tests.

The single-organization build keeps auth, user, role, dept, dict, params, and log
routes. Legacy tenant-selection auth routes must remain unregistered.
"""

from conftest import assert_route
from fastapi.testclient import TestClient


class TestAuth:
    """Authentication routes."""

    def test_auth_captcha(self, test_client: TestClient) -> None:
        assert_route(test_client, "GET", "/system/auth/captcha/get")

    def test_auth_login(self, test_client: TestClient) -> None:
        assert_route(
            test_client,
            "POST",
            "/system/auth/login",
            data={"username": "admin", "password": "admin123"},
            expected_status=200,
        )

    def test_auth_logout(self, test_client: TestClient, auth_headers: dict) -> None:
        assert_route(test_client, "POST", "/system/auth/logout", auth=auth_headers, json={"token": "mock_token"})

    def test_auth_refresh(self, test_client: TestClient) -> None:
        assert_route(test_client, "POST", "/system/auth/token/refresh", json={"refresh_token": "mock_refresh_token"})

    def test_legacy_tenant_auth_routes_are_removed(self, test_client: TestClient, auth_headers: dict) -> None:
        assert_route(test_client, "GET", "/system/auth/tenants", expected_status=404, auth=auth_headers)
        assert_route(
            test_client,
            "POST",
            "/system/auth/select-tenant",
            expected_status=404,
            auth=auth_headers,
            json={"tenant_id": 1},
        )
        assert_route(
            test_client,
            "POST",
            "/system/auth/tenant/register",
            expected_status=404,
            json={"name": "test", "username": "admin", "password": "admin123"},
        )

    def test_auth_auto_login_users(self, test_client: TestClient, auth_headers: dict) -> None:
        assert_route(test_client, "GET", "/system/auth/auto-login/users", auth=auth_headers)

    def test_auth_auto_login_token(self, test_client: TestClient, auth_headers: dict) -> None:
        assert_route(test_client, "POST", "/system/auth/auto-login/token?user_id=1", auth=auth_headers)


class TestSystemRoutes:
    """Core system management routes that remain registered."""

    def test_user_routes(self, test_client: TestClient, auth_headers: dict) -> None:
        assert_route(test_client, "GET", "/system/user/current/info", auth=auth_headers)
        assert_route(test_client, "GET", "/system/user/list", auth=auth_headers)
        assert_route(test_client, "GET", "/system/user/detail/1", auth=auth_headers)

    def test_role_routes(self, test_client: TestClient, auth_headers: dict) -> None:
        assert_route(test_client, "GET", "/system/role/list", auth=auth_headers)
        assert_route(test_client, "GET", "/system/role/detail/1", auth=auth_headers)

    def test_dept_routes(self, test_client: TestClient, auth_headers: dict) -> None:
        assert_route(test_client, "GET", "/system/dept/tree", auth=auth_headers)
        assert_route(test_client, "GET", "/system/dept/detail/1", auth=auth_headers)

    def test_dict_routes(self, test_client: TestClient, auth_headers: dict) -> None:
        assert_route(test_client, "GET", "/system/dict/type/list", auth=auth_headers)
        assert_route(test_client, "GET", "/system/dict/data/info/sys_normal_disable", auth=auth_headers)

    def test_params_routes(self, test_client: TestClient, auth_headers: dict) -> None:
        assert_route(test_client, "GET", "/system/param/list", auth=auth_headers)
        assert_route(test_client, "GET", "/system/param/info", auth=auth_headers)

    def test_log_routes(self, test_client: TestClient, auth_headers: dict) -> None:
        assert_route(test_client, "GET", "/system/log/login/list", auth=auth_headers)
        assert_route(test_client, "GET", "/system/log/operation/list", auth=auth_headers)


class TestRemovedSystemRoutes:
    """Legacy system modules removed from the single-organization skeleton."""

    def test_notice_position_ticket_routes_are_removed(self, test_client: TestClient, auth_headers: dict) -> None:
        assert_route(test_client, "GET", "/system/notice/list", expected_status=404, auth=auth_headers)
        assert_route(test_client, "GET", "/system/position/list", expected_status=404, auth=auth_headers)
        assert_route(test_client, "GET", "/system/ticket/list", expected_status=404, auth=auth_headers)
