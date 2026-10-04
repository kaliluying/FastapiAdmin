from sqlalchemy.exc import IntegrityError

from app.core.base_crud import CRUDBase
from app.core.base_schema import AuthSchema, PageResultSchema
from app.core.exceptions import CustomException

from .model import CategoryModel
from .schema import CategoryCreateSchema, CategoryOutSchema, CategoryQueryParam, CategoryUpdateSchema


class CategoryService:
    """分类用例：共享数据权限、保存一致性、冲突转换和批量删除校验。"""

    def __init__(self, auth: AuthSchema) -> None:
        self.auth = auth
        self.crud = CRUDBase[CategoryModel, CategoryCreateSchema, CategoryUpdateSchema](model=CategoryModel, auth=auth)

    async def detail(self, id: int) -> CategoryOutSchema:
        return CategoryOutSchema.model_validate(await self._get(id))

    async def _get(self, id: int) -> CategoryModel:
        category = await self.crud.get(id=id)
        if category is None:
            raise CustomException(msg="分类不存在或无权访问", status_code=404)
        return category

    async def page(self, page_no: int, page_size: int, search: CategoryQueryParam, order_by: list[dict[str, str]]) -> PageResultSchema:
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
            order_by=order_by, search=vars(search), out_schema=CategoryOutSchema,
        )

    async def create(self, data: CategoryCreateSchema) -> CategoryOutSchema:
        category = CategoryModel(created_id=self.auth.user.id)
        return await self._save(category, data)

    async def update(self, id: int, data: CategoryUpdateSchema) -> CategoryOutSchema:
        return await self._save(await self._get(id), data)

    async def _save(self, category: CategoryModel, data: CategoryCreateSchema) -> CategoryOutSchema:
        # 数据库唯一约束处理并发冲突；提交或失败回滚由请求级 db_getter 负责。
        try:
            for field, value in data.model_dump().items():
                setattr(category, field, value)
            category.updated_id = self.auth.user.id
            self.auth.db.add(category)
            await self.auth.db.flush()
            await self.auth.db.refresh(category)
        except IntegrityError as exc:
            raise CustomException(msg="该创建人的分类名称已使用（含已删除记录）", status_code=409) from exc
        return CategoryOutSchema.model_validate(category)

    async def delete(self, ids: list[int]) -> None:
        requested_ids = set(ids)
        categories = await self.crud.get_list(search={"id": ("in", list(requested_ids))})
        if len(categories) != len(requested_ids):
            raise CustomException(msg="分类不存在或无权访问，未删除任何记录", status_code=404)
        await self.crud.delete(ids=list(requested_ids))
