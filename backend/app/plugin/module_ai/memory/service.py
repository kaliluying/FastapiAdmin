"""Memory service — CRUD facade over MemoryCRUD."""

from __future__ import annotations

from types import SimpleNamespace
from typing import TYPE_CHECKING, Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.base_schema import AuthSchema
from app.core.database import async_db_session
from app.core.exceptions import CustomException
from app.core.logger import logger

from .crud import MemoryCRUD
from .extractor import MemoryExtractor
from .schema import MemoryCreateSchema, MemoryOutSchema, MemoryQueryParam, MemoryUpdateSchema

if TYPE_CHECKING:
    from app.plugin.module_ai.chat.rag import ChatModel


async def extract_conversation_in_background(
    *, user_id: int | str, user_message: str, assistant_response: str, chat_model: ChatModel | None = None,
) -> None:
    """Extract memories with an independent transaction without failing Chat."""
    try:
        async with async_db_session() as db:
            async with db.begin():
                saved = await MemoryService.for_user(db, user_id).extract_from_conversation(
                    user_message=user_message, assistant_response=assistant_response, chat_model=chat_model,
                )
                if saved > 0:
                    logger.info(f"记忆提取完成: 已保存 {saved} 条")
    except Exception as e:
        logger.warning(f"记忆提取后台任务失败: {e}")


class MemoryService:
    """Business logic for AI memory management."""

    def __init__(self, auth: AuthSchema) -> None:
        self.auth = auth

    @classmethod
    def for_user(cls, db: AsyncSession, user_id: int | str) -> MemoryService:
        """Use an already-authorized user identity for internal memory operations."""
        normalized_id = int(user_id) if isinstance(user_id, str) and user_id.isdigit() else user_id
        return cls(AuthSchema(user=SimpleNamespace(id=normalized_id), db=db, check_data_scope=False))

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

    async def extract_from_conversation(
        self, *, user_message: str, assistant_response: str, chat_model: ChatModel | None = None,
    ) -> int:
        """Extract and save the current user's memories in the caller's transaction."""
        return await MemoryExtractor(chat_model=chat_model).extract_and_save(
            crud=MemoryCRUD(self.auth), user_message=user_message, assistant_response=assistant_response,
        )
