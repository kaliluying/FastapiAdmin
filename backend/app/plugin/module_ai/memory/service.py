"""Memory service — CRUD facade over MemoryCRUD."""

from __future__ import annotations

from typing import Any

from app.core.base_schema import AuthSchema
from app.core.exceptions import CustomException

from .crud import MemoryCRUD
from .schema import MemoryCreateSchema, MemoryOutSchema, MemoryQueryParam, MemoryUpdateSchema


class MemoryService:
    """Business logic for AI memory management."""

    def __init__(self, auth: AuthSchema) -> None:
        self.auth = auth

    async def page(
        self,
        page_no: int,
        page_size: int,
        search: MemoryQueryParam | None = None,
        order_by: list[dict[str, str]] | None = None,
    ) -> dict[str, Any]:
        crud = MemoryCRUD(self.auth)
        search_dict = search.model_dump(exclude_none=True) if search else {}
        page_items, total = await crud.page_crud(
            offset=(page_no - 1) * page_size,
            limit=page_size,
            search=search_dict,
        )
        return {
            "items": [MemoryOutSchema.model_validate(item.to_dict()) for item in page_items],
            "total": total,
            "page_no": page_no,
            "page_size": page_size,
        }

    async def create(self, data: MemoryCreateSchema) -> dict[str, Any]:
        crud = MemoryCRUD(self.auth)
        entry = await crud.create_crud(data)
        if not entry:
            raise CustomException(msg="创建记忆失败")
        return MemoryOutSchema.model_validate(entry.to_dict()).model_dump()

    async def update(self, memory_id: int, data: MemoryUpdateSchema) -> bool:
        crud = MemoryCRUD(self.auth)
        ok = await crud.update_crud(memory_id, data)
        if not ok:
            raise CustomException(msg="更新记忆失败或记录不存在")
        return True

    async def delete(self, memory_ids: list[int]) -> bool:
        crud = MemoryCRUD(self.auth)
        ok = await crud.delete_crud(memory_ids)
        if not ok:
            raise CustomException(msg="删除记忆失败")
        return True

    async def get_active_memories(self, *, memory_type: str | None = None) -> list[dict[str, Any]]:
        """Called by rag.py to fetch memories for prompt injection."""
        crud = MemoryCRUD(self.auth)
        entries = await crud.get_active_memories(memory_type=memory_type)
        return [entry.to_dict() for entry in entries]
