"""OAuth identities must resolve only through explicit, exact database bindings."""

import json
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from sqlalchemy import MetaData, String, func, select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.api.v1.module_system.auth import oauth_service
from app.api.v1.module_system.user.model import UserModel
from app.common.enums import RedisInitKeyConfig
from app.core.base_model import MappedBase
from app.core.exceptions import CustomException
from app.core.redis_crud import RedisCURD
from app.core.security import decode_access_token
from tests.test_auth_session import FakeRedis

PROVIDERS = {"github": "github_login", "gitee": "gitee_login", "wechat": "wx_login", "qq": "qq_login"}


@pytest.fixture
async def binding_db(tmp_path):
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'oauth.db'}")
    metadata = MetaData()
    for table in MappedBase.metadata.sorted_tables:
        table.to_metadata(metadata)
    # Real SQL comparisons deliberately ignore case, like common MySQL collations.
    for field in PROVIDERS.values():
        metadata.tables["sys_user"].c[field].type = String(32, collation="NOCASE")
    async with engine.begin() as connection:
        await connection.run_sync(metadata.create_all)
    try:
        async with async_sessionmaker(engine, expire_on_commit=False)() as db:
            yield db
    finally:
        await engine.dispose()


async def add_user(db, username="internal", **bindings):
    user = UserModel(username=username, name="Local name", password="fixture", **bindings)
    db.add(user)
    await db.commit()
    return user


async def resolve(db, provider, subject):
    return await oauth_service.ensure_oauth_user(db=db, provider=provider, unique_id=subject, display_name="Untrusted display name")


@pytest.mark.parametrize("provider", PROVIDERS)
async def test_old_colliding_usernames_require_explicit_full_binding(binding_db, provider):
    first, second = "1" * 31 + "2", "1" * 31 + "3"
    legacy_username = f"oauth_{provider}_{first}"[:32]
    assert legacy_username == f"oauth_{provider}_{second}"[:32]
    legacy = await add_user(binding_db, legacy_username)
    for subject in (first, second):
        with pytest.raises(CustomException, match="未绑定"):
            await resolve(binding_db, provider, subject)
    setattr(legacy, PROVIDERS[provider], first)
    await binding_db.commit()
    assert (await resolve(binding_db, provider, first)).id == legacy.id
    with pytest.raises(CustomException, match="未绑定"):
        await resolve(binding_db, provider, second)
    assert await binding_db.scalar(select(func.count()).select_from(UserModel)) == 1
    assert legacy.name == "Local name"


@pytest.mark.parametrize("provider,field", PROVIDERS.items())
async def test_binding_duplicates_fail_closed_even_for_deleted_or_disabled_users(binding_db, provider, field):
    await add_user(binding_db, **{field: "123"})
    duplicate = await add_user(binding_db, "duplicate", **{field: "123"})
    for attrs in ({}, {"is_deleted": True}, {"is_deleted": False, "status": 1}):
        for key, value in attrs.items():
            setattr(duplicate, key, value)
        await binding_db.commit()
        with pytest.raises(CustomException, match="绑定冲突"):
            await resolve(binding_db, provider, "123")


@pytest.mark.parametrize("provider,field", PROVIDERS.items())
async def test_binding_is_scoped_to_provider(binding_db, provider, field):
    user = await add_user(binding_db, "123", **{field: "123"})
    assert (await resolve(binding_db, provider, "123")).id == user.id
    for other in PROVIDERS.keys() - {provider}:
        with pytest.raises(CustomException, match="未绑定"):
            await resolve(binding_db, other, "123")
    user.is_deleted = True
    await binding_db.commit()
    with pytest.raises(CustomException, match="未绑定"):
        await resolve(binding_db, provider, "123")


@pytest.mark.parametrize("provider", ["wechat", "qq"])
async def test_python_exact_match_overrides_case_insensitive_sql(binding_db, provider):
    field = PROVIDERS[provider]
    user = await add_user(binding_db, **{field: "CaseSensitive"})
    assert (await binding_db.scalars(select(UserModel).where(getattr(UserModel, field) == "casesensitive"))).one().id == user.id
    with pytest.raises(CustomException, match="未绑定"):
        await resolve(binding_db, provider, "casesensitive")
    exact = await add_user(binding_db, "exact", **{field: "casesensitive"})
    assert (await resolve(binding_db, provider, "casesensitive")).id == exact.id
    with pytest.raises(CustomException, match="未绑定"):
        await resolve(binding_db, provider, "CASESENSITIVE")


async def test_subject_punctuation_is_not_rewritten(binding_db):
    user = await add_user(binding_db, qq_login="opaque/id")
    assert (await resolve(binding_db, "qq", "opaque/id")).id == user.id
    with pytest.raises(CustomException, match="未绑定"):
        await resolve(binding_db, "qq", "opaque_id")


async def test_unknown_provider_is_rejected(binding_db):
    with pytest.raises(CustomException, match="渠道"):
        await resolve(binding_db, "unknown", "123")


@pytest.mark.parametrize("provider", PROVIDERS)
@pytest.mark.parametrize("subject", [None, "", " ", 123, True, [], "x" * 33, "trailing ", "bad\x00id"])
async def test_invalid_binding_subject_is_rejected(binding_db, provider, subject):
    await add_user(binding_db)
    with pytest.raises(CustomException, match="标识"):
        await resolve(binding_db, provider, subject)
    assert await binding_db.scalar(select(func.count()).select_from(UserModel)) == 1


@pytest.mark.parametrize("provider", ["github", "gitee"])
async def test_numeric_provider_id_is_used_instead_of_mutable_login(monkeypatch, provider):
    fetch = AsyncMock(return_value={"id": 123456, "login": "old-name", "email": "fixture@example.invalid"})
    monkeypatch.setattr(oauth_service, "_http_fetch", fetch)
    profile = getattr(oauth_service, f"fetch_{provider}_profile")
    assert (await profile("fixture"))[0] == "123456"
    fetch.return_value["login"] = "renamed"
    assert (await profile("fixture"))[0] == "123456"


@pytest.mark.parametrize("provider", ["github", "gitee"])
async def test_recycled_login_cannot_take_over_numeric_binding(binding_db, monkeypatch, provider):
    user = await add_user(binding_db, f"oauth_{provider}_recycled", **{PROVIDERS[provider]: "123"})
    fetch = AsyncMock(return_value={"id": 456, "login": "recycled", "email": "fixture@example.invalid"})
    monkeypatch.setattr(oauth_service, "_http_fetch", fetch)
    profile = getattr(oauth_service, f"fetch_{provider}_profile")
    subject, _, _ = await profile("fixture")
    with pytest.raises(CustomException, match="未绑定"):
        await resolve(binding_db, provider, subject)
    fetch.return_value = {"id": 123, "login": "renamed", "email": "fixture@example.invalid"}
    subject, _, _ = await profile("fixture")
    assert (await resolve(binding_db, provider, subject)).id == user.id


@pytest.mark.parametrize("provider", ["github", "gitee"])
@pytest.mark.parametrize("subject", [None, "", "123", True, False, 0, -1, 1.5, [], {}, 10**32])
async def test_invalid_numeric_profile_subject_is_rejected(monkeypatch, provider, subject):
    monkeypatch.setattr(oauth_service, "_http_fetch", AsyncMock(return_value={"id": subject, "login": "recycled", "email": "fixture@example.invalid"}))
    with pytest.raises(CustomException, match="标识"):
        await getattr(oauth_service, f"fetch_{provider}_profile")("fixture")


@pytest.mark.parametrize(
    "profile,expected",
    [
        ({"openid": "open", "unionid": "union"}, "union"),
        ({"openid": "open"}, "open"),
    ],
)
async def test_wechat_uses_unionid_then_openid(monkeypatch, profile, expected):
    monkeypatch.setattr(oauth_service, "_http_fetch", AsyncMock(return_value=profile))
    assert (await oauth_service.fetch_wechat_profile("fixture", "open"))[0] == expected


@pytest.mark.parametrize(
    "profile",
    [
        {},
        {"errcode": 40003, "errmsg": "invalid openid"},
        {"openid": "different", "unionid": "union"},
        {"openid": 123},
        {"openid": "open", "unionid": ""},
        {"openid": "open", "unionid": None},
        {"openid": "open", "unionid": 123},
        {"openid": "open", "unionid": "x" * 33},
    ],
)
async def test_invalid_wechat_profile_is_rejected(monkeypatch, profile):
    monkeypatch.setattr(oauth_service, "_http_fetch", AsyncMock(return_value=profile))
    with pytest.raises(CustomException):
        await oauth_service.fetch_wechat_profile("fixture", "open")


@pytest.mark.parametrize("profile", [{}, {"ret": 1}, {"ret": False}, {"ret": None}])
async def test_invalid_qq_profile_is_rejected(monkeypatch, profile):
    monkeypatch.setattr(oauth_service, "_http_fetch", AsyncMock(return_value=profile))
    with pytest.raises(CustomException):
        await oauth_service.fetch_qq_profile("fixture", "app", "open")


@pytest.mark.parametrize("ret", [0, "0"])
async def test_qq_uses_exact_token_openid(monkeypatch, ret):
    monkeypatch.setattr(oauth_service, "_http_fetch", AsyncMock(return_value={"ret": ret, "nickname": "Mutable name"}))
    assert (await oauth_service.fetch_qq_profile("fixture", "app", "ExactOpenID"))[0] == "ExactOpenID"


@pytest.mark.parametrize("provider", PROVIDERS)
@pytest.mark.parametrize("profile", [None, [], "invalid"])
async def test_non_object_profile_is_rejected(monkeypatch, provider, profile):
    monkeypatch.setattr(oauth_service, "_http_fetch", AsyncMock(return_value=profile))
    fetch = getattr(oauth_service, f"fetch_{provider}_profile")
    args = ("fixture",) if provider in {"github", "gitee"} else ("fixture", "open") if provider == "wechat" else ("fixture", "app", "open")
    with pytest.raises(CustomException, match="格式错误"):
        await fetch(*args)


@pytest.mark.parametrize("provider", ["wechat", "qq"])
@pytest.mark.parametrize("subject", [None, "", 123, "x" * 33])
async def test_invalid_openid_in_token_response_is_rejected(monkeypatch, provider, subject):
    responses = [{"access_token": "fixture", "openid": subject}] if provider == "wechat" else ["access_token=fixture", {"openid": subject}]
    monkeypatch.setattr(oauth_service, "_http_fetch", AsyncMock(side_effect=responses))
    with pytest.raises(CustomException):
        if provider == "wechat":
            await oauth_service.exchange_wechat_token("app", "secret", "code")
        else:
            await oauth_service.exchange_qq_token("app", "secret", "code", "https://fixture.invalid/callback")


@pytest.mark.parametrize("provider,field", PROVIDERS.items())
async def test_callback_resolves_real_binding_and_mints_session_for_internal_user(binding_db, monkeypatch, provider, field):
    subject = "123"
    user = await add_user(binding_db, **{field: subject})
    redis = FakeRedis()
    monkeypatch.setattr(oauth_service, "_callback_url", lambda *_: "https://fixture.invalid/callback")
    monkeypatch.setattr(oauth_service, "_require_credentials", lambda *_: ("fixture", "fixture"))
    monkeypatch.setattr(oauth_service, f"exchange_{provider}_token", AsyncMock(return_value="fixture" if provider in {"github", "gitee"} else ("fixture", subject)))
    profile = {"id": 123, "login": "recycled", "email": "fixture@example.invalid"} if provider in {"github", "gitee"} else {"openid": subject, "ret": 0}
    monkeypatch.setattr(oauth_service, "_http_fetch", AsyncMock(return_value=profile))
    request = SimpleNamespace(headers={}, client=SimpleNamespace(host="127.0.0.1"), state=SimpleNamespace())

    async def callback(state):
        await RedisCURD(redis).set(oauth_service.STATE_PREFIX + state, {"provider": provider, "frontend_redirect": "https://fixture.invalid/login"})
        return await oauth_service.complete_oauth_login(request=request, redis=redis, db=binding_db, provider=provider, code="fixture", state=state)

    token, frontend = await callback("bound")
    assert frontend == "https://fixture.invalid/login"
    session_id = decode_access_token(token.access_token).sub
    session = json.loads(await RedisCURD(redis).get(f"{RedisInitKeyConfig.USER_SESSION.key}:{session_id}"))
    assert session["user_id"] == user.id
    assert user.last_login is not None
    setattr(user, field, None)
    await binding_db.commit()
    with pytest.raises(CustomException, match="未绑定"):
        await callback("unbound")
    assert await binding_db.scalar(select(func.count()).select_from(UserModel)) == 1
    setattr(user, field, subject)
    user.status = 1
    await binding_db.commit()
    with pytest.raises(CustomException, match="停用"):
        await callback("disabled")
