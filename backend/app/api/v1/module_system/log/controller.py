from typing import Annotated

from fastapi import APIRouter, Body, Depends, Path
from fastapi.responses import JSONResponse

from app.common.response import ResponseSchema, SuccessResponse
from app.core.base_params import PaginationQueryParam
from app.core.base_schema import AuthSchema, BatchDelete, PageResultSchema
from app.core.dependencies import AuthPermission, get_current_user
from app.core.router_class import OperationLogRoute

from .schema import (
    LoginLogCreateSchema,
    LoginLogDetailOutSchema,
    LoginLogOutSchema,
    LoginLogQueryParam,
    OperationLogCreateSchema,
    OperationLogDetailOutSchema,
    OperationLogOutSchema,
    OperationLogQueryParam,
)
from .service import LoginLogService, OperationLogService

LogRouter = APIRouter(route_class=OperationLogRoute, prefix="/log", tags=["系统管理/日志管理"])


@LogRouter.get(
    "/login/detail/{id}",
    summary="获取登录日志详情",
    response_model=ResponseSchema[LoginLogDetailOutSchema],
)
async def get_obj_detail_controller(
    id: Annotated[int, Path(description="登录日志ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:login_log:query']))],
) -> JSONResponse:
    """
    获取登录日志详情

    参数:
    - id (int): 登录日志 ID。
    - auth (AuthSchema): 认证信息模型。

    返回:
    - JSONResponse: 包含登录日志详情的 JSON 响应。
    """
    result_dict = await LoginLogService.detail_service(id=id, auth=auth)
    return SuccessResponse(data=result_dict, msg="获取登录日志详情成功")


@LogRouter.get(
    "/login/list",
    summary="查询登录日志列表",
    response_model=ResponseSchema[PageResultSchema[LoginLogOutSchema]],
)
async def get_obj_list_controller(
    page: Annotated[PaginationQueryParam, Depends()],
    search: Annotated[LoginLogQueryParam, Depends()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:login_log:query']))],
) -> JSONResponse:
    """
    查询登录日志列表

    参数:
    - page (PaginationQueryParam): 分页查询参数。
    - search (LoginLogQueryParam): 查询筛选参数。
    - auth (AuthSchema): 认证信息模型。

    返回:
    - JSONResponse: 包含分页登录日志列表的 JSON 响应。
    """
    result_dict = await LoginLogService.page_service(
        auth=auth,
        page_no=page.page_no,
        page_size=page.page_size,
        search=search,
        order_by=page.order_by,
    )
    return SuccessResponse(data=result_dict, msg="查询登录日志列表成功")


@LogRouter.post(
    "/login/create",
    summary="创建登录日志",
    response_model=ResponseSchema[LoginLogDetailOutSchema],
)
async def create_obj_controller(
    data: LoginLogCreateSchema,
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    """
    创建登录日志

    参数:
    - data (LoginLogCreateSchema): 登录日志创建参数。
    - auth (AuthSchema): 认证信息模型。

    返回:
    - JSONResponse: 包含创建后的登录日志详情的 JSON 响应。
    """
    result_dict = await LoginLogService.create_service(auth=auth, data=data)
    return SuccessResponse(data=result_dict, msg="创建登录日志成功")


@LogRouter.delete(
    "/login/delete",
    summary="删除登录日志",
    response_model=ResponseSchema,
)
async def delete_obj_controller(
    ids: Annotated[list[int], Body(description="ID列表")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:login_log:delete']))],
) -> JSONResponse:
    """
    删除登录日志

    参数:
    - ids (list[int]): 日志 ID 列表。
    - auth (AuthSchema): 认证信息模型。

    返回:
    - JSONResponse: 删除结果。
    """
    await LoginLogService.delete_service(auth=auth, ids=ids)
    return SuccessResponse(msg="删除登录日志成功")


@LogRouter.get(
    "/operation/detail/{id}",
    summary="获取操作日志详情",
    response_model=ResponseSchema[OperationLogDetailOutSchema],
    dependencies=[Depends(AuthPermission(['module_system:log:query']))],
)
async def detail(
    *,
    id: Annotated[int, Path(gt=0)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
):
    """
    获取操作日志详情

    参数:
    - id (int): 操作日志 ID。
    - auth (AuthSchema): 认证信息模型。

    返回:
    - JSONResponse: 包含操作日志详情的 JSON 响应。
    """
    result_dict = await OperationLogService.detail_service(auth, id)
    return SuccessResponse(data=result_dict, msg="获取操作日志详情成功")


@LogRouter.get(
    "/operation/list",
    summary="获取操作日志列表",
    response_model=ResponseSchema[PageResultSchema[OperationLogOutSchema]],
    dependencies=[Depends(AuthPermission(['module_system:log:query']))],
)
async def list(
    *,
    page: Annotated[PaginationQueryParam, Depends()],
    search: Annotated[OperationLogQueryParam, Depends()],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
):
    """
    获取操作日志列表

    参数:
    - page (PaginationQueryParam): 分页查询参数。
    - search (OperationLogQueryParam): 查询筛选参数。
    - auth (AuthSchema): 认证信息模型。

    返回:
    - JSONResponse: 包含分页操作日志列表的 JSON 响应。
    """
    result_dict = await OperationLogService.page_service(
        auth,
        page.page_no,
        page.page_size,
        search.model_dump(exclude_none=True),
        page.order_by,
    )
    return SuccessResponse(data=result_dict, msg="查询操作日志列表成功")


@LogRouter.post(
    "/operation/create",
    summary="创建操作日志",
    response_model=ResponseSchema[OperationLogDetailOutSchema],
)
async def create(
    *,
    data: OperationLogCreateSchema,
    auth: Annotated[AuthSchema, Depends(get_current_user)],
):
    """
    创建操作日志

    参数:
    - data (OperationLogCreateSchema): 操作日志创建参数。
    - auth (AuthSchema): 认证信息模型。

    返回:
    - JSONResponse: 包含创建后的操作日志详情的 JSON 响应。
    """
    result_dict = await OperationLogService.create_service(auth, data)
    return SuccessResponse(data=result_dict, msg="创建操作日志成功")


@LogRouter.delete(
    "/operation/delete",
    summary="删除操作日志",
    response_model=ResponseSchema,
    dependencies=[Depends(AuthPermission(['module_system:log:delete']))],
)
async def delete(
    *,
    data: BatchDelete,
    auth: Annotated[AuthSchema, Depends(get_current_user)],
):
    """
    删除操作日志

    参数:
    - data (BatchDelete): 批量删除参数（ID 列表）。
    - auth (AuthSchema): 认证信息模型。

    返回:
    - JSONResponse: 删除结果。
    """
    await OperationLogService.delete_service(auth, data.ids)
    return SuccessResponse(msg="删除操作日志成功")
