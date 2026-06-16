from typing import Annotated

from fastapi import APIRouter, Body, Depends, Path
from fastapi.responses import JSONResponse, StreamingResponse
from redis.asyncio.client import Redis

from app.common.response import ResponseSchema, StreamResponse, SuccessResponse
from app.core.base_params import PaginationQueryParam
from app.core.base_schema import AuthSchema, PageResultSchema
from app.core.dependencies import AuthPermission, redis_getter
from app.core.router_class import OperationLogRoute
from app.utils.common_util import bytes2file_response

from .schema import ParamsCreateSchema, ParamsOutSchema, ParamsQueryParam, ParamsUpdateSchema
from .service import ParamsService

ParamsRouter = APIRouter(route_class=OperationLogRoute, prefix="/param", tags=["系统管理/参数管理"])


@ParamsRouter.get(
    "/detail/{id}",
    summary="获取参数详情",
    response_model=ResponseSchema[ParamsOutSchema],
)
async def get_type_detail_controller(
    id: Annotated[int, Path(description="参数ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:param:detail']))],
) -> JSONResponse:
    """
    获取参数详情

    参数:
    - id (int): 参数ID
    - auth (AuthSchema): 认证信息模型

    返回:
    - JSONResponse: 包含参数详情的 JSON 响应
    """
    result_dict = await ParamsService.get_obj_detail_service(id=id, auth=auth)
    return SuccessResponse(data=result_dict, msg="获取参数详情成功")


@ParamsRouter.get(
    "/key/{config_key}",
    summary="根据配置键获取参数详情",
    response_model=ResponseSchema[ParamsOutSchema],
)
async def get_obj_by_key_controller(
    config_key: Annotated[str, Path(description="配置键")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:param:query']))],
) -> JSONResponse:
    """
    根据配置键获取参数详情

    参数:
    - config_key (str): 配置键
    - auth (AuthSchema): 认证信息模型

    返回:
    - JSONResponse: 包含参数详情的 JSON 响应
    """
    result_dict = await ParamsService.get_obj_by_key_service(config_key=config_key, auth=auth)
    return SuccessResponse(data=result_dict, msg="根据配置键获取参数详情成功")


@ParamsRouter.get(
    "/value/{config_key}",
    summary="根据配置键获取参数值",
    response_model=ResponseSchema[ParamsOutSchema],
)
async def get_config_value_by_key_controller(
    config_key: Annotated[str, Path(description="配置键")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:param:query']))],
) -> JSONResponse:
    """
    根据配置键获取参数值

    参数:
    - config_key (str): 配置键
    - auth (AuthSchema): 认证信息模型

    返回:
    - JSONResponse: 包含参数值的 JSON 响应
    """
    result_value = await ParamsService.get_config_value_by_key_service(
        config_key=config_key, auth=auth
    )
    return SuccessResponse(data=result_value, msg="根据配置键获取参数值成功")


@ParamsRouter.get(
    "/list",
    summary="获取参数列表",
    response_model=ResponseSchema[PageResultSchema[ParamsOutSchema]],
)
async def get_obj_list_controller(
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:param:query']))],
    page: Annotated[PaginationQueryParam, Depends()],
    search: Annotated[ParamsQueryParam, Depends()],
) -> JSONResponse:
    """
    获取参数列表

    参数:
    - auth (AuthSchema): 认证信息模型
    - page (PaginationQueryParam): 分页查询参数模型
    - search (ParamsQueryParam): 参数查询参数模型

    返回:
    - JSONResponse: 包含参数列表的 JSON 响应
    """
    result_dict = await ParamsService.get_obj_page_service(
        auth=auth,
        page_no=page.page_no,
        page_size=page.page_size,
        search=search,
        order_by=page.order_by,
    )
    return SuccessResponse(data=result_dict, msg="查询参数列表成功")


@ParamsRouter.post(
    "/create",
    summary="创建参数",
    response_model=ResponseSchema[ParamsOutSchema],
)
async def create_obj_controller(
    data: ParamsCreateSchema,
    redis: Annotated[Redis, Depends(redis_getter)],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:param:create']))],
) -> JSONResponse:
    """
    创建参数

    参数:
    - data (ParamsCreateSchema): 参数创建模型
    - redis (Redis): Redis 客户端实例
    - auth (AuthSchema): 认证信息模型

    返回:
    - JSONResponse: 包含创建参数结果的 JSON 响应
    """
    result_dict = await ParamsService.create_obj_service(auth=auth, redis=redis, data=data)
    return SuccessResponse(data=result_dict, msg="创建参数成功")


@ParamsRouter.put(
    "/update/{id}",
    summary="修改参数",
    response_model=ResponseSchema[ParamsOutSchema],
)
async def update_objs_controller(
    data: ParamsUpdateSchema,
    id: Annotated[int, Path(description="参数ID")],
    redis: Annotated[Redis, Depends(redis_getter)],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:param:update']))],
) -> JSONResponse:
    """
    修改参数

    参数:
    - data (ParamsUpdateSchema): 参数更新模型
    - id (int): 参数ID
    - redis (Redis): Redis 客户端实例
    - auth (AuthSchema): 认证信息模型

    返回:
    - JSONResponse: 包含修改参数结果的 JSON 响应
    """
    result_dict = await ParamsService.update_obj_service(auth=auth, redis=redis, id=id, data=data)
    return SuccessResponse(data=result_dict, msg="更新参数成功")


@ParamsRouter.delete(
    "/delete",
    summary="删除参数",
    response_model=ResponseSchema[ParamsOutSchema],
)
async def delete_obj_controller(
    redis: Annotated[Redis, Depends(redis_getter)],
    ids: Annotated[list[int], Body(description="ID列表")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:param:delete']))],
) -> JSONResponse:
    """
    删除参数

    参数:
    - redis (Redis): Redis 客户端实例
    - ids (list[int]): 参数ID列表
    - auth (AuthSchema): 认证信息模型

    返回:
    - JSONResponse: 包含删除参数结果的 JSON 响应
    """
    await ParamsService.delete_obj_service(auth=auth, redis=redis, ids=ids)
    return SuccessResponse(msg="删除参数成功")


@ParamsRouter.patch(
    "/status/batch",
    summary="批量设置参数状态",
    response_model=ResponseSchema,
)
async def batch_set_status_controller(
    ids: Annotated[list[int], Body(description="参数ID列表")],
    status: Annotated[str, Body(description="状态值")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:param:patch']))],
) -> JSONResponse:
    """
    批量设置参数状态

    参数:
    - ids (list[int]): 参数ID列表
    - status (str): 状态值
    - auth (AuthSchema): 认证信息模型

    返回:
    - JSONResponse: 包含批量设置参数状态结果的 JSON 响应
    """
    await ParamsService.batch_set_status_service(auth=auth, ids=ids, status=status)
    return SuccessResponse(msg="批量设置参数状态成功")


@ParamsRouter.get(
    "/export",
    summary="导出参数",
    response_model=ResponseSchema[None],
)
async def export_obj_list_controller(
    search: Annotated[ParamsQueryParam, Depends()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:param:export']))],
) -> StreamingResponse:
    """
    导出参数

    参数:
    - search (ParamsQueryParam): 参数查询参数模型
    - auth (AuthSchema): 认证信息模型

    返回:
    - StreamingResponse: 包含导出参数的 Excel 文件流响应
    """
    result_dict_list = await ParamsService.get_obj_list_service(search=search, auth=auth)
    export_data = [item.model_dump() for item in result_dict_list]
    export_result = await ParamsService.export_obj_service(data_list=export_data)

    return StreamResponse(
        data=bytes2file_response(export_result),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=params.xlsx"},
    )


@ParamsRouter.get(
    "/info",
    summary="获取初始化缓存参数",
    response_model=ResponseSchema[list[ParamsOutSchema]],
)
async def get_init_obj_controller(
    redis: Annotated[Redis, Depends(redis_getter)],
) -> JSONResponse:
    """
    获取初始化缓存参数

    参数:
    - redis (Redis): Redis 客户端实例

    返回:
    - JSONResponse: 获取初始化缓存参数的 JSON 响应
    """
    result_dict = await ParamsService.get_init_config_service(redis=redis, tenant_id=1)
    return SuccessResponse(data=result_dict, msg="获取初始化缓存参数成功")
