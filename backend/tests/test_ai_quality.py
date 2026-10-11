from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.base_model import MappedBase
from app.core.base_schema import AuthSchema
from app.core.database import async_db_session
from app.core.exceptions import CustomException
from app.plugin.module_ai.chat.crud import run_identifier
from app.plugin.module_ai.chat.model import ChatSessionModel
from app.plugin.module_ai.knowledge.model import KnowledgeBaseModel, KnowledgeDocumentModel
from app.plugin.module_ai.quality.model import AnswerFeedbackModel
from app.plugin.module_ai.quality.schema import AnswerFeedbackSchema, EvaluationSchema, FeedbackReviewSchema
from app.plugin.module_ai.quality.service import QualityService, score_retrieval


@pytest.fixture
async def quality_auth():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as connection:
        await connection.run_sync(MappedBase.metadata.create_all)
    async with async_sessionmaker(engine, expire_on_commit=False)() as db:
        yield AuthSchema(db=db, user=SimpleNamespace(id=1, is_superuser=True, roles=[]))
    await engine.dispose()


async def seed_answer(auth, *, owner="1", legacy=False):
    run = {"messages": [{"role": "user", "content": "真实问题"}, {"role": "assistant", "content": "真实回答"}]}
    if not legacy:
        run["run_id"] = uuid4().hex
    session = ChatSessionModel(session_id=uuid4().hex, user_id=owner, runs=[run], session_data={})
    auth.db.add(session)
    await auth.db.flush()
    return session, run


@pytest.mark.parametrize("legacy", [False, True])
async def test_feedback_uses_owned_persisted_answer_and_updates_one_vote(quality_auth, legacy):
    session, run = await seed_answer(quality_auth, legacy=legacy)
    data = AnswerFeedbackSchema(session_id=session.session_id, run_id=run_identifier(run), rating="incorrect", comment="资料有误")
    service = QualityService(quality_auth)
    saved = await service.submit_feedback(data)
    assert saved["answer"] == "真实回答"
    await service.review_feedback(saved["id"], FeedbackReviewSchema(status="resolved", resolution="核对后修正", expected_revision=saved["revision"]))
    changed = await service.submit_feedback(data.model_copy(update={"rating": "helpful", "comment": "已修正"}))
    assert changed["id"] == saved["id"]
    assert changed["status"] == "pending"
    assert changed["resolution"] == ""
    with pytest.raises(CustomException, match="反馈已被更新"):
        await service.review_feedback(saved["id"], FeedbackReviewSchema(status="resolved", resolution="过时处理", expected_revision=saved["revision"]))
    listing = await service.list_feedback(session_id=None, all_users=False, page_no=1, page_size=20, status=None)
    assert listing["total"] == 1


async def test_feedback_rejects_foreign_session_unsaved_answer_and_nonadmin_review(quality_auth):
    session, run = await seed_answer(quality_auth, owner="2")
    service = QualityService(quality_auth)
    with pytest.raises(CustomException, match="会话不存在"):
        await service.submit_feedback(AnswerFeedbackSchema(session_id=session.session_id, run_id=run_identifier(run), rating="helpful"))
    own, _ = await seed_answer(quality_auth)
    with pytest.raises(CustomException, match="回答未保存"):
        await service.submit_feedback(AnswerFeedbackSchema(session_id=own.session_id, run_id="made-up", rating="helpful"))
    ordinary = QualityService(quality_auth.model_copy(update={"user": SimpleNamespace(id=2, is_superuser=False)}))
    with pytest.raises(CustomException, match="仅超级管理员"):
        await ordinary.list_feedback(session_id=None, all_users=True, page_no=1, page_size=20, status=None)
    with pytest.raises(CustomException, match="仅超级管理员"):
        await ordinary.review_feedback(1, FeedbackReviewSchema(status="resolved", resolution="x", expected_revision=1))


def test_metrics_use_unique_relevant_documents_and_original_chunk_rank():
    assert score_retrieval([1, 2, 2], [3, 1, 1]) == {"hit_rate": 1.0, "recall": 0.5, "mrr": 0.5}
    assert score_retrieval([1], []) == {"hit_rate": 0.0, "recall": 0.0, "mrr": 0.0}


async def test_saved_feedback_hides_citations_after_access_revocation(quality_auth, monkeypatch):
    session, run = await seed_answer(quality_auth)
    saved = await QualityService(quality_auth).submit_feedback(AnswerFeedbackSchema(session_id=session.session_id, run_id=run_identifier(run), rating="helpful"))
    row = (await quality_auth.db.execute(select(AnswerFeedbackModel).where(AnswerFeedbackModel.id == saved["id"]))).scalar_one()
    row.citations = [{"knowledge_base_id": 3, "snippet": "private-source"}]
    await quality_auth.db.flush()
    monkeypatch.setattr("app.plugin.module_ai.quality.service.accessible_knowledge_base_ids", AsyncMock(side_effect=CustomException(msg="无权限")))
    ordinary = quality_auth.model_copy(update={"user": SimpleNamespace(id=1, is_superuser=False)})
    listing = await QualityService(ordinary).list_feedback(session_id=None, all_users=False, page_no=1, page_size=20, status=None)
    assert listing["items"][0]["citations"] == []
    assert row.citations[0]["snippet"] == "private-source"


def test_audit_redacts_provider_api_key_variants():
    from app.core.router_class import _redact_sensitive_values

    assert _redact_sensitive_values({"openai_api_key": "synthetic", "anthropicApiKey": "synthetic", "nested": [{"api-key": "synthetic"}], "model": "safe"}) == {
        "openai_api_key": "***",
        "anthropicApiKey": "***",
        "nested": [{"api-key": "***"}],
        "model": "safe",
    }


@pytest.mark.parametrize("cases", [[], [{"query": " ", "expected_document_ids": [1]}], [{"query": "x", "expected_document_ids": [-1]}], [{"query": "x", "expected_document_ids": []}]])
def test_evaluation_rejects_invalid_labels(cases):
    with pytest.raises(ValidationError):
        EvaluationSchema(name="test", knowledge_base_ids=[1], cases=cases)


async def test_evaluation_persists_reusable_dataset_and_comparable_metrics(quality_auth, monkeypatch):
    base = KnowledgeBaseModel(name="资料", created_id=1)
    quality_auth.db.add(base)
    await quality_auth.db.flush()
    doc = KnowledgeDocumentModel(knowledge_base_id=base.id, file_name="truth.txt", file_type="txt", created_id=1)
    quality_auth.db.add(doc)
    await quality_auth.db.flush()
    calls = []

    async def retrieve(_self, data):
        calls.append(data.query)
        return {"retrieval_mode": "bm25", "results": [{"metadata": {"document_id": doc.id}}] if data.query == "hit" else []}

    monkeypatch.setattr("app.plugin.module_ai.quality.service.KnowledgeService.query_retrieval", retrieve)
    request = EvaluationSchema(name="基线", knowledge_base_ids=[base.id], cases=[{"query": "hit", "expected_document_ids": [doc.id]}, {"query": "miss", "expected_document_ids": [doc.id]}])
    service = QualityService(quality_auth)
    first = await service.evaluate(request)
    second = await service.evaluate(request.model_copy(update={"name": "更新后"}))
    assert calls == ["hit", "miss", "hit", "miss"]
    assert first["report"]["recall"] == first["report"]["mrr"] == 0.5
    assert first["dataset_hash"] == second["dataset_hash"]
    assert first["id"] != second["id"]
    history = await service.list_evaluations(1, 20)
    assert history["total"] == 2
    assert history["items"][0]["dataset"] == first["dataset"]
    doc.knowledge_base_id = 999
    await quality_auth.db.flush()
    with pytest.raises(CustomException, match="必须属于"):
        await service.evaluate(request)


def test_feedback_http_chain_requires_auth_and_commits_real_sql(ai_client, auth_headers):
    created = ai_client.post("/ai/chat/create", headers=auth_headers, json={"title": "反馈验收"})
    assert created.status_code == 200
    session_id = created.json()["data"]["session_id"]
    run_id = uuid4().hex

    async def seed():
        async with async_db_session() as db:
            row = (await db.execute(select(ChatSessionModel).where(ChatSessionModel.session_id == session_id))).scalar_one()
            row.runs = [{"run_id": run_id, "messages": [{"role": "user", "content": "HTTP问题"}, {"role": "assistant", "content": "HTTP回答"}]}]
            await db.commit()

    ai_client.portal.call(seed)
    payload = {"session_id": session_id, "run_id": run_id, "rating": "incorrect", "comment": "需要核对"}
    assert ai_client.post("/ai/quality/feedback", json=payload).status_code == 401
    response = ai_client.post("/ai/quality/feedback", headers=auth_headers, json=payload)
    assert response.status_code == 200, response.text
    identifier = response.json()["data"]["id"]
    reviewed = ai_client.put(f"/ai/quality/feedback/{identifier}", headers=auth_headers, json={"status": "resolved", "resolution": "已核对", "expected_revision": response.json()["data"]["revision"]})
    assert reviewed.status_code == 200
    listing = ai_client.get("/ai/quality/feedback", headers=auth_headers, params={"session_id": session_id})
    assert listing.json()["data"]["items"][0]["resolution"] == "已核对"

    async def persisted():
        async with async_db_session() as db:
            row = (await db.execute(select(AnswerFeedbackModel).where(AnswerFeedbackModel.id == identifier))).scalar_one()
            assert row.answer == "HTTP回答"
            assert row.status == "resolved"

    ai_client.portal.call(persisted)
