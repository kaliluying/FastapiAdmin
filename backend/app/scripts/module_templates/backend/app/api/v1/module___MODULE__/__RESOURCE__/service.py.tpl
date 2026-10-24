from sqlalchemy.exc import IntegrityError

from app.core.base_crud import CRUDBase
from app.core.base_schema import AuthSchema, PageResultSchema
from app.core.exceptions import CustomException

from .model import __MODEL_CLASS__
from .schema import __RESOURCE_CLASS__CreateSchema, __RESOURCE_CLASS__OutSchema, __RESOURCE_CLASS__QueryParam, __RESOURCE_CLASS__UpdateSchema


class __RESOURCE_CLASS__Service:
    """__TITLE__用例：共享数据权限、保存一致性、冲突转换和批量删除校验。"""

    def __init__(self, auth: AuthSchema) -> None:
        self.auth = auth
        self.crud = CRUDBase[__MODEL_CLASS__, __RESOURCE_CLASS__CreateSchema, __RESOURCE_CLASS__UpdateSchema](model=__MODEL_CLASS__, auth=auth)

    async def detail(self, id: int) -> __RESOURCE_CLASS__OutSchema:
        return __RESOURCE_CLASS__OutSchema.model_validate(await self._get(id))

    async def _get(self, id: int) -> __MODEL_CLASS__:
        record = await self.crud.get(id=id)
        if record is None:
            raise CustomException(msg="__TITLE__不存在或无权访问", status_code=404)
        return record

    async def page(self, page_no: int, page_size: int, search: __RESOURCE_CLASS__QueryParam, order_by: list[dict[str, str]]) -> PageResultSchema:
        allowed_fields = {"id", "name", "order", "status", "created_time", "updated_time"}
        if not isinstance(order_by, list) or not order_by or any(
            not isinstance(item, dict) or len(item) != 1
            or any(field not in allowed_fields or not isinstance(direction, str) or direction not in {"asc", "desc"} for field, direction in item.items())
            for item in order_by
        ):
            raise CustomException(msg="排序字段或方向不合法", status_code=422)
        if not any("id" in item for item in order_by):
            order_by = [*order_by, {"id": "desc"}]
        return await self.crud.page(
            offset=(page_no - 1) * page_size, limit=page_size,
            order_by=order_by, search=vars(search), out_schema=__RESOURCE_CLASS__OutSchema,
        )

    async def create(self, data: __RESOURCE_CLASS__CreateSchema) -> __RESOURCE_CLASS__OutSchema:
        record = __MODEL_CLASS__(created_id=self.auth.user.id)
        return await self._save(record, data)

    async def update(self, id: int, data: __RESOURCE_CLASS__UpdateSchema) -> __RESOURCE_CLASS__OutSchema:
        return await self._save(await self._get(id), data)

    async def _save(self, record: __MODEL_CLASS__, data: __RESOURCE_CLASS__CreateSchema) -> __RESOURCE_CLASS__OutSchema:
        # 数据库唯一约束处理并发冲突；提交或失败回滚由请求级 db_getter 负责。
        try:
            for field, value in data.model_dump().items():
                setattr(record, field, value)
            record.updated_id = self.auth.user.id
            self.auth.db.add(record)
            await self.auth.db.flush()
            await self.auth.db.refresh(record)
        except IntegrityError as exc:
            raise CustomException(msg="该创建人的__TITLE__名称已使用（含已删除记录）", status_code=409) from exc
        return __RESOURCE_CLASS__OutSchema.model_validate(record)

    async def delete(self, ids: list[int]) -> None:
        requested_ids = set(ids)
        records = await self.crud.get_list(search={"id": ("in", list(requested_ids))})
        if len(records) != len(requested_ids):
            raise CustomException(msg="__TITLE__不存在或无权访问，未删除任何记录", status_code=404)
        await self.crud.delete(ids=list(requested_ids))
