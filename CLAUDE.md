# Claude Code 项目入口

本仓库的协作约束见 `AGENTS.md`；当前跨端架构、数据归属、开发命令和验收路径见 `docs/ARCHITECTURE_AND_DEVELOPMENT.md`。开始修改前先核对相关源码及环境文件，避免把文档中的示例值当作当前运行配置。

依赖和脚本以 `backend/pyproject.toml`、`frontend/package.json` 为准。后端启动会修改配置的数据库；前端 `pnpm lint` 会改写文件。按用户授权和工作区状态选择运行命令。
