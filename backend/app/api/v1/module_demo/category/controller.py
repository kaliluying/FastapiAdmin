from typing import Annotated

from fastapi import APIRouter, Body, Depends, Path
from fastapi.responses import JSONResponse
from pydantic import Field

from app.common.response import ResponseSchema, SuccessResponse
from app.core.base_params import PaginationQueryParam
from app.core.base_schema import AuthSchema, PageResultSchema
from app.core.dependencies import AuthPermission
from app.core.router_class import OperationLogRoute

from .schema import CategoryCreateSchema, CategoryOutSchema, CategoryQueryParam, CategoryUpdateSchema
from .service import CategoryService

CategoryRouter = APIRouter(prefix="/category", tags=["开发范例", "分类管理"], route_class=OperationLogRoute)


@CategoryRouter.get("/list", summary="查询分类", response_model=ResponseSchema[PageResultSchema[CategoryOutSchema]])
async def list_categories(
    page: Annotated[PaginationQueryParam, Depends()],
    search: Annotated[CategoryQueryParam, Depends()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_demo:category:query"]))],
) -> JSONResponse:
    result = await CategoryService(auth).page(page.page_no, page.page_size, search, page.order_by)
    return SuccessResponse(data=result)


@CategoryRouter.get("/detail/{id}", summary="查看分类", response_model=ResponseSchema[CategoryOutSchema])
async def get_category(
    id: Annotated[int, Path(gt=0)],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_demo:category:detail"]))],
) -> JSONResponse:
    return SuccessResponse(data=await CategoryService(auth).detail(id))


@CategoryRouter.post("/create", summary="创建分类", response_model=ResponseSchema[CategoryOutSchema])
async def create_category(
    data: CategoryCreateSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_demo:category:create"]))],
) -> JSONResponse:
    return SuccessResponse(data=await CategoryService(auth).create(data), msg="分类已创建")


@CategoryRouter.put("/update/{id}", summary="修改分类", response_model=ResponseSchema[CategoryOutSchema])
async def update_category(
    id: Annotated[int, Path(gt=0)],
    data: CategoryUpdateSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_demo:category:update"]))],
) -> JSONResponse:
    return SuccessResponse(data=await CategoryService(auth).update(id, data), msg="分类已保存")


@CategoryRouter.delete("/delete", summary="删除分类", response_model=ResponseSchema[None])
async def delete_categories(
    ids: Annotated[list[Annotated[int, Field(gt=0)]], Body(min_length=1, max_length=100)],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_demo:category:delete"]))],
) -> JSONResponse:
    await CategoryService(auth).delete(ids)
    return SuccessResponse(msg="分类已删除")
