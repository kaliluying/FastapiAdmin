"""
应用入口测试 —— 健康检查接口返回码与响应体校验。
"""

from fastapi.testclient import TestClient
from pytest import MonkeyPatch

from app.config.setting import settings


def test_check_readiness(test_client: TestClient) -> None:
    response = test_client.get("/common/health/ready/")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    data = body["data"]
    assert data is not None
    assert data["status"] == 1
    assert set(data["dependencies"]) == {"database", "redis"}
    assert all(dependency["status"] == 1 for dependency in data["dependencies"].values())
    assert all(dependency["enabled"] is True for dependency in data["dependencies"].values())
    assert isinstance(data["disk_usage"], (int, float))


def test_check_health(test_client: TestClient) -> None:
    response = test_client.get("/common/health/")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["code"] == 0


def test_check_readiness_ignores_disabled_dependency(test_client: TestClient, monkeypatch: MonkeyPatch) -> None:
    monkeypatch.setattr(settings, "REDIS_ENABLE", False)

    response = test_client.get("/common/health/ready/")

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["status"] == 1
    assert body["data"]["dependencies"]["database"]["status"] == 1
    assert body["data"]["dependencies"]["redis"] == {"status": 1, "enabled": False, "latency_ms": None}
