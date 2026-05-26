from typing import Any

from app.api.v1.module_system.auth.schema import AuthSchema
from app.core.base_crud import CRUDBase

from .model import TicketModel
from .schema import TicketCreateSchema, TicketUpdateSchema


class TicketCRUD(CRUDBase[TicketModel, TicketCreateSchema, TicketUpdateSchema]):
    """工单 CRUD"""

    def __init__(self, auth: AuthSchema) -> None:
        self.auth = auth
        super().__init__(model=TicketModel, auth=auth)

    async def page_crud(
        self,
        offset: int,
        limit: int,
        order_by: list[dict[str, str]] | None,
        search: dict | None = None,
        out_schema: type | None = None,
        preload: list[str | Any] | None = None,
    ) -> dict:
        from .schema import TicketOutSchema

        return await self.page(
            offset=offset,
            limit=limit,
            order_by=order_by or [{"id": "asc"}],
            search=search or {},
            out_schema=out_schema or TicketOutSchema,
            preload=preload,
        )

    async def get_by_id_crud(self, id: int) -> TicketModel | None:
        return await self.get(id=id)

    async def create_crud(self, data: TicketCreateSchema) -> TicketModel | None:
        return await self.create(data=data)

    async def update_crud(self, id: int, data: TicketUpdateSchema) -> TicketModel | None:
        return await self.update(id=id, data=data)

    async def delete_crud(self, ids: list[int]) -> None:
        await self.delete(ids=ids)

    async def set_crud(self, ids: list[int], **kwargs) -> None:
        """批量设置工单状态"""
        await self.set(ids=ids, **kwargs)
