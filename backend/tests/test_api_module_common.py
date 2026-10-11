"""
模块接口测试 —— module_common（公共模块）
每个接口一个测试用例，验证路由存在且返回码正确。
"""

from unittest.mock import Mock

import pytest
from conftest import assert_route
from fastapi.testclient import TestClient


class TestHealth:
    """健康检查接口。"""

    def test_health_check(self, test_client: TestClient) -> None:
        assert_route(test_client, "GET", "/common/health", expected_status=200)

    def test_health_ready(self, test_client: TestClient) -> None:
        assert_route(test_client, "GET", "/common/health/ready", expected_status=200)

    def test_health_live(self, test_client: TestClient) -> None:
        assert_route(test_client, "GET", "/common/health/live", expected_status=200)


class TestMonitoring:
    """首页运营概览接口。"""

    def test_login_trend(self, test_client: TestClient, auth_headers: dict) -> None:
        response = test_client.get("/common/monitoring/login-trend", headers=auth_headers)

        assert response.status_code == 200
        payload = response.json()
        items = payload["data"]["items"]
        assert len(items) == 7
        assert [item["day"] for item in items] == sorted(item["day"] for item in items)
        assert all(set(item) == {"day", "logins", "unique_users", "new_users"} for item in items)
        assert sum(item["logins"] for item in items) >= 1
        assert max(item["unique_users"] for item in items) >= 1


class TestFile:
    """文件管理接口。"""

    def test_upload_file(self, test_client: TestClient) -> None:
        assert_route(test_client, "POST", "/common/file/upload", expected_status=401)

    def test_download_file(self, test_client: TestClient) -> None:
        assert_route(
            test_client,
            "POST",
            "/common/file/download",
            expected_status=401,
            json={"file_path": "test.txt", "delete": False},
        )


class TestRouteAssertion:
    def test_server_errors_fail(self) -> None:
        client = Mock()
        client.request.return_value.status_code = 500
        with pytest.raises(AssertionError, match="实际 500"):
            assert_route(client, "GET", "/broken")

    def test_request_exceptions_propagate(self) -> None:
        client = Mock()
        client.request.side_effect = RuntimeError("request failed")
        with pytest.raises(RuntimeError, match="request failed"):
            assert_route(client, "GET", "/broken")
