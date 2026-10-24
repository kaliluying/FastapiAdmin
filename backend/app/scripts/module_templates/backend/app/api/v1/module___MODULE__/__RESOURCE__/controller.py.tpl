from typing import Annotated

from fastapi import APIRouter, Body, Depends, Path
from fastapi.responses import JSONResponse
from pydantic import Field

from app.common.response import ResponseSchema, SuccessResponse
from app.core.base_params import PaginationQueryParam
from app.core.base_schema import AuthSchema, PageResultSchema
from app.core.dependencies import AuthPermission
from app.core.router_class import OperationLogRoute

from .schema import __RESOURCE_CLASS__CreateSchema, __RESOURCE_CLASS__OutSchema, __RESOURCE_CLASS__QueryParam, __RESOURCE_CLASS__UpdateSchema
from .service import __RESOURCE_CLASS__Service

__RESOURCE_CLASS__Router = APIRouter(prefix="/__RESOURCE__", tags=["__MODULE_TITLE__", "__TITLE__管理"], route_class=OperationLogRoute)


@__RESOURCE_CLASS__Router.get("/list", summary="查询__TITLE__", response_model=ResponseSchema[PageResultSchema[__RESOURCE_CLASS__OutSchema]])
async def list___RESOURCE___items(
    page: Annotated[PaginationQueryParam, Depends()],
    search: Annotated[__RESOURCE_CLASS__QueryParam, Depends()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module___MODULE__:__RESOURCE__:query"]))],
) -> JSONResponse:
    result = await __RESOURCE_CLASS__Service(auth).page(page.page_no, page.page_size, search, page.order_by)
    return SuccessResponse(data=result)


@__RESOURCE_CLASS__Router.get("/detail/{id}", summary="查看__TITLE__", response_model=ResponseSchema[__RESOURCE_CLASS__OutSchema])
async def get___RESOURCE__(
    id: Annotated[int, Path(gt=0)],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module___MODULE__:__RESOURCE__:detail"]))],
) -> JSONResponse:
    return SuccessResponse(data=await __RESOURCE_CLASS__Service(auth).detail(id))


@__RESOURCE_CLASS__Router.post("/create", summary="创建__TITLE__", response_model=ResponseSchema[__RESOURCE_CLASS__OutSchema])
async def create___RESOURCE__(
    data: __RESOURCE_CLASS__CreateSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module___MODULE__:__RESOURCE__:create"]))],
) -> JSONResponse:
    return SuccessResponse(data=await __RESOURCE_CLASS__Service(auth).create(data), msg="__TITLE__已创建")


@__RESOURCE_CLASS__Router.put("/update/{id}", summary="修改__TITLE__", response_model=ResponseSchema[__RESOURCE_CLASS__OutSchema])
async def update___RESOURCE__(
    id: Annotated[int, Path(gt=0)],
    data: __RESOURCE_CLASS__UpdateSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module___MODULE__:__RESOURCE__:update"]))],
) -> JSONResponse:
    return SuccessResponse(data=await __RESOURCE_CLASS__Service(auth).update(id, data), msg="__TITLE__已保存")


@__RESOURCE_CLASS__Router.delete("/delete", summary="删除__TITLE__", response_model=ResponseSchema[None])
async def delete___RESOURCE___items(
    ids: Annotated[list[Annotated[int, Field(gt=0)]], Body(min_length=1, max_length=100)],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module___MODULE__:__RESOURCE__:delete"]))],
) -> JSONResponse:
    await __RESOURCE_CLASS__Service(auth).delete(ids)
    return SuccessResponse(msg="__TITLE__已删除")
