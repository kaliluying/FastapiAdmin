"""
模块接口测试 —— module_ai（AI 对话模块）

动态路由映射：module_ai → /ai
每个接口一个测试用例，覆盖会话 CRUD 与 AI 对话。
"""

from conftest import assert_route
from fastapi.testclient import TestClient


class TestAiChat:
    """AI 对话接口。"""

    def test_ai_chat_list(self, ai_client: TestClient) -> None:
        assert_route(ai_client, "GET", "/ai/chat/list")

    def test_ai_chat_detail(self, ai_client: TestClient) -> None:
        assert_route(ai_client, "GET", "/ai/chat/detail/test_session")

    def test_ai_chat_create(self, ai_client: TestClient) -> None:
        assert_route(
            ai_client,
            "POST",
            "/ai/chat/create",
            json={"title": "测试会话"},
        )

    def test_ai_chat_update(self, ai_client: TestClient) -> None:
        assert_route(
            ai_client,
            "PUT",
            "/ai/chat/update/test_session",
            json={"title": "更新会话"},
        )

    def test_ai_chat_delete(self, ai_client: TestClient) -> None:
        assert_route(ai_client, "DELETE", "/ai/chat/delete", json=["test_session"])

    def test_ai_chat_non_stream(self, ai_client: TestClient) -> None:
        assert_route(
            ai_client,
            "POST",
            "/ai/chat/ai-chat",
            json={"message": "你好", "session_id": "test_session"},
        )
