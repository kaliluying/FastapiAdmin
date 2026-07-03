from __future__ import annotations

from typing import Any

from sqlalchemy import select

from app.core.base_schema import AuthSchema

from .model import ArbitrationCaseModel, ArbitrationDraftModel


class ArbitrationCaseCRUD:
    def __init__(self, auth: AuthSchema) -> None:
        self.auth = auth
        self.db = auth.db

    async def create_case(self, data: dict[str, Any]) -> ArbitrationCaseModel:
        obj = ArbitrationCaseModel(**data)
        self._fill_common(obj)
        self.db.add(obj)
        await self.db.flush()
        await self.db.refresh(obj)
        return obj

    async def update_case(self, case_id: int, data: dict[str, Any]) -> ArbitrationCaseModel | None:
        obj = await self.get_case(case_id)
        if not obj:
            return None
        for key, value in data.items():
            if hasattr(obj, key):
                setattr(obj, key, value)
        user = getattr(self.auth, "user", None)
        if user and hasattr(obj, "updated_id"):
            obj.updated_id = getattr(user, "id", None)
        await self.db.flush()
        await self.db.refresh(obj)
        return obj

    async def get_case(self, case_id: int) -> ArbitrationCaseModel | None:
        result = await self.db.execute(
            select(ArbitrationCaseModel).where(
                ArbitrationCaseModel.id == case_id,
                ArbitrationCaseModel.is_deleted == False,  # noqa: E712
            )
        )
        return result.scalars().first()

    async def list_cases(self) -> list[ArbitrationCaseModel]:
        result = await self.db.execute(
            select(ArbitrationCaseModel)
            .where(ArbitrationCaseModel.is_deleted == False)  # noqa: E712
            .order_by(ArbitrationCaseModel.updated_time.desc())
        )
        return list(result.scalars().all())

    def _fill_common(self, obj: Any) -> None:
        user = getattr(self.auth, "user", None)
        if user:
            if hasattr(obj, "tenant_id"):
                obj.tenant_id = getattr(self.auth, "tenant_id", None) or getattr(user, "tenant_id", None) or 1
            if hasattr(obj, "created_id"):
                obj.created_id = getattr(user, "id", None)
            if hasattr(obj, "updated_id"):
                obj.updated_id = getattr(user, "id", None)


class ArbitrationDraftCRUD:
    def __init__(self, auth: AuthSchema) -> None:
        self.auth = auth
        self.db = auth.db

    async def create_draft(self, data: dict[str, Any]) -> ArbitrationDraftModel:
        obj = ArbitrationDraftModel(**data)
        user = getattr(self.auth, "user", None)
        if user:
            obj.tenant_id = getattr(self.auth, "tenant_id", None) or getattr(user, "tenant_id", None) or 1
            obj.created_id = getattr(user, "id", None)
            obj.updated_id = getattr(user, "id", None)
        self.db.add(obj)
        await self.db.flush()
        await self.db.refresh(obj)
        return obj

    async def get_draft(self, draft_id: int) -> ArbitrationDraftModel | None:
        result = await self.db.execute(
            select(ArbitrationDraftModel).where(
                ArbitrationDraftModel.id == draft_id,
                ArbitrationDraftModel.is_deleted == False,  # noqa: E712
            )
        )
        return result.scalars().first()

    async def list_drafts(self, *, case_id: int | None = None) -> list[ArbitrationDraftModel]:
        stmt = select(ArbitrationDraftModel).where(ArbitrationDraftModel.is_deleted == False)  # noqa: E712
        if case_id:
            stmt = stmt.where(ArbitrationDraftModel.case_id == case_id)
        stmt = stmt.order_by(ArbitrationDraftModel.created_time.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
