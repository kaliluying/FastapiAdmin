"""Current account profile and password API regression checks."""

from uuid import uuid4

from fastapi.testclient import TestClient


def _fresh_admin_headers(test_client: TestClient) -> dict[str, str]:
    login = test_client.post("/system/auth/login", data={"username": "admin", "password": "admin123"})
    assert login.status_code == 200, login.text
    return {"Authorization": f"Bearer {login.json()['data']['access_token']}"}


def test_superuser_can_update_own_profile(test_client: TestClient) -> None:
    headers = _fresh_admin_headers(test_client)
    current = test_client.get("/system/user/current/info", headers=headers)
    assert current.status_code == 200
    profile = current.json()["data"]
    assert profile["username"] == "admin"
    changed_name = f"个人中心{uuid4().hex[:6]}"
    try:
        response = test_client.put(
            "/system/user/current/info/update",
            headers=headers,
            json={"name": changed_name},
        )
        assert response.status_code == 200
        saved = test_client.get("/system/user/current/info", headers=headers)
        assert saved.status_code == 200
        assert saved.json()["data"]["name"] == changed_name
        assert saved.json()["data"].get("email") == profile.get("email")
    finally:
        test_client.put(
            "/system/user/current/info/update",
            headers=headers,
            json={"name": profile["name"]},
        )


def test_current_user_can_change_password_and_login_with_new_password(
    test_client: TestClient,
) -> None:
    headers = _fresh_admin_headers(test_client)
    username = f"account_{uuid4().hex[:10]}"
    old_password = "Initial123"
    new_password = "Changed123"
    created = test_client.post(
        "/system/user/create",
        headers=headers,
        json={"username": username, "name": "测试账号", "password": old_password, "status": 0},
    )
    assert created.status_code == 200, created.text

    login = test_client.post("/system/auth/login", data={"username": username, "password": old_password})
    assert login.status_code == 200, login.text
    own_headers = {"Authorization": f"Bearer {login.json()['data']['access_token']}"}

    changed = test_client.put(
        "/system/user/password/change",
        headers=own_headers,
        json={"old_password": old_password, "new_password": new_password},
    )
    assert changed.status_code == 200, changed.text
    assert changed.json()["data"]["username"] == username

    assert test_client.post("/system/auth/login", data={"username": username, "password": old_password}).status_code != 200
    assert test_client.post("/system/auth/login", data={"username": username, "password": new_password}).status_code == 200
