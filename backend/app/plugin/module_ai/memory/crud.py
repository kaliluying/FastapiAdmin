"""基于项目数据库的记忆增删改查。"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from sqlalchemy import select

from app.core.base_schema import AuthSchema
from app.core.logger import logger

from .model import AiMemoryModel
from .schema import MemoryCreateSchema, MemoryUpdateSchema


@dataclass(slots=True)
class MemoryEntry:
    """记忆条目的普通数据对象。"""

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
    """记忆数据层，为 AI 助手提供按用户隔离的通用长期记忆。"""

    def __init__(self, auth: AuthSchema) -> None:
        self.auth = auth
        self.db = auth.db
        self.user_id = str(auth.user.id) if auth and auth.user and auth.user.id is not None else "anonymous"
        self.team_id = None

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

    async def page_crud(
        self,
        *,
        offset: int,
        limit: int,
        search: dict[str, Any] | None = None,
    ) -> tuple[list[MemoryEntry], int]:
        """从数据库获取一页记忆及匹配记录总数。

        Args:
            offset: 跳过的匹配记录数。
            limit: 最多返回的记录数。
            search: 可选的记忆筛选条件。

        Returns:
            由当前页条目和匹配记录总数组成的元组。
        """
        try:
            filters = [
                AiMemoryModel.user_id == self.user_id,
                AiMemoryModel.is_deleted == False,  # noqa: E712
            ]
            search = search or {}
            if search.get("memory_type"):
                filters.append(AiMemoryModel.memory_type == search["memory_type"])
            if search.get("category"):
                filters.append(AiMemoryModel.category == search["category"])
            if search.get("key"):
                filters.append(AiMemoryModel.key.like(f"%{search['key']}%"))
            if search.get("is_active") is not None:
                filters.append(AiMemoryModel.is_active == search["is_active"])

            from sqlalchemy import func

            total_result = await self.db.execute(
                select(func.count(AiMemoryModel.id)).where(*filters)
            )
            total = int(total_result.scalar() or 0)
            result = await self.db.execute(
                select(AiMemoryModel)
                .where(*filters)
                .order_by(AiMemoryModel.priority.desc(), AiMemoryModel.updated_time.desc())
                .offset(offset)
                .limit(limit)
            )
            return [self._to_entry(obj) for obj in result.scalars().all()], total
        except Exception as e:
            logger.error(f"获取记忆分页失败: {e}")
            return [], 0

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

    async def get_active_memories(self, *, memory_type: str | None = None) -> list[MemoryEntry]:
        """获取用于注入提示词的活跃记忆（由 rag.py 使用）。"""
        stmt = select(AiMemoryModel).where(
            AiMemoryModel.user_id == self.user_id,
            AiMemoryModel.is_active == True,  # noqa: E712
            AiMemoryModel.is_deleted == False,  # noqa: E712
        )
        if memory_type:
            stmt = stmt.where(AiMemoryModel.memory_type == memory_type)
        stmt = stmt.order_by(AiMemoryModel.priority.desc()).limit(50)
        result = await self.db.execute(stmt)
        return [self._to_entry(obj) for obj in result.scalars().all()]

    async def upsert(self, memory_type: str, key: str, value: str, *, category: str | None = None, priority: int = 0) -> MemoryEntry | None:
        """按 user_id + key 创建或更新记忆条目。

        返回创建或更新后的 MemoryEntry；数据库异常向上传播。
        """
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
