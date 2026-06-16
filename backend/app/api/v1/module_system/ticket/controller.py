from typing import Annotated

from fastapi import APIRouter, Body, Depends, Path
from fastapi.responses import JSONResponse

from app.common.response import ResponseSchema, SuccessResponse
from app.core.base_params import PaginationQueryParam
from app.core.base_schema import AuthSchema, PageResultSchema
from app.core.dependencies import AuthPermission
from app.core.router_class import OperationLogRoute

from .schema import (
    TicketBatchSchema,
    TicketCreateSchema,
    TicketOutSchema,
    TicketQueryParam,
    TicketUpdateSchema,
)
from .service import TicketService

TicketRouter = APIRouter(route_class=OperationLogRoute, prefix="/ticket", tags=["系统管理/工单管理"])


@TicketRouter.get("/list", summary="工单列表", response_model=ResponseSchema[PageResultSchema[TicketOutSchema]])
async def ticket_list(
    page: Annotated[PaginationQueryParam, Depends()],
    search: Annotated[TicketQueryParam, Depends()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:ticket:query']))],
) -> JSONResponse:
    """
    工单列表

    参数:
    - page (PaginationQueryParam): 分页查询参数。
    - search (TicketQueryParam): 查询筛选参数。
    - auth (AuthSchema): 认证信息模型。

    返回:
    - JSONResponse: 包含分页工单列表的 JSON 响应。
    """
    result = await TicketService.page_service(
        auth=auth,
        page_no=page.page_no,
        page_size=page.page_size,
        search=search,
        order_by=page.order_by,
    )
    return SuccessResponse(data=result, msg="查询成功")


@TicketRouter.get(
    "/detail/{id}", summary="工单详情", response_model=ResponseSchema[TicketOutSchema]
)
async def ticket_detail(
    id: Annotated[int, Path()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:ticket:query']))],
) -> JSONResponse:
    """
    工单详情

    参数:
    - id (int): 工单 ID。
    - auth (AuthSchema): 认证信息模型。

    返回:
    - JSONResponse: 包含工单详情的 JSON 响应。
    """
    result = await TicketService.detail_service(auth=auth, id=id)
    return SuccessResponse(data=result, msg="查询成功")


@TicketRouter.post("/create", summary="创建工单", response_model=ResponseSchema[TicketOutSchema])
async def ticket_create(
    data: TicketCreateSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:ticket:create']))],
) -> JSONResponse:
    """
    创建工单

    参数:
    - data (TicketCreateSchema): 工单创建参数。
    - auth (AuthSchema): 认证信息模型。

    返回:
    - JSONResponse: 包含创建后的工单详情的 JSON 响应。
    """
    result = await TicketService.create_service(auth=auth, data=data)
    return SuccessResponse(data=result, msg="创建成功")


@TicketRouter.put(
    "/update/{id}", summary="更新工单", response_model=ResponseSchema[TicketOutSchema]
)
async def ticket_update(
    id: Annotated[int, Path()],
    data: TicketUpdateSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:ticket:update']))],
) -> JSONResponse:
    """
    更新工单

    参数:
    - id (int): 工单 ID。
    - data (TicketUpdateSchema): 工单更新参数。
    - auth (AuthSchema): 认证信息模型。

    返回:
    - JSONResponse: 包含更新后的工单详情的 JSON 响应。
    """
    result = await TicketService.update_service(auth=auth, id=id, data=data)
    return SuccessResponse(data=result, msg="更新成功")


@TicketRouter.put("/batch", summary="批量更新工单", response_model=ResponseSchema)
async def ticket_batch_update(
    data: TicketBatchSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:ticket:update']))],
) -> JSONResponse:
    """
    批量更新工单

    参数:
    - data (TicketBatchSchema): 批量更新参数（ID 列表 + 状态）。
    - auth (AuthSchema): 认证信息模型。

    返回:
    - JSONResponse: 操作结果。
    """
    await TicketService.batch_service(auth=auth, data=data)
    return SuccessResponse(msg="批量更新成功")


@TicketRouter.delete("/delete", summary="删除工单", response_model=ResponseSchema[None])
async def ticket_delete(
    ids: Annotated[list[int], Body()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:ticket:delete']))],
) -> JSONResponse:
    """
    删除工单

    参数:
    - ids (list[int]): 工单 ID 列表。
    - auth (AuthSchema): 认证信息模型。

    返回:
    - JSONResponse: 删除结果。
    """
    await TicketService.delete_service(auth=auth, ids=ids)
    return SuccessResponse(msg="删除成功")
