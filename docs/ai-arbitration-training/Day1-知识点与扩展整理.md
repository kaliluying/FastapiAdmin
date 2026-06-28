# Day 1 知识点与扩展整理

> 来源：`courseware/index.html` 对应的 Day 1 课件数据、`Day1-环境搭建与AI基础-演讲稿.md`、`完整四天授课执行脚本.md`。  
> 口径：以当前骨架项目为准；演讲稿中与当前骨架不一致的命令、路径、接口，已在本文中修正。

## 1. Day1 定位

Day 1 的目标不是一次讲完 AI 系统，而是建立三个基础：

1. 项目能启动，接口能访问，数据库能初始化。
2. 学生知道劳动仲裁辅助系统解决什么业务问题。
3. 学生理解 AI 问答的最小链路：问题 -> 知识检索 -> Prompt -> 模型回答 -> 人工复核。

课件主线是“把项目跑起来，并建立 AI 应用开发的第一套心智模型”。演讲稿扩展了环境安装、uv、LangChain、Embedding、ChromaDB、知识库上传和检索测试。

## 2. Day1 网页课件页

| 时间 | 课件页 | 核心知识 | 课堂产出 |
|---|---|---|---|
| 9:00-9:10 | 开场：为什么做劳动仲裁辅助系统 | 劳动争议痛点、AI 辅助边界、系统用户 | 学生举一个劳动争议场景 |
| 9:10-9:40 | 项目功能总览 | 咨询、诉求分析、成功率评估、证据管理、文书生成 | 画出用户从提问到文书的流程 |
| 9:20-9:40 | 系统核心功能演示路线 | 四天最终演示效果、流式回答、法律依据、证据到文书 | 记录一个贯穿四天的案例 |
| 9:30-9:40 | 技术栈地图 | FastAPI、数据库、AI 能力、JWT、日志、配置 | 说出 `core` 和 `plugin` 的区别 |
| 9:40-9:50 | 环境检查 | Python、Git、MySQL、uv | 截图提交版本检查结果 |
| 9:50-10:20 | uv 与依赖安装 | 虚拟环境、依赖同步、锁定版本、网络/镜像问题 | 完成依赖安装 |
| 10:20-10:50 | 数据库初始化 | MySQL、Alembic、`.env`、迁移 | 确认数据库表创建 |
| 10:50-11:10 | 启动 FastAPI 项目 | `main.py`、路由、中间件、`/docs`、启动日志 | 打开接口文档 |
| 11:20-12:00 | AI 应用基础 | LLM、Prompt、RAG、Embedding、向量检索 | 用自己的话解释 RAG |
| 14:00-15:30 | LangChain 入门 | 模型调用、Prompt Template、Chain | 修改提示词并观察回答变化 |
| 15:40-17:20 | 创建知识库并上传文档 | 创建库、上传文档、解析、切片、Embedding、Chroma、检索测试 | 上传材料并测试召回 |
| 17:20-18:00 | Day1 总结与课堂验收 | 环境、接口、AI 基础链路、检索问题 | 提交启动截图、接口截图、检索问题 |

## 3. 业务知识

### 3.1 劳动仲裁辅助系统解决什么问题

普通劳动者常见问题：

- 不知道自己的诉求是否成立。
- 不知道该准备哪些证据。
- 不知道仲裁申请书怎么写。
- 不知道公司行为是否违法。
- 不知道下一步应该做什么。

系统目标不是替代律师或仲裁员，而是辅助完成信息整理、初步咨询、证据提示和文书草稿生成。

### 3.2 项目业务闭环

Day1 要让学生先看到终点：

```text
劳动争议问题
  -> AI 智能咨询
  -> 诉求分析
  -> 成功率/风险评估
  -> 证据管理
  -> 文书生成
  -> 答辩演示
```

课堂示例：

- 公司突然辞退，是否违法，能否赔偿。
- 怀孕期间被辞退，是否构成违法解除。
- 拖欠工资，应该准备什么证据。
- 劳动合同、工资流水、通知记录如何进入证据链。

### 3.3 AI 的边界

必须明确：

- AI 可以辅助整理事实、匹配法条、生成草稿。
- AI 不能替代律师意见、仲裁裁决或最终法律判断。
- 法律场景不能只靠模型记忆，必须有知识库、引用依据和人工复核。

## 4. 项目结构知识

Day1 只要求学生建立定位能力，不要求深入每个文件。

```text
backend/
  main.py                                  # 后端启动和 Typer 命令入口
  app/
    api/                                   # 通用系统接口
    plugin/module_ai/
      chat/                                # AI 对话、RAG、会话历史
      knowledge/                           # 知识库、文档上传、切片索引
    core/                                  # 数据库、权限、依赖、基础 CRUD
    config/                                # 环境变量和服务配置
  alembic/                                 # 数据库迁移

frontend/web/
  src/router                               # 前端路由
  src/views/module_ai                      # AI 模块页面
  src/api/module_ai                        # 前端接口封装
  src/utils/http                           # request、baseURL、token 拦截器

courseware/                                # 投屏课件
docs/ai-arbitration-training/              # 讲师备课资料
```

Day1 代码锚点：

| 文件 | Day1 讲法 |
|---|---|
| `backend/main.py` | `run`、`revision`、`upgrade` 命令，应用启动入口 |
| `backend/app/config/setting.py` | 数据库、OpenAI、Chroma、服务端口等配置 |
| `backend/app/plugin/module_ai/chat/rag.py` | RAG 检索、Prompt 构建、模型调用 |
| `backend/app/plugin/module_ai/knowledge/service.py` | 文档保存、解析、切片、Embedding、Chroma 写入 |
| `backend/app/plugin/module_ai/knowledge/controller.py` | 知识库创建、上传、重建索引、检索测试入口 |
| `backend/app/plugin/module_ai/knowledge/model.py` | 知识库、文档、chunk 的关系库记录 |
| `frontend/web/src/views/module_ai/chat/index.vue` | 聊天演示页面 |
| `frontend/web/src/views/module_ai/knowledge/index.vue` | 知识库维护页面 |
| `frontend/web/src/views/module_ai/retrieval/index.vue` | 检索质量验证页面 |
| `frontend/web/src/api/module_ai/chat.ts` | 聊天接口封装 |
| `frontend/web/src/api/module_ai/knowledge.ts` | 知识库接口封装 |

## 5. 环境与工具知识

### 5.1 必备环境

网页课件要求检查：

- Python
- Git
- MySQL
- uv

演讲稿扩展要求：

- Windows 10/11、macOS 10.15+ 或 Ubuntu 20.04+
- 内存建议 8GB 以上，推荐 16GB
- VS Code 或 PyCharm

当前骨架要求：

- Python：`backend/pyproject.toml` 标明 `requires-python = ">=3.12"`
- 后端依赖：`backend/pyproject.toml`
- 后端默认服务端口：`backend/app/config/setting.py` 中 `SERVER_PORT = 8004`

### 5.2 环境检查命令

```powershell
python --version
git --version
uv --version
mysql --version
```

### 5.3 uv 核心知识

uv 的作用：

- 创建虚拟环境。
- 根据 `pyproject.toml` 同步依赖。
- 生成/使用锁定文件，保证环境一致。
- 通过 `uv run` 在项目环境中执行命令。

常用命令：

```powershell
uv venv
uv sync
uv run main.py --help
uv run main.py run --env=dev
uv run main.py upgrade --env=dev
```

注意：当前后端依赖文件在 `backend/pyproject.toml`，实际执行时应在 `backend` 目录下运行后端命令，或确认当前工作目录能找到对应配置文件。

uv 扩展讲法：

- `pyproject.toml` 描述直接依赖和项目元信息。
- 锁文件描述精确版本和间接依赖。
- `uv sync` 适合首次克隆、拉取新代码、切换分支后的环境同步。
- 依赖安装失败通常优先检查网络、代理、镜像源、Python 版本。

## 6. 数据库与配置知识

### 6.1 数据库角色

MySQL 保存业务数据和状态，包括：

- 用户、权限、部门等系统数据。
- 聊天会话和 runs。
- 知识库、文档、chunk 元数据。
- 证据、文书、咨询等业务记录。

当前骨架使用 SQLAlchemy ORM；`backend/pyproject.toml` 中包含 `sqlalchemy`、`asyncmy`、`pymysql`、`alembic`。

### 6.2 迁移与初始化

当前骨架命令：

```powershell
uv run main.py upgrade --env=dev
```

相关文件：

- `backend/main.py`：Typer 命令入口。
- `backend/alembic.ini` 和 `backend/alembic/`：迁移配置和脚本。
- `backend/app/core/database.py`：数据库连接和 metadata 建表能力。

### 6.3 配置项

关键配置来源：`backend/app/config/setting.py` 与环境文件。

需要讲清：

- 服务地址与端口：`SERVER_HOST`、`SERVER_PORT`
- 数据库：`DATABASE_TYPE`、`DATABASE_HOST`、`DATABASE_PORT`、`DATABASE_USER`、`DATABASE_PASSWORD`、`DATABASE_NAME`
- JWT：`SECRET_KEY`、`ALGORITHM`
- OpenAI 兼容模型：`OPENAI_API_KEY`、`OPENAI_BASE_URL`、`OPENAI_MODEL`、`OPENAI_EMBEDDING_MODEL`
- Chroma：`CHROMA_HOST`、`CHROMA_PORT`、`CHROMA_SSL`、`CHROMA_COLLECTION_NAME`

讲师提醒：

- 不要把生产密钥写死在代码里。
- 不要把真实 API Key 投屏。
- 数据库连接失败先检查服务是否启动、端口是否正确、账号密码是否匹配。

## 7. FastAPI 项目启动知识

当前骨架启动命令：

```powershell
uv run main.py run --env=dev
```

核心机制：

- `backend/main.py` 通过 Typer 暴露 `run`、`revision`、`upgrade`。
- `run` 命令加载配置并启动 Uvicorn。
- `create_app()` 创建 FastAPI 应用。
- `init_app.py` 负责注册异常、中间件、路由、静态资源和插件路由。
- `/docs` 是接口演示和调试入口。

课堂验收：

- 能启动后端。
- 能打开接口文档。
- 能看到 AI、知识库、聊天相关接口。
- 能从日志判断服务是否正常启动。

注意：接口文档访问地址不要固定背诵端口；当前骨架默认 `SERVER_PORT = 8004`，实际端口以 `.env` 或 `setting.py` 为准。

## 8. AI 基础知识

### 8.1 大语言模型

讲法：

- 大模型可以理解和生成文本。
- 它基于输入上下文预测输出，不等于法律事实判断。
- 它可能出现幻觉，不知道自己不知道。
- 法律辅助系统必须引入知识库和人工复核。

能力：

- 文本生成。
- 问答对话。
- 文本分类。
- 信息提取。
- 翻译。

局限：

- 知识有截止日期。
- 对私有材料不了解。
- 可能生成不可靠内容。
- 不能替代法律专业判断。

### 8.2 Prompt Engineering

Prompt 是给模型的任务说明。好的 Prompt 应包含：

1. 角色：例如“你是一位劳动法律师”。
2. 任务：例如“分析违法解除风险”。
3. 输入：事实、证据、工资、工龄、公司行为。
4. 输出格式：Markdown、JSON、表格、分点建议。
5. 约束：引用依据、谨慎表述、不得编造事实。
6. 示例：必要时用 few-shot 引导格式。

差 Prompt：

```text
帮我写一份劳动仲裁申请书
```

改进方向：

```text
你是一位劳动争议方向律师。
请基于以下事实生成仲裁申请书草稿。
必须包含仲裁请求、事实与理由、证据清单。
不能编造未提供的信息；不确定处标注“需补充”。
```

### 8.3 RAG

RAG = Retrieval-Augmented Generation，检索增强生成。

核心流程：

```text
用户问题
  -> Embedding 向量化
  -> 向量库检索相关片段
  -> 将片段和问题组装进 Prompt
  -> 调用模型生成回答
  -> 返回答案和依据
```

Day1 只要求学生理解：

- 为什么纯模型回答不可靠。
- 为什么要先检索法律知识库。
- 为什么检索结果会影响回答质量。
- 为什么答案需要人工复核。

### 8.4 Embedding 与向量检索

Embedding 是把文本转成数字向量。

向量检索不是匹配字面关键词，而是匹配语义相似度。

示例：

```text
“公司辞退” 可以匹配 “用人单位解除劳动合同”
“被开除” 可以匹配 “终止劳动关系”
```

扩展：

- 关键词检索适合精确词、法条编号。
- 向量检索适合语义相似。
- 法律场景通常需要混合检索、重排序和人工校验。

## 9. LangChain 知识

演讲稿中把 LangChain 作为下午入门内容。当前骨架中实际使用 `langchain-openai`，RAG 代码集中在 `backend/app/plugin/module_ai/chat/rag.py`。

### 9.1 核心组件

- ChatModel：模型调用封装。
- Prompt Template / Prompt Builder：构建模型输入。
- Chain：把检索、Prompt、模型调用串起来。
- Embeddings：文本向量化。
- Vector Store：向量存储和检索。

### 9.2 当前骨架中的对应关系

| LangChain/AI 概念 | 当前骨架实现 |
|---|---|
| ChatModel | `LangChainChatModel` |
| Prompt 构建 | `RagPromptBuilder` |
| Retriever | `KeywordKnowledgeRetriever`、`ChromaKnowledgeRetriever` |
| Chain | `RagChatChain` |
| Embedding | `OpenAICompatibleEmbeddingClient` |
| Vector Store | `ChromaKnowledgeStore` |

### 9.3 教学建议

Day1 不建议让学生在骨架里随意新增 `test_langchain.py` 或 `utils/simple_qa.py` 作为主线代码。可以作为讲师演示或临时草稿，但学生主线应回到骨架已有文件：

- `backend/app/plugin/module_ai/chat/rag.py`
- `backend/app/plugin/module_ai/chat/service.py`
- `backend/app/plugin/module_ai/knowledge/service.py`

原因：用户明确该项目是骨架，不需要修改骨架代码；课堂应以理解和运行现有链路为主。

## 10. 知识库与向量库知识

### 10.1 当前骨架知识库链路

```text
创建知识库
  -> 上传文档
  -> 保存文档元数据
  -> 提取文本
  -> 文本切片
  -> Embedding
  -> 写入 Chroma
  -> 保存 chunk 元数据
  -> 检索测试
  -> 聊天选择 knowledge_base_ids
```

### 10.2 接口

真实接口前缀：插件挂到 `/ai` 下，KnowledgeRouter 前缀为 `/knowledge`。

常用接口：

```http
POST /ai/knowledge/create
POST /ai/knowledge/document/upload
POST /ai/knowledge/document/{id}/reindex
POST /ai/knowledge/retrieval/test
POST /ai/chat/ai-chat
WebSocket /ai/chat/ws
```

检索测试请求：

```json
{
  "query": "公司辞退员工需要赔偿吗？",
  "knowledge_base_ids": [1],
  "top_k": 3
}
```

聊天请求关键字段：

```json
{
  "message": "公司辞退我需要赔偿吗？",
  "session_id": "可选会话 ID",
  "knowledge_base_ids": [1]
}
```

WebSocket 的 `ChatQuerySchema` 还支持 `files`，用于临时文件上下文。

### 10.3 支持的文档类型

当前 `extractors.py` 支持：

- `.txt`
- `.md`
- `.pdf`
- `.docx`

### 10.4 切片参数

当前 `text_splitter.py` 默认：

- `chunk_size = 1000`
- `overlap = 150`

讲法：

- chunk 太大：召回片段可能包含无关内容，Prompt 变长。
- chunk 太小：法条或案例语义可能被切断。
- overlap 用于减少边界割裂。

### 10.5 MySQL 与 Chroma 的分工

| 存储 | 保存内容 |
|---|---|
| MySQL | 知识库、文档、chunk 元数据、状态、会话历史 |
| ChromaDB | 向量、可召回文本、metadata |
| 文件存储 | 原始上传文件 |

关键模型：

- `KnowledgeBaseModel`：知识库元数据。
- `KnowledgeDocumentModel`：文档元数据、`parse_status`、`index_status`、`error_message`。
- `KnowledgeChunkModel`：chunk 元数据；向量内容在 Chroma。
- `ChatSessionModel`：会话和 `runs`。

### 10.6 检索质量判断

学生需要会看：

- 是否选择了正确知识库。
- 文档状态是否解析成功、索引成功。
- `retrieval/test` 是否返回相关片段。
- 返回片段是否真的能支撑回答。
- 回答中是否存在无依据扩展。

## 11. 前端相关知识

Day1 网页课件偏后端启动和接口验证，但整体项目必须让学生知道前端位置。

前端主线：

```text
router
  -> views/module_ai/chat
  -> views/module_ai/knowledge
  -> views/module_ai/retrieval
  -> api/module_ai/chat.ts
  -> api/module_ai/knowledge.ts
  -> utils/http/request
  -> backend /ai/*
```

页面职责：

- `chat/index.vue`：聊天演示、会话、知识库选择、WebSocket/HTTP 问答。
- `knowledge/index.vue`：知识库管理、创建、启停、删除。
- `retrieval/index.vue`：检索测试、查看召回片段。
- `api/module_ai/chat.ts`：聊天会话和非流式 AI 对话接口。
- `api/module_ai/knowledge.ts`：知识库、文档上传、检索测试接口。

Day1 讲法：

- 前端不是第一天主开发内容，但它是最终演示入口。
- 学生要知道页面动作如何变成后端接口。
- 知识库上传和检索测试可通过页面或 `/docs` 完成，课堂以能验证链路为目标。

## 12. 常见问题与处理

### 12.1 环境问题

| 问题 | 排查顺序 |
|---|---|
| Python 版本不对 | `python --version`，确认 >= 3.12 |
| uv 不存在 | `uv --version`，必要时重新安装 |
| 依赖安装失败 | 检查网络、代理、镜像源、是否在 backend 目录 |
| MySQL 连接失败 | 检查服务、端口、账号密码、数据库名 |
| 端口被占用 | 查看 `SERVER_PORT`，换端口或关闭占用进程 |
| `/docs` 打不开 | 确认后端是否启动、端口是否一致、日志是否报错 |

### 12.2 AI 与知识库问题

| 问题 | 排查顺序 |
|---|---|
| OpenAI API 超时 | 网络、代理、`OPENAI_BASE_URL`、Key |
| Embedding 失败 | `OPENAI_EMBEDDING_MODEL`、API Key、额度 |
| Chroma 连接失败 | `CHROMA_HOST`、`CHROMA_PORT`、Chroma 服务是否启动 |
| 上传成功但检索不到 | 文档状态、切片数、索引状态、knowledge_base_ids |
| 回答不准 | 先看检索片段，再看 Prompt，最后看模型输出 |

### 12.3 教学节奏问题

- 上午演示不要过长，环境搭建必须留时间。
- 环境问题不要让全班等待单个学生，先记录共性错误，个别问题课间处理。
- LangChain 示例可以讲概念，主线不要偏离骨架已有代码。
- 知识库检索比“模型回答好不好”更适合 Day1 验收，因为它能直接证明数据进入系统。

## 13. Day1 课堂验收

必做验收：

- 项目能正常启动。
- API 文档能访问。
- 数据库迁移完成。
- 至少创建一个知识库。
- 至少上传一份法律材料。
- `retrieval/test` 能返回相关片段。
- 学生能用自己的话解释 RAG。

建议提交物：

- 环境版本截图。
- 后端启动日志截图。
- `/docs` 页面截图。
- 知识库文档状态截图。
- 检索测试请求和返回截图。
- 一个学生自己设计的劳动争议问题。

## 14. Day1 可扩展讲解

适合扩展但不要求当天全部讲完：

1. uv 与 pip 的差异：速度、锁文件、团队一致性。
2. FastAPI 的自动文档：OpenAPI、Swagger UI、接口调试。
3. Alembic 的作用：数据库结构版本管理。
4. JWT 的作用：登录态和接口访问边界。
5. Prompt 的可测试性：同一问题不同提示词输出差异。
6. RAG 与普通搜索的区别：语义召回和依据约束。
7. chunk_size / overlap 调参：召回质量和上下文长度的权衡。
8. MySQL 与 Chroma 双存储：元数据和向量数据分离。
9. 前端页面与后端接口契约：页面状态、请求字段、响应展示。
10. 法律辅助系统的风险边界：不能把模型输出包装成最终法律意见。

## 15. 技术关键词详解

本节用于讲师备课。课堂上不需要逐字讲完，建议按当天节奏挑选关键词展开。讲法要始终回到一个主线：这些技术不是孤立名词，而是共同支撑“用户提问 -> 系统检索依据 -> 模型生成回答 -> 人工复核”的链路。

### 15.1 环境与工程工具

| 关键词 | 详细解释 | 当前骨架中的位置 | 课堂讲法 |
|---|---|---|---|
| Python | 本项目后端主要开发语言。Python 适合快速构建 Web API、数据处理和 AI 应用，生态中有 FastAPI、SQLAlchemy、LangChain、Chroma 客户端等库。 | `backend/pyproject.toml` 要求 `>=3.12` | Python 是后端和 AI 编排的基础运行环境，不是只用来写脚本。 |
| uv | Python 包管理和环境管理工具，可创建虚拟环境、同步依赖、执行项目命令。它读取 `pyproject.toml` 和锁文件，帮助团队获得一致环境。 | 后端目录执行 `uv sync`、`uv run main.py ...` | 讲清 “安装依赖” 和 “在项目环境中运行命令” 是两件事。 |
| 虚拟环境 | 每个项目独立的一套 Python 包环境，避免不同项目依赖版本互相污染。 | `uv venv` 或 `uv sync` 创建/使用 | 学生遇到包不存在，先确认命令是否在正确虚拟环境里执行。 |
| `pyproject.toml` | Python 项目的标准配置文件之一，描述项目元信息、Python 版本、直接依赖和工具配置。 | `backend/pyproject.toml` | 它是后端依赖的“清单”，不要在仓库根目录找后端依赖。 |
| 锁文件 | 记录精确依赖版本和间接依赖版本，使不同机器安装出的环境尽量一致。 | uv 同步依赖时使用 | `pyproject.toml` 说明想要什么，锁文件说明实际锁定到什么版本。 |
| Git | 代码版本管理工具，用于克隆项目、切换分支、查看改动、提交历史。 | 整个仓库 | Day1 只要求会检查版本和获取代码，不展开复杂协作流。 |
| PowerShell | Windows 默认常用终端。执行中文路径、中文输出时要显式使用 UTF-8，减少乱码。 | 本地命令执行环境 | Windows 演示时先设置 UTF-8，再运行检查命令。 |

### 15.2 后端 Web 框架与启动链路

| 关键词 | 详细解释 | 当前骨架中的位置 | 课堂讲法 |
|---|---|---|---|
| FastAPI | Python Web API 框架，基于类型标注构建接口，适合快速开发 JSON API，并能生成 OpenAPI 文档和 Swagger UI 调试页面。 | `backend/app/core/init_app.py` 创建应用并注册路由 | 它负责把浏览器或前端请求转成后端函数调用。 |
| ASGI | Python 异步 Web 服务规范，支持 HTTP、WebSocket 等协议。FastAPI 运行在 ASGI 生态上。 | Uvicorn 运行 FastAPI 应用 | 可以理解为服务器和 Python 应用之间的协议约定。 |
| Uvicorn | ASGI 服务器，负责监听端口、接收请求、把请求交给 FastAPI 应用处理。 | `uv run main.py run --env=dev` 最终启动 Uvicorn | FastAPI 是应用框架，Uvicorn 是把应用跑起来的服务进程。 |
| Typer | 命令行工具框架，用 Python 函数定义命令。当前骨架用它暴露 `run`、`revision`、`upgrade`。 | `backend/main.py` | 学生执行的启动和迁移命令不是散落脚本，而是统一入口。 |
| 路由 Router | 把 URL 路径和处理函数绑定起来。例如 `/ai/knowledge/create` 会进入知识库控制器。 | `controller.py`、各模块 router | 路由回答“这个请求由谁处理”。 |
| Controller | 接收请求、解析参数、调用服务层、返回响应的入口层。 | `chat/controller.py`、`knowledge/controller.py` | Controller 不应承担复杂业务推理，它主要组织请求和响应。 |
| Service | 业务逻辑层，封装创建知识库、上传文档、解析切片、聊天调用等核心流程。 | `knowledge/service.py`、`chat/service.py` | Service 回答“系统实际做了什么”。 |
| Middleware | 请求进入业务代码前后的统一处理层，可用于跨域、日志、鉴权、异常包装等。 | `init_app.py` 中注册 | 它像入口门禁和检查点，不属于某一个具体接口。 |
| Dependency | FastAPI 的依赖注入机制，用于统一注入数据库会话、当前用户、权限校验等对象。 | `app/core/dependency.py` 等核心模块 | 让接口函数不用手写重复的初始化和校验代码。 |
| OpenAPI | 描述 API 的标准格式，机器和工具可以读取它生成文档、客户端或测试用例。 | FastAPI 自动生成 | `/docs` 背后依赖 OpenAPI 描述接口结构。 |
| Swagger UI | 浏览器中的交互式 API 文档页面，可查看接口、请求参数并发起调试请求。FastAPI 默认文档路径是 `/docs`，当前项目端口以配置为准。 | 后端启动后访问接口文档 | Day1 用它证明后端启动成功、路由注册成功。 |
| Schema | 请求和响应的数据结构约束，通常由 Pydantic 模型表达。它规定字段名、类型、是否必填。 | `chat/schema.py`、`knowledge/schema.py` | Schema 是前后端接口契约的一部分。 |
| JSON | 前后端最常用的数据交换格式，字段由键值对组成。 | HTTP 请求体和响应体 | 学生要能读懂请求示例和响应结构。 |
| HTTP 方法 | 常见有 GET、POST、PUT、DELETE。GET 通常查询，POST 通常创建或提交操作。 | `/ai/*` 接口 | 方法表达操作语义，路径表达资源或能力。 |
| WebSocket | 浏览器和后端之间的长连接协议，适合持续推送消息，例如流式 AI 回答。 | `backend/app/plugin/module_ai/chat/ws.py`、`/ai/chat/ws` | HTTP 像一次问答，WebSocket 像开着一条持续通话线路。 |

### 15.3 数据库、配置与状态管理

| 关键词 | 详细解释 | 当前骨架中的位置 | 课堂讲法 |
|---|---|---|---|
| MySQL | 关系型数据库，保存用户、权限、会话、知识库、文档、chunk 元数据等结构化数据。 | `DATABASE_*` 配置 | MySQL 保存“业务状态”，不是保存向量相似度索引的主阵地。 |
| SQLAlchemy ORM | Python ORM 框架，把 Python 类和数据库表建立映射，让业务代码以对象方式读写数据库。 | `model.py`、`database.py` | ORM 不是数据库本身，而是代码访问数据库的抽象层。 |
| Alembic | 数据库迁移工具，用版本脚本管理表结构变化。 | `backend/alembic/`、`uv run main.py upgrade --env=dev` | 它解决“代码更新后数据库结构如何跟上”的问题。 |
| 迁移 Migration | 对数据库结构的版本化变更，例如新增表、增加字段、修改索引。 | Alembic 脚本 | 迁移不是导入业务数据，而是调整表结构。 |
| `.env` | 环境变量文件，存放本地配置，例如数据库地址、模型 Key、端口等。 | 与 `setting.py` 配合 | 配置应该随环境变化，不能把真实密钥硬编码进代码。 |
| Settings | 项目读取配置后的对象，业务代码通过它获取端口、数据库、模型、Chroma 等配置。 | `backend/app/config/setting.py` | Settings 是“配置入口”，不要在各处散写魔法字符串。 |
| 元数据 Metadata | 描述数据的数据。例如文档名、知识库 ID、chunk 编号、来源文件、状态。 | MySQL 模型和 Chroma metadata | 元数据让系统知道片段来自哪里、属于哪个知识库。 |
| 状态字段 | 用于记录流程进度和结果，例如 `parse_status`、`index_status`、`error_message`。 | `KnowledgeDocumentModel` 等模型 | 上传成功不等于可检索，还要看解析和索引状态。 |
| 文件存储 | 保存原始上传文件的位置，与数据库记录和向量库记录共同构成知识库链路。 | 文档上传服务 | 原始文件、元数据、向量索引是三类不同资产。 |

### 15.4 前端页面与接口调用

| 关键词 | 详细解释 | 当前骨架中的位置 | 课堂讲法 |
|---|---|---|---|
| Vue | 前端界面框架，用组件组织页面和交互状态。 | `frontend/web/src/views/module_ai/*` | 用户看到的聊天、知识库、检索测试页面由 Vue 组件构成。 |
| TypeScript | JavaScript 的类型增强版本，可提前约束接口字段和组件数据结构。 | `frontend/web/src/api/module_ai/*.ts` | 它帮助前端更早发现字段名、类型不匹配问题。 |
| Vite | 前端开发和构建工具，负责本地开发服务、热更新和生产构建。 | `frontend/web` 工程 | Day1 可知道它是“把前端跑起来”的工具，不必深入构建细节。 |
| Router | 前端路由，决定浏览器路径对应哪个页面组件。 | `frontend/web/src/router` | 后端路由处理接口，前端路由处理页面。两者不是一回事。 |
| View | 页面级组件，通常承载一个业务页面，例如聊天页、知识库页、检索页。 | `views/module_ai/chat`、`knowledge`、`retrieval` | View 是用户可见的操作入口。 |
| API 封装 | 前端把后端接口包装成函数，页面调用函数而不是到处手写 URL。 | `src/api/module_ai/chat.ts`、`knowledge.ts` | 它是前后端契约在前端侧的集中位置。 |
| Request 拦截器 | 前端请求发出前后的统一处理，例如拼接 baseURL、携带 token、处理错误响应。 | `src/utils/http` | 它减少每个页面重复写鉴权和错误处理。 |
| baseURL | 前端请求后端接口的基础地址。接口函数只写相对路径，最终由 baseURL 拼成完整地址。 | HTTP 工具配置 | 页面打不开接口时，要检查前端 baseURL 和后端端口是否一致。 |
| 页面状态 | 页面中用于驱动 UI 的数据，例如当前会话、选中的知识库、上传状态、检索结果。 | Vue 组件内部状态 | 前端不是只画页面，还要维护用户操作过程中的状态。 |

### 15.5 AI、Prompt 与 RAG

| 关键词 | 详细解释 | 当前骨架中的位置 | 课堂讲法 |
|---|---|---|---|
| AI | 本课程中主要指用大模型辅助劳动争议咨询、材料整理、知识检索和文书草稿生成。 | AI 模块整体 | 强调辅助属性，不把模型回答当最终法律结论。 |
| LLM | Large Language Model，大语言模型。它根据上下文生成文本，可用于问答、分类、摘要、信息抽取。 | 通过 OpenAI 兼容接口调用 | LLM 擅长生成和理解文本，但可能产生不可靠内容。 |
| OpenAI 兼容接口 | 一类遵循 OpenAI 风格请求/响应格式的模型服务接口。不同模型供应商可能提供兼容协议。 | `OPENAI_BASE_URL`、`OPENAI_MODEL` | 当前骨架不把模型写死，配置可切换服务地址和模型名。 |
| Prompt | 发送给模型的任务说明，包括角色、任务、输入事实、输出格式、约束条件。 | `RagPromptBuilder` | Prompt 决定模型“按什么任务和边界回答”。 |
| Prompt Template | 可复用的提示词模板，用变量填入用户问题、检索片段、上下文等内容。 | RAG Prompt 构建逻辑 | 模板让提示词可维护、可测试，而不是每次手写。 |
| Chain | 把多个步骤串成完整流程，例如检索、组装 Prompt、调用模型、解析输出。 | `RagChatChain` | Chain 是 AI 应用的流程编排，不等于单次模型调用。 |
| LangChain | AI 应用开发框架，提供模型、Prompt、Embedding、向量库等组件的统一抽象。当前骨架使用其中一部分能力。 | `langchain-openai`、`rag.py` | Day1 讲“抽象和编排”，不要把它讲成必须掌握的全部框架。 |
| RAG | Retrieval-Augmented Generation，检索增强生成。先从知识库检索依据，再把依据交给模型生成回答。 | `rag.py`、`retrieval/test`、聊天接口 | RAG 的价值是降低纯模型瞎答风险，并让回答有依据可查。 |
| Retrieval | 检索，从知识库中找出和用户问题相关的文本片段。 | `KeywordKnowledgeRetriever`、`ChromaKnowledgeRetriever` | 回答质量先看检索质量，再看模型表达。 |
| Retriever | 检索器，是执行检索逻辑的组件，可以是关键词检索、向量检索或混合检索。 | `rag.py` | Retriever 回答“哪些资料应该送进 Prompt”。 |
| Embedding | 把文本转换成数字向量，使系统可以计算语义相似度。 | `OpenAICompatibleEmbeddingClient` | “被开除”和“解除劳动合同”字面不同，但语义可能接近。 |
| 向量 | 一组数字，用来表示文本语义特征。向量之间的距离或相似度用于排序相关片段。 | Chroma 中保存 | 学生不需要手算向量，只要理解它服务语义检索。 |
| 向量检索 | 根据向量相似度查找相关文本，不只依赖字面关键词。 | Chroma 检索 | 适合表达不同但意思相近的问题。 |
| 关键词检索 | 根据文本中的明确词语匹配内容，适合法条编号、专有名词、精确短语。 | `KeywordKnowledgeRetriever` | 法律场景中关键词检索和向量检索可以互补。 |
| 混合检索 | 组合关键词、向量、过滤、重排序等多种策略，提高召回稳定性。 | 可作为扩展讲法 | Day1 只讲概念，不要求实现复杂检索策略。 |
| 幻觉 | 模型生成看似合理但缺乏事实依据或法律依据的内容。 | 风险边界说明 | 法律辅助系统必须通过检索依据和人工复核降低风险。 |
| 人工复核 | 人对 AI 输出进行事实、法律依据和表达风险检查。 | 教学验收和业务边界 | 它是法律场景的必要环节，不是可选装饰。 |

### 15.6 知识库、切片与 Chroma

| 关键词 | 详细解释 | 当前骨架中的位置 | 课堂讲法 |
|---|---|---|---|
| 知识库 | 一组可被检索的业务资料集合，例如劳动法条、案例、公司制度、课堂材料。 | `KnowledgeBaseModel`、`/ai/knowledge/create` | 知识库回答“模型可以参考哪些资料”。 |
| 文档上传 | 把 PDF、DOCX、TXT、MD 等资料上传到系统，作为后续解析和索引的来源。 | `/ai/knowledge/document/upload` | 上传只是第一步，还要解析、切片、索引。 |
| 文本提取 | 从上传文件中读取正文内容。不同格式需要不同提取器。 | `extractors.py` | PDF 上传失败时，不一定是 AI 问题，可能是文本提取问题。 |
| Chunk | 文档切分后的文本片段。系统通常不是把整篇文档都塞给模型，而是检索相关 chunk。 | `KnowledgeChunkModel`、`text_splitter.py` | chunk 是知识库检索和 Prompt 输入的基本单位。 |
| `chunk_size` | 每个文本片段的大致长度。太大会引入噪声，太小会割裂语义。 | 默认 `1000` | 这是召回质量和上下文长度之间的权衡。 |
| `overlap` | 相邻 chunk 之间保留的重叠文本，用于减少段落边界造成的信息丢失。 | 默认 `150` | 它解决“关键句刚好被切开”的问题。 |
| ChromaDB | 面向 AI 检索的向量数据库/检索基础设施，可存储文档、向量和 metadata，并按相似度查询。 | `ChromaKnowledgeStore`、`chromadb.HttpClient` | Chroma 负责“按语义找相似片段”。 |
| Collection | Chroma 中存储和查询向量的基本集合单位。可以理解为向量库里的一个命名空间。 | `CHROMA_COLLECTION_NAME` | 当前系统通过 collection 管理可检索数据。 |
| Metadata Filter | 按 metadata 条件过滤检索结果，例如只查某个知识库或某个文档来源。 | Chroma metadata、`knowledge_base_ids` | 没有过滤，可能把不相关知识库的片段召回。 |
| `top_k` | 检索时返回最相关的前 K 个片段。 | `retrieval/test` 请求字段 | K 太小可能漏资料，K 太大可能给模型太多噪声。 |
| Reindex | 重新索引文档，通常用于解析/切片/向量写入失败后重建，或模型、切片策略变化后刷新索引。 | `/ai/knowledge/document/{id}/reindex` | 重新索引不是重新上传，而是重建可检索内容。 |
| `knowledge_base_ids` | 聊天或检索时指定使用哪些知识库。 | 聊天和检索测试请求字段 | 这是控制回答依据范围的关键字段。 |

### 15.7 接口安全、权限与可观测性

| 关键词 | 详细解释 | 当前骨架中的位置 | 课堂讲法 |
|---|---|---|---|
| JWT | JSON Web Token，常用于登录后向后端证明用户身份。前端请求接口时通常携带 token。 | `SECRET_KEY`、`ALGORITHM`、用户鉴权逻辑 | JWT 解决“你是谁、是否登录”的问题。 |
| Token | 登录态凭证。前端保存后随请求发送，后端校验后识别用户。 | 前端 request 拦截器、后端依赖校验 | token 泄露等同于身份凭证泄露，不能随便投屏或写进代码。 |
| 权限 | 控制用户能访问哪些菜单、接口或数据。 | `core` 权限相关模块 | 权限不是隐藏按钮，而是后端也要校验访问边界。 |
| 接口契约 | 前后端约定好的路径、方法、字段、响应结构和错误格式。 | `schema.py` 与 `src/api/module_ai/*.ts` | 当前端字段和后端 Schema 不一致，就会出现联调问题。 |
| 日志 | 记录系统运行过程、错误、请求和关键业务状态，用于排查问题。 | 后端启动日志、服务日志 | Day1 要学会看第一条真实错误，不只看最后一屏报错。 |
| 异常处理 | 对错误进行捕获、转换和统一响应，避免内部错误直接暴露给用户。 | `init_app.py`、核心异常处理 | 好的异常处理能让学生知道问题发生在哪个环节。 |
| 可观测性 | 通过日志、状态字段、接口返回、测试页面等证据判断系统是否正常。 | 文档状态、检索测试、启动日志 | 验收不要只看“页面有按钮”，要看链路是否真的跑通。 |

### 15.8 容易混淆的概念

| 容易混淆 | 正确区分 |
|---|---|
| FastAPI 与 Uvicorn | FastAPI 是应用框架，Uvicorn 是运行 ASGI 应用的服务器。 |
| 前端路由与后端路由 | 前端路由决定显示哪个页面，后端路由决定哪个接口处理请求。 |
| 上传成功与索引成功 | 上传成功只说明文件进入系统；索引成功才说明内容可被检索。 |
| MySQL 与 Chroma | MySQL 保存业务状态和元数据；Chroma 保存向量和可检索片段。 |
| Prompt 与 RAG | Prompt 是模型输入说明；RAG 是先检索依据再构建 Prompt 的完整流程。 |
| Embedding 与模型回答 | Embedding 用于语义表示和检索；聊天模型负责生成自然语言回答。 |
| `/docs` 能打开与业务可用 | `/docs` 能打开只说明 API 文档可访问；还要验证数据库、模型、Chroma 和具体接口。 |
| AI 回答与法律意见 | AI 回答是辅助解释和草稿，法律结论必须由人复核。 |

参考口径来自当前骨架代码和官方文档：FastAPI 的自动文档默认路径、LangChain 的模型/Embedding 统一接口思路、Chroma 的 collection、embedding、metadata 和检索能力。

## 16. Day1 讲师速查

### 当前骨架命令

```powershell
cd backend
uv sync
uv run main.py --help
uv run main.py upgrade --env=dev
uv run main.py run --env=dev
```

### 当前骨架核心接口

```text
POST /ai/knowledge/create
POST /ai/knowledge/document/upload
POST /ai/knowledge/document/{id}/reindex
POST /ai/knowledge/retrieval/test
POST /ai/chat/ai-chat
WebSocket /ai/chat/ws
```

### 当前骨架关键文件

```text
backend/main.py
backend/app/config/setting.py
backend/app/plugin/module_ai/chat/rag.py
backend/app/plugin/module_ai/chat/service.py
backend/app/plugin/module_ai/chat/schema.py
backend/app/plugin/module_ai/chat/ws.py
backend/app/plugin/module_ai/chat/controller.py
backend/app/plugin/module_ai/knowledge/controller.py
backend/app/plugin/module_ai/knowledge/service.py
backend/app/plugin/module_ai/knowledge/text_splitter.py
backend/app/plugin/module_ai/knowledge/embedding.py
backend/app/plugin/module_ai/knowledge/chroma_store.py
frontend/web/src/views/module_ai/chat/index.vue
frontend/web/src/views/module_ai/knowledge/index.vue
frontend/web/src/views/module_ai/retrieval/index.vue
frontend/web/src/api/module_ai/chat.ts
frontend/web/src/api/module_ai/knowledge.ts
```

## 17. 与原演讲稿相比的校正点

| 原演讲稿常见说法 | 本文校正 |
|---|---|
| 依赖在项目根目录 | 当前后端依赖在 `backend/pyproject.toml` |
| 固定背诵接口文档端口 | 当前默认端口看 `SERVER_PORT`，骨架默认是 `8004`，以 `.env` 为准 |
| 使用 `core.config.settings` 的临时示例 | 当前骨架配置路径是 `app.config.setting.settings` |
| 新建 `utils/simple_qa.py` 作为课堂主线 | 不改骨架代码；作为讲师演示草稿可以，学生主线看现有 RAG 文件 |
| Chroma 本地持久化目录示例 | 当前骨架使用 `chromadb.HttpClient` 连接 Chroma 服务 |
| 使用非当前骨架的 ORM 示例 | 当前骨架实际使用 SQLAlchemy ORM |

## 18. 推荐讲法

Day1 结束前，要求学生能说出这段话：

> 今天我们把项目跑起来，知道它服务劳动争议咨询、证据整理和文书生成。后端用 FastAPI 提供接口，数据库保存业务状态，知识库把法律文档切片并写入 Chroma，聊天时通过 knowledge_base_ids 选择知识库，RAG 先检索依据再构建 Prompt 调用模型。AI 只做辅助解释和草稿生成，最终结论需要人工复核。
