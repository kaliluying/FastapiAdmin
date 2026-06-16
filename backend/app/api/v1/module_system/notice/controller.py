from typing import Annotated

from fastapi import APIRouter, Body, Depends, Path
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi_cache import FastAPICache
from fastapi_cache.decorator import cache

from app.common.response import ResponseSchema, StreamResponse, SuccessResponse
from app.core.base_params import PaginationQueryParam
from app.core.base_schema import AuthSchema, BatchSetAvailable, PageResultSchema
from app.core.dependencies import AuthPermission, get_current_user
from app.core.logger import logger
from app.core.router_class import OperationLogRoute
from app.utils.common_util import bytes2file_response

from .schema import (
    NoticeCreateSchema,
    NoticeOutSchema,
    NoticeQueryParam,
    NoticeUpdateSchema,
    PanelDataOut,
)
from .service import NoticeService

NoticeRouter = APIRouter(route_class=OperationLogRoute, prefix="/notice", tags=["系统管理/公告通知"])

_NOTICE_NS = "notice"


@NoticeRouter.get(
    "/detail/{id}",
    summary="获取公告详情",
    response_model=ResponseSchema[NoticeOutSchema],
)
async def get_obj_detail_controller(
    id: Annotated[int, Path(description="公告ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:notice:detail']))],
) -> JSONResponse:
    """
    获取公告详情。

    参数:
    - id (int): 公告ID。
    - auth (AuthSchema): 认证信息模型。

    返回:
    - JSONResponse: 包含公告详情的响应模型。
    """
    result_dict = await NoticeService.get_notice_detail_service(id=id, auth=auth)
    return SuccessResponse(data=result_dict, msg="获取公告详情成功")


@NoticeRouter.get(
    "/list",
    summary="查询公告",
    response_model=ResponseSchema[PageResultSchema[NoticeOutSchema]],
)
async def get_obj_list_controller(
    page: Annotated[PaginationQueryParam, Depends()],
    search: Annotated[NoticeQueryParam, Depends()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:notice:query']))],
) -> JSONResponse:
    """
    查询公告。

    参数:
    - page (PaginationQueryParam): 分页查询参数模型。
    - search (NoticeQueryParam): 查询公告参数模型。
    - auth (AuthSchema): 认证信息模型。

    返回:
    - JSONResponse: 包含分页公告详情的响应模型。
    """
    result_dict = await NoticeService.get_notice_page_service(
        auth=auth,
        page_no=page.page_no,
        page_size=page.page_size,
        search=search,
        order_by=page.order_by,
    )
    return SuccessResponse(data=result_dict, msg="查询公告列表成功")


@NoticeRouter.post(
    "/create",
    summary="创建公告",
    response_model=ResponseSchema[NoticeOutSchema],
)
async def create_obj_controller(
    data: NoticeCreateSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:notice:create']))],
) -> JSONResponse:
    """
    创建公告。

    参数:
    - data (NoticeCreateSchema): 创建公告负载模型。
    - auth (AuthSchema): 认证信息模型。

    返回:
    - JSONResponse: 包含创建公告结果的响应模型。
    """
    result_dict = await NoticeService.create_notice_service(auth=auth, data=data)
    await FastAPICache.clear(namespace=_NOTICE_NS)
    return SuccessResponse(data=result_dict, msg="创建公告成功")


@NoticeRouter.put(
    "/update/{id}",
    summary="修改公告",
    response_model=ResponseSchema[NoticeOutSchema],
)
async def update_obj_controller(
    data: NoticeUpdateSchema,
    id: Annotated[int, Path(description="公告ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:notice:update']))],
) -> JSONResponse:
    """
    修改公告。

    参数:
    - data (NoticeUpdateSchema): 修改公告负载模型。
    - id (int): 公告ID。
    - auth (AuthSchema): 认证信息模型。

    返回:
    - JSONResponse: 包含修改公告结果的响应模型。
    """
    result_dict = await NoticeService.update_notice_service(auth=auth, id=id, data=data)
    await FastAPICache.clear(namespace=_NOTICE_NS)
    return SuccessResponse(data=result_dict, msg="修改公告成功")


@NoticeRouter.delete(
    "/delete",
    summary="删除公告",
    response_model=ResponseSchema[None],
)
async def delete_obj_controller(
    ids: Annotated[list[int], Body(description="ID列表")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:notice:delete']))],
) -> JSONResponse:
    """
    删除公告。

    参数:
    - ids (list[int]): 公告ID列表。
    - auth (AuthSchema): 认证信息模型。

    返回:
    - JSONResponse: 包含删除公告结果的响应模型。
    """
    await NoticeService.delete_notice_service(auth=auth, ids=ids)
    await FastAPICache.clear(namespace=_NOTICE_NS)
    return SuccessResponse(msg="删除公告成功")


@NoticeRouter.patch(
    "/status/batch",
    summary="批量修改公告状态",
    response_model=ResponseSchema[None],
)
async def batch_set_available_obj_controller(
    data: BatchSetAvailable,
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:notice:patch']))],
) -> JSONResponse:
    """
    批量修改公告状态。

    参数:
    - data (BatchSetAvailable): 批量修改公告状态负载模型。
    - auth (AuthSchema): 认证信息模型。

    返回:
    - JSONResponse: 包含批量修改公告状态结果的响应模型。
    """
    await NoticeService.set_notice_available_service(auth=auth, data=data)
    await FastAPICache.clear(namespace=_NOTICE_NS)
    return SuccessResponse(msg="批量修改公告状态成功")


@NoticeRouter.get(
    "/export",
    summary="导出公告",
    response_model=ResponseSchema[None],
)
async def export_obj_list_controller(
    search: Annotated[NoticeQueryParam, Depends()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:notice:export']))],
) -> StreamingResponse:
    """
    导出公告。

    参数:
    - search (NoticeQueryParam): 查询公告参数模型。
    - auth (AuthSchema): 认证信息模型。

    返回:
    - StreamingResponse: 包含导出公告的流式响应模型。
    """
    result_dict_list = await NoticeService.get_notice_list_service(search=search, auth=auth)
    export_data = [item.model_dump() for item in result_dict_list]
    export_result = await NoticeService.export_notice_service(notice_list=export_data)

    return StreamResponse(
        data=bytes2file_response(export_result),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=notice.xlsx"},
    )


@NoticeRouter.get(
    "/available",
    summary="获取全局启用公告",
    response_model=ResponseSchema[list[NoticeOutSchema]],
)
@cache(expire=120, namespace=_NOTICE_NS)
async def get_obj_list_available_controller(
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    """
    获取全局启用公告。

    参数:
    - auth (AuthSchema): 认证信息模型。

    返回:
    - JSONResponse: 包含分页已启用公告详情的响应模型。
    """
    result_dict = await NoticeService.get_notice_available_page_service(auth=auth)
    return SuccessResponse(data=result_dict, msg="查询已启用公告列表成功")


@NoticeRouter.get(
    "/panel",
    summary="通知面板数据（铃铛）",
    response_model=ResponseSchema[PanelDataOut],
)
@cache(expire=30, namespace=_NOTICE_NS)
async def get_notification_panel_controller(
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    """通知面板聚合接口，返回通知、消息、待办三个列表。"""
    result = await NoticeService.get_panel_data_service(auth=auth)
    return SuccessResponse(data=result, msg="获取面板数据成功")

# ============ 已读追踪端点 ============


@NoticeRouter.post(
    "/read/{id}",
    summary="标记已读",
    response_model=ResponseSchema[None],
)
async def mark_read_controller(
    id: Annotated[int, Path(description="通知ID")],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    """标记已读。通过 `sys_notice_read` 表记录已读时间。"""
    await NoticeService.mark_read_service(auth=auth, notice_id=id)
    await FastAPICache.clear(namespace=_NOTICE_NS)
    logger.info(f"用户[{auth.user.id}]标记通知[{id}]已读")
    return SuccessResponse(msg="标记已读成功")


@NoticeRouter.post(
    "/read-all",
    summary="全部已读",
    response_model=ResponseSchema[int],
)
async def mark_all_read_controller(
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    """全部标记已读。返回本次操作标记的数量。"""
    count = await NoticeService.mark_all_read_service(auth=auth)
    await FastAPICache.clear(namespace=_NOTICE_NS)
    logger.info(f"用户[{auth.user.id}]全部已读, 数量={count}")
    return SuccessResponse(data=count, msg=f"全部标记已读成功，共标记 {count} 条")


@NoticeRouter.get(
    "/unread-count",
    summary="获取未读数量",
    response_model=ResponseSchema[int],
)
@cache(expire=15, namespace=_NOTICE_NS)
async def get_unread_count_controller(
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    """获取未读通知数量。通过 LEFT JOIN 统计未读数。"""
    count = await NoticeService.get_unread_count_service(auth=auth)
    return SuccessResponse(data=count, msg="获取未读数量成功")
