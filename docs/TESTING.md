# 测试与验收

[文档目录](README.md) · [架构指南](ARCHITECTURE_AND_DEVELOPMENT.md)

按改动风险选择检查；通过局部测试只证明该测试边界。依赖与脚本以当前文件为准，历史记录中的测试数量和本地命令不作为固定验收标准。

## 后端检查

从 `backend/` 执行，先完成 `uv sync`：

```bash
.venv/bin/python -m pytest tests -q
.venv/bin/ruff check app tests --no-fix --output-format concise
```

日常改动可选择对应测试文件。`tests/conftest.py` 使用临时 SQLite、模拟 Redis 和测试生命周期；不能证明 MySQL/PostgreSQL、真实 Redis、OCR 工具或外部模型服务已可用。

## 前端检查

从 `frontend/` 执行，先按 lockfile 安装依赖：

```bash
corepack pnpm install --frozen-lockfile
# 新 checkout 生成忽略的自动导入类型声明
corepack pnpm exec vite build
corepack pnpm type-check
corepack pnpm test
corepack pnpm build
```

Vitest 验证组件与逻辑；类型检查和构建验证编译。`lint` 会修复文件，单纯检查可对目标文件调用 `corepack pnpm exec eslint <文件>`、`corepack pnpm exec stylelint <文件>` 或 `corepack pnpm exec prettier --check <文件>`。

## 隔离浏览器验收

从仓库根目录执行，要求后端 `.venv`、前端依赖和本机 Chrome 已就绪：

```bash
# 检查工具与浏览器前提，不启动应用服务
node frontend/tests/ux-e2e.cjs --preflight

# 按目标用例选择
node frontend/tests/ux-e2e.cjs
node frontend/tests/category-e2e.cjs
node frontend/tests/route-lifecycle-e2e.cjs
node frontend/tests/documents-e2e.cjs
node frontend/tests/model-usage-e2e.cjs
node frontend/tests/quality-e2e.cjs
```

脚本建立隔离测试环境，使用临时 SQLite、模拟 Redis 和确定性模型，运行真实浏览器操作；默认测试端口需空闲，具体前提以各脚本为准。它们验证登录、页面、API 和测试数据持久化的链路，不能证明真实供应商或生产部署。

共用验收器保留的 JSON 与截图位于忽略的 `.local/acceptance/`；其他脚本的输出目录见运行结果。仅分享脱敏结果，避免导出环境文件、数据库或原始日志。工作区有改动时，证据需包含源码差异信息，不能只用提交号代表实际测试代码。

`frontend/scripts/check.cjs` 是本地组合检查入口，可从 `frontend/` 使用 `corepack pnpm check frontend`、`backend`、`table` 或 `logs`。组合入口复用检查，不替代真实依赖验收。钩子、额外 npm scripts 和 CI 的实际状态需检查当前文件；本地未提交变更不能代表远程分支已配置。

## 真实依赖与供应商

真实数据库/Redis 验收须使用可丢弃的独立实例与测试库，先确认数据库目标、端口和销毁范围。若工作区存在 `backend/integration/README.md`，按其说明检查前提后再执行；该目录若尚未提交，新克隆不会包含此入口。

真实模型验收至少覆盖：保存配置、手动能力验证、AI 对话、知识库召回与引用、用量记录、失败或取消后的状态。模型列表可读取、权限状态正常或模拟模型通过，都不能单独证明供应商调用成功。远程 embedding 和模型请求可能产生费用，验收前确认目标与额度。

跨层功能应记录浏览器主要操作、API 响应、持久化结果及错误态。知识库上传需等待索引终态并检查实际召回；数据库迁移需记录所用数据库与版本；备份需演练恢复后读取，不能只验证 ZIP 可打开。无法覆盖的依赖明确标注未验证。
