# 2026-10-13 依赖升级记录

版本核对时间：2026-10-13，北京时间。以 PyPI 的稳定发布和 npm 的 `latest` 标签为准；不采用预发布版本。保留原有 uv / pnpm 工具链，并同步依赖声明、锁文件和生产用 `requirements.txt`。本轮调整 27 项后端运行依赖声明、4 项开发依赖声明和 56 项前端依赖声明，新增 Anthropic SDK 测试所需的 `httpx2` 开发依赖。

## 主要版本

| 依赖                | 升级前安装版本 | 当前版本            |
| ------------------- | -------------- | ------------------- |
| FastAPI             | 0.115.2        | 0.136.3（兼容版本） |
| Starlette           | 0.40.0         | 1.8.0               |
| SQLAlchemy          | 2.0.51         | 2.1.4               |
| Pydantic            | 2.12.5         | 2.14.1              |
| Redis Python 客户端 | 7.1.0          | 8.1.0               |
| OpenAI SDK          | 2.28.0         | 3.29.0              |
| langchain-core      | 1.4.8          | 1.6.10              |
| langchain-openai    | 1.3.3          | 1.7.1               |
| langchain-anthropic | 1.4.8          | 1.7.6               |
| Vite                | 7.3.6          | 8.3.4               |
| Vue / compiler-sfc  | 3.5.34         | 3.5.44              |
| Element Plus        | 2.13.7         | 2.14.7              |
| Pinia               | 3.0.4          | 4.0.3               |
| VueUse              | 13.9.0         | 15.0.0              |
| Vitest              | 4.1.7          | 5.0.4               |
| pnpm                | 10.34.5        | 12.11.2             |

完整版本见 `backend/uv.lock` 和 `frontend/pnpm-lock.yaml`。已升级传递依赖，并保留原有前端安全 overrides 的适用范围，更新对应版本。统一 unplugin 3.4.0 消除新版 unctx 的 peer 冲突。pnpm 12 的近期发布例外按具体包版本记录；安装脚本仅允许 esbuild 和 @parcel/watcher，core-js 的非必要安装脚本禁用。

Node.js 要求更新为 `^22.22.2 || ^24.15.0 || >=26.0.0`，与新版 jsdom 等工具的实际要求一致；本机验收使用 Node.js 24.21.0、Python 3.12.14。

## 保留的兼容边界

- **FastAPI 0.136.3**：最新稳定版为 0.143.0，但 [FastAPI 0.137 的发布说明](https://fastapi.tiangolo.com/release-notes/#01370) 明确将 `router.routes` 改为树状结构。现有 fastapi-limiter HTTP 实现直接遍历扁平路由，在新结构下报 `_IncludedRouter` 没有 `path`。保留最后一个采用原结构的补丁版本。
- **fastapi-limiter 0.1.6**：[0.2.0](https://pypi.org/project/fastapi-limiter/0.2.0/) 移除了 FastAPILimiter 的 Redis 初始化/关闭接口，改用 pyrate-limiter，构造和回调接口也变化。本轮保留已有 Redis 固定窗口和生命周期语义；迁移该限流实现后才能继续升级 FastAPI。
- **TypeScript 6.0.3**：最新稳定版为 7.0.2，但 [typescript-eslint 8.71.2 的包声明](https://registry.npmjs.org/typescript-eslint/8.71.2) 只支持 `>=4.8.4 <6.1.0`。等待工具链支持后再升级。

因此本轮交付是尽可能升级到最新稳定版本，同时保留以上三个有明确证据的例外。

## 必要兼容改动

- 新 FastAPI 默认在响应和后台任务完成后退出 yield 依赖。HTTP 数据库依赖明确使用 `scope="function"`，恢复响应前提交事务的行为，避免后台审计等待未提交的写事务。覆盖认证共享入口和所有直接数据库依赖，WebSocket 生命周期沿用现有实现。新增真实 HTTP 回归，验证审计独立连接能读取刚创建的分类；修复前失败，修复后通过。
- Vue 对对象模型默认值使用工厂函数；Element Plus 表格使用 TableInstance，并为业务列提供显式泛型，接受排序取消时的空字段。
- VueUse 15 的 useNow 使用 scheduler，保留一秒更新和初始暂停；Markdown-it 15 使用其内置实例类型。
- Anthropic 1.x SDK 测试传输层使用 httpx2，OpenAI 测试继续使用 httpx，覆盖普通调用、SSE、工具调用和用量记录。
- 锁文件升级产生的 Git diff 超过 Node 默认 1 MiB 缓冲。验收证据采集提高到 16 MiB，并增加大差异回归；超过 16 MiB 时仍会明确失败。

## 验证与限制

升级前基线：后端 549 项测试，前端 174 项测试和类型检查通过。

最终后端完整回归 **550 项通过**（新增 1 项事务回归），耗时 228.82 秒；前端类型检查、生产构建、174 项测试、10 项工具测试通过。无 peer 冲突，`pnpm install --frozen-lockfile`、`uv lock --check`、`uv pip check` 及生产 requirements 内容一致性检查通过。`pnpm audit --prod` 在查询当时报告 0 项漏洞，这不等于未来或全部依赖安全保证。

隔离浏览器验收：真实登录、HTTP/WebSocket、附件检索、流式输出、引用恢复、取消、错误重试；分类创建、修改、三种排序状态、重复名称错误、删除、审计持久化及 375/768/1024/1440px 布局。使用临时 SQLite、模拟 Redis 和确定性模型，不访问外部供应商。已检查手机和桌面截图。最终证据保留在 `.local/acceptance/2026-10-13-Gk6dKB/`（AI 对话）和 `.local/acceptance/2026-10-13-3TDfY9/`（分类），两次验收均通过，页面错误为 0。

独立临时 Redis 验收：真实 Redis Python 8.1.0 客户端，验证 200/200/429、Retry-After、窗口恢复和 Lua 脚本失效后重载；仅使用随机 loopback 端口和临时目录，退出后停止实例。

全量 Ruff 检查存在 5 项基线问题：4 处导入排序和 1 处未使用导入；旧 Ruff 0.14.13 与新 Ruff 0.17.0 均可复现。本轮修改的 Python 文件检查通过。保留现有枚举的字符串语义，限定忽略新规则 UP042。

后端测试还有 11 条警告，来自 Starlette 的旧 422 状态常量别名，以及新版 Pydantic 对既有菜单字典序列化的提示；测试和 JSON 响应检查通过，未将这些提示描述为全量无警告。Vite/Vitest 对未来原生配置加载方式有迁移提示，当前构建和测试通过。

未连接生产数据库、运行生产迁移或部署；MySQL/PostgreSQL、真实模型和 embedding 服务尚未验证。保留工作区已有启动策略、文档修改和 `.ua/`；未提交。
