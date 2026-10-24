import importlib.util
import json
from pathlib import Path
from types import SimpleNamespace

import pytest
from alembic import command
from alembic.config import Config
from alembic.migration import MigrationContext
from alembic.operations import Operations
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy import create_engine, inspect, select
from sqlalchemy.dialects import mysql, postgresql
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.schema import CreateTable

from app.api.v1.module___MODULE__ import __MODULE___router
from app.api.v1.module___MODULE__.__RESOURCE__.model import __MODEL_CLASS__
from app.api.v1.module_system.user.model import UserModel
from app.config.setting import settings
from app.core import router_class
from app.core.base_model import MappedBase
from app.core.base_schema import AuthSchema
from app.core.database import async_db_session
from app.core.dependencies import get_current_user
from app.init_app import register_exceptions

PERMISSIONS = {f"module___MODULE__:__RESOURCE__:{action}": index for index, action in enumerate(("query", "detail", "create", "update", "delete"), start=1)}


def test_http_write_is_committed_before_background_audit(test_client, auth_headers, monkeypatch):
    observed = []
    monkeypatch.setattr(settings, "OPERATION_LOG_RECORD", True)
    monkeypatch.setattr(settings, "OPERATION_RECORD_METHOD", ["POST"])

    async def audit(record):
        if record["request_path"] == "/__MODULE__/__RESOURCE__/create":
            async with async_db_session() as db:
                created_record = await db.scalar(select(__MODEL_CLASS__).where(__MODEL_CLASS__.name == "提交时机回归"))
                assert created_record is not None, "business transaction must commit before background audit"
                observed.append(created_record.id)

    monkeypatch.setattr(router_class, "_write_operation_log_async", audit)
    response = test_client.post("/__MODULE__/__RESOURCE__/create", headers=auth_headers, json={"name": "提交时机回归"})
    assert response.status_code == 200
    identifier = response.json()["data"]["id"]
    try:
        assert observed == [identifier]
    finally:
        assert test_client.request("DELETE", "/__MODULE__/__RESOURCE__/delete", headers=auth_headers, json=[identifier]).status_code == 200


@pytest.fixture
async def __RESOURCE___app(tmp_path, monkeypatch):
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / '__RESOURCE__.db'}")
    async with engine.begin() as connection:
        await connection.run_sync(MappedBase.metadata.create_all)
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    async with sessions() as db:
        db.add_all([UserModel(id=id, username=f"__RESOURCE__{id}", name=f"用户{id}", password="synthetic") for id in (1, 2)])
        await db.commit()
    actor = {"id": 1, "superuser": False, "permissions": dict(PERMISSIONS)}

    async def auth_override():
        async with sessions() as db, db.begin():
            user = SimpleNamespace(id=actor["id"], is_superuser=actor["superuser"], roles=[SimpleNamespace(status=0, data_scope=1, menus=[])])
            yield AuthSchema(db=db, user=user, permission_map=actor["permissions"])

    app = FastAPI()
    app.include_router(__MODULE___router)
    app.dependency_overrides[get_current_user] = auth_override
    register_exceptions(app)
    monkeypatch.setattr(settings, "OPERATION_LOG_RECORD", False)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client, sessions, actor
    await engine.dispose()


async def create___RESOURCE__(client, name="办公用品", **fields):
    response = await client.post("/__MODULE__/__RESOURCE__/create", json={"name": name, **fields})
    assert response.status_code == 200, response.text
    return response.json()["data"]


async def test___RESOURCE___crud_filter_sort_and_soft_delete(__RESOURCE___app):
    client, sessions, _ = __RESOURCE___app
    first = await create___RESOURCE__(client, " 办公用品 ", order=20)
    second = await create___RESOURCE__(client, "耗材", order=10)
    assert first["name"] == "办公用品" and first["created_id"] == 1
    response = await client.get("/__MODULE__/__RESOURCE__/list", params={"page_size": 1, "order_by": json.dumps([{"order": "asc"}])})
    page = response.json()["data"]
    assert page["total"] == 2 and page["has_next"] and page["items"][0]["id"] == second["id"]
    response = await client.put(f"/__MODULE__/__RESOURCE__/update/{first['id']}", json={"name": "办公设备", "status": 1, "order": 30})
    assert response.status_code == 200
    filtered = (await client.get("/__MODULE__/__RESOURCE__/list", params={"name": "设备", "status": 1})).json()["data"]
    assert filtered["total"] == 1 and filtered["items"][0]["updated_id"] == 1
    assert (await client.get(f"/__MODULE__/__RESOURCE__/detail/{first['id']}")).status_code == 200
    assert (await client.request("DELETE", "/__MODULE__/__RESOURCE__/delete", json=[first["id"], first["id"]])).status_code == 200
    assert (await client.get(f"/__MODULE__/__RESOURCE__/detail/{first['id']}")).status_code == 404
    async with sessions() as db:
        deleted = await db.get(__MODEL_CLASS__, first["id"])
        assert deleted.is_deleted and deleted.deleted_id == 1 and deleted.deleted_time is not None


async def test_duplicate_create_update_and_deleted_name_are_transactional(__RESOURCE___app):
    client, sessions, _ = __RESOURCE___app
    first = await create___RESOURCE__(client)
    second = await create___RESOURCE__(client, "其他")
    duplicate = await client.post("/__MODULE__/__RESOURCE__/create", json={"name": " 办公用品 "})
    assert duplicate.status_code == 409 and "INSERT" not in duplicate.text
    conflict = await client.put(f"/__MODULE__/__RESOURCE__/update/{second['id']}", json={"name": "办公用品"})
    assert conflict.status_code == 409
    async with sessions() as db:
        assert (await db.get(__MODEL_CLASS__, second["id"])).name == "其他"
        assert len(list(await db.scalars(select(__MODEL_CLASS__)))) == 2
    await client.request("DELETE", "/__MODULE__/__RESOURCE__/delete", json=[first["id"]])
    assert (await client.post("/__MODULE__/__RESOURCE__/create", json={"name": "办公用品"})).status_code == 409
    assert (await create___RESOURCE__(client, "新__TITLE__"))["id"] > second["id"]


async def test_data_scope_hides_other_owners_and_batch_delete_is_atomic(__RESOURCE___app):
    client, sessions, actor = __RESOURCE___app
    first = await create___RESOURCE__(client)
    actor["id"] = 2
    second = await create___RESOURCE__(client)  # 不同创建人允许同名。
    assert (await client.get("/__MODULE__/__RESOURCE__/list")).json()["data"]["total"] == 1
    assert (await client.get(f"/__MODULE__/__RESOURCE__/detail/{first['id']}")).status_code == 404
    assert (await client.put(f"/__MODULE__/__RESOURCE__/update/{first['id']}", json={"name": "越权修改"})).status_code == 404
    assert (await client.request("DELETE", "/__MODULE__/__RESOURCE__/delete", json=[first["id"], second["id"]])).status_code == 404
    async with sessions() as db:
        assert not (await db.get(__MODEL_CLASS__, second["id"])).is_deleted
    actor["superuser"] = True
    assert (await client.get("/__MODULE__/__RESOURCE__/list")).json()["data"]["total"] == 2


@pytest.mark.parametrize("payload", [{"name": " "}, {"name": "x" * 65}, {"name": "合法", "status": 2}, {"name": "合法", "order": -1}, {"name": "合法", "created_id": 2}])
async def test_invalid_payload_cannot_write(__RESOURCE___app, payload):
    client, _, _ = __RESOURCE___app
    assert (await client.post("/__MODULE__/__RESOURCE__/create", json=payload)).status_code == 422
    assert (await client.get("/__MODULE__/__RESOURCE__/list")).json()["data"]["total"] == 0


@pytest.mark.parametrize("order", [[{"password": "asc"}], [{"name": "drop"}], {"name": "asc"}, [{"name": []}], []])
async def test_invalid_sort_is_rejected(__RESOURCE___app, order):
    client, _, _ = __RESOURCE___app
    assert (await client.get("/__MODULE__/__RESOURCE__/list", params={"order_by": json.dumps(order)})).status_code == 422


@pytest.mark.parametrize("ids", [[], [0], [-1]])
async def test_invalid_delete_is_rejected(__RESOURCE___app, ids):
    client, _, _ = __RESOURCE___app
    assert (await client.request("DELETE", "/__MODULE__/__RESOURCE__/delete", json=ids)).status_code == 422


async def test_read_permission_does_not_grant_mutation(__RESOURCE___app):
    client, _, actor = __RESOURCE___app
    actor["permissions"] = {"module___MODULE__:__RESOURCE__:query": 1}
    assert (await client.get("/__MODULE__/__RESOURCE__/list")).status_code == 200
    assert (await client.post("/__MODULE__/__RESOURCE__/create", json={"name": "无权限"})).status_code == 403


@pytest.mark.parametrize("table_origin", ["migration", "existing", "bootstrap"])
def test_migration_preserves_tables_data_and_revision_on_refused_downgrade(tmp_path, table_origin):
    filename = Path(__file__).parents[1] / "app/alembic/versions/__MIGRATION_FILE__"
    spec = importlib.util.spec_from_file_location("__RESOURCE___migration", filename)
    migration = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(migration)
    scripts = tmp_path / "alembic"
    versions = scripts / "versions"
    versions.mkdir(parents=True)
    (versions / filename.name).write_text(filename.read_text())
    (versions / "parent.py").write_text(f"revision = {migration.down_revision!r}\ndown_revision = None\ndef upgrade(): pass\ndef downgrade(): pass\n")
    (scripts / "env.py").write_text(
        "from alembic import context\n"
        "context.configure(connection=context.config.attributes['connection'])\n"
        "with context.begin_transaction():\n"
        "    context.run_migrations()\n"
    )
    config = Config()
    config.set_main_option("script_location", str(scripts))
    engine = create_engine(f"sqlite:///{tmp_path / 'migration.db'}")
    with engine.begin() as connection:
        config.attributes["connection"] = connection
        migration.op = Operations(MigrationContext.configure(connection))
        command.stamp(config, migration.down_revision)
        command.upgrade(config, migration.revision)  # 空数据库等待 bootstrap。
        assert "__MODULE_____RESOURCE__" not in inspect(connection).get_table_names()
        command.downgrade(config, migration.down_revision)  # 没有表时可以安全回退。
        assert MigrationContext.configure(connection).get_current_revision() == migration.down_revision
        if table_origin == "bootstrap":
            command.upgrade(config, migration.revision)
        UserModel.__table__.create(connection)
        if table_origin != "migration":
            __MODEL_CLASS__.__table__.create(connection)
            connection.execute(__MODEL_CLASS__.__table__.insert().values(name="preserve-existing-data"))
        command.upgrade(config, migration.revision)
        # 重复运行迁移不能修改已有表或数据。
        migration.upgrade()
        migration.upgrade()
        if table_origin == "migration":
            connection.execute(__MODEL_CLASS__.__table__.insert().values(name="preserve-existing-data"))
        assert {column["name"] for column in inspect(connection).get_columns("__MODULE_____RESOURCE__")} == set(__MODEL_CLASS__.__table__.columns.keys())
        assert {item["name"] for item in inspect(connection).get_indexes("__MODULE_____RESOURCE__")} == {index.name for index in __MODEL_CLASS__.__table__.indexes}
        with pytest.raises(RuntimeError, match="Refusing automatic downgrade"):
            command.downgrade(config, migration.down_revision)
        assert "sys_user" in inspect(connection).get_table_names()
        assert connection.scalar(select(__MODEL_CLASS__.__table__.c.name)) == "preserve-existing-data"
        assert MigrationContext.configure(connection).get_current_revision() == migration.revision
    with engine.connect() as connection:
        assert connection.scalar(select(__MODEL_CLASS__.__table__.c.name)) == "preserve-existing-data"
        assert MigrationContext.configure(connection).get_current_revision() == migration.revision
    engine.dispose()


@pytest.mark.parametrize("dialect", [mysql.dialect(), postgresql.dialect()])
def test___RESOURCE___constraints_compile_for_supported_databases(dialect):
    sql = str(CreateTable(__MODEL_CLASS__.__table__).compile(dialect=dialect))
    assert "uq___MODULE_____RESOURCE___owner_name" in sql and "FOREIGN KEY" in sql
    quoted_order = dialect.identifier_preparer.quote("order")
    assert f"{quoted_order} >= 0" in sql
