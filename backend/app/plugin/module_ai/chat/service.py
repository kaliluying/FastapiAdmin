from __future__ import annotations

import json
from collections.abc import AsyncGenerator
from datetime import datetime
from typing import Any

from app.api.v1.module_system.dept.service import DeptService
from app.common.request import PaginationService
from app.config.setting import settings
from app.core.base_schema import AuthSchema
from app.core.exceptions import CustomException
from app.core.logger import logger

from .crud import ChatSession, ChatSessionCRUD
from .rag import RagChainFactory
from .schema import (
    AiModelConfigOutSchema,
    ChatQuerySchema,
    ChatSessionCreateSchema,
    ChatSessionQueryParam,
    ChatSessionUpdateSchema,
)


async def _format_session_data(session: ChatSession, auth: AuthSchema | None = None) -> dict[str, Any]:
    session_dict = session.to_dict() if hasattr(session, "to_dict") else {
        "session_id": getattr(session, "session_id", ""),
        "team_id": getattr(session, "team_id", None),
        "user_id": getattr(session, "user_id", None),
        "session_data": getattr(session, "session_data", None),
        "runs": getattr(session, "runs", []),
        "summary": getattr(session, "summary", None),
        "created_at": getattr(session, "created_at", None),
        "updated_at": getattr(session, "updated_at", None),
    }
    session_data = session_dict.get("session_data") or {}
    runs = session_dict.get("runs") or []
    messages = _extract_messages(runs)
    session_name = session_data.get("session_name") if session_data else None

    result = {
        **session_dict,
        "id": session_dict.get("session_id"),
        "title": session_name or session_dict.get("session_id", "")[:8] or "未命名会话",
        "created_time": _unix_to_datetime(session_dict.get("created_at")),
        "updated_time": _unix_to_datetime(session_dict.get("updated_at")),
        "message_count": len(messages),
        "messages": messages,
    }

    result["team_name"] = await _get_team_name(session_dict.get("team_id"), auth)
    summary = session_dict.get("summary")
    if summary:
        result["summary"] = summary.get("summary") if isinstance(summary, dict) else str(summary)
    return result


async def _get_team_name(team_id: Any, auth: AuthSchema | None) -> str | None:
    if not auth or not team_id:
        return None
    try:
        dept_id = int(team_id)
        dept = await DeptService(auth).detail(id=dept_id)
        return dept.get("name")
    except Exception:
        return None


def _unix_to_datetime(timestamp: int | None) -> str | None:
    if timestamp is None:
        return None
    try:
        return datetime.fromtimestamp(timestamp).strftime("%Y-%m-%d %H:%M:%S")
    except (ValueError, TypeError, OSError):
        return None


def _extract_messages(runs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    messages: list[dict[str, Any]] = []
    for run in runs or []:
        if not isinstance(run, dict):
            continue
        for msg in run.get("messages", []) or []:
            if not isinstance(msg, dict):
                continue
            role = msg.get("role")
            if role in ("user", "assistant"):
                messages.append(
                    {
                        "id": msg.get("id"),
                        "role": role,
                        "content": msg.get("content", ""),
                        "created_at": msg.get("created_at"),
                    }
                )
    return messages


class ChatService:
    def __init__(self, auth: AuthSchema) -> None:
        self.auth = auth

    async def chat_query(self, query: ChatQuerySchema) -> AsyncGenerator[str, None]:
        try:
            config_error = self._validate_ai_config()
            if config_error:
                yield config_error
                return

            crud = ChatSessionCRUD(self.auth)
            session_id = await self._ensure_session_id(crud, query.session_id)
            chain = RagChainFactory().create_chain(db=crud.db)

            has_content = False
            response_chunks: list[str] = []
            async for chunk in chain.astream(
                message=query.message,
                user_id=self._get_user_id(),
                dept_id=self._get_dept_id(),
                session_id=session_id,
                files=query.files,
                knowledge_base_ids=query.knowledge_base_ids,
            ):
                if chunk:
                    has_content = True
                    response_chunks.append(chunk)
                    yield chunk

            if not has_content:
                yield "AI 服务没有返回内容，请检查 OPENAI_API_KEY、OPENAI_BASE_URL 和 OPENAI_MODEL 配置。"
                return

            await crud.append_run_crud(
                session_id=session_id,
                message=query.message,
                response="".join(response_chunks),
            )
        except Exception as e:
            logger.error(f"聊天查询失败: {e}")
            yield f"抱歉，处理您的请求时出现错误：{e}"

    async def chat_non_stream(
        self,
        message: str,
        session_id: str | None,
        knowledge_base_ids: list[int] | None = None,
    ) -> dict[str, Any]:
        try:
            config_error = self._validate_ai_config()
            if config_error:
                return {"response": config_error, "session_id": session_id or "", "function_calls": None, "action": None}

            crud = ChatSessionCRUD(self.auth)
            active_session_id = await self._ensure_session_id(crud, session_id)
            chain = RagChainFactory().create_chain(db=crud.db)
            response_text = await chain.ainvoke(
                message=message,
                user_id=self._get_user_id(),
                dept_id=self._get_dept_id(),
                session_id=active_session_id,
                knowledge_base_ids=knowledge_base_ids or [],
            )
            action = self._extract_action(response_text) if response_text else None
            if response_text:
                await crud.append_run_crud(session_id=active_session_id, message=message, response=response_text)
            return {"response": response_text, "session_id": active_session_id, "function_calls": None, "action": action}
        except Exception as e:
            logger.error(f"聊天查询失败: {e}")
            return {"response": f"抱歉，处理您的请求时出现错误：{e}", "session_id": session_id, "function_calls": None, "action": None}

    async def _ensure_session_id(self, crud: ChatSessionCRUD, session_id: str | None) -> str:
        if session_id:
            return session_id
        session = await crud.create_crud(data=ChatSessionCreateSchema(title="新对话"))
        if not session:
            raise CustomException(msg="创建会话失败")
        return session.session_id

    @staticmethod
    def _validate_ai_config() -> str | None:
        api_key = settings.OPENAI_API_KEY.strip()
        model = settings.OPENAI_MODEL.strip()
        base_url = settings.OPENAI_BASE_URL.strip()
        if not api_key or api_key == "your_api_key":
            return "AI 服务未配置有效 OPENAI_API_KEY，请先在后端环境配置中填写真实 API Key。"
        if not model:
            return "AI 服务未配置 OPENAI_MODEL，请先在后端环境配置中填写模型名称。"
        if not base_url:
            return "AI 服务未配置 OPENAI_BASE_URL，请先在后端环境配置中填写 OpenAI 兼容接口地址。"
        return None

    def _get_user_id(self) -> str:
        username = getattr(getattr(self.auth, "user", None), "username", None)
        return str(username) if username else "user"

    def _get_dept_id(self) -> str:
        dept_id = getattr(getattr(self.auth, "user", None), "dept_id", None)
        return str(dept_id) if dept_id else "default"

    @staticmethod
    def get_model_config() -> AiModelConfigOutSchema:
        api_key = settings.OPENAI_API_KEY.strip()
        return AiModelConfigOutSchema(
            openai_base_url=settings.OPENAI_BASE_URL,
            openai_model=settings.OPENAI_MODEL,
            openai_embedding_model=settings.OPENAI_EMBEDDING_MODEL,
            openai_api_key_configured=bool(api_key and api_key != "your_api_key"),
            chroma_host=settings.CHROMA_HOST,
            chroma_port=settings.CHROMA_PORT,
            chroma_ssl=settings.CHROMA_SSL,
            chroma_collection_name=settings.CHROMA_COLLECTION_NAME,
        )

    @staticmethod
    def _extract_action(response_text: str) -> dict[str, Any] | None:
        try:
            text = response_text.strip()
            if text.startswith("{") and text.endswith("}"):
                return json.loads(text)
            if "```json" in text:
                json_start = text.find("```json") + 7
                json_end = text.find("```", json_start)
                if json_end > json_start:
                    return json.loads(text[json_start:json_end].strip())
        except (json.JSONDecodeError, Exception):
            pass
        return ChatService._parse_action_from_response(response_text)

    @staticmethod
    def _parse_action_from_response(response_text: str) -> dict[str, Any] | None:
        route_config = {
            "用户管理": {"path": "/system/user", "name": "用户管理"},
            "角色管理": {"path": "/system/role", "name": "角色管理"},
            "菜单管理": {"path": "/system/menu", "name": "菜单管理"},
            "部门管理": {"path": "/system/dept", "name": "部门管理"},
            "字典管理": {"path": "/system/dict", "name": "字典管理"},
            "系统日志": {"path": "/system/log", "name": "系统日志"},
        }
        navigation_keywords = ["跳转", "打开", "进入", "前往", "去", "浏览", "查看"]
        if not any(keyword in response_text for keyword in navigation_keywords):
            return None
        for page_name, route_info in route_config.items():
            if page_name in response_text:
                return {"type": "navigate", **route_info}
        keyword_mapping = {
            "用户": route_config["用户管理"],
            "角色": route_config["角色管理"],
            "菜单": route_config["菜单管理"],
            "部门": route_config["部门管理"],
            "字典": route_config["字典管理"],
            "日志": route_config["系统日志"],
        }
        for keyword, route_info in keyword_mapping.items():
            if keyword in response_text:
                return {"type": "navigate", **route_info}
        return None

    async def get_session(self, session_id: str) -> dict[str, Any] | None:
        session = await ChatSessionCRUD(self.auth).get_by_id_crud(session_id=session_id)
        return await _format_session_data(session, self.auth) if session else None

    async def create(self, data: ChatSessionCreateSchema) -> dict[str, Any] | None:
        session = await ChatSessionCRUD(self.auth).create_crud(data=data)
        return await _format_session_data(session, self.auth) if session else None

    async def page(
        self,
        page_no: int,
        page_size: int,
        search: ChatSessionQueryParam,
        order_by: list[dict[str, str]] | None = None,
    ) -> dict[str, Any]:
        sessions = await ChatSessionCRUD(self.auth).list_crud(search=search.__dict__ if search else None, order_by=order_by)
        items = [await _format_session_data(session, self.auth) for session in sessions]
        return await PaginationService.paginate(data_list=items, page_no=page_no, page_size=page_size)

    async def update(self, session_id: str, data: ChatSessionUpdateSchema) -> bool:
        return await ChatSessionCRUD(self.auth).update_crud(session_id=session_id, data=data)

    async def delete(self, session_ids: list[str]) -> None:
        await ChatSessionCRUD(self.auth).delete_crud(session_ids=session_ids)
