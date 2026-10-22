"""记忆服务，为 MemoryCRUD 提供增删改查入口。"""

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
    """使用独立事务提取记忆，避免提取失败影响聊天。"""
    try:
        async with async_db_session() as db:
            async with db.begin():
                existing = await MemoryService.for_user(db, user_id).get_active_memories()
        extractor = MemoryExtractor(chat_model=chat_model)
        actions = await extractor.extract_actions(
            user_message=user_message, assistant_response=assistant_response, existing_memories=existing,
        )
        if actions:
            async with async_db_session() as db:
                async with db.begin():
                    saved = await extractor.save_actions(crud=MemoryCRUD(MemoryService.for_user(db, user_id).auth), actions=actions)
            if saved > 0:
                logger.info(f"记忆提取完成: 已保存 {saved} 条")
    except Exception as e:
        logger.warning(f"记忆提取后台任务失败: {e}")


class MemoryService:
    """AI 记忆管理的业务逻辑。"""

    def __init__(self, auth: AuthSchema) -> None:
        self.auth = auth

    @classmethod
    def for_user(cls, db: AsyncSession, user_id: int | str) -> MemoryService:
        """使用已获授权的用户身份执行内部记忆操作。"""
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
        """由 rag.py 调用，获取用于注入提示词的记忆。"""
        crud = MemoryCRUD(self.auth)
        entries = await crud.get_active_memories(memory_type=memory_type)
        return [entry.to_dict() for entry in entries]

    async def extract_from_conversation(
        self, *, user_message: str, assistant_response: str, chat_model: ChatModel | None = None,
    ) -> int:
        """在调用方事务中提取并保存当前用户的记忆。"""
        return await MemoryExtractor(chat_model=chat_model).extract_and_save(
            crud=MemoryCRUD(self.auth), user_message=user_message, assistant_response=assistant_response,
        )
