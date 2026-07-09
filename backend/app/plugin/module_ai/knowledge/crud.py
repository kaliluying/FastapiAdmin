from collections.abc import Sequence
from datetime import datetime

from sqlalchemy import delete, func, select

from app.core.base_crud import CRUDBase
from app.core.base_schema import AuthSchema

from .model import KnowledgeBaseModel, KnowledgeChunkModel, KnowledgeDocumentModel
from .schema import KnowledgeBaseCreateSchema, KnowledgeBaseUpdateSchema


class KnowledgeBaseCRUD(CRUDBase[KnowledgeBaseModel, KnowledgeBaseCreateSchema, KnowledgeBaseUpdateSchema]):
    def __init__(self, auth: AuthSchema) -> None:
        super().__init__(model=KnowledgeBaseModel, auth=auth)

    async def count_documents(self, knowledge_base_id: int) -> int:
        result = await self.db.execute(
            select(func.count(KnowledgeDocumentModel.id)).where(
                KnowledgeDocumentModel.knowledge_base_id == knowledge_base_id,
                KnowledgeDocumentModel.is_deleted == False,  # noqa: E712
            )
        )
        return result.scalar_one() or 0

    async def count_documents_by_index_status(self, knowledge_base_id: int) -> dict[str, int]:
        result = await self.db.execute(
            select(KnowledgeDocumentModel.index_status, func.count(KnowledgeDocumentModel.id))
            .where(
                KnowledgeDocumentModel.knowledge_base_id == knowledge_base_id,
                KnowledgeDocumentModel.is_deleted == False,  # noqa: E712
            )
            .group_by(KnowledgeDocumentModel.index_status)
        )
        return dict(result.all())

    async def count_documents_bulk(self, knowledge_base_ids: list[int]) -> dict[int, int]:
        """批量统计每个知识库的文档总数，避免分页列表逐条查询导致的 N+1。"""
        if not knowledge_base_ids:
            return {}
        result = await self.db.execute(
            select(KnowledgeDocumentModel.knowledge_base_id, func.count(KnowledgeDocumentModel.id))
            .where(
                KnowledgeDocumentModel.knowledge_base_id.in_(knowledge_base_ids),
                KnowledgeDocumentModel.is_deleted == False,  # noqa: E712
            )
            .group_by(KnowledgeDocumentModel.knowledge_base_id)
        )
        return dict(result.all())

    async def count_documents_by_index_status_bulk(
        self, knowledge_base_ids: list[int]
    ) -> dict[int, dict[str, int]]:
        """批量统计每个知识库各索引状态下的文档数，避免分页列表逐条查询导致的 N+1。"""
        if not knowledge_base_ids:
            return {}
        result = await self.db.execute(
            select(
                KnowledgeDocumentModel.knowledge_base_id,
                KnowledgeDocumentModel.index_status,
                func.count(KnowledgeDocumentModel.id),
            )
            .where(
                KnowledgeDocumentModel.knowledge_base_id.in_(knowledge_base_ids),
                KnowledgeDocumentModel.is_deleted == False,  # noqa: E712
            )
            .group_by(KnowledgeDocumentModel.knowledge_base_id, KnowledgeDocumentModel.index_status)
        )
        grouped: dict[int, dict[str, int]] = {}
        for kb_id, index_status, count in result.all():
            grouped.setdefault(kb_id, {})[index_status] = count
        return grouped


class KnowledgeDocumentCRUD(CRUDBase[KnowledgeDocumentModel, dict, dict]):
    def __init__(self, auth: AuthSchema) -> None:
        super().__init__(model=KnowledgeDocumentModel, auth=auth)

    async def create_document(
        self,
        *,
        knowledge_base_id: int,
        file_name: str,
        file_path: str | None,
        file_type: str,
        file_size: int,
    ) -> KnowledgeDocumentModel:
        return await self.create(
            {
                "knowledge_base_id": knowledge_base_id,
                "file_name": file_name,
                "file_path": file_path,
                "file_type": file_type,
                "file_size": file_size,
                "parse_status": "pending",
                "index_status": "pending",
            }
        )

    async def update_status(
        self,
        document_id: int,
        *,
        parse_status: str | None = None,
        index_status: str | None = None,
        error_message: str | None = None,
        parsed_at: datetime | None = None,
        indexed_at: datetime | None = None,
    ) -> KnowledgeDocumentModel:
        obj = await self.get_or_404(id=document_id, msg="knowledge document not found")
        if parse_status is not None:
            obj.parse_status = parse_status
        if index_status is not None:
            obj.index_status = index_status
        obj.error_message = error_message
        if parsed_at is not None:
            obj.parsed_at = parsed_at
        if indexed_at is not None:
            obj.indexed_at = indexed_at
        await self.db.flush()
        await self.db.refresh(obj)
        return obj


class KnowledgeChunkCRUD(CRUDBase[KnowledgeChunkModel, dict, dict]):
    def __init__(self, auth: AuthSchema) -> None:
        super().__init__(model=KnowledgeChunkModel, auth=auth)

    async def list_by_document(self, document_id: int) -> Sequence[KnowledgeChunkModel]:
        return await self.get_list(search={"document_id": document_id}, order_by=[{"chunk_index": "asc"}])

    async def count_by_document(self, document_id: int) -> int:
        result = await self.db.execute(
            select(func.count(KnowledgeChunkModel.id)).where(
                KnowledgeChunkModel.document_id == document_id,
                KnowledgeChunkModel.is_deleted == False,  # noqa: E712
            )
        )
        return result.scalar_one() or 0

    async def count_by_document_bulk(self, document_ids: list[int]) -> dict[int, int]:
        """批量统计每个文档的分块数，避免分页列表逐条查询导致的 N+1。"""
        if not document_ids:
            return {}
        result = await self.db.execute(
            select(KnowledgeChunkModel.document_id, func.count(KnowledgeChunkModel.id))
            .where(
                KnowledgeChunkModel.document_id.in_(document_ids),
                KnowledgeChunkModel.is_deleted == False,  # noqa: E712
            )
            .group_by(KnowledgeChunkModel.document_id)
        )
        return dict(result.all())

    async def replace_chunks(
        self,
        *,
        knowledge_base_id: int,
        document_id: int,
        chunks: list[str],
        chroma_ids: list[str],
    ) -> list[KnowledgeChunkModel]:
        await self.db.execute(delete(KnowledgeChunkModel).where(KnowledgeChunkModel.document_id == document_id))

        objs = [
            KnowledgeChunkModel(
                knowledge_base_id=knowledge_base_id,
                document_id=document_id,
                chunk_index=index,
                content=content,
                token_count=len(content),
                chroma_id=chroma_ids[index],
                **({"created_id": self.auth.user.id} if self.auth and self.auth.user else {}),
            )
            for index, content in enumerate(chunks)
        ]
        self.db.add_all(objs)
        await self.db.flush()
        return objs
