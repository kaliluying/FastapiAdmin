"""发票管理 CRUD"""
from app.core.base_crud import CRUDBase
from app.core.base_schema import AuthSchema

from .model import InvoiceModel
from .schema import InvoiceCreateSchema, InvoiceUpdateSchema


class InvoiceCRUD(CRUDBase[InvoiceModel, InvoiceCreateSchema, InvoiceUpdateSchema]):
    """发票 CRUD —— 继承 CRUDBase 获得增删改查、软删除过滤、租户隔离、权限过滤"""

    def __init__(self, auth: AuthSchema) -> None:
        super().__init__(model=InvoiceModel, auth=auth)

    async def get_by_order_id(self, order_id: int) -> InvoiceModel | None:
        return await self.get(order_id=order_id)
