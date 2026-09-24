# FastapiAdmin

FastapiAdmin 是面向单组织的后台系统，包含用户与角色权限、菜单、系统配置、审计日志、AI 对话、知识库和文档检索。后端使用 FastAPI，前端使用 Vue 3。

**从 [架构与开发指南](docs/ARCHITECTURE_AND_DEVELOPMENT.md) 开始**：其中有跨端模块图、启动与权限链路、数据归属、知识库纵向链路、开发步骤和验收要求。

## 代码与文档入口

| 位置 | 内容 |
| --- | --- |
| [`backend/`](backend/README.md) | FastAPI 服务、系统与 AI 模块、数据库初始化和后端测试 |
| [`frontend/`](frontend/README.md) | Vue 应用、登录状态、授权菜单与动态路由 |
| [`docs/ARCHITECTURE_AND_DEVELOPMENT.md`](docs/ARCHITECTURE_AND_DEVELOPMENT.md) | 当前整体架构与开发流程 |

后端入口是 `backend/main.py`；前端入口是 `frontend/src/main.ts`。AI 路由、模型和启动钩子由 `backend/app/plugin/module_ai/plugin.toml` 声明。实际命令与依赖分别以 `backend/pyproject.toml`、`frontend/package.json` 为准。

## 本地启动

需要 Python 3.12+、`uv`、Node.js 20.19+、仓库声明的 `pnpm`，以及按后端环境文件配置的关系数据库和 Redis。先复制并填写 `backend/env/.env.dev.example`；核对前端 `.env` 与 `.env.development` 中的 API 代理和 WebSocket 地址。模板地址只是示例，当前开发文件可能覆盖它们。

```bash
# 仓库根目录
cp backend/env/.env.dev.example backend/env/.env.dev

# 终端 1
cd backend
uv sync
uv run main.py run --env=dev

# 终端 2，从仓库根目录
cd frontend
pnpm install
pnpm dev
```

启动后端会针对配置的数据库应用已有 Alembic 迁移、创建缺失表并补齐种子数据；运行前确认数据库目标。AI 核心依赖已包含在 `uv sync` 中。模型与向量库的配置、测试命令以及知识库上传后的异步索引流程见[架构与开发指南](docs/ARCHITECTURE_AND_DEVELOPMENT.md)。

## 文档维护

本 README 只保留项目入口和最短启动步骤。跨端事实维护在架构与开发指南；子项目命令维护在各自 README。遇到差异，以当前源码、包脚本和环境配置为准。历史设计稿及实现报告记录当时的工作，不作为当前运行说明。
