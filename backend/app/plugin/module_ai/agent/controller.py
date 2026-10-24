from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.common.response import SuccessResponse
from app.core.base_schema import AuthSchema
from app.core.dependencies import AuthPermission
from app.core.router_class import OperationLogRoute

from .schema import AgentRunCreateSchema
from .service import cancel_run, create_run, get_run, list_runs

AgentRouter = APIRouter(route_class=OperationLogRoute, prefix="/agent", tags=["AI诊断任务"])
AgentAuth = Annotated[AuthSchema, Depends(AuthPermission(["module_ai:chat:ws"]))]


@AgentRouter.post("/runs", summary="创建只读诊断任务", openapi_extra={"x-audit-payload": False})
async def create_agent_run(data: AgentRunCreateSchema, auth: AgentAuth):
    return SuccessResponse(data=await create_run(auth, data))


@AgentRouter.get("/runs", summary="本人诊断任务列表")
async def list_agent_runs(auth: AgentAuth, limit: Annotated[int, Query(ge=1, le=50)] = 20):
    return SuccessResponse(data=await list_runs(auth, limit))


@AgentRouter.get("/runs/{run_id}", summary="读取诊断进度和结果")
async def get_agent_run(run_id: str, auth: AgentAuth, after_seq: Annotated[int, Query(ge=0)] = 0):
    return SuccessResponse(data=await get_run(auth, run_id, after_seq=after_seq))


@AgentRouter.post("/runs/{run_id}/cancel", summary="取消本人诊断任务", openapi_extra={"x-audit-payload": False})
async def cancel_agent_run(run_id: str, auth: AgentAuth):
    return SuccessResponse(data=await cancel_run(auth, run_id))
