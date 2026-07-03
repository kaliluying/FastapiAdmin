"""Evidence analysis service.

Coordinates file upload, text extraction, AI analysis, and result persistence.
"""

from __future__ import annotations

import json
import uuid
from pathlib import Path

import aiofiles
from fastapi import UploadFile

from app.config.setting import settings
from app.core.base_schema import AuthSchema
from app.core.exceptions import CustomException
from app.core.logger import logger
from app.plugin.module_ai.chat.rag import LangChainChatModel

from .crud import EvidenceAnalysisCRUD, EvidenceFileCRUD
from .extractors import extract_text as extract_file_text
from .prompts import build_analysis_prompt
from .schema import EvidenceAnalysisOutSchema, EvidenceListOutSchema

STORAGE_DIR = Path("storage") / "evidence"

# Allowed extensions for evidence upload
EVIDENCE_ALLOWED_EXTENSIONS = {
    ".docx", ".xlsx", ".pdf", ".txt", ".csv", ".png", ".jpg", ".jpeg",
}

# Evidence type hints based on file name keywords
EVIDENCE_TYPE_HINTS = [
    ("劳动合同", ["劳动合同", "合同", "contract", "聘用"]),
    ("工资记录", ["工资", "工资条", "工资流水", "银行流水", "salary", "wage", "payroll"]),
    ("考勤记录", ["考勤", "打卡", "出勤", "attendance"]),
    ("聊天记录", ["聊天", "微信", "沟通", "chat", "message"]),
    ("解除通知", ["解除", "辞退", "开除", "解雇", "termination", "dismissal"]),
    ("公司主体信息", ["营业执照", "信用代码", "工商", "企业信息", "subject"]),
]


def _guess_evidence_type(filename: str) -> str:
    """Heuristically guess evidence type from filename."""
    lower = filename.lower()
    for evidence_type, keywords in EVIDENCE_TYPE_HINTS:
        for kw in keywords:
            if kw.lower() in lower:
                return evidence_type
    return "其他材料"


def _parse_ai_response(raw: str) -> dict:
    """Parse AI response into structured dict, with sanitization."""
    text = raw.strip()
    # Remove markdown code fences if present
    if text.startswith("```"):
        lines = text.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines)

    # Find the first { and last }
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        text = text[start : end + 1]

    try:
        result = json.loads(text)
    except json.JSONDecodeError:
        logger.warning(f"AI response not valid JSON, raw: {raw[:500]}")
        return {}

    # Sanitize: ensure all expected fields exist
    sanitized = {
        "evidence_type": str(result.get("evidence_type", ""))[:64],
        "key_facts": result.get("key_facts") if isinstance(result.get("key_facts"), list) else [],
        "proof_purpose": result.get("proof_purpose") if isinstance(result.get("proof_purpose"), list) else [],
        "related_claims": result.get("related_claims") if isinstance(result.get("related_claims"), list) else [],
        "evidence_strength": str(result.get("evidence_strength", ""))[:16],
        "risks": result.get("risks") if isinstance(result.get("risks"), list) else [],
        "missing_materials": result.get("missing_materials") if isinstance(result.get("missing_materials"), list) else [],
        "summary": str(result.get("summary", ""))[:500],
    }

    # Ensure lists contain only strings
    for list_key in ("key_facts", "proof_purpose", "related_claims", "risks", "missing_materials"):
        sanitized[list_key] = [str(item)[:200] for item in sanitized[list_key] if item]

    # Validate evidence_strength
    if sanitized["evidence_strength"] not in {"强", "中", "弱"}:
        sanitized["evidence_strength"] = "中"

    return sanitized


class EvidenceService:
    def __init__(self, auth: AuthSchema) -> None:
        self.auth = auth
        self._chat_model: LangChainChatModel | None = None

    @property
    def current_user_id(self) -> int:
        user_id = getattr(self.auth.user, "id", None)
        if not user_id:
            raise CustomException(msg="当前用户信息异常，请重新登录", code=10401, status_code=401)
        return int(user_id)

    def _get_chat_model(self) -> LangChainChatModel:
        if self._chat_model is None:
            self._chat_model = LangChainChatModel()
        return self._chat_model

    async def upload_and_analyze(
        self,
        *,
        session_id: str,
        file: UploadFile,
        evidence_type: str | None = None,
    ) -> dict:
        """Upload an evidence file, parse it, and run AI analysis."""
        if not file.filename:
            raise CustomException(msg="请选择要上传的文件")

        # Validate extension
        suffix = Path(file.filename).suffix.lower()
        if suffix not in EVIDENCE_ALLOWED_EXTENSIONS:
            raise CustomException(
                msg=f"不支持的文件类型: {suffix}，支持: {', '.join(sorted(EVIDENCE_ALLOWED_EXTENSIONS))}"
            )

        file_crud = EvidenceFileCRUD(self.auth)
        analysis_crud = EvidenceAnalysisCRUD(self.auth)

        # Save file
        STORAGE_DIR.mkdir(parents=True, exist_ok=True)
        saved_name = f"{uuid.uuid4().hex}{suffix}"
        saved_path = STORAGE_DIR / saved_name

        file_size = 0
        async with aiofiles.open(saved_path, "wb") as target:
            while chunk := await file.read(1024 * 1024):
                file_size += len(chunk)
                await target.write(chunk)

        # Create DB record
        file_obj = await file_crud.create_file(
            session_id=session_id,
            user_id=self.current_user_id,
            file_name=file.filename,
            file_type=suffix.lstrip("."),
            file_path=str(saved_path),
            file_size=file_size,
        )

        # Parse file content
        await file_crud.update_parse_status(file_obj.id, parse_status="parsing")
        parse_status, parsed_content = extract_file_text(str(saved_path))

        if parse_status == "parsed":
            await file_crud.update_parse_status(
                file_obj.id,
                parse_status="parsed",
                parsed_content=parsed_content,
            )
        else:
            await file_crud.update_parse_status(
                file_obj.id,
                parse_status=parse_status,
                parsed_content=parsed_content if parsed_content else None,
            )

        # Determine evidence type
        resolved_type = evidence_type or _guess_evidence_type(file.filename)

        # Run AI analysis if content was parsed
        if parse_status == "parsed" and parsed_content:
            await file_crud.update_analysis_status(file_obj.id, analysis_status="analyzing")

            try:
                # Check if AI config is available
                if not settings.OPENAI_API_KEY or not settings.OPENAI_MODEL:
                    raise CustomException(
                        msg="AI 模型未配置（OPENAI_API_KEY 或 OPENAI_MODEL 为空），请检查 .env.dev 配置"
                    )

                prompt = build_analysis_prompt(
                    evidence_type=resolved_type,
                    content=parsed_content,
                )
                chat = self._get_chat_model()
                raw_result = await chat.complete(prompt)
                analysis_data = _parse_ai_response(raw_result)

                await analysis_crud.create_analysis(
                    evidence_file_id=file_obj.id,
                    evidence_type=analysis_data.get("evidence_type") or resolved_type,
                    key_facts=analysis_data.get("key_facts"),
                    proof_purpose=analysis_data.get("proof_purpose"),
                    related_claims=analysis_data.get("related_claims"),
                    evidence_strength=analysis_data.get("evidence_strength"),
                    risks=analysis_data.get("risks"),
                    missing_materials=analysis_data.get("missing_materials"),
                    summary=analysis_data.get("summary"),
                    raw_result=raw_result,
                    model_name=settings.OPENAI_MODEL,
                )
                await file_crud.update_analysis_status(file_obj.id, analysis_status="analyzed")
            except CustomException:
                await file_crud.update_analysis_status(file_obj.id, analysis_status="failed")
                raise
            except Exception as exc:
                logger.error(f"AI analysis failed: {exc}")
                await file_crud.update_analysis_status(file_obj.id, analysis_status="failed")
                raise CustomException(msg=f"AI 分析失败: {exc}")
        else:
            # No parsed content: create empty analysis placeholder
            try:
                await analysis_crud.create_analysis(
                    evidence_file_id=file_obj.id,
                    evidence_type=resolved_type,
                    key_facts=[],
                    proof_purpose=[],
                    related_claims=[],
                    evidence_strength=None,
                    risks=[],
                    missing_materials=[],
                    summary=parsed_content if parse_status == "unsupported" else "文件解析失败，无法进行 AI 分析",
                    raw_result=None,
                    model_name=None,
                )
            except Exception:
                pass

        # Return combined result
        return await self._build_analysis_out(file_obj.id, file_crud, analysis_crud)

    async def list_evidence(self, *, session_id: str) -> list[dict]:
        """List all evidence files and their analysis for a session."""
        file_crud = EvidenceFileCRUD(self.auth)
        files = await file_crud.get_list(
            search={"session_id": session_id, "user_id": self.current_user_id},
            order_by=[{"id": "desc"}],
        )

        analysis_crud = EvidenceAnalysisCRUD(self.auth)
        result: list[dict] = []
        for f in files:
            analysis_list = await analysis_crud.get_list(
                search={"evidence_file_id": f.id},
            )
            analysis = analysis_list[0] if analysis_list else None
            result.append(
                EvidenceListOutSchema(
                    evidence_id=f.id,
                    user_id=f.user_id,
                    file_name=f.file_name,
                    file_type=f.file_type,
                    file_size=f.file_size,
                    parse_status=f.parse_status,
                    analysis_status=f.analysis_status,
                    evidence_type=analysis.evidence_type if analysis else None,
                    summary=analysis.summary if analysis else None,
                    created_at=f.created_time,
                ).model_dump()
            )
        return result

    async def get_evidence_detail(self, evidence_id: int) -> dict:
        """Get detailed analysis result for a single evidence file."""
        file_crud = EvidenceFileCRUD(self.auth)
        analysis_crud = EvidenceAnalysisCRUD(self.auth)
        return await self._build_analysis_out(evidence_id, file_crud, analysis_crud)

    async def _build_analysis_out(
        self,
        evidence_id: int,
        file_crud: EvidenceFileCRUD,
        analysis_crud: EvidenceAnalysisCRUD,
    ) -> dict:
        file_obj = await file_crud.get_or_404(
            id=evidence_id,
            user_id=self.current_user_id,
            msg="evidence file not found",
        )
        analysis_list = await analysis_crud.get_list(
            search={"evidence_file_id": evidence_id},
        )
        analysis = analysis_list[0] if analysis_list else None

        return EvidenceAnalysisOutSchema(
            evidence_id=file_obj.id,
            user_id=file_obj.user_id,
            file_name=file_obj.file_name,
            file_type=file_obj.file_type,
            file_size=file_obj.file_size,
            parse_status=file_obj.parse_status,
            analysis_status=file_obj.analysis_status,
            evidence_type=analysis.evidence_type if analysis else None,
            key_facts=list(analysis.key_facts) if analysis and analysis.key_facts else None,
            proof_purpose=list(analysis.proof_purpose) if analysis and analysis.proof_purpose else None,
            related_claims=list(analysis.related_claims) if analysis and analysis.related_claims else None,
            evidence_strength=analysis.evidence_strength if analysis else None,
            risks=list(analysis.risks) if analysis and analysis.risks else None,
            missing_materials=list(analysis.missing_materials) if analysis and analysis.missing_materials else None,
            summary=analysis.summary if analysis else None,
            created_at=file_obj.created_time,
        ).model_dump()
