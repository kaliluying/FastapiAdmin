"""全局 pytest fixtures — test_client、test_db 等共享夹具。"""

import sys
from pathlib import Path

# 确保 backend 根目录在 Python 路径中
sys.path.insert(0, str(Path(__file__).parent.parent))

import pytest
from fastapi.testclient import TestClient


@pytest.fixture(scope="session")
def test_client() -> TestClient:
    """创建 TestClient 用于 API 测试。

    scope=session 确保只创建一次 app，避免 prometheus registry 冲突。
    """
    # 清除 prometheus 注册表（避免 Duplicated timeseries）
    try:
        from prometheus_client import REGISTRY

        REGISTRY._collector_to_names.clear()
    except Exception:
        pass

    from main import create_app

    app = create_app()
    with TestClient(app) as client:
        yield client
