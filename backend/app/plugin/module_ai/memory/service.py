"""记忆服务，为 MemoryCRUD 提供增删改查入口。"""

from __future__ import annotations

from types import SimpleNamespace
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.base_schema import AuthSchema
from app.core.database import async_db_session
from app.core.exceptions import CustomException
from app.core.logger import logger

from .crud import MemoryCRUD
from .extractor import ExtractionModel, MemoryExtractor
from .schema import MemoryCreateSchema, MemoryExtractAction, MemoryOutSchema, MemoryQueryParam, MemoryUpdateSchema


async def extract_conversation_in_background(
    *, user_id: int | str, user_message: str, assistant_response: str, chat_model: ExtractionModel,
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
                    saved = await MemoryService.for_user(db, user_id).apply_extracted_actions(actions)
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
        self, *, user_message: str, assistant_response: str, chat_model: ExtractionModel,
    ) -> int:
        """在调用方事务中提取并保存当前用户的记忆。"""
        try:
            actions = await MemoryExtractor(chat_model=chat_model).extract_actions(
                user_message=user_message, assistant_response=assistant_response,
                existing_memories=await self.get_active_memories(),
            )
            return await self.apply_extracted_actions(actions)
        except Exception as e:
            logger.warning(f"记忆提取失败（非致命）: {e}")
            return 0

    async def apply_extracted_actions(self, actions: list[MemoryExtractAction]) -> int:
        """在调用方事务内写入当前用户的记忆，不自行提交。"""
        crud = MemoryCRUD(self.auth)
        saved = 0
        for action in actions:
            saved += await self._execute_action(crud, action)
        return saved

    async def _execute_action(self, crud: MemoryCRUD, action: MemoryExtractAction) -> int:
        if action.action == "delete":
            if action.memory_id is not None:
                ok = await crud.delete_crud([action.memory_id])
                if ok:
                    logger.info(f"记忆提取: 删除记忆 id={action.memory_id}, reason={action.reason}")
                    return 1
            return 0
        if action.action in ("create", "update"):
            key = (action.key or "").strip()
            value = (action.value or "").strip()
            if not key or not value:
                logger.warning(f"记忆提取: 跳过空 key/value, action={action}")
                return 0
            if action.action == "update":
                if action.memory_id is None:
                    return 0
                data = MemoryUpdateSchema(
                    memory_type=action.memory_type or "fact", key=key, value=value, priority=action.priority,
                )
                if action.category is not None:
                    data.category = action.category
                return int(await crud.update_crud(action.memory_id, data))
            entry = await crud.upsert(
                memory_type=action.memory_type or "fact", key=key, value=value,
                category=action.category, priority=action.priority,
            )
            return 1 if entry else 0
        logger.warning(f"记忆提取: 未知操作类型 action={action.action}")
        return 0
