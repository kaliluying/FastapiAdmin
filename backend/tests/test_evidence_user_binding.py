from types import SimpleNamespace

import pytest

from app.core.base_schema import AuthSchema
from app.plugin.module_ai.evidence import service as evidence_service


class FakeUploadFile:
    filename = "工资记录.txt"

    def __init__(self) -> None:
        self._chunks = [b"company owes salary", b""]

    async def read(self, _size: int) -> bytes:
        return self._chunks.pop(0)


@pytest.mark.asyncio
async def test_upload_binds_evidence_to_current_user(monkeypatch, tmp_path):
    captured: dict = {}

    class FakeFileCRUD:
        def __init__(self, _auth):
            pass

        async def create_file(self, *, session_id, user_id, file_name, file_type, file_path, file_size):
            captured["create_file"] = {
                "session_id": session_id,
                "user_id": user_id,
                "file_name": file_name,
                "file_type": file_type,
                "file_path": file_path,
                "file_size": file_size,
            }
            return SimpleNamespace(id=42)

        async def update_parse_status(self, *_args, **_kwargs):
            return SimpleNamespace(id=42)

        async def get_or_404(self, **_kwargs):
            return SimpleNamespace(
                id=42,
                user_id=7,
                file_name="工资记录.txt",
                file_type="txt",
                file_size=19,
                parse_status="unsupported",
                analysis_status="pending",
                created_time=None,
            )

    class FakeAnalysisCRUD:
        def __init__(self, _auth):
            pass

        async def create_analysis(self, **_kwargs):
            return SimpleNamespace(id=1)

        async def get_list(self, search):
            return [
                SimpleNamespace(
                    evidence_type="工资记录",
                    key_facts=[],
                    proof_purpose=[],
                    related_claims=[],
                    evidence_strength=None,
                    risks=[],
                    missing_materials=[],
                    summary="暂不支持解析",
                )
            ]

    monkeypatch.setattr(evidence_service, "STORAGE_DIR", tmp_path)
    monkeypatch.setattr(evidence_service, "EvidenceFileCRUD", FakeFileCRUD)
    monkeypatch.setattr(evidence_service, "EvidenceAnalysisCRUD", FakeAnalysisCRUD)
    monkeypatch.setattr(evidence_service, "extract_file_text", lambda _path: ("unsupported", "暂不支持解析"))

    auth = AuthSchema(user=SimpleNamespace(id=7))
    result = await evidence_service.EvidenceService(auth).upload_and_analyze(
        session_id="session-wage",
        file=FakeUploadFile(),
    )

    assert captured["create_file"]["user_id"] == 7
    assert captured["create_file"]["session_id"] == "session-wage"
    assert result["evidence_id"] == 42


@pytest.mark.asyncio
async def test_list_evidence_filters_by_current_user(monkeypatch):
    captured: dict = {}

    class FakeFileCRUD:
        def __init__(self, _auth):
            pass

        async def get_list(self, search, order_by):
            captured["search"] = search
            captured["order_by"] = order_by
            return []

    class FakeAnalysisCRUD:
        def __init__(self, _auth):
            pass

    monkeypatch.setattr(evidence_service, "EvidenceFileCRUD", FakeFileCRUD)
    monkeypatch.setattr(evidence_service, "EvidenceAnalysisCRUD", FakeAnalysisCRUD)

    auth = AuthSchema(user=SimpleNamespace(id=9))
    result = await evidence_service.EvidenceService(auth).list_evidence(session_id="session-wage")

    assert result == []
    assert captured["search"] == {"session_id": "session-wage", "user_id": 9}
