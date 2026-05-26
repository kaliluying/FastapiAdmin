from app.api.v1.module_system.auth.schema import AuthSchema
from app.core.exceptions import CustomException

from .crud import TicketCRUD
from .schema import (
    TicketBatchSchema,
    TicketCreateSchema,
    TicketOutSchema,
    TicketQueryParam,
    TicketUpdateSchema,
)


class TicketService:
    """工单管理服务层"""

    @classmethod
    async def page_service(
        cls, auth: AuthSchema, page_no: int, page_size: int,
        search: TicketQueryParam | None = None, order_by: list | None = None,
    ) -> dict:
        return await TicketCRUD(auth).page_crud(
            offset=(page_no - 1) * page_size, limit=page_size,
            order_by=order_by or [{"created_time": "desc"}],
            search=search.__dict__ if search else {},
            out_schema=TicketOutSchema,
        )

    @classmethod
    async def detail_service(cls, auth: AuthSchema, id: int) -> dict:
        obj = await TicketCRUD(auth).get_by_id_crud(id=id)
        if not obj:
            raise CustomException(msg="工单不存在")
        return TicketOutSchema.model_validate(obj).model_dump()

    @classmethod
    async def create_service(cls, auth: AuthSchema, data: TicketCreateSchema) -> dict:
        obj = await TicketCRUD(auth).create_crud(data=data)
        if not obj:
            raise CustomException(msg="创建工单失败")
        return TicketOutSchema.model_validate(obj).model_dump()

    @classmethod
    async def update_service(cls, auth: AuthSchema, id: int, data: TicketUpdateSchema) -> dict:
        obj = await TicketCRUD(auth).get_by_id_crud(id=id)
        if not obj:
            raise CustomException(msg="工单不存在")
        updated = await TicketCRUD(auth).update_crud(id=id, data=data)
        if not updated:
            raise CustomException(msg="更新失败")
        return TicketOutSchema.model_validate(updated).model_dump()

    @classmethod
    async def delete_service(cls, auth: AuthSchema, ids: list[int]) -> None:
        if not ids:
            raise CustomException(msg="删除对象不能为空")
        await TicketCRUD(auth).delete_crud(ids=ids)

    @classmethod
    async def batch_service(cls, auth: AuthSchema, data: TicketBatchSchema) -> None:
        """批量更新工单状态"""
        if not data.ids:
            raise CustomException(msg="请选择要操作的工单")
        await TicketCRUD(auth).set_crud(ids=data.ids, status=data.status)
