# FastCore

FastCore 是面向单组织企业应用的后端项目骨架，基于 FastAPI，配套 Vue 3 管理端。它提供认证与权限、菜单、审计日志、文件管理等基础能力，并内置 AI 对话、知识库、文档检索、用量额度和质量评测，便于在此基础上开发业务模块。

[English](README.en.md) · [文档目录](docs/README.md) · [架构与开发](docs/ARCHITECTURE_AND_DEVELOPMENT.md) · [标准模块模板](docs/STANDARD_MODULE_TEMPLATE.md)

## 能力与结构

| 位置                                             | 内容                                                                       |
| ------------------------------------------------ | -------------------------------------------------------------------------- |
| [backend/](backend/README.md)                    | FastAPI、SQLAlchemy、Alembic；认证、用户、角色、菜单、日志、文件与健康检查 |
| [frontend/](frontend/README.md)                  | Vue 3、TypeScript、Vite、Pinia、Element Plus；管理页面与授权菜单导航       |
| `backend/app/plugin/module_ai/`                  | AI 对话、知识库、记忆、模型配置、调用额度、回答反馈与检索评测              |
| [分类管理范例](docs/STANDARD_MODULE_TEMPLATE.md) | 从数据库约束到权限、菜单、页面和验收的业务模块示例，仅开发环境开放         |
| [备份与恢复](docs/BACKUP_AND_RESTORE.md)         | 关系库、私有文件、Chroma 与 BM25 索引的离线备份及恢复演练                  |

AI 是内置核心能力，通过显式清单装配。当前骨架采用单组织权限模型；新增企业业务模块时沿用现有接口、事务和权限边界。

## 本地启动

需要 Python 3.12+、`uv`、Node.js 20.19+，以及 `frontend/package.json` 声明的 pnpm（通过 Corepack 使用）。准备后端配置指定的关系数据库和 Redis；MySQL、PostgreSQL、SQLite 的选择以环境文件为准。

```bash
git clone git@github.com:kaliluying/fastcore.git
cd fastcore
cp backend/env/.env.dev.example backend/env/.env.dev
```

先填写数据库、Redis 和密钥，再核对 `frontend/.env`、`.env.development` 的 API 代理与 WebSocket 地址。端口以实际配置为准，不要把模板值当成已运行的服务地址。

```bash
# 终端 1，在仓库根目录
cd backend
uv sync
uv run main.py run --env=dev
```

```bash
# 终端 2，在仓库根目录
cd frontend
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

开发启动会迁移并初始化所选数据库，运行前确认目标。生产启动只检查结构：首次部署显式执行 `bootstrap --env=prod`，后续版本显式执行 `migrate --env=prod`，详见[后端说明](backend/README.md)。AI 依赖随 `uv sync` 安装；实际模型服务、OCR 工具和生产依赖需按对应文档准备。

## 开发与维护

新增业务从[标准模块模板](docs/STANDARD_MODULE_TEMPLATE.md)开始；跨端调用链见[架构指南](docs/ARCHITECTURE_AND_DEVELOPMENT.md)，验证命令与证据边界见[测试与验收](docs/TESTING.md)。`main` 为默认分支，`dev` 为开发分支。

仓库与文档品牌名统一为 FastCore。现有 `fastapiadmin` 数据库名、Redis 前缀、日志文件名、内部符号和设计目录名属于兼容标识，继续保留；仓库改名不包含数据迁移。本地目录名可保持原样。

当前运行说明集中在文档目录和子项目 README；历史任务记录保留原始时间与验证结果。实际行为以当前源码、依赖声明和有效环境配置为准。项目协作规则见 [AGENTS.md](AGENTS.md)。
