# FastApiAdmin AI Knowledge Skeleton

单组织内部后台管理系统骨架，保留用户、角色、部门、菜单、字典、参数、日志、文件上传等后台基础能力，并内置 AI 知识库与 RAG 对话。

## 定位

- 单组织内部使用，不提供租户切换、租户注册和 SaaS 套餐运行时。
- MySQL 存储业务元数据和知识库元数据。
- ChromaDB HTTP Server 存储向量和分块检索索引。
- OpenAI-compatible API 提供对话模型和 embedding 模型。
- Vue 3 + Element Plus 提供后台管理界面。

## 保留模块

- 系统管理：用户、角色、部门、菜单、字典、参数配置、操作日志。
- 公共能力：认证、RBAC、动态菜单、文件上传、Redis 缓存。
- AI 知识库：AI 对话、会话记录、模型配置、知识库管理、文档管理、检索测试。

## 已移除或禁用

- 租户中间件、租户切换、租户注册、租户菜单入口。
- 通知、工单、岗位、监控等可选后台产品入口。
- 种子菜单已收敛为最小后台骨架 + AI 知识库。

## 服务依赖

- Python 3.12+
- Node.js 20.19+ / pnpm
- MySQL 8+
- Redis 6+
- ChromaDB HTTP Server
- OpenAI-compatible chat and embedding endpoint

## 后端启动

```powershell
cd backend
copy env\.env.dev.example env\.env.dev
uv sync
uv run main.py run --env=dev
```

关键配置在 `backend/env/.env.dev`：

```env
OPENAI_API_KEY=
OPENAI_BASE_URL=
OPENAI_MODEL=
OPENAI_EMBEDDING_MODEL=
CHROMA_HOST=localhost
CHROMA_PORT=8000
CHROMA_SSL=false
CHROMA_COLLECTION_NAME=knowledge_base
```

Chroma 以 HTTP server 方式运行，后端使用 `chromadb-client` 连接，避免 Windows 本地构建 HNSW 扩展。

## 前端启动

```powershell
cd frontend\web
pnpm install
pnpm run dev
```

## 知识库流程

1. 在“AI 知识库 / 知识库管理”创建知识库。
2. 在“文档管理”上传 `.txt`、`.md`、`.pdf`、`.docx`。
3. 后端提取文本、切分 chunk、写 MySQL 元数据，并将 embedding 写入 ChromaDB。
4. 在“检索测试”验证召回效果。
5. 在“AI 对话”选择知识库后进行 RAG 问答。

## 验证命令

```powershell
cd backend
uv run pytest tests\core\test_single_org_runtime.py tests\scripts\test_skeleton_seed_menu.py tests\plugin\module_ai -q
python -m compileall -q app tests
uv run ruff check app\plugin\module_ai app\scripts\initialize.py app\api\v1\module_system\__init__.py app\config\setting.py app\init_app.py tests --output-format concise
uv run python -c "import chromadb, openai, pypdf, docx"

cd ..\frontend\web
pnpm vitest run src\__tests__\single-org-user-store.test.ts src\__tests__\knowledge-api.test.ts
pnpm run type-check
```
