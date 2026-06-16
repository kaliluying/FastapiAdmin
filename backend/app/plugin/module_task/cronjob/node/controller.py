from typing import Annotated

from fastapi import APIRouter, Body, Depends, Path
from fastapi.responses import JSONResponse

from app.common.response import ResponseSchema, SuccessResponse
from app.core.base_params import PaginationQueryParam
from app.core.base_schema import AuthSchema, PageResultSchema
from app.core.dependencies import AuthPermission
from app.core.router_class import OperationLogRoute

from .schema import (
    NodeCreateSchema,
    NodeExecuteSchema,
    NodeOutSchema,
    NodeQueryParam,
    NodeUpdateSchema,
)
from .service import NodeService

NodeRouter = APIRouter(route_class=OperationLogRoute, prefix="/cronjob/node", tags=["定时任务/节点管理"])


@NodeRouter.get(
    "/options",
    summary="获取定时任务节点列表",
    response_model=ResponseSchema[list[dict]],
)
async def get_node_options_controller(
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_task:cronjob:node:query"]))],
) -> JSONResponse:
    """
    获取数据库中的定时任务节点定义（task_node），与编排节点类型无关。

    参数:
    - auth (AuthSchema): 认证信息。

    返回:
    - JSONResponse: 成功响应，data 为选项列表。
    """
    result = await NodeService.get_node_options_service(auth=auth)
    return SuccessResponse(data=result, msg="获取定时任务节点选项成功")


@NodeRouter.get(
    "/detail/{id}",
    summary="获取节点详情",
    response_model=ResponseSchema[NodeOutSchema],
)
async def get_obj_detail_controller(
    id: Annotated[int, Path(description="节点ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_task:cronjob:node:detail"]))],
) -> JSONResponse:
    """
    获取节点详情

    参数:
    - id (int): 节点ID
    - auth (AuthSchema): 认证信息模型

    返回:
    - JSONResponse: 包含节点详情的JSON响应
    """
    result_dict = await NodeService.get_node_detail_service(id=id, auth=auth)
    return SuccessResponse(data=result_dict, msg="获取节点详情成功")


@NodeRouter.get(
    "/list",
    summary="查询节点",
    response_model=ResponseSchema[PageResultSchema[NodeOutSchema]],
)
async def get_obj_list_controller(
    page: Annotated[PaginationQueryParam, Depends()],
    search: Annotated[NodeQueryParam, Depends()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_task:cronjob:node:query"]))],
) -> JSONResponse:
    """
    查询节点

    参数:
    - page (PaginationQueryParam): 分页查询参数模型
    - search (NodeQueryParam): 查询参数模型
    - auth (AuthSchema): 认证信息模型

    返回:
    - JSONResponse: 包含分页后的节点列表的JSON响应
    """
    result_dict = await NodeService.get_node_page_service(
        auth=auth,
        page_no=page.page_no,
        page_size=page.page_size,
        search=search,
        order_by=page.order_by,
    )
    return SuccessResponse(data=result_dict, msg="查询节点列表成功")


@NodeRouter.post(
    "/create",
    summary="创建节点",
    response_model=ResponseSchema[NodeOutSchema],
)
async def create_obj_controller(
    data: NodeCreateSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_task:cronjob:node:create"]))],
) -> JSONResponse:
    """
    创建节点

    参数:
    - data (NodeCreateSchema): 创建参数模型
    - auth (AuthSchema): 认证信息模型

    返回:
    - JSONResponse: 包含创建节点结果的JSON响应
    """
    result_dict = await NodeService.create_node_service(auth=auth, data=data)
    return SuccessResponse(data=result_dict, msg="创建节点成功")


@NodeRouter.put(
    "/update/{id}",
    summary="修改节点",
    response_model=ResponseSchema[NodeOutSchema],
)
async def update_obj_controller(
    data: NodeUpdateSchema,
    id: Annotated[int, Path(description="节点ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_task:cronjob:node:update"]))],
) -> JSONResponse:
    """
    修改节点

    参数:
    - data (NodeUpdateSchema): 更新参数模型
    - id (int): 节点ID
    - auth (AuthSchema): 认证信息模型

    返回:
    - JSONResponse: 包含修改节点结果的JSON响应
    """
    result_dict = await NodeService.update_node_service(auth=auth, id=id, data=data)
    return SuccessResponse(data=result_dict, msg="修改节点成功")


@NodeRouter.delete(
    "/delete",
    summary="删除节点",
    response_model=ResponseSchema[None],
)
async def delete_obj_controller(
    ids: Annotated[list[int], Body(description="ID列表")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_task:cronjob:node:delete"]))],
) -> JSONResponse:
    """
    删除节点

    参数:
    - ids (list[int]): ID列表
    - auth (AuthSchema): 认证信息模型

    返回:
    - JSONResponse: 包含删除节点结果的JSON响应
    """
    await NodeService.delete_node_service(auth=auth, ids=ids)
    return SuccessResponse(msg="删除节点成功")


@NodeRouter.delete(
    "/clear",
    summary="清空节点",
    response_model=ResponseSchema[None],
)
async def clear_obj_controller(
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_task:cronjob:node:delete"]))],
) -> JSONResponse:
    """
    清空所有节点

    参数:
    - auth (AuthSchema): 认证信息模型

    返回:
    - JSONResponse: 包含清空节点结果的JSON响应
    """
    await NodeService.clear_node_service(auth=auth)
    return SuccessResponse(msg="清空节点成功")


@NodeRouter.post(
    "/execute/{id}",
    summary="调试节点",
    response_model=ResponseSchema[dict],
)
async def execute_job_controller(
    id: Annotated[int, Path(description="节点ID")],
    data: NodeExecuteSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_task:cronjob:node:execute"]))],
) -> JSONResponse:
    """
    调试节点

    参数:
    - id (int): 节点ID
    - data (NodeExecuteSchema): 执行参数模型
    - auth (AuthSchema): 认证信息模型

    返回:
    - JSONResponse: 包含调试结果的JSON响应
    """
    result = await NodeService.execute_node_service(auth=auth, id=id, execute_data=data)
    return SuccessResponse(data=result, msg="调试节点成功")


@NodeRouter.patch(
    "/status/batch",
    summary="批量设置节点状态",
    response_model=ResponseSchema[None],
)
async def batch_set_status_controller(
    ids: Annotated[list[int], Body(description="节点ID列表")],
    status: Annotated[str, Body(description="状态值")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_task:cronjob:node:update"]))],
) -> JSONResponse:
    """
    批量设置节点状态

    参数:
    - ids (list[int]): 节点ID列表
    - status (str): 状态值
    - auth (AuthSchema): 认证信息模型

    返回:
    - JSONResponse: 成功响应
    """
    await NodeService.batch_set_status_service(auth=auth, ids=ids, status=status)
    return SuccessResponse(msg="批量设置节点状态成功")
