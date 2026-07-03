"""Memory CRUD backed by the project database."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from sqlalchemy import select

from app.core.base_schema import AuthSchema
from app.core.logger import logger

from .model import AiMemoryModel
from .schema import MemoryCreateSchema, MemoryUpdateSchema


@dataclass(slots=True)
class MemoryEntry:
    """Plain data object for a memory entry."""

    id: int
    user_id: str
    team_id: str | None = None
    memory_type: str = "fact"
    category: str | None = None
    key: str = ""
    value: str = ""
    priority: int = 0
    is_active: bool = True
    created_time: Any = None
    updated_time: Any = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "team_id": self.team_id,
            "memory_type": self.memory_type,
            "category": self.category,
            "key": self.key,
            "value": self.value,
            "priority": self.priority,
            "is_active": self.is_active,
            "created_time": self.created_time,
            "updated_time": self.updated_time,
        }


class MemoryCRUD:
    """Memory data layer — generic per-user long-term memory for the AI assistant."""

    def __init__(self, auth: AuthSchema) -> None:
        self.auth = auth
        self.db = auth.db
        self.user_id = auth.user.username if auth and auth.user else "user"
        dept_id = getattr(auth.user, "dept_id", None) if auth and auth.user else None
        self.team_id = str(dept_id) if dept_id else None

    async def get_by_id(self, memory_id: int) -> MemoryEntry | None:
        obj = await self._get_model(memory_id)
        return self._to_entry(obj) if obj else None

    async def list_crud(
        self,
        search: dict[str, Any] | None = None,
    ) -> list[MemoryEntry]:
        try:
            stmt = select(AiMemoryModel).where(
                AiMemoryModel.user_id == self.user_id,
                AiMemoryModel.is_deleted == False,  # noqa: E712
            )
            if search:
                if "memory_type" in search and search["memory_type"]:
                    stmt = stmt.where(AiMemoryModel.memory_type == search["memory_type"])
                if "category" in search and search["category"]:
                    stmt = stmt.where(AiMemoryModel.category == search["category"])
                if "key" in search and search["key"]:
                    stmt = stmt.where(AiMemoryModel.key.like(f"%{search['key']}%"))
                if "is_active" in search and search["is_active"] is not None:
                    stmt = stmt.where(AiMemoryModel.is_active == search["is_active"])
            stmt = stmt.order_by(AiMemoryModel.priority.desc(), AiMemoryModel.updated_time.desc())
            result = await self.db.execute(stmt)
            return [self._to_entry(obj) for obj in result.scalars().all()]
        except Exception as e:
            logger.error(f"获取记忆列表失败: {e}")
            return []

    async def create_crud(self, data: MemoryCreateSchema) -> MemoryEntry | None:
        try:
            obj = AiMemoryModel(
                user_id=self.user_id,
                team_id=self.team_id,
                memory_type=data.memory_type,
                category=data.category,
                key=data.key,
                value=data.value,
                priority=data.priority,
                is_active=data.is_active,
            )
            self.db.add(obj)
            await self.db.flush()
            await self.db.refresh(obj)
            return self._to_entry(obj)
        except Exception as e:
            logger.exception(f"创建记忆失败: {e}")
            return None

    async def update_crud(self, memory_id: int, data: MemoryUpdateSchema) -> bool:
        try:
            obj = await self._get_model(memory_id)
            if not obj:
                return False
            update_data = data.model_dump(exclude_unset=True)
            for field_name, field_value in update_data.items():
                if hasattr(obj, field_name):
                    setattr(obj, field_name, field_value)
            await self.db.flush()
            return True
        except Exception as e:
            logger.error(f"更新记忆失败: {e}")
            return False

    async def delete_crud(self, memory_ids: list[int]) -> bool:
        try:
            result = await self.db.execute(
                select(AiMemoryModel).where(
                    AiMemoryModel.id.in_(memory_ids),
                    AiMemoryModel.user_id == self.user_id,
                    AiMemoryModel.is_deleted == False,  # noqa: E712
                )
            )
            for obj in result.scalars().all():
                obj.is_deleted = True
            await self.db.flush()
            return True
        except Exception as e:
            logger.error(f"删除记忆失败: {e}")
            return False

    async def get_active_memories(self, *, memory_type: str | None = None) -> list[MemoryEntry]:
        """Fetch active memories for prompt injection (used by rag.py)."""
        try:
            stmt = select(AiMemoryModel).where(
                AiMemoryModel.user_id == self.user_id,
                AiMemoryModel.is_active == True,  # noqa: E712
                AiMemoryModel.is_deleted == False,  # noqa: E712
            )
            if memory_type:
                stmt = stmt.where(AiMemoryModel.memory_type == memory_type)
            stmt = stmt.order_by(AiMemoryModel.priority.desc())
            result = await self.db.execute(stmt)
            return [self._to_entry(obj) for obj in result.scalars().all()]
        except Exception as e:
            logger.error(f"获取活跃记忆失败: {e}")
            return []

    async def upsert(self, memory_type: str, key: str, value: str, *, category: str | None = None, priority: int = 0) -> MemoryEntry | None:
        """Create or update a memory entry by user_id + key.

        Returns the created/updated MemoryEntry, or None on failure.
        """
        try:
            stmt = select(AiMemoryModel).where(
                AiMemoryModel.user_id == self.user_id,
                AiMemoryModel.key == key,
                AiMemoryModel.is_deleted == False,  # noqa: E712
            )
            result = await self.db.execute(stmt)
            existing = result.scalars().first()

            if existing:
                existing.memory_type = memory_type
                existing.value = value
                if category is not None:
                    existing.category = category
                existing.priority = priority
                await self.db.flush()
                await self.db.refresh(existing)
                logger.info(f"更新已有记忆: key={key}, user={self.user_id}")
                return self._to_entry(existing)
            else:
                obj = AiMemoryModel(
                    user_id=self.user_id,
                    team_id=self.team_id,
                    memory_type=memory_type,
                    category=category,
                    key=key,
                    value=value,
                    priority=priority,
                    is_active=True,
                )
                self.db.add(obj)
                await self.db.flush()
                await self.db.refresh(obj)
                logger.info(f"创建新记忆: key={key}, user={self.user_id}")
                return self._to_entry(obj)
        except Exception as e:
            logger.exception(f"upsert 记忆失败: key={key}, error={e}")
            return None

    async def _get_model(self, memory_id: int) -> AiMemoryModel | None:
        result = await self.db.execute(
            select(AiMemoryModel).where(
                AiMemoryModel.id == memory_id,
                AiMemoryModel.user_id == self.user_id,
                AiMemoryModel.is_deleted == False,  # noqa: E712
            )
        )
        return result.scalars().first()

    @staticmethod
    def _to_entry(obj: AiMemoryModel) -> MemoryEntry:
        return MemoryEntry(
            id=obj.id,
            user_id=obj.user_id,
            team_id=obj.team_id,
            memory_type=obj.memory_type,
            category=getattr(obj, "category", None),
            key=obj.key,
            value=obj.value,
            priority=getattr(obj, "priority", 0),
            is_active=getattr(obj, "is_active", True),
            created_time=obj.created_time,
            updated_time=obj.updated_time,
        )
