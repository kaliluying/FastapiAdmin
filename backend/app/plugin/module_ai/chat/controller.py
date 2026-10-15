from datetime import date
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Path, Request, UploadFile
from fastapi.responses import JSONResponse

from app.common.response import ResponseSchema, SuccessResponse
from app.core.base_params import PaginationQueryParam
from app.core.base_schema import AuthSchema
from app.core.database import async_db_session
from app.core.dependencies import AuthPermission, _load_user_from_db
from app.core.exceptions import CustomException
from app.core.router_class import OperationLogRoute
from app.plugin.module_ai.knowledge.public import extract_chat_attachment

from .schema import (
    AiChatRequestSchema,
    AiChatResponseSchema,
    AiModelConfigOutSchema,
    AiModelConfigUpdateSchema,
    AiModelListRequestSchema,
    AiUsageQuotaUpdateSchema,
    ChatQuerySchema,
    ChatSessionCreateSchema,
    ChatSessionQueryParam,
    ChatSessionUpdateSchema,
)
from .service import ChatService
from .stream import ChatStreamResponse, chat_events

ChatRouter = APIRouter(route_class=OperationLogRoute, prefix="/chat", tags=["AI管理", "AI对话"])


@ChatRouter.post("/stream", summary="AI 对话 SSE", response_class=ChatStreamResponse, openapi_extra={"x-audit-payload": False})
async def stream_chat_controller(
    request: Request,
    query: ChatQuerySchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:chat:ws"]))],
) -> ChatStreamResponse:
    if len(await request.body()) > 120_000:
        raise CustomException(msg="消息和附件内容过大", status_code=413)
    return ChatStreamResponse(chat_events(auth, query), media_type="text/event-stream", headers={"Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no"})


@ChatRouter.get("/runtime-logs/status", summary="运行日志分析可用状态", response_model=ResponseSchema[dict[str, Any]])
async def runtime_log_status_controller(
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:chat:ws"]))],
) -> JSONResponse:
    can_query = getattr(auth.user, "is_superuser", False) is True
    return SuccessResponse(data={"can_query": can_query, "enabled": can_query})


@ChatRouter.post("/attachment", summary="解析聊天附件", response_model=ResponseSchema[dict[str, Any]])
async def parse_chat_attachment_controller(
    file: UploadFile,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:chat:ws"]))],
) -> JSONResponse:
    result = await extract_chat_attachment(file)
    return SuccessResponse(data=result, msg="附件已解析")


@ChatRouter.get(
    "/detail/{session_id}",
    summary="获取会话详情",
    response_model=ResponseSchema[dict[str, Any]],
)
async def get_session_detail_controller(
    session_id: Annotated[str, Path(description="会话ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:session:detail"]))],
) -> JSONResponse:
    service = ChatService(auth)
    result = await service.get_session(session_id=session_id)
    return SuccessResponse(data=result, msg="获取会话详情成功")


@ChatRouter.get(
    "/list",
    summary="查询会话列表",
    response_model=ResponseSchema[dict],
)
async def get_session_list_controller(
    page: Annotated[PaginationQueryParam, Depends()],
    search: Annotated[ChatSessionQueryParam, Depends()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:session:query"]))],
) -> JSONResponse:
    service = ChatService(auth)
    result_dict = await service.page(
        page_no=page.page_no,
        page_size=page.page_size,
        search=search,
        order_by=page.order_by,
    )
    return SuccessResponse(data=result_dict, msg="查询会话列表成功")


@ChatRouter.post(
    "/create",
    summary="创建会话",
    response_model=ResponseSchema[dict[str, Any]],
)
async def create_session_controller(
    data: ChatSessionCreateSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:chat:create"]))],
) -> JSONResponse:
    service = ChatService(auth)
    result = await service.create(data=data)
    return SuccessResponse(data=result, msg="创建会话成功")


@ChatRouter.put(
    "/update/{session_id}",
    summary="更新会话",
    response_model=ResponseSchema[None],
)
async def update_session_controller(
    session_id: Annotated[str, Path(description="会话ID")],
    data: ChatSessionUpdateSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:chat:update"]))],
) -> JSONResponse:
    service = ChatService(auth)
    await service.update(session_id=session_id, data=data)
    return SuccessResponse(data=None, msg="更新会话成功")


@ChatRouter.delete(
    "/delete",
    summary="删除会话",
    response_model=ResponseSchema[None],
)
async def delete_session_controller(
    session_ids: list[str],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:session:delete"]))],
) -> JSONResponse:
    service = ChatService(auth)
    await service.delete(session_ids=session_ids)
    return SuccessResponse(data=None, msg="删除会话成功")


@ChatRouter.post(
    "/ai-chat",
    summary="AI 对话（非流式）",
    response_model=ResponseSchema[AiChatResponseSchema],
    openapi_extra={"x-audit-payload": False},
)
async def ai_chat_controller(
    data: AiChatRequestSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:chat:ws"]))],
) -> JSONResponse:
    async with async_db_session() as auth_db:
        user = await _load_user_from_db(auth_db, auth.user.username)
    service = ChatService(auth.model_copy(update={"user": user}))
    result = await service.chat_non_stream(
        message=data.message,
        session_id=data.session_id,
        knowledge_base_ids=data.knowledge_base_ids,
        log_context_id=data.log_context_id,
    )
    return SuccessResponse(
        data=AiChatResponseSchema(
            response=result["response"],
            session_id=result["session_id"],
            function_calls=result.get("function_calls"),
            action=result.get("action"),
            log_context_id=result.get("log_context_id"),
        ),
        msg="chat success",
    )


@ChatRouter.get(
    "/model-config",
    summary="AI model configuration",
    response_model=ResponseSchema[AiModelConfigOutSchema],
)
async def model_config_controller(
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:model_config:query"]))],
) -> JSONResponse:
    result = await ChatService(auth).get_model_config()
    return SuccessResponse(data=result, msg="query AI model configuration success")


@ChatRouter.post(
    "/model-config/models",
    summary="获取当前接口可用模型",
    response_model=ResponseSchema[list[str]],
)
async def list_model_options_controller(
    data: AiModelListRequestSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:model_config:update"]))],
) -> JSONResponse:
    result = await ChatService(auth).list_provider_models(data)
    return SuccessResponse(data=result, msg="获取模型成功")


@ChatRouter.put(
    "/model-config",
    summary="Update AI model configuration",
    response_model=ResponseSchema[AiModelConfigOutSchema],
)
async def update_model_config_controller(
    data: AiModelConfigUpdateSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:model_config:update"]))],
) -> JSONResponse:
    result = await ChatService(auth).update_model_config(data)
    return SuccessResponse(data=result, msg="update AI model configuration success")


@ChatRouter.post("/model-config/check", summary="实际验证模型回答、流式与工具调用能力", response_model=ResponseSchema[dict])
async def check_model_capabilities_controller(
    data: AiModelConfigUpdateSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:model_config:update"]))],
) -> JSONResponse:
    from .capabilities import check_model_capabilities
    return SuccessResponse(data=await check_model_capabilities(auth, data))


@ChatRouter.get("/usage", summary="本人今日 AI 用量", response_model=ResponseSchema[dict])
async def own_ai_usage_controller(
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:chat:ws"]))],
) -> JSONResponse:
    from .usage import usage_day, usage_summary
    return SuccessResponse(data=await usage_summary(auth.user.id, usage_day()))


@ChatRouter.get("/usage/admin", summary="管理员查询用户 AI 用量", response_model=ResponseSchema[dict])
async def admin_ai_usage_controller(
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:model_config:query"]))],
    user_id: int | None = None,
    day: date | None = None,
) -> JSONResponse:
    from sqlalchemy import select

    from app.api.v1.module_system.user.model import UserModel
    from app.core.exceptions import CustomException

    from .usage import usage_day, usage_summary
    if auth.user.is_superuser is not True:
        raise CustomException(msg="仅超级管理员可查看他人用量", status_code=403)
    users = (await auth.db.execute(select(UserModel.id, UserModel.username).where(UserModel.is_deleted.is_(False)).order_by(UserModel.id))).all()
    selected = user_id if user_id is not None else auth.user.id
    if selected not in {user.id for user in users}:
        raise CustomException(msg="用户不存在", status_code=404)
    await auth.db.rollback()
    return SuccessResponse(data={**await usage_summary(selected, day or usage_day()), "users": [{"id": user.id, "username": user.username} for user in users]})


@ChatRouter.put("/usage/quota/{user_id}", summary="设置用户每日 AI 调用额度", response_model=ResponseSchema[dict])
async def update_ai_usage_quota_controller(
    user_id: Annotated[int, Path(ge=1)],
    data: AiUsageQuotaUpdateSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:model_config:update"]))],
) -> JSONResponse:
    from sqlalchemy import select

    from app.api.v1.module_system.user.model import UserModel
    from app.core.exceptions import CustomException

    from .usage import set_quota, usage_day, usage_summary
    if auth.user.is_superuser is not True:
        raise CustomException(msg="仅超级管理员可设置调用额度", status_code=403)
    if not await auth.db.scalar(select(UserModel.id).where(UserModel.id == user_id, UserModel.is_deleted.is_(False))):
        raise CustomException(msg="用户不存在", status_code=404)
    await auth.db.rollback()
    await set_quota(user_id, data.daily_limit)
    return SuccessResponse(data=await usage_summary(user_id, usage_day()), msg="调用额度已更新")
