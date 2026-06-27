import json
from types import SimpleNamespace

import pytest

from app.api.v1.module_system.auth.service import LoginService
from app.common.enums import RedisInitKeyConfig
from app.core.security import decode_access_token


class FakeRedis:
    def __init__(self) -> None:
        self.values: dict[str, bytes] = {}
        self.expires: dict[str, int | None] = {}

    async def set(self, name: str, value: bytes, ex: int | None = None, **_: object) -> bool:
        self.values[name] = value
        self.expires[name] = ex
        return True


@pytest.mark.asyncio
async def test_create_token_stores_user_session() -> None:
    request = SimpleNamespace(
        headers={"user-agent": "pytest"},
        client=SimpleNamespace(host="127.0.0.1"),
        state=SimpleNamespace(),
    )
    redis = FakeRedis()
    user = SimpleNamespace(id=7, username="admin", tenant_id=1)

    token = await LoginService.create_token(
        request=request,  # type: ignore[arg-type]
        redis=redis,  # type: ignore[arg-type]
        user=user,  # type: ignore[arg-type]
        login_type="PC端",
    )

    session_id = decode_access_token(token.access_token).sub
    session_key = f"{RedisInitKeyConfig.USER_SESSION.key}:{session_id}"

    assert session_key in redis.values
    session = json.loads(redis.values[session_key].decode("utf-8"))
    assert session["session_id"] == session_id
    assert session["user_id"] == 7
    assert session["username"] == "admin"
    assert session["user_name"] == "admin"
    assert session["tenant_id"] == 1
