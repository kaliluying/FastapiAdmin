# 真实运行态隔离验收

[测试与验收](../../docs/TESTING.md) · [后端说明](../README.md)

> 此目录当前为本地未提交验收材料；新克隆使用前先确认目录和脚本存在。历史通过记录不代表当前工作区已重跑。

本目录脚本独立运行，不导入 `tests/conftest.py`，不替换 Redis、SQLAlchemy、生产 lifespan、迁移或恢复方法。记忆任务验收使用确定性本地模型，HTTP 聊天的回答生成与日志路由使用显式替身；认证、授权、事务和队列均走实际应用路径。

## 前提和安全边界

- 提供**专用临时** MySQL 8.4 和 Redis 7.x 实例，只监听 loopback；脚本不会启动服务。
- 拒绝 3306/6379 默认端口、重复端口、非 loopback、缺少显式确认或非空 Redis DB 15。
- MySQL 用户需有建库权限；脚本创建随机 `fastcore_ci_<16位hex>` 库，不接收已有库名。退出时只删除本次创建的库。
- 不读取仓库环境文件。嵌套初始化进程通过仅限本次 `PYTHONPATH` 的 `sitecustomize.py` 使用临时环境/日志目录。文档、BM25、Chroma 路径也指向系统临时目录。
- `--disposable-services` 是调用者对服务独占性的声明，不是自动证明；不要把现有数据库或共享 Redis 的其他端口伪装成临时实例。
- Redis DB 15 内验收产生的键保留至临时 Redis 实例销毁，脚本不执行全库清空。

从 `backend/` 执行：

```bash
# 默认 root，无密码的全新临时 MySQL 可不设置密码变量。
INTEGRATION_MYSQL_USER=root INTEGRATION_MYSQL_PASSWORD="$TEMP_MYSQL_PASSWORD" \
  .venv/bin/python integration/runtime_acceptance.py \
  --mysql-port 13316 --redis-port 16379 --disposable-services

# 不连接任何服务的安全检查。
.venv/bin/python -m unittest discover -s integration -p 'test_*.py'
```

输出为 `/tmp/fastcore-integration-*`（macOS 使用系统临时目录）。`runtime-results.json` 只有全部验收成功后才写入最终重启证据；失败查看对应阶段 `.log`，不要直接发布可能含诊断数据的原始日志。

## 验收路径

1. 空库通过真实生产启动自动创建结构、应用 Alembic 迁移并初始化基础数据；显式生产 `bootstrap` 与 `upgrade` 子进程仍用于验证幂等部署命令。
2. 真实生产 startup/shutdown、MySQL/Redis readiness、Redis 锁过期/错误所有者拒绝续约或释放、启动锁并发串行化。
3. 使用 2 次 / 2 秒的配置检查 HTTP 第三次请求返回 429，真实时间窗口过后恢复；生产启动会自动迁移但不会破坏已有表和种子数据。
4. 删除临时库的版本记录后，结构检查必须失败且不得自行修复，随后恢复记录。
5. 真实上传服务保存文档和 pending 任务，独立生产进程经 manifest hook 认领任务。仅在被杀的验收进程把租约缩短为 2 秒，并在真实解析后的屏障暂停；主脚本 SIGKILL 此进程，检查 MySQL 保留 indexing/attempts/token。
6. 等待真实租约过期，以两个新的生产进程执行 startup/shutdown，自动恢复文档至 success，检查 SQL 分块、源文件、真实 BM25 检索及重复重启无重复分块。正常 shutdown 必须停止恢复任务。
7. 登录后通过实际 HTTP 聊天保存 7 个待提取任务；阻塞本地模型验证任务留在 SQL，释放后全部处理。另用 6 个用户验证实际工作并发不超过 4。
8. 对上传、替换分别注入数据库回滚及已提交后的回执丢失，核对清理与保留。持有真实 MySQL 行锁时恢复必须跳过文件，回滚后才可删除；生产恢复循环也需实际执行清理。
9. 在记忆任务已持久化认领、另一笔文件上传已写盘但未提交后 SIGKILL 独立进程，租约过期后由新进程恢复记忆并清理孤立文件；再次重启不得重复写入记忆。相关结果写入 `verify-reliability-*.json` 和 `memory-restart.json`。

外部模型和 embedding 不参与本脚本（BM25 模式）；解析屏障和短租约是明确的故障注入，不属于真实模型提供商验收。

本目录的真实依赖验收需手动执行；CI 是否存在以目标分支文件为准，本地删除工作流不代表远程已删除。原始日志、环境目录、数据库文件和故障原始输出可能包含诊断数据，分享时只选脱敏结果 JSON 和截图。Ruff 默认不修复文件，本地检查使用 `--no-fix`。

## 浏览器回归与环境预检

从 `frontend/` 执行 `corepack pnpm install --frozen-lockfile`，Playwright 已在开发依赖和 lockfile 中声明；需要后端 `.venv` 依赖及本机 Chrome。检查和 hook 通过 Corepack 使用项目指定版本；浏览器启动器直接调用安装的 Vite。安装目录存在旧账号 store 时，先在独立目录按同一 lockfile 验证新安装，再切换并保留旧安装，不覆盖失败状态或更换包管理器。此流程采用 CodeVault staged-immutable-installation 的“先验证、后切换”不变量，不引入版本注册表。

```bash
node tests/ux-e2e.cjs --preflight
SITE_E2E_INTERACTIONS_ONLY=1 node tests/site-e2e.cjs
node tests/site-e2e.cjs
```

预检只检查解释器、模块、Vite 和 Chrome，不启动应用或连接数据库。回归自动启动 loopback 临时 SQLite、模拟 Redis 和本地模型，拒绝复用被占用的 8009/5179 端口。快速回归覆盖 375/390/640px 下普通点击重试、请求次数及错误/分页状态清理；完整回归另覆盖路由和布局矩阵。原始隔离数据位于系统临时目录 `fastcore-ux-e2e-*`；结果 JSON、PNG 和重试几何数据另保存到仓库忽略的 `.local/acceptance/`。manifest 记录成功/失败、版本与工作区摘要，不导出原始日志、环境或数据库。

这些回归证明隔离环境中的应用行为；MySQL/Redis 恢复链路由上面的运行态脚本验证，真实供应商由下面的人工验收验证。

## 真实模型供应商最短验收

使用已授权且有专用测试数据的应用实例和现有 AI 对话页面，不另写供应商客户端，也不运行隔离 E2E 的本地模型替身。发送请求前确认模型配置指向目标供应商，明确本次请求成本、资料发送范围及当前账号授权。

1. 登录应用，打开 AI 对话，使用无敏感信息的新会话发送唯一标记，例如“只回复 PROVIDER-SMOKE-20261006”。
2. 确认真实流式回答完成、停止生成按钮恢复、无错误提示；记录请求时间、应用版本、模型名称、脱敏供应商请求 ID 和实际返回标记。仅配置页面成功或 HTTP 200 不代表已完成回答。
3. 刷新页面并打开该会话，确认回答恢复；如需证明知识检索，再上传仅含该标记的测试文档，待索引成功，询问标记并检查引用及恢复。

这条路径复用应用的模型适配、权限和持久化链路。CodeVault `ai-provider-compatibility` 的兼容性检查意图适用于验收边界，无需新增适配层；环境预检只借鉴尽早检查前提的原则，不复制 `auth-state-gate` 的账号状态模型。

当前仅完成本地执行入口和产物回归。真实供应商验收需目标应用实例、对应模型配置及调用授权；截至 2026-10-08 尚未完成应用供应商链路验收。10 月 3 日临时 MySQL/Redis 恢复验收曾通过，但不代表当前工作区重跑通过。

## 骨架增删改验收

运行 `uv run --no-sync python integration/skeleton_acceptance.py`。在副本中新增供应商业务、修改字段及校验，以真实浏览器验证保存、权限和重启持久化；然后物理删除 AI、范例和监控展示，创建不含 AI 专用依赖的独立 Python 环境，验证菜单清理、启动与前端构建。使用隔离 SQLite 和独立真实 Redis，不读取已有数据库或环境文件，不调用外部模型服务。依赖与证据边界见[模块开发指南](../../docs/MODULE_DEVELOPMENT.md)。
