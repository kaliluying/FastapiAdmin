from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from typing import Any

from sqlalchemy import select

from app.core.base_schema import AuthSchema
from app.core.logger import logger

from .model import ChatSessionModel
from .schema import ChatSessionCreateSchema, ChatSessionUpdateSchema


@dataclass(slots=True)
class ChatSession:
    session_id: str
    user_id: str
    team_id: str | None = None
    session_data: dict[str, Any] = field(default_factory=dict)
    runs: list[dict[str, Any]] = field(default_factory=list)
    created_at: int | None = None
    updated_at: int | None = None
    agent_id: str | None = None
    workflow_id: str | None = None
    agent_data: dict[str, Any] | None = None
    team_data: dict[str, Any] | None = None
    workflow_data: dict[str, Any] | None = None
    metadata: dict[str, Any] | None = None
    summary: dict[str, Any] | str | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "session_id": self.session_id,
            "agent_id": self.agent_id,
            "team_id": self.team_id,
            "workflow_id": self.workflow_id,
            "user_id": self.user_id,
            "session_data": self.session_data,
            "agent_data": self.agent_data,
            "team_data": self.team_data,
            "workflow_data": self.workflow_data,
            "metadata": self.metadata,
            "runs": self.runs,
            "summary": self.summary,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }


class ChatSessionCRUD:
    """Chat session data layer backed by the project database."""

    def __init__(self, auth: AuthSchema) -> None:
        self.auth = auth
        self.db = auth.db
        self.user_id = auth.user.username if auth and auth.user else "user"
        dept_id = getattr(auth.user, "dept_id", None) if auth and auth.user else None
        self.team_id = str(dept_id) if dept_id else None

    async def get_by_id_crud(self, session_id: str) -> ChatSession | None:
        try:
            obj = await self._get_model(session_id)
            return self._to_session(obj) if obj else None
        except Exception as e:
            logger.error(f"获取聊天会话详情失败: {e}")
            return None

    async def list_crud(
        self,
        search: dict[str, Any] | None = None,
        order_by: list[dict[str, str]] | None = None,
    ) -> list[ChatSession]:
        try:
            stmt = select(ChatSessionModel).where(
                ChatSessionModel.user_id == self.user_id,
                ChatSessionModel.is_deleted == False,  # noqa: E712
            )
            title = (search or {}).get("title")
            if title:
                stmt = stmt.where(ChatSessionModel.session_data["session_name"].as_string().like(f"%{title}%"))
            stmt = stmt.order_by(ChatSessionModel.updated_time.desc())
            result = await self.db.execute(stmt)
            return [self._to_session(obj) for obj in result.scalars().all()]
        except Exception as e:
            logger.error(f"获取聊天会话列表失败: {e}")
            return []

    async def create_crud(self, data: ChatSessionCreateSchema) -> ChatSession | None:
        try:
            obj = ChatSessionModel(
                session_id=str(uuid.uuid4()),
                user_id=self.user_id,
                team_id=self.team_id,
                session_data={"session_name": data.title} if data.title else {},
                runs=[],
            )
            self.db.add(obj)
            await self.db.flush()
            await self.db.refresh(obj)
            return self._to_session(obj)
        except Exception as e:
            logger.exception(f"创建聊天会话失败: {e}")
            return None

    async def update_crud(self, session_id: str, data: ChatSessionUpdateSchema) -> bool:
        try:
            obj = await self._get_model(session_id)
            if not obj:
                return False
            obj.session_data = {**(obj.session_data or {}), "session_name": data.title}
            await self.db.flush()
            return True
        except Exception as e:
            logger.error(f"更新聊天会话失败: {e}")
            return False

    async def append_run_crud(self, *, session_id: str, message: str, response: str) -> bool:
        try:
            obj = await self._get_model(session_id)
            if not obj:
                return False
            runs = list(obj.runs or [])
            runs.append(
                {
                    "session_id": session_id,
                    "team_id": self.team_id,
                    "user_id": self.user_id,
                    "content": response,
                    "created_at": int(time.time()),
                    "messages": [
                        {"role": "user", "content": message},
                        {"role": "assistant", "content": response},
                    ],
                }
            )
            obj.runs = runs
            await self.db.flush()
            return True
        except Exception as e:
            logger.error(f"追加聊天历史失败: {e}")
            return False

    async def delete_crud(self, session_ids: list[str]) -> bool:
        try:
            result = await self.db.execute(
                select(ChatSessionModel).where(
                    ChatSessionModel.session_id.in_(session_ids),
                    ChatSessionModel.user_id == self.user_id,
                    ChatSessionModel.is_deleted == False,  # noqa: E712
                )
            )
            for obj in result.scalars().all():
                obj.is_deleted = True
            await self.db.flush()
            return True
        except Exception as e:
            logger.error(f"删除聊天会话失败: {e}")
            return False

    async def _get_model(self, session_id: str) -> ChatSessionModel | None:
        result = await self.db.execute(
            select(ChatSessionModel).where(
                ChatSessionModel.session_id == session_id,
                ChatSessionModel.user_id == self.user_id,
                ChatSessionModel.is_deleted == False,  # noqa: E712
            )
        )
        return result.scalars().first()

    @staticmethod
    def _to_session(obj: ChatSessionModel) -> ChatSession:
        return ChatSession(
            session_id=obj.session_id,
            user_id=obj.user_id,
            team_id=obj.team_id,
            session_data=obj.session_data or {},
            runs=obj.runs or [],
            created_at=int(obj.created_time.timestamp()) if obj.created_time else None,
            updated_at=int(obj.updated_time.timestamp()) if obj.updated_time else None,
        )
