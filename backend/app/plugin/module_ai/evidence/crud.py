from __future__ import annotations

from app.core.base_crud import CRUDBase
from app.core.base_schema import AuthSchema

from .model import EvidenceAnalysisModel, EvidenceFileModel


class EvidenceFileCRUD(CRUDBase[EvidenceFileModel, dict, dict]):
    def __init__(self, auth: AuthSchema) -> None:
        super().__init__(model=EvidenceFileModel, auth=auth)

    async def create_file(
        self,
        *,
        session_id: str,
        user_id: int,
        file_name: str,
        file_type: str,
        file_path: str | None,
        file_size: int,
    ) -> EvidenceFileModel:
        return await self.create(
            {
                "session_id": session_id,
                "user_id": user_id,
                "file_name": file_name,
                "file_type": file_type,
                "file_path": file_path,
                "file_size": file_size,
                "parse_status": "pending",
                "analysis_status": "pending",
            }
        )

    async def update_parse_status(
        self,
        file_id: int,
        *,
        parse_status: str,
        parsed_content: str | None = None,
    ) -> EvidenceFileModel:
        obj = await self.get_or_404(id=file_id, msg="evidence file not found")
        obj.parse_status = parse_status
        if parsed_content is not None:
            obj.parsed_content = parsed_content[:10000]  # Truncate for storage
        await self.db.flush()
        await self.db.refresh(obj)
        return obj

    async def update_analysis_status(
        self,
        file_id: int,
        *,
        analysis_status: str,
    ) -> EvidenceFileModel:
        obj = await self.get_or_404(id=file_id, msg="evidence file not found")
        obj.analysis_status = analysis_status
        await self.db.flush()
        await self.db.refresh(obj)
        return obj


class EvidenceAnalysisCRUD(CRUDBase[EvidenceAnalysisModel, dict, dict]):
    def __init__(self, auth: AuthSchema) -> None:
        super().__init__(model=EvidenceAnalysisModel, auth=auth)

    async def create_analysis(
        self,
        *,
        evidence_file_id: int,
        evidence_type: str | None,
        key_facts: list[str] | None,
        proof_purpose: list[str] | None,
        related_claims: list[str] | None,
        evidence_strength: str | None,
        risks: list[str] | None,
        missing_materials: list[str] | None,
        summary: str | None,
        raw_result: str | None,
        model_name: str | None,
    ) -> EvidenceAnalysisModel:
        return await self.create(
            {
                "evidence_file_id": evidence_file_id,
                "evidence_type": evidence_type,
                "key_facts": key_facts,
                "proof_purpose": proof_purpose,
                "related_claims": related_claims,
                "evidence_strength": evidence_strength,
                "risks": risks,
                "missing_materials": missing_materials,
                "summary": summary,
                "raw_result": raw_result,
                "model_name": model_name,
            }
        )

    async def get_analyzed_by_session(self, *, session_id: str) -> list[dict]:
        """返回指定会话中已完成分析的全部证据结果，含文件名。

        供 rag.py 在构建聊天提示词时调用，将证据分析结果注入上下文。
        """
        from sqlalchemy import select

        stmt = (
            select(EvidenceAnalysisModel, EvidenceFileModel)
            .join(EvidenceFileModel, EvidenceAnalysisModel.evidence_file_id == EvidenceFileModel.id)
            .where(
                EvidenceFileModel.session_id == session_id,
                EvidenceFileModel.analysis_status == "analyzed",
            )
        )
        result = await self.db.execute(stmt)
        rows = result.all()
        return [
            {
                "file_name": file.file_name,
                "evidence_type": analysis.evidence_type,
                "key_facts": analysis.key_facts,
                "proof_purpose": analysis.proof_purpose,
                "related_claims": analysis.related_claims,
                "evidence_strength": analysis.evidence_strength,
                "risks": analysis.risks,
                "missing_materials": analysis.missing_materials,
                "summary": analysis.summary,
            }
            for analysis, file in rows
        ]
