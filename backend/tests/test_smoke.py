"""
关键业务流烟雾测试：SaaS 平台核心链路验证

覆盖：
- 超管登录 → 租户选择 → 菜单/套餐/租户列表 → 权限校验
"""

from fastapi.testclient import TestClient

SUPER_USERNAME = "super"
SUPER_PASSWORD = "super123"


def _login(test_client: TestClient) -> str:
    """登录并返回 access_token"""
    resp = test_client.post("/system/auth/login", json={
        "username": SUPER_USERNAME,
        "password": SUPER_PASSWORD,
    })
    assert resp.status_code == 200, f"登录失败: {resp.json()}"
    token = resp.json()["data"]["access_token"]
    assert token
    return token


def _auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


class TestHealthCheck:
    """健康检查"""

    def test_basic_health(self, test_client: TestClient):
        resp = test_client.get("/common/health/")
        assert resp.status_code == 200
        assert resp.json()["success"] is True

    def test_readiness(self, test_client: TestClient):
        resp = test_client.get("/common/health/ready/")
        assert resp.status_code == 200
        assert resp.json()["data"]["dependencies"]["database"] is not None


class TestAuthFlow:
    """认证流程"""

    def test_login_superadmin(self, test_client: TestClient):
        resp = test_client.post("/system/auth/login", json={
            "username": SUPER_USERNAME,
            "password": SUPER_PASSWORD,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["data"]["access_token"]

    def test_login_wrong_password(self, test_client: TestClient):
        resp = test_client.post("/system/auth/login", json={
            "username": SUPER_USERNAME,
            "password": "wrong_password_123",
        })
        assert resp.status_code in (400, 401, 403, 422)

    def test_get_user_info(self, test_client: TestClient):
        token = _login(test_client)
        resp = test_client.get("/system/user/current", headers=_auth_headers(token))
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["data"]["username"] == SUPER_USERNAME
        assert "menus" in data["data"]

    def test_select_tenant(self, test_client: TestClient):
        token = _login(test_client)
        resp = test_client.post("/system/auth/select-tenant", json={
            "tenant_id": 1,
        }, headers=_auth_headers(token))
        assert resp.status_code == 200
        assert resp.json()["success"] is True


class TestPlatformModule:
    """平台管理模块"""

    def test_menu_tree(self, test_client: TestClient):
        token = _login(test_client)
        resp = test_client.get("/platform/menu/tree", headers=_auth_headers(token))
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)

    def test_package_list(self, test_client: TestClient):
        token = _login(test_client)
        resp = test_client.get("/platform/package/list", headers=_auth_headers(token))
        assert resp.status_code == 200
        assert resp.json()["success"] is True

    def test_tenant_list(self, test_client: TestClient):
        token = _login(test_client)
        resp = test_client.get("/platform/tenant/list", headers=_auth_headers(token))
        assert resp.status_code == 200
        assert resp.json()["success"] is True

    def test_dashboard_overview(self, test_client: TestClient):
        token = _login(test_client)
        resp = test_client.get("/platform/dashboard/overview", headers=_auth_headers(token))
        assert resp.status_code == 200
        assert resp.json()["success"] is True


class TestSystemModule:
    """系统管理模块"""

    def test_user_list(self, test_client: TestClient):
        token = _login(test_client)
        resp = test_client.get("/system/user/list", headers=_auth_headers(token))
        assert resp.status_code == 200
        assert resp.json()["success"] is True

    def test_role_list(self, test_client: TestClient):
        token = _login(test_client)
        resp = test_client.get("/system/role/list", headers=_auth_headers(token))
        assert resp.status_code == 200
        assert resp.json()["success"] is True

    def test_dept_list(self, test_client: TestClient):
        token = _login(test_client)
        resp = test_client.get("/system/dept/list", headers=_auth_headers(token))
        assert resp.status_code == 200
        assert resp.json()["success"] is True

    def test_dict_list(self, test_client: TestClient):
        token = _login(test_client)
        resp = test_client.get("/system/dict/type/list", headers=_auth_headers(token))
        assert resp.status_code == 200
        assert resp.json()["success"] is True


class TestPermissionFlow:
    """权限控制验证"""

    def test_unauthorized_access(self, test_client: TestClient):
        resp = test_client.get("/platform/tenant/list")
        assert resp.status_code in (401, 403)

    def test_invalid_token(self, test_client: TestClient):
        resp = test_client.get("/platform/menu/tree", headers={
            "Authorization": "Bearer invalid_token_here",
        })
        assert resp.status_code in (401, 403)
