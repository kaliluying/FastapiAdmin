"""供其他功能读取聊天结果、准备模型和授权查询日志的稳定入口。"""

import json
from collections.abc import Awaitable, Callable
from typing import Any

from pydantic import ValidationError
from sqlalchemy import select

from app.api.v1.module_system.user.model import UserModel
from app.common.enums import RedisInitKeyConfig
from app.core.base_schema import AuthSchema
from app.core.dependencies import _check_token_online, _load_authenticated_user
from app.core.exceptions import CustomException
from app.core.security import verify_session_credentials
from app.plugin.module_ai.config import async_validate_model_base_url

from . import rag
from .crud import ChatSessionCRUD, run_identifier
from .model_config_service import load_runtime_chat_model_config
from .rag import ToolChatModel
from .runtime_logs import RUNTIME_LOG_TOOL, RuntimeLogQuerySchema, redact_log_text
from .runtime_logs import query_runtime_logs as _query_runtime_logs
from .usage import usage_context

__all__ = [
    "RUNTIME_LOG_TOOL",
    "RuntimeLogQuerySchema",
    "ToolChatModel",
    "authorize_runtime_log_access",
    "get_saved_answer",
    "prepare_tool_model",
    "query_runtime_logs",
    "redact_log_text",
    "usage_context",
]


async def prepare_tool_model(auth: AuthSchema) -> ToolChatModel:
    """加载并校验运行配置，复用现有模型客户端，不发起模型请求。"""
    try:
        config = await load_runtime_chat_model_config(auth)
    finally:
        if auth.db is not None:
            await auth.db.rollback()
    if not config.api_key.strip() or config.api_key.strip() == "your_api_key":
        raise CustomException(msg="AI 服务未配置有效 API Key，请先在模型配置中填写。", data={"error_code": "model_config_invalid"})
    if not config.model.strip():
        raise CustomException(msg="AI 服务未配置对话模型，请先在模型配置中填写模型名称。", data={"error_code": "model_config_invalid"})
    if not config.base_url.strip():
        raise CustomException(msg="AI 服务未配置接口地址，请先在模型配置中填写。", data={"error_code": "model_config_invalid"})
    try:
        await async_validate_model_base_url(config.base_url.strip())
    except ValueError:
        raise CustomException(msg="AI 服务接口地址不符合安全策略，请检查主机白名单配置。", data={"error_code": "model_config_invalid"}) from None
    return rag.get_cached_chat_model()


async def authorize_runtime_log_access(auth: AuthSchema, *, token_checker: Callable[[Any, str], Awaitable[None]] | None = None) -> None:
    """复查在线会话、凭据指纹和当前超管资格。"""
    if getattr(getattr(auth, "user", None), "is_superuser", False) is not True:
        raise CustomException(msg="仅超级管理员可分析运行日志", status_code=403)
    if not auth.db or not auth.redis or not getattr(auth, "session_id", None):
        raise CustomException(msg="登录已失效，请重新登录后分析日志", status_code=401)
    await (token_checker or _check_token_online)(auth.redis, auth.session_id)
    raw_session = await auth.redis.get(f"{RedisInitKeyConfig.USER_SESSION.key}:{auth.session_id}")
    if not raw_session:
        raise CustomException(msg="登录已失效，请重新登录后分析日志", status_code=401)
    try:
        session_info = json.loads(raw_session)
    except (TypeError, json.JSONDecodeError):
        raise CustomException(msg="登录已失效，请重新登录后分析日志", status_code=401) from None
    if not isinstance(session_info, dict):
        raise CustomException(msg="登录已失效，请重新登录后分析日志", status_code=401)
    if session_info.get("user_id") != auth.user.id:
        raise CustomException(msg="任务身份已失效", status_code=401)
    current_user = await _load_authenticated_user(auth.user.id)
    verify_session_credentials(session_info, current_user.id, current_user.password)
    try:
        allowed = await auth.db.scalar(select(UserModel.id).where(UserModel.id == current_user.id, UserModel.is_superuser.is_(True), UserModel.is_deleted.is_(False), UserModel.status == 0))
    finally:
        await auth.db.rollback()
    if allowed is None:
        raise CustomException(msg="管理员权限已失效，请重新登录", status_code=403)


async def query_runtime_logs(auth: AuthSchema, filters: RuntimeLogQuerySchema | dict) -> dict:
    """严格校验参数并在读取前后重新授权，撤权后的结果不得返回。"""
    try:
        query = RuntimeLogQuerySchema.model_validate(filters.model_dump() if isinstance(filters, RuntimeLogQuerySchema) else filters, strict=True)
    except ValidationError:
        raise CustomException(msg="日志工具参数不符合安全范围", status_code=422, data={"error_code": "invalid_tool_args"}) from None
    query.keyword = redact_log_text(query.keyword)
    await authorize_runtime_log_access(auth)
    result = await _query_runtime_logs(auth, query)
    await authorize_runtime_log_access(auth)
    return result


async def get_saved_answer(auth: AuthSchema, *, session_id: str, run_id: str) -> dict[str, Any]:
    session = await ChatSessionCRUD(auth).get_by_id_crud(session_id)
    if not session:
        raise CustomException(msg="会话不存在或无权访问", status_code=404)
    run = next((run for run in session.runs if isinstance(run, dict) and run_identifier(run) == run_id), None)
    if not run:
        raise CustomException(msg="回答未保存或已不在当前会话历史中", status_code=404)
    messages = run.get("messages", [])
    answer = next((message for message in messages if message.get("role") == "assistant"), None)
    question = next((message for message in messages if message.get("role") == "user"), {})
    if not answer:
        raise CustomException(msg="该记录没有可评价的回答", status_code=422)
    return {"question": question.get("content", ""), "answer": answer.get("content", ""), "citations": answer.get("citations", [])}
