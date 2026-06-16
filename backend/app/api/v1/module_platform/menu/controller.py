from typing import Annotated

from fastapi import APIRouter, Body, Depends, Path
from fastapi.responses import JSONResponse
from fastapi_cache import FastAPICache
from fastapi_cache.decorator import cache

from app.common.response import ResponseSchema, SuccessResponse
from app.core.base_schema import AuthSchema, BatchSetAvailable
from app.core.dependencies import AuthPermission
from app.core.router_class import OperationLogRoute

from .schema import MenuCreateSchema, MenuOutSchema, MenuQueryParam, MenuUpdateSchema
from .service import MenuService

MenuRouter = APIRouter(route_class=OperationLogRoute, prefix="/menu", tags=["平台管理/菜单管理"])

_MENU_NS = "menu"


@MenuRouter.get(
    "/tree",
    summary="查询菜单树",
    response_model=ResponseSchema[list[MenuOutSchema]],
)
@cache(expire=300, namespace=_MENU_NS)
async def get_menu_tree_controller(
    search: Annotated[MenuQueryParam, Depends()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_platform:menu:query']))],
) -> JSONResponse:
    """
    查询菜单树。

    参数:
    - search (MenuQueryParam): 查询参数模型。

    返回:
    - JSONResponse: 包含菜单树的 JSON 响应。
    """
    order_by = [{"order": "asc"}]
    result_dict_list = await MenuService.get_menu_tree_service(
        search=search, auth=auth, order_by=order_by
    )
    return SuccessResponse(data=result_dict_list, msg="查询菜单树成功")


@MenuRouter.get(
    "/detail/{id}",
    summary="查询菜单详情",
    response_model=ResponseSchema[MenuOutSchema],
)
async def get_obj_detail_controller(
    id: Annotated[int, Path(description="菜单ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_platform:menu:detail']))],
) -> JSONResponse:
    """
    查询菜单详情。

    参数:
    - id (int): 菜单ID。

    返回:
    - JSONResponse: 包含菜单详情的 JSON 响应。
    """
    result_dict = await MenuService.get_menu_detail_service(id=id, auth=auth)
    return SuccessResponse(data=result_dict, msg="查询菜单详情成功")


@MenuRouter.post(
    "/create",
    summary="创建菜单",
    response_model=ResponseSchema[MenuOutSchema],
)
async def create_obj_controller(
    data: MenuCreateSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_platform:menu:create']))],
) -> JSONResponse:
    """
    创建菜单。

    参数:
    - data (MenuCreateSchema): 菜单创建模型。

    返回:
    - JSONResponse: 包含创建菜单的 JSON 响应。
    """
    result_dict = await MenuService.create_menu_service(data=data, auth=auth)
    await FastAPICache.clear(namespace=_MENU_NS)
    return SuccessResponse(data=result_dict, msg="创建菜单成功")


@MenuRouter.put(
    "/update/{id}",
    summary="修改菜单",
    response_model=ResponseSchema[MenuOutSchema],
)
async def update_obj_controller(
    data: MenuUpdateSchema,
    id: Annotated[int, Path(description="菜单ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_platform:menu:update']))],
) -> JSONResponse:
    """
    修改菜单。

    参数:
    - id (int): 菜单ID。
    - data (MenuUpdateSchema): 菜单更新模型。

    返回:
    - JSONResponse: 包含修改菜单的 JSON 响应。
    """
    result_dict = await MenuService.update_menu_service(id=id, data=data, auth=auth)
    await FastAPICache.clear(namespace=_MENU_NS)
    return SuccessResponse(data=result_dict, msg="修改菜单成功")


@MenuRouter.delete(
    "/delete",
    summary="删除菜单",
    response_model=ResponseSchema[None],
)
async def delete_obj_controller(
    ids: Annotated[list[int], Body(description="ID列表")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_platform:menu:delete']))],
) -> JSONResponse:
    """
    删除菜单。

    参数:
    - ids (list[int]): 菜单ID列表。

    返回:
    - JSONResponse: 包含删除菜单的 JSON 响应。
    """
    await MenuService.delete_menu_service(ids=ids, auth=auth)
    await FastAPICache.clear(namespace=_MENU_NS)
    return SuccessResponse(msg="删除菜单成功")


@MenuRouter.patch(
    "/status/batch",
    summary="批量修改菜单状态",
    response_model=ResponseSchema[None],
)
async def batch_set_available_obj_controller(
    data: BatchSetAvailable,
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_platform:menu:patch']))],
) -> JSONResponse:
    """
    批量修改菜单状态。

    参数:
    - data (BatchSetAvailable): 批量修改菜单状态模型。

    返回:
    - JSONResponse: 批量修改菜单状态的 JSON 响应。
    """
    await MenuService.set_menu_available_service(data=data, auth=auth)
    await FastAPICache.clear(namespace=_MENU_NS)
    return SuccessResponse(msg="批量修改菜单状态成功")
