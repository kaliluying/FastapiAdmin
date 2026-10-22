"""Seed replay must preserve administrator-owned authorization changes."""

import pytest
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.api.v1.module_platform.menu.model import MenuModel
from app.api.v1.module_system.role.model import RoleMenusModel, RoleModel
from app.api.v1.module_system.user.model import UserModel, UserRolesModel
from app.core.base_model import MappedBase
from app.scripts import initialize


@pytest.fixture
async def seed_database(monkeypatch, tmp_path):
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'seed.db'}")
    models = [MenuModel, RoleModel, UserModel, RoleMenusModel, UserRolesModel]
    data = {
        "platform_menu": [{"name": "Read", "route_name": "Read", "type": 2}],
        "sys_role": [{"name": "Reader", "code": "READER"}],
        "sys_user": [{"name": "Reader", "username": "reader", "password": "synthetic-hash"}],
        "sys_role_menus": [{"role_code": "READER", "route_name": "Read"}],
        "sys_user_roles": [{"user_id": 1, "role_id": 1}],
    }
    try:
        async with engine.begin() as connection:
            await connection.run_sync(lambda sync: MappedBase.metadata.create_all(sync, tables=[model.__table__ for model in models]))
        sessions = async_sessionmaker(engine, expire_on_commit=False)
        monkeypatch.setattr(initialize, "async_db_session", sessions)
        monkeypatch.setattr(initialize, "create_tables", _noop)
        monkeypatch.setattr(initialize, "ensure_schema_indexes", _noop)
        monkeypatch.setattr(initialize.InitializeData, "get_prepare_init_models", classmethod(lambda cls: models))
        monkeypatch.setattr(initialize, "get_seed_data", lambda name: data.get(name, []))
        yield initialize.InitializeData(), sessions, data
    finally:
        await engine.dispose()


async def _noop():
    pass


async def test_replaying_seeds_preserves_revoked_user_roles_and_role_menus(seed_database):
    initializer, sessions, _ = seed_database
    await initializer.init_db()
    async with sessions() as session, session.begin():
        assert list(await session.scalars(select(UserRolesModel.user_id)))
        assert list(await session.scalars(select(RoleMenusModel.role_id)))
        await session.execute(delete(UserRolesModel))
        await session.execute(delete(RoleMenusModel))
    await initializer.init_db()
    async with sessions() as session:
        assert list(await session.scalars(select(UserRolesModel.user_id))) == []
        assert list(await session.scalars(select(RoleMenusModel.role_id))) == []


async def test_new_seed_entities_receive_defaults_without_granting_existing_entities(seed_database):
    initializer, sessions, data = seed_database
    await initializer.init_db()
    async with sessions() as session, session.begin():
        await session.execute(delete(UserRolesModel))
        await session.execute(delete(RoleMenusModel))
    data["sys_role"].append({"name": "Writer", "code": "WRITER"})
    data["sys_user"].append({"name": "Writer", "username": "writer", "password": "synthetic-hash"})
    data["sys_role_menus"].append({"role_code": "WRITER", "route_name": "Read"})
    data["sys_user_roles"].extend([{"user_id": 2, "role_id": 2}, {"user_id": 1, "role_id": 2}])
    await initializer.init_db()
    async with sessions() as session:
        writer = await session.scalar(select(UserModel.id).where(UserModel.username == "writer"))
        writer_role = await session.scalar(select(RoleModel.id).where(RoleModel.code == "WRITER"))
        assert list(await session.execute(select(UserRolesModel.user_id, UserRolesModel.role_id))) == [(writer, writer_role)]
        assert list(await session.scalars(select(RoleMenusModel.role_id))) == [writer_role]
