# FastapiAdmin

FastapiAdmin 是一个面向单组织内部使用的后台管理系统。它提供 RBAC、系统配置、审计日志和文件管理；AI 知识库、文档索引和 RAG 对话通过可选依赖组启用。

## 项目定位

- **使用场景**：单组织内部后台、知识库管理、RAG 问答、基础系统管理。
- **组织边界**：当前版本不支持多租户，也不保留多租户字段或切换入口。
- **后端栈**：FastAPI、SQLAlchemy、Alembic、Redis、MySQL；启用 AI 后增加 ChromaDB 与 OpenAI-compatible API。
- **前端栈**：Vue 3、Vite、TypeScript、Element Plus、Pinia、Vue Router。
- **向量检索**：启用 AI 后使用 ChromaDB 本地持久化目录存储向量和文本块索引。
- **模型接入**：启用 AI 后通过 OpenAI-compatible chat 和 embedding endpoint 接入模型能力。

## 功能范围

### 保留模块

- 系统管理：用户、角色、菜单、字典、参数配置、操作日志。
- 公共能力：认证、RBAC、动态菜单、文件上传、Redis 缓存。
- AI 对话：会话记录、模型配置、普通对话、结合知识库的 RAG 对话。
- AI 知识库：知识库管理、文档上传、文本抽取、分块、embedding、Chroma 写入、召回验证（安装 `ai` 可选组后启用）。

### 已移除或禁用

- 多租户中间件、组织切换、组织注册、组织运营入口。
- SaaS 订阅、授权售卖、平台运营类需求文档。
- 通知、工单、岗位、监控等可选后台产品入口。
- Dockerfile、docker-compose、Docker nginx/redis/mysql 配置。

## 目录结构

```txt
.
├── backend/                  # FastAPI 后端
│   ├── app/
│   │   ├── api/              # 系统 API 路由
│   │   ├── core/             # 基础 CRUD、认证、异常、权限等
│   │   ├── plugin/
│   │   │   └── module_ai/    # AI 对话与知识库插件
│   │   └── scripts/          # 初始化和种子数据脚本
│   ├── env/                  # 环境变量模板
│   ├── tests/                # 后端测试
│   └── pyproject.toml
├── frontend/                  # Vue 3 frontend
│   ├── src/
│   │   ├── api/               # Frontend API wrappers
│   │   ├── router/            # Routes
│   │   ├── stores/            # Pinia state
│   │   └── views/             # Pages
│   └── package.json
└── docs/                     # 项目文档与实训资料
```

## 服务依赖

本地开发需要准备：

- Python 3.12+
- uv
- Node.js 20.19+
- pnpm
- MySQL 8+
- Redis 6+
- 启用 AI 时需要 OpenAI-compatible chat endpoint
- 启用 AI 时需要 OpenAI-compatible embedding endpoint

## 后端配置

进入后端目录并复制开发环境配置：

```powershell
cd backend
copy env\.env.dev.example env\.env.dev
```

重点配置项在 `backend/env/.env.dev`：

```env
DATABASE_TYPE = "mysql"
DATABASE_HOST = "localhost"
DATABASE_PORT = 3306
DATABASE_USER = "root"
DATABASE_PASSWORD = "your_database_password"
DATABASE_NAME = "fastapiadmin"

REDIS_ENABLE = True
REDIS_HOST = "localhost"
REDIS_PORT = 6379
REDIS_PASSWORD = "your_redis_password"
REDIS_DB_NAME = 1

DATABASE_AUTO_CREATE_TABLES = True  # 仅本地开发需要自动建表时显式开启
SECRET_KEY = "dev-only-change-this-secret-before-sharing"

AI_ENABLE = False
OPENAI_BASE_URL = "https://api.example.com"
OPENAI_API_KEY = "your_api_key"
OPENAI_MODEL = "your_chat_model"
EMBEDDING_PROVIDER = "local"
LOCAL_EMBEDDING_MODEL = "BAAI/bge-small-zh-v1.5"
LOCAL_EMBEDDING_CACHE_DIR = "./data/fastembed"
OPENAI_EMBEDDING_MODEL = ""

CHROMA_PERSIST_DIR = "./data/chroma"
CHROMA_COLLECTION_NAME = "knowledge_base"
```

说明：

- 后端使用 `chromadb.PersistentClient` 直接读写本地 Chroma 持久化目录。
- 向量模型默认使用本地 `fastembed` 小模型 `BAAI/bge-small-zh-v1.5`；如需远程 embedding，可将 `EMBEDDING_PROVIDER` 改为 `openai` 并配置 `OPENAI_EMBEDDING_MODEL`。
- `CHROMA_PERSIST_DIR` 是当前向量库数据目录，部署或备份时需要保留。
- 不要提交真实数据库密码、Redis 密码或模型 API key。

## 后端启动

```powershell
cd backend
# 基础后台
uv sync
uv run main.py run --env=dev

# 启用 AI 知识库与 RAG
uv sync --extra ai
# 在 env/.env.dev 中设置 AI_ENABLE = True
```

将 `DATABASE_AUTO_CREATE_TABLES` 显式设为 `True` 时，应用启动会创建缺失表并写入当前启用模块的种子数据。生产环境启动前必须执行 `uv run main.py upgrade --env=prod`；该命令会先应用核心 Alembic 迁移，再补齐当前启用 AI 模块的缺失表，应用运行时不会自动建表。

`backend/requirements.txt` 仅包含基础后台依赖；启用 AI 的部署使用 `backend/requirements-ai.txt`。

默认开发配置中的 API 前缀为 `/api/v1`。Swagger 和 ReDoc 路径由 `backend/env/.env.dev` 中的 `DOCS_URL`、`REDOC_URL` 控制。

## 前端配置

进入前端目录并安装依赖：

```powershell
cd frontend
pnpm install
```

前端环境模板：

```powershell
copy .env.example .env
```

常用配置项：

```env
VITE_PORT=5180
VITE_APP_BASE_API=/api/v1
VITE_API_BASE_URL=http://127.0.0.1:8004
VITE_APP_WS_ENDPOINT=ws://127.0.0.1:8004
VITE_ACCESS_MODE=mixed
```

如果后端端口不是 `8004`，需要同步调整 `VITE_API_BASE_URL` 和 `VITE_APP_WS_ENDPOINT`。

## 前端启动

```powershell
cd frontend
pnpm run dev
```

常用脚本：

```powershell
pnpm run type-check
pnpm test
pnpm run build
```

## AI 知识库流程

先执行 `uv sync --extra ai` 并设置 `AI_ENABLE=True`，再进行以下操作：

1. 在“AI 知识库 / 知识库管理”创建知识库。
2. 在“文档管理”上传 `.txt`、`.md`、`.pdf`、`.docx` 文件。
3. 后端保存文件到 `backend/storage/knowledge`。
4. 后端抽取文档文本并切分 chunk。
5. 后端调用 embedding 模型生成向量。
6. MySQL 保存知识库、文档、chunk 元数据。
7. ChromaDB 保存向量、chunk 文本和检索 metadata。
8. 在知识库页面内验证召回效果。
9. 在“AI 对话”中选择知识库进行 RAG 问答。

核心后端路径：

```txt
backend/app/plugin/module_ai/chat/
backend/app/plugin/module_ai/knowledge/
```

核心前端路径：

```txt
frontend/src/api/module_ai/
frontend/src/views/module_ai/
```

## 验证命令

后端：

```powershell
cd backend
uv run pytest tests\core\test_optional_ai_plugin.py -q
uv run --extra ai pytest tests\plugin\module_ai -q
python -m compileall -q app tests
uv run ruff check app\plugin\module_ai app\scripts\initialize.py app\api\v1\module_system\__init__.py app\config\setting.py app\init_app.py tests --output-format concise
uv run --extra ai python -c "import chromadb, openai, pypdf, docx"
```

前端：

```powershell
cd frontend
pnpm vitest run src\__tests__\single-org-user-store.test.ts src\__tests__\knowledge-api.test.ts
pnpm run type-check
```

## 常见问题

### 文档上传后索引失败

检查：

- `CHROMA_PERSIST_DIR` 是否可读写，磁盘空间是否充足。
- `OPENAI_API_KEY`、`OPENAI_BASE_URL`、`OPENAI_EMBEDDING_MODEL` 是否正确。
- 上传文件是否为 `.txt`、`.md`、`.pdf`、`.docx`。
- 后端日志中的 `error_message` 字段。

### 前端能打开但接口报错

检查：

- 后端是否已启动。
- `VITE_APP_BASE_API` 是否与后端 `ROOT_PATH` 一致。
- `VITE_API_BASE_URL` 是否指向正确后端端口。
- 浏览器网络请求是否命中 `/api/v1`。

### 启动后看不到旧多组织功能

这是当前代码线的预期状态。本分支定位为单组织 AI 知识库后台，旧多组织文档和入口不再维护。

## 文档维护原则

- README 只描述当前分支可运行、可验证的能力。
- 不在 README 中记录历史长需求；过期需求应移出根目录。
- 新增运行依赖、环境变量或验证命令时，需要同步更新本文件。
