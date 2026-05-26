"""通用业务服务基类 — 减少 CRUD 样板代码。

使用方法:
    class MyService(GenericService[MyModel, MyCreateSchema, MyUpdateSchema]):
        model = MyModel
        crud_class = MyCRUD

    # 一行搞定分页查询
    result = await MyService.page(auth, page_no=1, page_size=10)
"""

from __future__ import annotations

from typing import Any, Generic, TypeVar

from app.api.v1.module_system.auth.schema import AuthSchema
from app.core.base_crud import CRUDBase
from app.core.exceptions import CustomException

ModelT = TypeVar("ModelT")
CreateSchemaT = TypeVar("CreateSchemaT")
UpdateSchemaT = TypeVar("UpdateSchemaT")


class GenericService(Generic[ModelT, CreateSchemaT, UpdateSchemaT]):
    """通用 CRUD 服务基类。

    子类须声明:
        model: ModelT         — SQLAlchemy 模型类
        crud_class: type[CRUDBase]  — 对应的 CRUD 类
    """

    model: type[ModelT]
    crud_class: type[CRUDBase[Any, Any, Any]]

    # ── 分页查询 ──

    @classmethod
    async def page(
        cls,
        auth: AuthSchema,
        *,
        page_no: int = 1,
        page_size: int = 10,
        **filters: Any,
    ) -> dict:
        crud = cls.crud_class(auth=auth)
        return await crud.page(page_no=page_no, page_size=page_size, **filters)

    # ── 详情查询 ──

    @classmethod
    async def detail(cls, auth: AuthSchema, id: int) -> dict:
        crud = cls.crud_class(auth=auth)
        obj = await crud.get_by_id(id)
        if not obj:
            raise CustomException(msg=f"{cls.model.__name__} 不存在", code=404)
        return cls._to_dict(obj)

    # ── 创建 ──

    @classmethod
    async def create(cls, auth: AuthSchema, data: CreateSchemaT) -> dict:
        crud = cls.crud_class(auth=auth)
        obj = await crud.create(data)
        await auth.db.flush()
        return cls._to_dict(obj)

    # ── 更新 ──

    @classmethod
    async def update(cls, auth: AuthSchema, id: int, data: UpdateSchemaT) -> dict:
        crud = cls.crud_class(auth=auth)
        obj = await crud.get_by_id(id)
        if not obj:
            raise CustomException(msg=f"{cls.model.__name__} 不存在", code=404)
        await crud.update(id, data)
        await auth.db.flush()
        return cls._to_dict(obj)

    # ── 删除 ──

    @classmethod
    async def delete(cls, auth: AuthSchema, ids: list[int]) -> None:
        crud = cls.crud_class(auth=auth)
        await crud.delete(ids)

    # ── 辅助 ──

    @staticmethod
    def _to_dict(obj: ModelT) -> dict:
        """将 ORM 对象转为字典。子类可重写以自定义序列化。"""
        if hasattr(obj, "model_dump"):
            return obj.model_dump()
        if hasattr(obj, "__dict__"):
            return {k: v for k, v in obj.__dict__.items() if not k.startswith("_")}
        return {}
