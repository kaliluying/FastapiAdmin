from __future__ import annotations

import hashlib
import json
import time
import uuid
from dataclasses import dataclass, field
from typing import Any

from sqlalchemy import delete, func, select, update

from app.core.base_schema import AuthSchema
from app.core.logger import logger
from app.plugin.module_ai.memory.model import MemoryExtractionJobModel

from .model import ChatSessionModel
from .schema import ChatSessionCreateSchema, ChatSessionUpdateSchema

MAX_STORED_MESSAGE_CHARS = 8_000
MAX_STORED_RESPONSE_CHARS = 16_000
MAX_STORED_RUNS = 50


def run_identifier(run: dict[str, Any]) -> str:
    """Keep legacy answers addressable without rewriting stored transcripts."""
    return run.get("run_id") or hashlib.sha256(json.dumps(run, sort_keys=True, ensure_ascii=False, default=str).encode()).hexdigest()


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
        self.user_id = str(auth.user.id) if auth and auth.user and auth.user.id is not None else "anonymous"
        self.team_id = None
        self.last_run_id: str | None = None

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

    async def page_crud(
        self, *, offset: int, limit: int, search: dict[str, Any] | None = None,
    ) -> tuple[list[ChatSession], int]:
        filters = [
            ChatSessionModel.user_id == self.user_id,
            ChatSessionModel.is_deleted == False,  # noqa: E712
        ]
        if title := (search or {}).get("title"):
            filters.append(ChatSessionModel.session_data["session_name"].as_string().like(f"%{title}%"))
        total = await self.db.scalar(select(func.count(ChatSessionModel.id)).where(*filters))
        result = await self.db.scalars(
            select(ChatSessionModel).where(*filters)
            .order_by(ChatSessionModel.updated_time.desc(), ChatSessionModel.id.desc())
            .offset(offset).limit(limit)
        )
        return [self._to_session(obj) for obj in result.all()], int(total or 0)

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

    async def append_run_crud(self, *, session_id: str, message: str, response: str, citations: list[dict[str, Any]] | None = None) -> bool:
        try:
            conditions = (
                ChatSessionModel.session_id == session_id,
                ChatSessionModel.user_id == self.user_id,
                ChatSessionModel.is_deleted == False,  # noqa: E712
            )
            # Take the write lock before reading, including on SQLite; only saving holds this lock.
            await self.db.execute(
                update(ChatSessionModel).where(*conditions).values(runs=ChatSessionModel.runs)
                .execution_options(synchronize_session=False)
            )
            result = await self.db.execute(
                select(ChatSessionModel).where(*conditions).with_for_update()
                .execution_options(populate_existing=True)
            )
            obj = result.scalars().first()
            if not obj:
                return False
            runs = list(obj.runs or [])
            self.last_run_id = uuid.uuid4().hex
            runs.append(
                {
                    "run_id": self.last_run_id,
                    "session_id": session_id,
                    "team_id": self.team_id,
                    "user_id": self.user_id,
                    "content": response,
                    "created_at": int(time.time()),
                    "messages": [
                        {"role": "user", "content": message[:MAX_STORED_MESSAGE_CHARS]},
                        {"role": "assistant", "content": response[:MAX_STORED_RESPONSE_CHARS], **({"citations": citations} if citations is not None else {})},
                    ],
                }
            )
            # ponytail: keep the JSON transcript bounded; add archival storage when full history is required.
            obj.runs = runs[-MAX_STORED_RUNS:]
            self.db.add(MemoryExtractionJobModel(
                run_id=self.last_run_id,
                session_id=session_id,
                user_id=self.user_id,
                user_message=message[:MAX_STORED_MESSAGE_CHARS],
                assistant_response=response[:MAX_STORED_RESPONSE_CHARS],
            ))
            await self.db.flush()
            return True
        except Exception as e:
            logger.error(f"追加聊天历史失败: {e}")
            return False

    async def delete_crud(self, session_ids: list[str]) -> bool:
        try:
            # Serialize deletion with a worker's final transaction before removing the source session.
            await self.db.execute(delete(MemoryExtractionJobModel).where(
                MemoryExtractionJobModel.session_id.in_(session_ids),
                MemoryExtractionJobModel.user_id == self.user_id,
            ))
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
