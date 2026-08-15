from __future__ import annotations

import asyncio
import json
from collections.abc import AsyncGenerator
from datetime import datetime
from typing import Any
from uuid import uuid4

from app.common.request import paginate
from app.core.base_schema import AuthSchema
from app.core.database import async_db_session
from app.core.exceptions import CustomException
from app.core.logger import logger
from app.plugin.module_ai.config import validate_model_base_url

from .crud import ChatSession, ChatSessionCRUD
from .memory_extractor import MemoryExtractor
from .model_config_service import (
    get_active_chat_model_config,
    load_runtime_chat_model_config,
)
from .model_config_service import (
    get_model_config as get_runtime_model_config,
)
from .model_config_service import (
    update_model_config as update_runtime_model_config,
)
from .rag import create_rag_chain
from .schema import (
    AiModelConfigOutSchema,
    AiModelConfigUpdateSchema,
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

    result["team_name"] = None
    summary = session_dict.get("summary")
    if summary:
        result["summary"] = summary.get("summary") if isinstance(summary, dict) else str(summary)
    return result


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
            knowledge_base_ids = await self._accessible_knowledge_base_ids(query.knowledge_base_ids)
            await load_runtime_chat_model_config(self.auth)
            config_error = self._validate_ai_config()
            if config_error:
                yield config_error
                return

            crud = ChatSessionCRUD(self.auth) if self._should_persist_session() else None
            active_session_id = (
                await self._ensure_session_id(crud, query.session_id)
                if crud is not None
                else self._ensure_runtime_session_id(query.session_id)
            )
            db = crud.db if crud else self._get_db()
            if crud and query.session_id is None and db:
                await db.commit()
            chain = create_rag_chain(db=db, auth=self.auth)

            has_content = False
            response_chunks: list[str] = []
            async for chunk in chain.astream(
                message=query.message,
                user_id=self._get_user_id(),
                scope_id=self._get_scope_id(),
                session_id=active_session_id,
                files=query.files,
                knowledge_base_ids=knowledge_base_ids,
            ):
                if chunk:
                    has_content = True
                    response_chunks.append(chunk)
                    yield chunk

            if not has_content:
                yield "AI 服务没有返回内容，请检查 OPENAI_API_KEY、OPENAI_BASE_URL 和 OPENAI_MODEL 配置。"
                return

            if crud:
                full_response = "".join(response_chunks)
                await crud.append_run_crud(
                    session_id=active_session_id,
                    message=query.message,
                    response=full_response,
                )
                db = self._get_db()
                if db:
                    await db.commit()
                # 异步触发记忆提取，不阻塞用户看到回复
                self._trigger_memory_extraction(
                    user_message=query.message,
                    assistant_response=full_response,
                )
        except Exception:
            logger.exception("聊天查询失败")
            db = self._get_db()
            if db:
                await db.rollback()
            yield "抱歉，处理您的请求时出现错误，请稍后重试。"

    async def chat_non_stream(
        self,
        message: str,
        session_id: str | None,
        knowledge_base_ids: list[int] | None = None,
    ) -> dict[str, Any]:
        try:
            knowledge_base_ids = await self._accessible_knowledge_base_ids(knowledge_base_ids or [])
            await load_runtime_chat_model_config(self.auth)
            config_error = self._validate_ai_config()
            if config_error:
                return {"response": config_error, "session_id": session_id or "", "function_calls": None, "action": None}

            crud = ChatSessionCRUD(self.auth) if self._should_persist_session() else None
            active_session_id = await self._ensure_session_id(crud, session_id)
            db = crud.db if crud else self._get_db()
            if crud and session_id is None and db:
                await db.commit()
            chain = create_rag_chain(db=db, auth=self.auth)
            response_text = await chain.ainvoke(
                message=message,
                user_id=self._get_user_id(),
                scope_id=self._get_scope_id(),
                session_id=active_session_id,
                knowledge_base_ids=knowledge_base_ids,
            )
            action = self._extract_action(response_text) if response_text else None
            if response_text and crud:
                await crud.append_run_crud(session_id=active_session_id, message=message, response=response_text)
                db = self._get_db()
                if db:
                    await db.commit()
                # 异步触发记忆提取
                self._trigger_memory_extraction(
                    user_message=message,
                    assistant_response=response_text,
                )
            return {"response": response_text, "session_id": active_session_id, "function_calls": None, "action": action}
        except Exception:
            logger.exception("聊天查询失败")
            db = self._get_db()
            if db:
                await db.rollback()
            return {"response": "抱歉，处理您的请求时出现错误，请稍后重试。", "session_id": session_id, "function_calls": None, "action": None}

    async def _ensure_session_id(self, crud: ChatSessionCRUD | None, session_id: str | None) -> str:
        if session_id:
            return session_id
        if crud is None:
            return self._generate_ephemeral_session_id()
        session = await crud.create_crud(data=ChatSessionCreateSchema(title="新对话"))
        if not session:
            raise CustomException(msg="创建会话失败")
        return session.session_id

    def _ensure_runtime_session_id(self, session_id: str | None) -> str:
        return session_id or self._generate_ephemeral_session_id()

    def _trigger_memory_extraction(
        self,
        user_message: str,
        assistant_response: str,
    ) -> None:
        """Fire-and-forget 触发记忆提取，不阻塞主流程。"""
        auth = self.auth
        user = getattr(auth, "user", None)
        user_id = getattr(user, "id", None)
        if not auth or user_id is None:
            return
        try:
            async def _extract() -> None:
                try:
                    from types import SimpleNamespace

                    from app.plugin.module_ai.memory.crud import MemoryCRUD

                    async with async_db_session() as background_db:
                        async with background_db.begin():
                            background_auth = AuthSchema(
                                user=SimpleNamespace(id=user_id),
                                db=background_db,
                                check_data_scope=False,
                            )
                            crud = MemoryCRUD(background_auth)
                            extractor = MemoryExtractor()
                            saved = await extractor.extract_and_save(
                                crud=crud,
                                user_message=user_message,
                                assistant_response=assistant_response,
                            )
                            if saved > 0:
                                logger.info(f"记忆提取完成: 已保存 {saved} 条")
                except Exception as e:
                    logger.warning(f"记忆提取后台任务失败: {e}")

            asyncio.create_task(_extract())
        except Exception as e:
            logger.warning(f"启动记忆提取任务失败: {e}")

    def _should_persist_session(self) -> bool:
        return getattr(self.auth, "user", None) is not None and self._get_db() is not None

    def _get_db(self) -> Any | None:
        return getattr(self.auth, "db", None)

    @staticmethod
    def _generate_ephemeral_session_id() -> str:
        return f"guest-{uuid4().hex}"

    @staticmethod
    def _validate_ai_config() -> str | None:
        config = get_active_chat_model_config()
        api_key = config.api_key.strip()
        model = config.model.strip()
        base_url = config.base_url.strip()
        if not api_key or api_key == "your_api_key":
            return "AI 服务未配置有效 API Key，请先在模型配置中填写。"
        if not model:
            return "AI 服务未配置对话模型，请先在模型配置中填写模型名称。"
        if not base_url:
            return "AI 服务未配置接口地址，请先在模型配置中填写。"
        try:
            validate_model_base_url(base_url)
        except ValueError:
            return "AI 服务接口地址不符合安全策略，请检查主机白名单配置。"
        return None

    def _get_user_id(self) -> str:
        user_id = getattr(getattr(self.auth, "user", None), "id", None)
        return str(user_id) if user_id is not None else "anonymous"

    def _get_scope_id(self) -> str:
        return self._get_user_id()

    async def _accessible_knowledge_base_ids(self, ids: list[int]) -> list[int]:
        """Validate that every requested knowledge base is user-accessible."""
        normalized = list(dict.fromkeys(ids))
        if not normalized or not getattr(self.auth, "user", None) or not self._get_db():
            return normalized
        from app.plugin.module_ai.knowledge.crud import KnowledgeBaseCRUD

        visible = await KnowledgeBaseCRUD(self.auth).get_list(
            search={"id": ("in", normalized)},
        )
        visible_ids = {item.id for item in visible}
        if visible_ids != set(normalized):
            raise CustomException(msg="知识库不存在或无权访问", status_code=403)
        return normalized

    async def get_model_config(self) -> AiModelConfigOutSchema:
        return await get_runtime_model_config(self.auth)

    async def update_model_config(self, data: AiModelConfigUpdateSchema) -> AiModelConfigOutSchema:
        return await update_runtime_model_config(self.auth, data)

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
        return paginate(data_list=items, page_no=page_no, page_size=page_size)

    async def update(self, session_id: str, data: ChatSessionUpdateSchema) -> bool:
        return await ChatSessionCRUD(self.auth).update_crud(session_id=session_id, data=data)

    async def delete(self, session_ids: list[str]) -> None:
        await ChatSessionCRUD(self.auth).delete_crud(session_ids=session_ids)
