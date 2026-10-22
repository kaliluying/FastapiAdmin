"""Exercise operation auditing across request, transaction and response failures."""

import json
from contextlib import asynccontextmanager
from typing import Annotated
from unittest.mock import AsyncMock

import httpx
import pytest
from fastapi import BackgroundTasks, Body, Depends, FastAPI
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, OperationalError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.module_system.log.model import OperationLogModel
from app.api.v1.module_system.user.model import UserModel
from app.core import dependencies, router_class
from app.core.exceptions import CustomException, handle_exception
from tests.test_arch_auth_regressions import arch_sessions as arch_sessions


@pytest.fixture
def audit_app(arch_sessions, monkeypatch):
    monkeypatch.setattr(router_class, "async_db_session", arch_sessions)
    monkeypatch.setattr(router_class.settings, "OPERATION_LOG_RECORD", True)
    monkeypatch.setattr(router_class.settings, "OPERATION_RECORD_METHOD", ["POST"])
    monkeypatch.setattr(router_class.settings, "IGNORE_OPERATION_FUNCTION", [])
    app = FastAPI()
    app.router.route_class = router_class.OperationLogRoute
    handle_exception(app)
    return app


async def only_record(sessions):
    async with sessions() as db:
        records = (await db.scalars(select(OperationLogModel))).all()
        assert len(records) == 1
        return records[0]


@pytest.mark.parametrize("failure,status", [("permission", 403), ("validation", 422), ("business", 409), ("unhandled", 500)])
async def test_failed_request_has_one_safe_operation_audit(audit_app, arch_sessions, failure, status):
    @audit_app.post("/failure")
    async def fail(payload: Annotated[int, Body()]):
        if failure in {"permission", "business"}:
            raise CustomException(msg="synthetic-private-detail", status_code=status)
        raise RuntimeError("synthetic-private-detail")

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=audit_app, raise_app_exceptions=False), base_url="http://test") as client:
        response = await client.post("/failure", json="invalid" if failure == "validation" else 7)
    assert response.status_code == status
    record = await only_record(arch_sessions)
    assert record.request_path == "/failure"
    assert record.response_code == status
    assert "synthetic-private-detail" not in record.response_json
    assert json.loads(record.request_payload) == {"omitted": True}


@pytest.mark.parametrize("failure", ["background", "stream"])
@pytest.mark.parametrize("omit_payload", [False, True])
async def test_response_failure_still_audits_without_changing_sent_status(audit_app, arch_sessions, failure, omit_payload):
    async def fail_task():
        raise RuntimeError("synthetic-private-detail")

    async def fail_stream():
        yield b"partial"
        raise RuntimeError("synthetic-private-detail")

    @audit_app.post("/response", openapi_extra={"x-audit-payload": False} if omit_payload else None)
    async def respond(tasks: BackgroundTasks):
        if failure == "stream":
            return StreamingResponse(fail_stream())
        tasks.add_task(fail_task)
        return {"private_content": "synthetic-private-detail"}

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=audit_app, raise_app_exceptions=False), base_url="http://test") as client:
        response = await client.post("/response", json={"content": "synthetic-private-detail"})
    assert response.status_code == 200
    record = await only_record(arch_sessions)
    assert record.response_code == 200
    assert "synthetic-private-detail" not in record.request_payload + record.response_json
    assert json.loads(record.request_payload) == {"omitted": True}
    assert json.loads(record.response_json)["error_type"] == "RuntimeError"


@pytest.mark.parametrize("failure,status", [
    (RuntimeError("synthetic-private-detail"), 500),
    (IntegrityError("synthetic statement", {}, ValueError("synthetic-private-detail")), 409),
    (OperationalError("synthetic statement", {}, ConnectionError("synthetic-private-detail: connection lost"), connection_invalidated=True), 503),
])
async def test_commit_failure_is_audited_as_failure_after_rollback(audit_app, arch_sessions, monkeypatch, failure, status):
    @asynccontextmanager
    async def failing_transaction():
        async with arch_sessions() as db:
            monkeypatch.setattr(db, "commit", AsyncMock(side_effect=failure))
            yield db

    monkeypatch.setattr(dependencies, "async_db_session", failing_transaction)

    @audit_app.post("/commit")
    async def write(payload: dict, db: Annotated[AsyncSession, Depends(dependencies.db_getter, scope="function")]):
        db.add(UserModel(username="rolledback", name="Rolled back", password="fixture"))
        await db.flush()
        return {"success": True, "private_content": "SYNTHETIC_RESPONSE"}

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=audit_app, raise_app_exceptions=False), base_url="http://test") as client:
        response = await client.post("/commit", json={"content": "SYNTHETIC_REQUEST"})
    assert response.status_code == status
    record = await only_record(arch_sessions)
    assert record.response_code == status
    assert "synthetic-private-detail" not in record.response_json
    assert "SYNTHETIC_RESPONSE" not in record.response_json
    assert json.loads(record.request_payload) == {"omitted": True}
    async with arch_sessions() as db:
        assert await db.scalar(select(UserModel).where(UserModel.username == "rolledback")) is None
