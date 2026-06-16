from typing import Annotated

from fastapi import APIRouter, Body, Depends, Path

from app.common.response import ResponseSchema, SuccessResponse
from app.core.base_params import PaginationQueryParam
from app.core.base_schema import AuthSchema, PageResultSchema
from app.core.dependencies import AuthPermission
from app.core.router_class import OperationLogRoute

from .schema import (
    EmailConfigCreateSchema,
    EmailConfigOutSchema,
    EmailConfigQueryParam,
    EmailConfigUpdateSchema,
    EmailLogOutSchema,
    EmailLogQueryParam,
    EmailSendSchema,
    EmailTemplateCreateSchema,
    EmailTemplateOutSchema,
    EmailTemplateQueryParam,
    EmailTemplateUpdateSchema,
    EmailTestSchema,
)
from .service import EmailConfigService, EmailLogService, EmailSendService, EmailTemplateService

EmailRouter = APIRouter(
    route_class=OperationLogRoute,
    prefix="/email",
    tags=["平台管理/邮件服务"],
)

# ──────────────────────────────────────────────────────────────
# SMTP 配置接口
# ──────────────────────────────────────────────────────────────


@EmailRouter.get(
    "/config/list",
    summary="SMTP 配置列表",
    response_model=ResponseSchema[PageResultSchema[EmailConfigOutSchema]],
)
async def email_config_list(
    page: Annotated[PaginationQueryParam, Depends()],
    search: Annotated[EmailConfigQueryParam, Depends()],
    auth: Annotated[
        AuthSchema, Depends(AuthPermission(['module_platform:email:query']))
    ],
):
    """
    SMTP 配置列表

    参数:
    - page (PaginationQueryParam): 分页查询参数。
    - search (EmailConfigQueryParam): 查询筛选参数。

    返回:
    - SuccessResponse: 包含分页配置列表的 JSON 响应。
    """
    result = await EmailConfigService.page_service(
        auth=auth,
        page_no=page.page_no,
        page_size=page.page_size,
        search=search,
        order_by=page.order_by,
    )
    return SuccessResponse(data=result, msg="查询成功")


@EmailRouter.get(
    "/config/detail/{id}",
    summary="SMTP 配置详情",
    response_model=ResponseSchema[EmailConfigOutSchema],
)
async def email_config_detail(
    id: Annotated[int, Path()],
    auth: Annotated[
        AuthSchema, Depends(AuthPermission(['module_platform:email:query']))
    ],
):
    """
    SMTP 配置详情

    参数:
    - id (int): 配置 ID。

    返回:
    - SuccessResponse: 包含配置详情的 JSON 响应。
    """
    result = await EmailConfigService.detail_service(auth=auth, id=id)
    return SuccessResponse(data=result, msg="查询成功")


@EmailRouter.post(
    "/config/create",
    summary="创建 SMTP 配置",
    response_model=ResponseSchema[EmailConfigOutSchema],
)
async def email_config_create(
    data: EmailConfigCreateSchema,
    auth: Annotated[
        AuthSchema, Depends(AuthPermission(['module_platform:email:update']))
    ],
):
    """
    创建 SMTP 配置

    参数:
    - data (EmailConfigCreateSchema): 配置创建参数。

    返回:
    - SuccessResponse: 包含创建后的配置详情的 JSON 响应。
    """
    result = await EmailConfigService.create_service(auth=auth, data=data)
    return SuccessResponse(data=result, msg="创建成功")


@EmailRouter.put(
    "/config/update/{id}",
    summary="更新 SMTP 配置",
    response_model=ResponseSchema[EmailConfigOutSchema],
)
async def email_config_update(
    id: Annotated[int, Path()],
    data: EmailConfigUpdateSchema,
    auth: Annotated[
        AuthSchema, Depends(AuthPermission(['module_platform:email:update']))
    ],
):
    """
    更新 SMTP 配置

    参数:
    - id (int): 配置 ID。
    - data (EmailConfigUpdateSchema): 配置更新参数。

    返回:
    - SuccessResponse: 包含更新后的配置详情的 JSON 响应。
    """
    result = await EmailConfigService.update_service(auth=auth, id=id, data=data)
    return SuccessResponse(data=result, msg="更新成功")


@EmailRouter.delete("/config/delete", summary="删除 SMTP 配置", response_model=ResponseSchema[None])
async def email_config_delete(
    ids: Annotated[list[int], Body()],
    auth: Annotated[
        AuthSchema, Depends(AuthPermission(['module_platform:email:update']))
    ],
):
    """
    删除 SMTP 配置

    参数:
    - ids (list[int]): 配置 ID 列表。

    返回:
    - SuccessResponse: 删除结果。
    """
    await EmailConfigService.delete_service(auth=auth, ids=ids)
    return SuccessResponse(msg="删除成功")


@EmailRouter.post("/config/test", summary="测试 SMTP 连接", response_model=ResponseSchema)
async def email_config_test(
    data: EmailTestSchema,
    auth: Annotated[
        AuthSchema, Depends(AuthPermission(['module_platform:email:update']))
    ],
):
    """
    测试 SMTP 连接

    参数:
    - data (EmailTestSchema): 测试参数（配置 ID 与目标邮箱）。

    返回:
    - SuccessResponse: 包含测试结果的 JSON 响应。
    """
    result = await EmailConfigService.test_service(auth=auth, data=data)
    return SuccessResponse(data=result, msg="测试邮件已发送")

# ──────────────────────────────────────────────────────────────
# 邮件模板接口
# ──────────────────────────────────────────────────────────────


@EmailRouter.get(
    "/template/list",
    summary="邮件模板列表",
    response_model=ResponseSchema[PageResultSchema[EmailTemplateOutSchema]],
)
async def email_template_list(
    page: Annotated[PaginationQueryParam, Depends()],
    search: Annotated[EmailTemplateQueryParam, Depends()],
    auth: Annotated[
        AuthSchema, Depends(AuthPermission(['module_platform:email:query']))
    ],
):
    """
    邮件模板列表

    参数:
    - page (PaginationQueryParam): 分页查询参数。
    - search (EmailTemplateQueryParam): 查询筛选参数。

    返回:
    - SuccessResponse: 包含分页模板列表的 JSON 响应。
    """
    result = await EmailTemplateService.page_service(
        auth=auth,
        page_no=page.page_no,
        page_size=page.page_size,
        search=search,
        order_by=page.order_by,
    )
    return SuccessResponse(data=result, msg="查询成功")


@EmailRouter.get(
    "/template/detail/{id}",
    summary="邮件模板详情",
    response_model=ResponseSchema[EmailTemplateOutSchema],
)
async def email_template_detail(
    id: Annotated[int, Path()],
    auth: Annotated[
        AuthSchema, Depends(AuthPermission(['module_platform:email:query']))
    ],
):
    """
    邮件模板详情

    参数:
    - id (int): 模板 ID。

    返回:
    - SuccessResponse: 包含模板详情的 JSON 响应。
    """
    result = await EmailTemplateService.detail_service(auth=auth, id=id)
    return SuccessResponse(data=result, msg="查询成功")


@EmailRouter.post(
    "/template/create",
    summary="创建邮件模板",
    response_model=ResponseSchema[EmailTemplateOutSchema],
)
async def email_template_create(
    data: EmailTemplateCreateSchema,
    auth: Annotated[
        AuthSchema, Depends(AuthPermission(['module_platform:email:update']))
    ],
):
    """
    创建邮件模板

    参数:
    - data (EmailTemplateCreateSchema): 模板创建参数。

    返回:
    - SuccessResponse: 包含创建后的模板详情的 JSON 响应。
    """
    result = await EmailTemplateService.create_service(auth=auth, data=data)
    return SuccessResponse(data=result, msg="创建成功")


@EmailRouter.put(
    "/template/update/{id}",
    summary="更新邮件模板",
    response_model=ResponseSchema[EmailTemplateOutSchema],
)
async def email_template_update(
    id: Annotated[int, Path()],
    data: EmailTemplateUpdateSchema,
    auth: Annotated[
        AuthSchema, Depends(AuthPermission(['module_platform:email:update']))
    ],
):
    """
    更新邮件模板

    参数:
    - id (int): 模板 ID。
    - data (EmailTemplateUpdateSchema): 模板更新参数。

    返回:
    - SuccessResponse: 包含更新后的模板详情的 JSON 响应。
    """
    result = await EmailTemplateService.update_service(auth=auth, id=id, data=data)
    return SuccessResponse(data=result, msg="更新成功")


@EmailRouter.delete("/template/delete", summary="删除邮件模板", response_model=ResponseSchema[None])
async def email_template_delete(
    ids: Annotated[list[int], Body()],
    auth: Annotated[
        AuthSchema, Depends(AuthPermission(['module_platform:email:update']))
    ],
):
    """
    删除邮件模板

    参数:
    - ids (list[int]): 模板 ID 列表。

    返回:
    - SuccessResponse: 删除结果。
    """
    await EmailTemplateService.delete_service(auth=auth, ids=ids)
    return SuccessResponse(msg="删除成功")

# ──────────────────────────────────────────────────────────────
# 邮件发送接口
# ──────────────────────────────────────────────────────────────


@EmailRouter.post(
    "/send",
    summary="手动发送邮件（超管测试/补发）",
    response_model=ResponseSchema,
)
async def email_send(
    data: EmailSendSchema,
    auth: Annotated[
        AuthSchema, Depends(AuthPermission(['module_platform:email:update']))
    ],
):
    """
    手动发送邮件

    参数:
    - data (EmailSendSchema): 发送参数（模板代码、目标邮箱、模板变量）。

    返回:
    - SuccessResponse: 包含发送结果的 JSON 响应。
    """
    result = await EmailSendService.manual_send_service(auth=auth, data=data)
    return SuccessResponse(data=result, msg="发送成功")

# ──────────────────────────────────────────────────────────────
# 邮件发送日志接口
# ──────────────────────────────────────────────────────────────


@EmailRouter.get(
    "/log/list",
    summary="邮件发送日志",
    response_model=ResponseSchema[PageResultSchema[EmailLogOutSchema]],
)
async def email_log_list(
    page: Annotated[PaginationQueryParam, Depends()],
    search: Annotated[EmailLogQueryParam, Depends()],
    auth: Annotated[
        AuthSchema, Depends(AuthPermission(['module_platform:email:query']))
    ],
):
    """
    邮件发送日志

    参数:
    - page (PaginationQueryParam): 分页查询参数。
    - search (EmailLogQueryParam): 查询筛选参数。

    返回:
    - SuccessResponse: 包含分页日志列表的 JSON 响应。
    """
    result = await EmailLogService.page_service(
        auth=auth,
        page_no=page.page_no,
        page_size=page.page_size,
        search=search,
        order_by=page.order_by,
    )
    return SuccessResponse(data=result, msg="查询成功")
