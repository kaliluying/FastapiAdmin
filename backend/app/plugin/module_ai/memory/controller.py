"""Memory controller — CRUD endpoints for AI memory management."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query
from fastapi.responses import JSONResponse

from app.common.response import ResponseSchema, SuccessResponse
from app.core.base_params import PaginationQueryParam
from app.core.base_schema import AuthSchema
from app.core.dependencies import AuthPermission
from app.core.router_class import OperationLogRoute

from .schema import (
    MemoryCreateSchema,
    MemoryOutSchema,
    MemoryQueryParam,
    MemoryUpdateSchema,
)
from .service import MemoryService

MemoryRouter = APIRouter(
    route_class=OperationLogRoute,
    prefix="/memory",
    tags=["AI管理", "AI记忆"],
)


@MemoryRouter.get(
    "/list",
    summary="查询记忆列表",
    response_model=ResponseSchema[dict],
)
async def list_memory_controller(
    page: Annotated[PaginationQueryParam, Depends()],
    search: Annotated[MemoryQueryParam, Depends()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:memory:query"]))],
) -> JSONResponse:
    service = MemoryService(auth)
    result_dict = await service.page(
        page_no=page.page_no,
        page_size=page.page_size,
        search=search,
        order_by=page.order_by,
    )
    return SuccessResponse(data=result_dict, msg="查询记忆列表成功")


@MemoryRouter.post(
    "/create",
    summary="创建记忆",
    response_model=ResponseSchema[MemoryOutSchema],
)
async def create_memory_controller(
    data: MemoryCreateSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:memory:create"]))],
) -> JSONResponse:
    service = MemoryService(auth)
    result = await service.create(data=data)
    return SuccessResponse(data=result, msg="创建记忆成功")


@MemoryRouter.put(
    "/update/{memory_id}",
    summary="更新记忆",
    response_model=ResponseSchema[None],
)
async def update_memory_controller(
    memory_id: Annotated[int, Path(description="记忆ID", ge=1)],
    data: MemoryUpdateSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:memory:update"]))],
) -> JSONResponse:
    service = MemoryService(auth)
    await service.update(memory_id=memory_id, data=data)
    return SuccessResponse(data=None, msg="更新记忆成功")


@MemoryRouter.delete(
    "/delete",
    summary="删除记忆",
    response_model=ResponseSchema[None],
)
async def delete_memory_controller(
    memory_ids: Annotated[list[int], Query(description="记忆ID列表")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:memory:delete"]))],
) -> JSONResponse:
    service = MemoryService(auth)
    await service.delete(memory_ids=memory_ids)
    return SuccessResponse(data=None, msg="删除记忆成功")
