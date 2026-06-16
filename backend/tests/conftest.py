"""全局 pytest fixtures — test_client、test_db 等共享夹具。"""

import sys
from pathlib import Path

# 确保 backend 根目录在 Python 路径中
sys.path.insert(0, str(Path(__file__).parent.parent))

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def test_client() -> TestClient:
    """创建 TestClient 用于 API 测试。"""
    from main import create_app

    app = create_app()
    with TestClient(app) as client:
        yield client
