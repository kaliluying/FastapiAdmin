import hashlib
import json
from datetime import datetime
from typing import Any

from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError

from app.core.base_schema import AuthSchema
from app.core.exceptions import CustomException
from app.plugin.module_ai.chat.crud import ChatSessionCRUD, run_identifier
from app.plugin.module_ai.knowledge.crud import KnowledgeDocumentCRUD
from app.plugin.module_ai.knowledge.public import accessible_knowledge_base_ids
from app.plugin.module_ai.knowledge.schema import RetrievalTestSchema
from app.plugin.module_ai.knowledge.service import KnowledgeService

from .model import AnswerFeedbackModel, RetrievalEvaluationModel
from .schema import AnswerFeedbackSchema, EvaluationSchema, FeedbackReviewSchema


def score_retrieval(expected: list[int], retrieved: list[int]) -> dict[str, float]:
    expected_ids = set(expected)
    matched = expected_ids.intersection(retrieved)
    first_rank = next((rank for rank, identifier in enumerate(retrieved, 1) if identifier in expected_ids), None)
    return {"hit_rate": float(bool(matched)), "recall": len(matched) / len(expected_ids), "mrr": 1 / first_rank if first_rank else 0.0}


class QualityService:
    def __init__(self, auth: AuthSchema):
        self.auth = auth
        self.db = auth.db
        self.user_id = auth.user.id

    def require_admin(self) -> None:
        if getattr(self.auth.user, "is_superuser", False) is not True:
            raise CustomException(msg="仅超级管理员可处理回答反馈", status_code=403)

    @staticmethod
    def feedback_output(row: AnswerFeedbackModel) -> dict[str, Any]:
        return {
            key: getattr(row, key)
            for key in (
                "id",
                "user_id",
                "session_id",
                "run_id",
                "revision",
                "rating",
                "comment",
                "question",
                "answer",
                "citations",
                "status",
                "resolution",
                "reviewed_by",
                "created_time",
                "updated_time",
            )
        }

    async def submit_feedback(self, data: AnswerFeedbackSchema) -> dict[str, Any]:
        session = await ChatSessionCRUD(self.auth).get_by_id_crud(data.session_id)
        if not session:
            raise CustomException(msg="会话不存在或无权访问", status_code=404)
        run = next((run for run in session.runs if isinstance(run, dict) and run_identifier(run) == data.run_id), None)
        if not run:
            raise CustomException(msg="回答未保存或已不在当前会话历史中", status_code=404)
        messages = run.get("messages", [])
        answer = next((message for message in messages if message.get("role") == "assistant"), None)
        question = next((message for message in messages if message.get("role") == "user"), {})
        if not answer:
            raise CustomException(msg="该记录没有可评价的回答", status_code=422)
        citations = answer.get("citations", [])
        base_ids = [item["knowledge_base_id"] for item in citations if item.get("knowledge_base_id")]
        if base_ids:
            await accessible_knowledge_base_ids(self.auth, base_ids)
        statement = select(AnswerFeedbackModel).where(AnswerFeedbackModel.user_id == self.user_id, AnswerFeedbackModel.session_id == data.session_id, AnswerFeedbackModel.run_id == data.run_id)
        row = (await self.db.execute(statement)).scalar_one_or_none()
        if row is None:
            row = AnswerFeedbackModel(
                user_id=self.user_id,
                session_id=data.session_id,
                run_id=data.run_id,
                question=question.get("content", ""),
                answer=answer.get("content", ""),
                citations=citations,
                rating=data.rating,
                comment=data.comment,
            )
            # 同一回答的并发投票只更新一行，避免产生重复记录。
            try:
                async with self.db.begin_nested():
                    self.db.add(row)
                    await self.db.flush()
            except IntegrityError:
                row = (await self.db.execute(statement.with_for_update())).scalar_one()
        await self.db.execute(
            update(AnswerFeedbackModel)
            .where(AnswerFeedbackModel.id == row.id)
            .values(rating=data.rating, comment=data.comment, status="pending", resolution="", reviewed_by=None, revision=AnswerFeedbackModel.revision + 1, updated_time=datetime.now())
        )
        await self.db.refresh(row)
        return self.feedback_output(row)

    async def list_feedback(self, *, session_id: str | None, all_users: bool, page_no: int, page_size: int, status: str | None) -> dict[str, Any]:
        if all_users:
            self.require_admin()
        statement = select(AnswerFeedbackModel).where(AnswerFeedbackModel.is_deleted == False)
        if not all_users:
            statement = statement.where(AnswerFeedbackModel.user_id == self.user_id)
        if session_id:
            statement = statement.where(AnswerFeedbackModel.session_id == session_id)
        if status:
            statement = statement.where(AnswerFeedbackModel.status == status)
        total = (await self.db.execute(select(func.count()).select_from(statement.subquery()))).scalar_one()
        rows = (await self.db.execute(statement.order_by(AnswerFeedbackModel.updated_time.desc()).offset((page_no - 1) * page_size).limit(page_size))).scalars().all()
        items = []
        for row in rows:
            item = self.feedback_output(row)
            if not getattr(self.auth.user, "is_superuser", False):
                base_ids = [citation["knowledge_base_id"] for citation in item["citations"] if citation.get("knowledge_base_id")]
                try:
                    await accessible_knowledge_base_ids(self.auth, base_ids)
                except CustomException:
                    item["citations"] = []
            items.append(item)
        return {"items": items, "total": total}

    async def review_feedback(self, identifier: int, data: FeedbackReviewSchema) -> dict[str, Any]:
        self.require_admin()
        if data.status == "resolved" and not data.resolution:
            raise CustomException(msg="请填写处理说明", status_code=422)
        row = (await self.db.execute(select(AnswerFeedbackModel).where(AnswerFeedbackModel.id == identifier, AnswerFeedbackModel.is_deleted == False))).scalar_one_or_none()
        if row is None:
            raise CustomException(msg="反馈不存在", status_code=404)
        changed = await self.db.execute(
            update(AnswerFeedbackModel)
            .where(AnswerFeedbackModel.id == identifier, AnswerFeedbackModel.revision == data.expected_revision)
            .values(status=data.status, resolution=data.resolution, reviewed_by=self.user_id, revision=AnswerFeedbackModel.revision + 1, updated_time=datetime.now())
        )
        if changed.rowcount != 1:
            raise CustomException(msg="反馈已被更新，请刷新后重新核对", status_code=409)
        await self.db.refresh(row)
        return self.feedback_output(row)

    @staticmethod
    def evaluation_output(row: RetrievalEvaluationModel) -> dict[str, Any]:
        return {key: getattr(row, key) for key in ("id", "name", "dataset_hash", "knowledge_base_ids", "top_k", "retrieval_mode", "dataset", "report", "created_time")}

    async def evaluate(self, data: EvaluationSchema) -> dict[str, Any]:
        base_ids = await accessible_knowledge_base_ids(self.auth, data.knowledge_base_ids)
        documents = KnowledgeDocumentCRUD(self.auth)
        for identifier in {identifier for case in data.cases for identifier in case.expected_document_ids}:
            document = await documents.get_or_404(id=identifier, msg="标注文档不存在或无权访问")
            if document.knowledge_base_id not in base_ids:
                raise CustomException(msg="标注文档必须属于所选知识库", status_code=422)
        dataset = [{"query": case.query, "expected_document_ids": sorted(set(case.expected_document_ids))} for case in data.cases]
        digest = hashlib.sha256(json.dumps({"cases": dataset, "knowledge_base_ids": sorted(base_ids), "top_k": data.top_k}, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
        cases = []
        mode = ""
        for case in dataset:
            result = await KnowledgeService(self.auth).query_retrieval(RetrievalTestSchema(query=case["query"], knowledge_base_ids=base_ids, top_k=data.top_k))
            mode = result["retrieval_mode"]
            retrieved = [int(hit["metadata"]["document_id"]) for hit in result["results"] if hit.get("metadata", {}).get("document_id")]
            cases.append({**case, "retrieved_document_ids": retrieved, **score_retrieval(case["expected_document_ids"], retrieved)})
        report = {"case_count": len(cases), **{key: sum(case[key] for case in cases) / len(cases) for key in ("hit_rate", "recall", "mrr")}, "cases": cases}
        row = RetrievalEvaluationModel(user_id=self.user_id, name=data.name, dataset_hash=digest, knowledge_base_ids=base_ids, top_k=data.top_k, retrieval_mode=mode, dataset=dataset, report=report)
        self.db.add(row)
        await self.db.flush()
        return self.evaluation_output(row)

    async def list_evaluations(self, page_no: int, page_size: int) -> dict[str, Any]:
        statement = select(RetrievalEvaluationModel).where(RetrievalEvaluationModel.user_id == self.user_id, RetrievalEvaluationModel.is_deleted == False)
        total = (await self.db.execute(select(func.count()).select_from(statement.subquery()))).scalar_one()
        rows = (
            (await self.db.execute(statement.order_by(RetrievalEvaluationModel.created_time.desc(), RetrievalEvaluationModel.id.desc()).offset((page_no - 1) * page_size).limit(page_size)))
            .scalars()
            .all()
        )
        # 返回已保存的查询和证据数据前，重新检查当前授权。
        visible = []
        for row in rows:
            try:
                await accessible_knowledge_base_ids(self.auth, row.knowledge_base_ids)
            except CustomException:
                continue
            visible.append(self.evaluation_output(row))
        return {"items": visible, "total": total}
