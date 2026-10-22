"""Isolated regressions for authentication, request transactions and shared CRUD."""

import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from types import SimpleNamespace
from typing import Annotated
from unittest.mock import AsyncMock

import httpx
import pytest
from fakeredis import FakeAsyncRedis
from fastapi import Depends, FastAPI
from sqlalchemy import update
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.api.v1.module_platform.menu.model import MenuModel
from app.api.v1.module_platform.menu.schema import MenuUpdateSchema
from app.api.v1.module_platform.menu.service import MenuService
from app.api.v1.module_system.user.model import UserModel
from app.common.enums import RedisInitKeyConfig
from app.core import dependencies
from app.core.base_crud import CRUDBase
from app.core.base_model import MappedBase
from app.core.base_schema import AuthSchema, JWTPayloadSchema
from app.core.exceptions import CustomException, handle_exception
from app.core.redis_crud import RedisCURD
from app.core.security import create_access_token


@pytest.fixture
async def arch_sessions(tmp_path, monkeypatch):
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'arch.db'}")
    async with engine.begin() as connection:
        await connection.run_sync(MappedBase.metadata.create_all)
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    monkeypatch.setattr(dependencies, "async_db_session", sessions)
    try:
        yield sessions
    finally:
        await engine.dispose()


@pytest.fixture
async def arch_redis():
    redis = FakeAsyncRedis(decode_responses=True)
    try:
        yield redis
    finally:
        await redis.aclose()


@pytest.mark.parametrize("transport", ["http", "ws", "ticket"])
async def test_live_session_keeps_user_id_when_username_is_reused(arch_sessions, arch_redis, transport):
    async with arch_sessions() as db:
        original = UserModel(username="original", name="Original", password="fixture", status=0)
        db.add(original)
        await db.commit()
        original_id = original.id
        await db.execute(update(UserModel).where(UserModel.id == original_id).values(username="renamed"))
        db.add(UserModel(username="original", name="Replacement", password="fixture", status=0))
        await db.commit()

    session_id = "arch-session"
    token = create_access_token(JWTPayloadSchema(sub=session_id, exp=datetime.now() + timedelta(minutes=5), jti="arch-token"))
    await RedisCURD(arch_redis).set(
        f"{RedisInitKeyConfig.USER_SESSION.key}:{session_id}",
        {"session_id": session_id, "user_id": original_id, "user_name": "original"},
        expire=300,
    )
    await RedisCURD(arch_redis).set(f"{RedisInitKeyConfig.ACCESS_TOKEN.key}:{session_id}", token, expire=300)

    if transport == "http":
        app = FastAPI()
        app.dependency_overrides[dependencies.redis_getter] = lambda: arch_redis

        @app.get("/identity")
        async def current_identity(auth: Annotated[AuthSchema, Depends(dependencies.get_current_user)]):
            return {"id": auth.user.id, "username": auth.user.username}

        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/identity", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        identity = response.json()
    else:
        async with arch_sessions() as db:
            if transport == "ticket":
                await RedisCURD(arch_redis).set(dependencies.WS_TICKET_PREFIX + "arch-ticket", {"session_id": session_id}, expire=60)
                auth = await dependencies._verify_ws_ticket("arch-ticket", db, arch_redis)
            else:
                auth = await dependencies._verify_session(session_id, db, arch_redis)
            identity = {"id": auth.user.id, "username": auth.user.username}
    assert identity == {"id": original_id, "username": "renamed"}


@pytest.mark.parametrize("user_id", [None, 0, -1, "1", True])
async def test_session_cannot_fall_back_to_username_without_valid_user_id(arch_sessions, arch_redis, user_id):
    async with arch_sessions() as db:
        db.add(UserModel(username="existing", name="Existing", password="fixture", status=0))
        await db.commit()
    await RedisCURD(arch_redis).set(
        f"{RedisInitKeyConfig.USER_SESSION.key}:invalid-id",
        {"session_id": "invalid-id", "user_id": user_id, "user_name": "existing"},
        expire=300,
    )
    await RedisCURD(arch_redis).set(f"{RedisInitKeyConfig.ACCESS_TOKEN.key}:invalid-id", "fixture", expire=300)
    async with arch_sessions() as db:
        with pytest.raises(CustomException) as error:
            await dependencies._verify_session("invalid-id", db, arch_redis)
    assert error.value.status_code == 401


@pytest.mark.parametrize("failure", [RuntimeError("handler failed"), asyncio.CancelledError()])
async def test_request_transaction_finishes_cleanup_before_propagating(monkeypatch, failure):
    events = []
    session = SimpleNamespace(
        commit=AsyncMock(side_effect=lambda: events.append("commit")),
        rollback=AsyncMock(side_effect=lambda: events.append("rollback")),
    )

    @asynccontextmanager
    async def session_scope():
        try:
            yield session
        finally:
            events.append("closed")

    monkeypatch.setattr(dependencies, "async_db_session", session_scope)
    with pytest.raises(type(failure)):
        async with asynccontextmanager(dependencies.db_getter)(SimpleNamespace(method="POST")):
            raise failure
    assert events == ["rollback", "closed"]


async def test_crud_constraint_error_is_safe_http_conflict(arch_sessions):
    app = FastAPI()
    handle_exception(app)

    @app.post("/users")
    async def create_user(payload: dict, db: Annotated[object, Depends(dependencies.db_getter, scope="function")]):
        user = await CRUDBase(UserModel, session=db).create(payload)
        return {"id": user.id}

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        first = await client.post("/users", json={"username": "first", "name": "First", "email": "same@example.invalid", "password": "synthetic-private-value"})
        assert first.status_code == 200
        duplicate = await client.post("/users", json={"username": "second", "name": "Second", "email": "same@example.invalid", "password": "synthetic-private-value"})
    assert "synthetic-private-value" not in duplicate.text
    assert "INSERT INTO" not in duplicate.text
    assert duplicate.status_code == 409


async def test_crud_unexpected_database_error_keeps_details_out_of_public_message(arch_sessions, monkeypatch):
    async with arch_sessions() as db:
        monkeypatch.setattr(db, "execute", AsyncMock(side_effect=RuntimeError("synthetic-private-detail")))
        with pytest.raises(CustomException) as error:
            await CRUDBase(UserModel, session=db).get(id=1)
    assert "synthetic-private-detail" not in error.value.msg
    assert isinstance(error.value.__cause__, RuntimeError)


@pytest.mark.parametrize("action", ["disable_parent", "enable_child"])
async def test_menu_edit_applies_the_same_status_cascade_as_batch_action(arch_sessions, action):
    initial_status = 0 if action == "disable_parent" else 1
    async with arch_sessions() as db:
        actor = UserModel(username="operator", name="Operator", password="fixture", is_superuser=True)
        root = MenuModel(name="Root", type=1, route_name="ArchRoot", route_path="/arch-root", redirect="/arch-root/page", status=initial_status)
        db.add_all([actor, root])
        await db.flush()
        page = MenuModel(name="Page", type=2, parent_id=root.id, route_name="ArchPage", route_path="page", component_path="module_system/user/index", permission="arch:page:query", status=initial_status)
        db.add(page)
        await db.flush()
        button = MenuModel(name="Button", type=3, parent_id=page.id, permission="arch:button:write", status=initial_status)
        db.add(button)
        await db.commit()

        service = MenuService(AuthSchema(db=db, user=actor))
        target_id = root.id if action == "disable_parent" else button.id
        target_status = 1 if action == "disable_parent" else 0
        await service.update(target_id, MenuUpdateSchema(status=target_status))
        statuses = [(await service.detail(node.id)).status for node in (root, page, button)]
        assert statuses == [target_status] * 3
