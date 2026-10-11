from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.core.exceptions import CustomException
from app.plugin.module_ai.chat import controller, usage
from app.plugin.module_ai.chat.schema import AiUsageQuotaUpdateSchema


def test_own_usage_and_admin_quota_api(test_client, auth_headers):
    own = test_client.get("/ai/chat/usage?user_id=999999", headers=auth_headers)
    assert own.status_code == 200
    user_id = own.json()["data"]["user_id"]
    assert user_id != 999999
    admin = test_client.get("/ai/chat/usage/admin", headers=auth_headers)
    assert admin.status_code == 200 and admin.json()["data"]["users"]
    try:
        response = test_client.put(f"/ai/chat/usage/quota/{user_id}", headers=auth_headers, json={"daily_limit": 0})
        assert response.status_code == 200 and response.json()["data"]["daily_limit"] == 0
        assert test_client.get("/ai/chat/usage", headers=auth_headers).json()["data"]["remaining"] == 0
        for invalid in [-1, True, 1.5, "2"]:
            assert test_client.put(f"/ai/chat/usage/quota/{user_id}", headers=auth_headers, json={"daily_limit": invalid}).status_code == 422
        assert test_client.put("/ai/chat/usage/quota/999999", headers=auth_headers, json={"daily_limit": 3}).status_code == 404
        assert test_client.get("/ai/chat/usage/admin?user_id=999999", headers=auth_headers).status_code == 404
    finally:
        assert test_client.put(f"/ai/chat/usage/quota/{user_id}", headers=auth_headers, json={"daily_limit": None}).status_code == 200


@pytest.mark.parametrize("method,path,payload", [
    ("GET", "/ai/chat/usage", None), ("GET", "/ai/chat/usage/admin", None),
    ("PUT", "/ai/chat/usage/quota/1", {"daily_limit": 1}),
    ("POST", "/ai/chat/model-config/check", {"openai_base_url": "https://fixture.invalid/v1", "openai_model": "fixture"}),
])
def test_usage_and_capabilities_require_auth(test_client, method, path, payload):
    assert test_client.request(method, path, json=payload).status_code == 401


async def test_non_superuser_cannot_manage_or_query_other_users(monkeypatch):
    auth = SimpleNamespace(user=SimpleNamespace(id=7, is_superuser=False), db=SimpleNamespace(execute=AsyncMock(), scalar=AsyncMock()))
    with pytest.raises(CustomException) as error:
        await controller.admin_ai_usage_controller(auth, user_id=1)
    assert error.value.status_code == 403
    with pytest.raises(CustomException) as error:
        await controller.update_ai_usage_quota_controller(1, AiUsageQuotaUpdateSchema(daily_limit=0), auth)
    assert error.value.status_code == 403
    auth.db.execute.assert_not_called()
    auth.db.scalar.assert_not_called()
    spy = AsyncMock(return_value={"user_id": 7})
    monkeypatch.setattr(usage, "usage_summary", spy)
    await controller.own_ai_usage_controller(auth)
    spy.assert_awaited_once_with(7, usage.usage_day())
