import importlib.util
import json
from pathlib import Path
from types import SimpleNamespace

import pytest
from alembic.migration import MigrationContext
from alembic.operations import Operations
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy import create_engine, inspect, select
from sqlalchemy.dialects import mysql, postgresql
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.schema import CreateTable

from app.api.v1.module_demo import demo_router
from app.api.v1.module_demo.category.model import CategoryModel
from app.api.v1.module_system.user.model import UserModel
from app.config.setting import settings
from app.core.base_model import MappedBase
from app.core.base_schema import AuthSchema
from app.core.dependencies import get_current_user
from app.init_app import register_exceptions

PERMISSIONS = {f"module_demo:category:{action}": index for index, action in enumerate(("query", "detail", "create", "update", "delete"), start=1)}


@pytest.fixture
async def category_app(tmp_path, monkeypatch):
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'category.db'}")
    async with engine.begin() as connection:
        await connection.run_sync(MappedBase.metadata.create_all)
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    async with sessions() as db:
        db.add_all([UserModel(id=id, username=f"category{id}", name=f"用户{id}", password="synthetic") for id in (1, 2)])
        await db.commit()
    actor = {"id": 1, "superuser": False, "permissions": dict(PERMISSIONS)}

    async def auth_override():
        async with sessions() as db, db.begin():
            user = SimpleNamespace(id=actor["id"], is_superuser=actor["superuser"], roles=[SimpleNamespace(status=0, data_scope=1, menus=[])])
            yield AuthSchema(db=db, user=user, permission_map=actor["permissions"])

    app = FastAPI()
    app.include_router(demo_router)
    app.dependency_overrides[get_current_user] = auth_override
    register_exceptions(app)
    monkeypatch.setattr(settings, "OPERATION_LOG_RECORD", False)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client, sessions, actor
    await engine.dispose()


async def create_category(client, name="办公用品", **fields):
    response = await client.post("/demo/category/create", json={"name": name, **fields})
    assert response.status_code == 200, response.text
    return response.json()["data"]


async def test_category_crud_filter_sort_and_soft_delete(category_app):
    client, sessions, _ = category_app
    first = await create_category(client, " 办公用品 ", order=20)
    second = await create_category(client, "耗材", order=10)
    assert first["name"] == "办公用品" and first["created_id"] == 1
    response = await client.get("/demo/category/list", params={"page_size": 1, "order_by": json.dumps([{"order": "asc"}])})
    page = response.json()["data"]
    assert page["total"] == 2 and page["has_next"] and page["items"][0]["id"] == second["id"]
    response = await client.put(f"/demo/category/update/{first['id']}", json={"name": "办公设备", "status": 1, "order": 30})
    assert response.status_code == 200
    filtered = (await client.get("/demo/category/list", params={"name": "设备", "status": 1})).json()["data"]
    assert filtered["total"] == 1 and filtered["items"][0]["updated_id"] == 1
    assert (await client.get(f"/demo/category/detail/{first['id']}")).status_code == 200
    assert (await client.request("DELETE", "/demo/category/delete", json=[first["id"], first["id"]])).status_code == 200
    assert (await client.get(f"/demo/category/detail/{first['id']}")).status_code == 404
    async with sessions() as db:
        deleted = await db.get(CategoryModel, first["id"])
        assert deleted.is_deleted and deleted.deleted_id == 1 and deleted.deleted_time is not None


async def test_duplicate_create_update_and_deleted_name_are_transactional(category_app):
    client, sessions, _ = category_app
    first = await create_category(client)
    second = await create_category(client, "其他")
    duplicate = await client.post("/demo/category/create", json={"name": " 办公用品 "})
    assert duplicate.status_code == 409 and "INSERT" not in duplicate.text
    conflict = await client.put(f"/demo/category/update/{second['id']}", json={"name": "办公用品"})
    assert conflict.status_code == 409
    async with sessions() as db:
        assert (await db.get(CategoryModel, second["id"])).name == "其他"
        assert len(list(await db.scalars(select(CategoryModel)))) == 2
    await client.request("DELETE", "/demo/category/delete", json=[first["id"]])
    assert (await client.post("/demo/category/create", json={"name": "办公用品"})).status_code == 409
    assert (await create_category(client, "新分类"))["id"] > second["id"]


async def test_data_scope_hides_other_owners_and_batch_delete_is_atomic(category_app):
    client, sessions, actor = category_app
    first = await create_category(client)
    actor["id"] = 2
    second = await create_category(client)  # 不同创建人允许同名。
    assert (await client.get("/demo/category/list")).json()["data"]["total"] == 1
    assert (await client.get(f"/demo/category/detail/{first['id']}")).status_code == 404
    assert (await client.put(f"/demo/category/update/{first['id']}", json={"name": "越权修改"})).status_code == 404
    assert (await client.request("DELETE", "/demo/category/delete", json=[first["id"], second["id"]])).status_code == 404
    async with sessions() as db:
        assert not (await db.get(CategoryModel, second["id"])).is_deleted
    actor["superuser"] = True
    assert (await client.get("/demo/category/list")).json()["data"]["total"] == 2


@pytest.mark.parametrize("payload", [{"name": " "}, {"name": "x" * 65}, {"name": "合法", "status": 2}, {"name": "合法", "order": -1}, {"name": "合法", "created_id": 2}])
async def test_invalid_payload_cannot_write(category_app, payload):
    client, _, _ = category_app
    assert (await client.post("/demo/category/create", json=payload)).status_code == 422
    assert (await client.get("/demo/category/list")).json()["data"]["total"] == 0


@pytest.mark.parametrize("order", [[{"password": "asc"}], [{"name": "drop"}], {"name": "asc"}, [{"name": []}], []])
async def test_invalid_sort_is_rejected(category_app, order):
    client, _, _ = category_app
    assert (await client.get("/demo/category/list", params={"order_by": json.dumps(order)})).status_code == 422


@pytest.mark.parametrize("ids", [[], [0], [-1]])
async def test_invalid_delete_is_rejected(category_app, ids):
    client, _, _ = category_app
    assert (await client.request("DELETE", "/demo/category/delete", json=ids)).status_code == 422


async def test_read_permission_does_not_grant_mutation(category_app):
    client, _, actor = category_app
    actor["permissions"] = {"module_demo:category:query": 1}
    assert (await client.get("/demo/category/list")).status_code == 200
    assert (await client.post("/demo/category/create", json={"name": "无权限"})).status_code == 403


def test_migration_upgrades_existing_schema_idempotently_and_downgrades(tmp_path):
    filename = Path(__file__).parents[1] / "app/alembic/versions/20261004_demo_category.py"
    spec = importlib.util.spec_from_file_location("category_migration", filename)
    migration = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(migration)
    engine = create_engine(f"sqlite:///{tmp_path / 'migration.db'}")
    with engine.begin() as connection:
        migration.op = Operations(MigrationContext.configure(connection))
        migration.upgrade()  # 空数据库等待 bootstrap。
        assert "demo_category" not in inspect(connection).get_table_names()
        UserModel.__table__.create(connection)
        migration.upgrade()
        migration.upgrade()
        assert {column["name"] for column in inspect(connection).get_columns("demo_category")} == set(CategoryModel.__table__.columns.keys())
        assert {item["name"] for item in inspect(connection).get_indexes("demo_category")} == {index.name for index in CategoryModel.__table__.indexes}
        migration.downgrade()
        assert "sys_user" in inspect(connection).get_table_names()
        assert "demo_category" not in inspect(connection).get_table_names()
    engine.dispose()


@pytest.mark.parametrize("dialect", [mysql.dialect(), postgresql.dialect()])
def test_category_constraints_compile_for_supported_server_databases(dialect):
    sql = str(CreateTable(CategoryModel.__table__).compile(dialect=dialect))
    assert "uq_demo_category_owner_name" in sql and "FOREIGN KEY" in sql
    quoted_order = dialect.identifier_preparer.quote("order")
    assert f"{quoted_order} >= 0" in sql
