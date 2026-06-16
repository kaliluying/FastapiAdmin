from typing import Annotated

from fastapi import APIRouter, Body, Depends, Path
from fastapi.responses import JSONResponse
from fastapi_cache import FastAPICache
from fastapi_cache.decorator import cache

from app.common.response import ResponseSchema, SuccessResponse
from app.core.base_params import PaginationQueryParam
from app.core.base_schema import AuthSchema, BatchSetAvailable, PageResultSchema
from app.core.dependencies import AuthPermission
from app.core.router_class import OperationLogRoute

from .schema import (
    PackageCreateSchema,
    PackageMenuSetSchema,
    PackageOutSchema,
    PackagePluginSetSchema,
    PackageQueryParam,
    PackageUpdateSchema,
)
from .service import PackageService

PackageRouter = APIRouter(route_class=OperationLogRoute, prefix="/package", tags=["平台管理/套餐管理"])

_PKG_NS = "package"


@PackageRouter.get(
    "/detail/{id}",
    summary="获取套餐详情",
    response_model=ResponseSchema[PackageOutSchema],
)
@cache(expire=300, namespace=_PKG_NS)
async def get_obj_detail_controller(
    id: Annotated[int, Path(description="套餐ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_package:package:query']))],
) -> JSONResponse:
    """
    获取套餐详情

    参数:
    - id (int): 套餐 ID。

    返回:
    - JSONResponse: 包含套餐详情的 JSON 响应。
    """
    result_dict = await PackageService.detail_service(auth=auth, id=id)
    return SuccessResponse(data=result_dict, msg="获取套餐详情成功")


@PackageRouter.get(
    "/list",
    summary="获取套餐列表",
    response_model=ResponseSchema[PageResultSchema[PackageOutSchema]],
)
async def get_obj_list_controller(
    page: Annotated[PaginationQueryParam, Depends()],
    search: Annotated[PackageQueryParam, Depends()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_package:package:query']))],
) -> JSONResponse:
    """
    获取套餐列表

    参数:
    - page (PaginationQueryParam): 分页查询参数。
    - search (PackageQueryParam): 查询筛选参数。

    返回:
    - JSONResponse: 包含分页套餐列表的 JSON 响应。
    """
    result_dict = await PackageService.page_service(
        auth=auth,
        page_no=page.page_no,
        page_size=page.page_size,
        search=search,
        order_by=page.order_by,
    )
    return SuccessResponse(data=result_dict, msg="查询成功")


@PackageRouter.post(
    "/create",
    summary="创建套餐",
    response_model=ResponseSchema[PackageOutSchema],
)
async def create_obj_controller(
    data: Annotated[PackageCreateSchema, Body(description="套餐信息")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_package:package:create']))],
) -> JSONResponse:
    """
    创建套餐

    参数:
    - data (PackageCreateSchema): 套餐创建参数。

    返回:
    - JSONResponse: 包含创建后的套餐详情的 JSON 响应。
    """
    result_dict = await PackageService.create_service(auth=auth, data=data)
    await FastAPICache.clear(namespace=_PKG_NS)
    return SuccessResponse(data=result_dict, msg="创建成功")


@PackageRouter.put(
    "/update/{id}",
    summary="更新套餐",
    response_model=ResponseSchema[PackageOutSchema],
)
async def update_obj_controller(
    id: Annotated[int, Path(description="套餐ID")],
    data: Annotated[PackageUpdateSchema, Body(description="套餐信息")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_package:package:update']))],
) -> JSONResponse:
    """
    更新套餐

    参数:
    - id (int): 套餐 ID。
    - data (PackageUpdateSchema): 套餐更新参数。

    返回:
    - JSONResponse: 包含更新后的套餐详情的 JSON 响应。
    """
    result_dict = await PackageService.update_service(auth=auth, id=id, data=data)
    await FastAPICache.clear(namespace=_PKG_NS)
    return SuccessResponse(data=result_dict, msg="更新成功")


@PackageRouter.delete(
    "/delete",
    summary="删除套餐",
    response_model=ResponseSchema,
)
async def delete_obj_controller(
    ids: Annotated[list[int], Body(description="ID列表")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_package:package:delete']))],
) -> JSONResponse:
    """
    删除套餐

    参数:
    - ids (list[int]): 套餐 ID 列表。

    返回:
    - JSONResponse: 删除结果。
    """
    await PackageService.delete_service(auth=auth, ids=ids)
    await FastAPICache.clear(namespace=_PKG_NS)
    return SuccessResponse(msg="删除成功")


@PackageRouter.patch(
    "/status/batch",
    summary="批量修改状态",
    response_model=ResponseSchema,
)
async def set_available_controller(
    data: Annotated[BatchSetAvailable, Body(description="状态设置")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_package:package:update']))],
) -> JSONResponse:
    """
    批量修改套餐状态

    参数:
    - data (BatchSetAvailable): 批量状态设置参数。

    返回:
    - JSONResponse: 操作结果。
    """
    for id in data.ids:
        await PackageService.update_service(auth=auth, id=id, data=PackageUpdateSchema(status=data.status))
    await FastAPICache.clear(namespace=_PKG_NS)
    return SuccessResponse(msg="状态设置成功")


@PackageRouter.get(
    "/menus/{package_id}",
    summary="获取套餐菜单",
    response_model=ResponseSchema[list[int]],
)
async def get_menus_controller(
    package_id: Annotated[int, Path(description="套餐ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_package:package:query']))],
) -> JSONResponse:
    """
    获取套餐关联菜单

    参数:
    - package_id (int): 套餐 ID。

    返回:
    - JSONResponse: 包含菜单 ID 列表的 JSON 响应。
    """
    result = await PackageService.get_menus_service(auth=auth, package_id=package_id)
    return SuccessResponse(data=result, msg="获取成功")


@PackageRouter.post(
    "/menus/{package_id}/set",
    summary="设置套餐菜单",
    response_model=ResponseSchema,
)
async def set_menus_controller(
    package_id: Annotated[int, Path(description="套餐ID")],
    data: Annotated[PackageMenuSetSchema, Body(description="菜单列表")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_package:package:update']))],
) -> JSONResponse:
    """
    设置套餐菜单权限

    参数:
    - package_id (int): 套餐 ID。
    - data (PackageMenuSetSchema): 菜单 ID 列表。

    返回:
    - JSONResponse: 操作结果。
    """
    await PackageService.set_menus_service(auth=auth, package_id=package_id, data=data)
    return SuccessResponse(msg="设置成功")


@PackageRouter.get(
    "/plugins/{package_id}",
    summary="获取套餐插件",
    response_model=ResponseSchema[list[int]],
)
async def get_plugins_controller(
    package_id: Annotated[int, Path(description="套餐ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_package:package:query']))],
) -> JSONResponse:
    """
    获取套餐关联插件

    参数:
    - package_id (int): 套餐 ID。

    返回:
    - JSONResponse: 包含插件 ID 列表的 JSON 响应。
    """
    result = await PackageService.get_plugins_service(auth=auth, package_id=package_id)
    return SuccessResponse(data=result, msg="获取成功")


@PackageRouter.post(
    "/plugins/{package_id}/set",
    summary="设置套餐插件",
    response_model=ResponseSchema,
)
async def set_plugins_controller(
    package_id: Annotated[int, Path(description="套餐ID")],
    data: Annotated[PackagePluginSetSchema, Body(description="插件列表")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_package:package:update']))],
) -> JSONResponse:
    """
    设置套餐插件

    参数:
    - package_id (int): 套餐 ID。
    - data (PackagePluginSetSchema): 插件 ID 列表。

    返回:
    - JSONResponse: 操作结果。
    """
    await PackageService.set_plugins_service(auth=auth, package_id=package_id, data=data)
    return SuccessResponse(msg="设置成功")
