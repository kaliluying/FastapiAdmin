from typing import Annotated

from fastapi import APIRouter, Body, Depends, Path

from app.api.v1.module_system.auth.schema import AuthSchema
from app.common.response import ResponseSchema, SuccessResponse
from app.core.base_params import PaginationQueryParam
from app.core.dependencies import AuthPermission
from app.core.logger import log
from app.core.router_class import OperationLogRoute

from .schema import TicketBatchSchema, TicketCreateSchema, TicketOutSchema, TicketQueryParam, TicketUpdateSchema
from .service import TicketService

TicketRouter = APIRouter(route_class=OperationLogRoute, prefix="/ticket", tags=["工单管理"])


@TicketRouter.get("/list", summary="工单列表", response_model=ResponseSchema[dict])
async def ticket_list(
    page: Annotated[PaginationQueryParam, Depends()],
    search: Annotated[TicketQueryParam, Depends()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:ticket:query"]))],
):
    result = await TicketService.page_service(auth=auth, page_no=page.page_no, page_size=page.page_size, search=search, order_by=page.order_by)
    return SuccessResponse(data=result, msg="查询成功")


@TicketRouter.get("/detail/{id}", summary="工单详情", response_model=ResponseSchema[TicketOutSchema])
async def ticket_detail(
    id: Annotated[int, Path()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:ticket:query"]))],
):
    result = await TicketService.detail_service(auth=auth, id=id)
    return SuccessResponse(data=result, msg="查询成功")


@TicketRouter.post("/create", summary="创建工单", response_model=ResponseSchema[TicketOutSchema])
async def ticket_create(
    data: TicketCreateSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:ticket:create"]))],
):
    result = await TicketService.create_service(auth=auth, data=data)
    log.info(f"创建工单: {data.title}")
    return SuccessResponse(data=result, msg="创建成功")


@TicketRouter.put("/update/{id}", summary="更新工单", response_model=ResponseSchema[TicketOutSchema])
async def ticket_update(
    id: Annotated[int, Path()],
    data: TicketUpdateSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:ticket:update"]))],
):
    result = await TicketService.update_service(auth=auth, id=id, data=data)
    log.info(f"更新工单: {id}")
    return SuccessResponse(data=result, msg="更新成功")


@TicketRouter.put("/batch", summary="批量更新工单", response_model=ResponseSchema)
async def ticket_batch_update(
    data: TicketBatchSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:ticket:update"]))],
):
    await TicketService.batch_service(auth=auth, data=data)
    log.info(f"批量更新工单状态: {data.ids} -> {data.status}")
    return SuccessResponse(msg="批量更新成功")


@TicketRouter.delete("/delete", summary="删除工单")
async def ticket_delete(
    ids: Annotated[list[int], Body()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:ticket:delete"]))],
):
    await TicketService.delete_service(auth=auth, ids=ids)
    log.info(f"删除工单: {ids}")
    return SuccessResponse(msg="删除成功")
