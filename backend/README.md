# 后端开发

后端是单组织 FastAPI 服务，提供认证与 RBAC、系统配置、菜单、文件管理，以及 AI 对话、知识库、检索和记忆。跨端架构与知识库链路见[架构与开发指南](../docs/ARCHITECTURE_AND_DEVELOPMENT.md)。本目录的依赖和命令以 `pyproject.toml` 为准。

## 入口与模块

| 路径 | 职责 |
| --- | --- |
| `main.py`、`app/init_app.py` | CLI、应用组装、生命周期、路由与中间件 |
| `app/api/v1/module_common/` | 通用文件、健康检查与监控 |
| `app/api/v1/module_platform/` | 菜单 |
| `app/api/v1/module_system/` | 认证、用户、角色、字典、参数和日志 |
| `app/plugin/module_ai/` | 对话、知识库、记忆与模型配置 |
| `app/plugin/module_ai/plugin.toml`、`app/core/plugins.py` | AI 路由、模型与启动钩子的显式组装 |
| `app/scripts/initialize.py`、`app/scripts/migrate.py` | 种子数据、建表与已有迁移的应用 |

业务权限由后端 `AuthPermission` 校验，前端菜单只负责导航与可见性。当前 AI 是核心模块，依赖随 `uv sync` 安装；没有额外的 `ai` extra 或目录扫描式路由发现。

## 本地运行

要求 Python 3.12+、`uv`、配置的关系数据库和 Redis。将 `env/.env.dev.example` 复制为 `env/.env.dev`，填写本机数据库、Redis 与模型设置。默认 embedding 使用本地 `fastembed`；AI 对话或远程 embedding 需要可用的模型服务。不要提交真实密钥。

```bash
# 在 backend/ 下
cp env/.env.dev.example env/.env.dev
uv sync
uv run main.py run --env=dev
```

`main.py` 先设置 `ENVIRONMENT` 再导入配置；独立脚本复用配置时也要保持顺序。启动会针对所选数据库应用已有 Alembic 迁移、创建缺失表和补齐种子数据。执行前确认环境文件指向的数据库。版本文件生成在 `app/alembic/versions/`；`uv run main.py revision --env=dev` 生成新迁移后，先审查脚本及数据影响。

普通上传在 `storage/upload/`，知识库原件在 `storage/knowledge/`；本地 Chroma 与 BM25 索引目录分别由 `CHROMA_PERSIST_DIR`、`BM25_INDEX_DIR` 决定。数据备份与恢复要同时考虑关系库、文件和索引。

## 验证

```bash
# 在 backend/ 下，按改动范围选择
uv run pytest tests/test_api_module_ai.py -q
uv run pytest tests/plugin/module_ai -q
uv run ruff check app tests --no-fix --output-format concise
```

`tests/conftest.py` 使用临时 SQLite、模拟 Redis 和测试生命周期；这些测试不能代替真实数据库、Redis、浏览器与模型服务的端到端验收。跨层功能的实际验收路径见[架构与开发指南](../docs/ARCHITECTURE_AND_DEVELOPMENT.md)。
