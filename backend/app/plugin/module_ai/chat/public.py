"""供反馈等调用方读取当前用户已保存的回答，不暴露会话存储实现。"""

from typing import Any

from app.core.base_schema import AuthSchema
from app.core.exceptions import CustomException

from .crud import ChatSessionCRUD, run_identifier


async def get_saved_answer(auth: AuthSchema, *, session_id: str, run_id: str) -> dict[str, Any]:
    session = await ChatSessionCRUD(auth).get_by_id_crud(session_id)
    if not session:
        raise CustomException(msg="会话不存在或无权访问", status_code=404)
    run = next((run for run in session.runs if isinstance(run, dict) and run_identifier(run) == run_id), None)
    if not run:
        raise CustomException(msg="回答未保存或已不在当前会话历史中", status_code=404)
    messages = run.get("messages", [])
    answer = next((message for message in messages if message.get("role") == "assistant"), None)
    question = next((message for message in messages if message.get("role") == "user"), {})
    if not answer:
        raise CustomException(msg="该记录没有可评价的回答", status_code=422)
    return {"question": question.get("content", ""), "answer": answer.get("content", ""), "citations": answer.get("citations", [])}
