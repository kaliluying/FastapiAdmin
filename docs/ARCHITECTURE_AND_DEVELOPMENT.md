# 架构与开发指南

本文描述当前 `backend/` 与 `frontend/` 的运行链路。实际行为以源码、`backend/pyproject.toml`、`frontend/package.json` 和环境文件为准；历史设计稿与实现总结不作为运行说明。

## 系统概览

FastapiAdmin 是单组织后台。前端负责登录、菜单导航、系统管理和 AI 工作界面；后端负责认证与权限、业务 API、数据初始化及 AI 知识库与对话。正常启动会连接关系数据库和 Redis；知识库还使用本地文件、Chroma 与 BM25 索引，AI 对话使用配置的模型服务。

```mermaid
flowchart LR
    U[浏览器：Vue 3] -->|HTTP /api/v1| A[FastAPI]
    U -->|WebSocket ticket| A
    A --> S[系统与平台模块]
    A --> K[AI 模块：对话、知识库、记忆]
    S --> DB[(关系数据库)]
    K --> DB
    A --> R[(Redis)]
    K --> F[私有文档文件]
    K --> C[(Chroma 向量与文本)]
    K --> B[(BM25 索引)]
    K --> M[模型服务或本地 Embedding]
```

| 边界 | 代码入口 | 职责 |
| --- | --- | --- |
| 前端启动 | `frontend/src/main.ts`、`src/plugins/index.ts` | 初始化 Pinia、路由、指令、国际化和组件库 |
| 前端鉴权与导航 | `src/store/modules/user.store.ts`、`src/router/` | 登录状态、授权菜单转换、动态路由注册和导航守卫 |
| 后端组装 | `backend/main.py`、`app/init_app.py` | 装配中间件、路由、生命周期和静态文件 |
| 通用后台 API | `app/api/v1/module_common/`、`module_platform/`、`module_system/` | 文件与健康检查、菜单、认证及系统管理 |
| AI 核心模块 | `app/plugin/module_ai/`、`app/core/plugins.py` | 对话、知识库、记忆及模型配置；通过显式清单组装 |
| 数据初始化 | `app/scripts/initialize.py`、`app/scripts/migrate.py` | ORM 建表与种子数据、已有 Alembic 迁移 |

表中 `app/` 和 `src/` 分别相对于 `backend/`、`frontend/`。模块按功能组织；新增功能先沿现有调用链打通完整用例，再决定是否需要拆分更多文件。

## 启动、路由与权限

1. 从 `backend/` 运行 `uv run main.py run --env=dev`。CLI 先设置 `ENVIRONMENT`，再导入配置；`app/config/setting.py` 和 `app/plugin/module_ai/config.py` 读取对应 `backend/env/.env.dev`。
2. `create_app()` 注册异常处理、中间件、通用路由、AI 路由和静态资源。通用路由在 `app/init_app.py:register_routers()` 显式挂载；AI 的 HTTP/WebSocket 路由、模型和启动钩子由 `app/plugin/module_ai/plugin.toml` 声明，交给 `app/core/plugins.py` 装配。当前没有目录扫描式插件发现。
3. 应用生命周期先连接必需的 Redis。开发环境仍在 Redis 锁下初始化数据库；生产环境只读检查迁移版本、必需表、列和索引，不自动迁移、建表或补种子，结构不匹配即拒绝启动。随后初始化 AI 核心模块、通用缓存及限流器；HTTP 与 WebSocket 使用 `RATE_LIMITER_TIMES` / `RATE_LIMITER_SECONDS`。开发初始化运行在可终止子进程中，锁续约失败会中止该进程。
4. 前端使用 Hash 路由。登录后用户信息中的菜单进入 `MenuProcessor`，由 `menuRoutes.ts` 转换，再经 `RouteRegistry` 校验并注册；`beforeEach.ts` 负责权限与导航。个人中心是静态隐藏路由，资料与密码操作仍由后端登录态校验。

前端 API 请求通过 `frontend/src/utils/http/` 发送。开发代理由 `frontend/vite.config.ts` 配置：`VITE_APP_BASE_API` 是浏览器使用的 API 前缀，`VITE_API_BASE_URL` 是代理目标；WebSocket 另用 `VITE_APP_WS_ENDPOINT`。Vite 会加载 `.env` 和对应模式的 `.env.development`，后者可覆盖同名值。仓库模板与当前开发文件可能不同，联调前以实际加载值和后端监听地址核对。

## 数据归属与知识库链路

| 数据 | 存放位置 | 开发时要确认的事 |
| --- | --- | --- |
| 用户、权限、菜单、知识库元数据、chunk 与状态 | 配置的 MySQL、PostgreSQL 或 SQLite | 数据库目标、迁移与事务；后端测试默认用临时 SQLite |
| 启动锁、缓存、限流与会话相关状态 | Redis | 正常启动需要可访问的 Redis |
| 通用上传与知识库原件 | `backend/storage/upload/`、`backend/storage/knowledge/` | 私有文件与数据库记录的一致性；不要在 API 中暴露服务器绝对路径 |
| 向量与文本块 | `CHROMA_PERSIST_DIR` 指定的 Chroma 目录 | Embedding 模型变化时检查向量维度与集合 |
| 关键词索引 | `BM25_INDEX_DIR` 指定的本地目录 | 与文档重建、删除及检索模式保持一致 |
| 模型调用 | 本地 `fastembed`、配置的对话模型服务或远程 embedding 服务 | 对话模型可选 OpenAI Chat Completions、OpenAI Responses、Anthropic；embedding 单独配置 |

模型配置页可填写模型名，也可使用当前接口地址和 API Key 获取服务商模型列表后选择。获取列表不会保存配置；改用其他接口地址或在 OpenAI 与 Anthropic 之间切换时，保存前需填写对应接口的 API Key。

**真实纵向链路示例：上传知识库文档。**前端 `src/api/module_ai/knowledge.ts` 调用 `POST /ai/knowledge/document/upload`；后端 `knowledge/controller.py` 校验文档创建权限，`knowledge/service.py` 保存原件和持久化 `pending` 记录。进程内后台任务只是加速器；manifest 声明的恢复任务每 15 秒扫描可领取的文档，通过 SQL 条件更新领取，抽取文本、切块并按 `RETRIEVAL_MODE` 更新 Chroma、BM25 或两者，最后更新索引状态。上传成功只代表文件与记录已接收；应继续检查文档索引状态和检索结果。AI 对话在 `chat/` 中使用知识库检索结果，WebSocket 入口在 `chat/ws.py`，通过 ticket 鉴权。

- 索引租约默认 300 秒，每 30 秒续约；失败后等待 60 秒自动重试，最多 3 次。硬终止后过期的任务可被重启进程接管，耗尽次数会明确失败而不是永久 `indexing`；手动重建可重新开始。
- 每次索引生成使用独立分块标识，保存待清理列表；旧索引在新 SQL 分块提交后清理。删除先通过 SQL 阻止重新领取，外部索引和源文件清理由持久化删除状态恢复。检索须以未删除文档和当前 SQL 分块为准，不能仅信任外部索引命中。
- SQL、Chroma 与 BM25 没有跨系统原子事务。恢复机制不等同于分布式事务，也不自动证明所有历史孤立文件已修复；存储不可访问或连续失败仍需管理员排查。

**模块接口约定。**索引清理通过 Chroma 与 BM25 的 `delete_chunks(ids)` 删除指定代际，知识库处理逻辑不直接操作 collection 或索引 writer。Chat 通过 `MemoryService` 读取用户记忆并触发后台提取；身份转换、提取与保存、独立数据库事务由记忆模块负责，提取器位于 `memory/extractor.py`。这样存储实现或记忆规则变化时，调用方无需同步实现细节。

对应回归检查位于 `tests/plugin/module_ai/knowledge/test_chunk_deletion.py` 与 `tests/plugin/module_ai/chat/test_memory_workflow.py`：分别使用临时真实 Chroma/Whoosh 索引，以及临时 SQLite 加确定性模型替身，验证代际删除、其他文档保留、用户隔离和后台提交。这些检查不代表外部模型或生产验收。

文本模型使用 `ChatModel`；需要结构化工具调用的模型使用扩展协议 `ToolChatModel`。供应商内容块通过公共函数 `content_to_text()` 转换，调用方不依赖 LangChain 适配器的私有方法。知识任务的恢复扫描和自动领取共享 `KnowledgeService` 的状态、租约与重试条件；恢复 worker 只负责启动、轮询和停止。

动态路由的移除回调和 iframe 缓存由 `RouteRegistry` 统一管理，菜单 store 只保存展示数据。退出登录同步清理路由，避免延迟清理影响再次登录；注册失败会回滚已添加的路由和 iframe 数据。此处采用 CodeVault `server-driven-route-registry` 的集中所有权原则；知识任务已有 SQL 租约和持久化状态，无需引入 `persistent-failure-guard` 的文件锁与 JSON 状态层。

新增回归检查覆盖模型内容转换、恢复资格、路由重复清理及缓存写入失败回滚。`frontend/tests/route-lifecycle-e2e.cjs` 使用隔离的 SQLite、模拟 Redis 与确定性模型，在真实浏览器中验证登录、刷新、菜单重建、退出和重新登录；不代表生产数据库或外部模型验收。

## 本地开发

新增业务可从 [标准模块模板：分类管理](STANDARD_MODULE_TEMPLATE.md) 开始，沿用其中的数据库约束、请求事务、功能权限、数据范围、菜单接入和端到端验收方式。范例接口和导航仅在开发环境启用；生产保留模型及迁移历史，正式业务应使用独立命名并正常注册。

工具版本以 `backend/pyproject.toml` 与 `frontend/package.json` 为准：后端 Python 3.12+ 和 `uv`，前端 Node 20.19+ 与仓库声明的 `pnpm`。按所选后端配置准备关系数据库、Redis；使用 AI 对话或远程 embedding 时配置相应模型服务。`uv sync` 已安装 AI 核心依赖，无需额外的 `ai` extra。

```bash
# 在仓库根目录：复制后端模板，先填写本机连接与密钥
cp backend/env/.env.dev.example backend/env/.env.dev

# 终端 1：后端
cd backend
uv sync
uv run main.py run --env=dev

# 终端 2：从仓库根目录启动前端
cd frontend
pnpm install
pnpm dev
```

前端运行前核对已跟踪的 `frontend/.env`、`frontend/.env.development`，尤其是代理与 WebSocket 目标。不要把模板地址、端口或账号当成当前环境的真实值。后端 `--env=dev` 读取 `backend/env/.env.dev`；本地配置和密钥不得提交。

### 生产部署的数据库步骤

从 `backend/` 执行，先确认 `env/.env.prod` 的目标及备份：

```bash
# 首次部署：创建缺失表并写入基础数据，不清空现有数据。
uv run main.py bootstrap --env=prod

# 后续部署：显式应用已审查的迁移（upgrade 为兼容命令）。
uv run main.py migrate --env=prod
uv run main.py run --env=prod
```

`bootstrap` 使用 Redis 初始化锁；部署侧应串行执行迁移。DDL 的回滚能力取决于数据库，取消子进程不能撤销已经提交的 DDL。结构检查失败应修复部署步骤，不要用 `reset` 绕过检查；`reset` 会删除数据。生产应用仍可进行正常业务写入和知识任务恢复，只禁止隐式结构修复及补种子。

### 常用验证

以下命令分别在对应子目录运行，按改动范围选择；它们本身不构成跨层功能的端到端验收。

```bash
# backend/
uv run pytest tests/test_api_module_ai.py -q
uv run pytest tests/plugin/module_ai -q
uv run ruff check app tests --no-fix --output-format concise

# frontend/
pnpm test
pnpm type-check
pnpm build
```

`backend/tests/conftest.py` 将数据库切到临时 SQLite，并模拟 Redis、限流器等；测试通过不能证明 MySQL/Redis、浏览器或外部模型的运行行为。`pnpm lint` 中的 ESLint、Prettier、Stylelint 脚本会修复或重写文件，仅在需要格式化且已检查工作区差异时运行。

跨层功能至少选择一个可重复的用户场景，验证真实登录与权限、浏览器操作、API 响应、持久化结果及错误态。例如知识库链路要等后台索引完成，再检查文档状态和实际召回；只看到上传接口成功不足以验收检索功能。


## 修改功能的路径

- **系统 API**：从 `app/api/v1/module_*/<feature>/` 的 controller 进入，核对 service、数据访问、权限码与功能组 router；前端对应 `src/api/`、`src/views/` 和后端菜单。
- **AI 能力**：先核对 `module_ai/plugin.toml` 的声明和现有 `chat/`、`knowledge/`、`memory/` 边界。跨功能调用依赖拥有方的公开用例，避免直接耦合对方内部 CRUD、索引或 Provider Client。
- **前端页面**：核对用户菜单的 `route_path`、`route_name`、组件路径、`MenuProcessor`、`RouteRegistry` 与守卫；同时验证后端授权。
- **数据库模型**：Alembic `script_location` 是 `backend/app/alembic`，版本目录为 `backend/app/alembic/versions/`。生成迁移后审查脚本和数据影响；生产部署显式应用迁移，正常启动只检查结构，不会生成或应用迁移。需要交付的版本文件应与代码一起纳入版本管理。

变更文档时，以代码入口、包脚本和环境模板为事实来源。入口总览放在根 `README.md`；子项目 README 只保留本子项目的操作说明；本文维护跨端调用链和验收边界。历史实现报告与设计稿保留其原始时间语境，不作为当前开发命令的依据。
