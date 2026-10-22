# 后端架构审查修复与验收记录

日期：2026-10-22（Asia/Shanghai）。

范围：本次后端架构审查确认的 15 项问题。保留单组织、显式模块注册的模块化单体，以及生产启动自动迁移策略。工作基于 `main` 的已有脏工作区，保留此前修改；本次未提交。

结论：清单 ID 1-15 的修复及对应回归均为 **PASS**，两组独立审查已完成，无待处理的 P1/P2。完整文档浏览器脚本在扫描 PDF OCR 处为 **BLOCKED**；该限制不作为扫描 PDF 已验收通过的证据。

## 修复清单

| ID | 级别 | 问题及修复 | 回归证据 |
| --- | --- | --- | --- |
| 1 | P1 | HTTP、WebSocket、ticket 会话使用 Redis 中的不可变用户 ID 加载用户；非流式聊天重载也使用同一 ID。缺失或非法 ID 拒绝认证。 | 用户改名且旧用户名被复用、非法 ID、单次 ticket、非流式调用方回归 |
| 2 | P1 | 种子只为本次新建的用户、角色添加默认关联，已有实体的撤权在启动后保留。 | 撤销角色菜单和用户角色后重复初始化；新增实体仍获得默认关联 |
| 3 | P1 | 下载接口移除删除副作用，保持 `file_path` JSON 对象结构；旧请求中的 `delete=true` 不会删除文件。 | 真实 HTTP 下载返回原内容，响应后源文件仍存在 |
| 4 | P1 | 共享 CRUD 不再把数据库异常拼入公开文案。SQLAlchemy 异常交给既有安全 HTTP 映射，其他异常使用固定文案。 | 唯一约束冲突返回安全 409；原始异常和参数不进入公开文案 |
| 5 | P1 | 在 Alembic 配置边界转义 URL 百分号，避免编码密码被 ConfigParser 当成插值。 | 含 `%40`、`%25` 的合成 URI 进入迁移上下文后保持原值 |
| 6 | P2 | 单个数据库依赖生成器拥有请求事务，不再通过嵌套生成器转发。 | 异常、取消和 commit 失败在传播前完成 rollback 与 session 关闭 |
| 7 | P2 | 部分启动失败进入清理，关闭阶段逐项尝试全部资源及模块 hook；保留原始异常。 | 启动五个失败点、关闭失败与请求原始异常组合、多个关闭 hook |
| 8 | P2 | 健康路由独立于业务 Redis 限流注册。live 不查 Redis；ready 报告依赖状态；业务接口继续限流。 | Redis 可用/不可用的探针回归；真实 Redis 上业务 429 和窗口恢复 |
| 9 | P2 | CLI migrate/upgrade 与启动共用 Redis schema 锁。父进程持锁，迁移子进程只执行迁移。 | CLI 两入口、子进程不重复加锁和 seed；真实 Redis 锁串行化 |
| 10 | P2 | 后台记忆按短读事务、模型调用、短写事务分离。后续补充改为与聊天同事务保存持久任务，每进程 4 个 worker，满载排队、失败重试、租约过期接管。直接服务调用保留调用方事务语义。 | 单连接池在模型等待时仍可查询；持久排队、用户顺序、原子完成、用户隔离及 shutdown |
| 11 | P2 | 聊天列表先执行 SQL count、offset/limit，再格式化当前页。排序增加 ID 作为平局判定。 | 用户/标题/软删除过滤、页边界、非法分页、SQL LIMIT、格式化数量 |
| 12 | P2 | 审计覆盖完整路由生命周期，包含权限/校验/业务异常、commit 失败、后台及流式失败；最终 HTTP 失败或异常时统一省略请求和响应正文，保留状态及安全异常类型。 | 11 个独立审计失败场景，包含有正文的 409/503 提交失败及普通后台/流式失败，以及既有后台任务、AI 内容省略回归 |
| 13 | P2 | 菜单编辑先保存旧状态，再调用与批量启停一致的级联逻辑。 | 编辑启用、禁用与关联菜单状态回归 |
| 14 | P2 | 文档上传/替换在 commit 前 SQL 或元数据异常、取消时补偿本次新文件，保持旧文件；commit 结果不确定时保留文件，后续补充由归属事务锁与完整引用核对安全回收孤立文件。 | 上传/替换 SQL 失败、实际 Task.cancel、rollback 失败、commit 不确定、refresh 失败及上传文件恢复 |
| 15 | P2 | 知识库同步 getter 和 DNS 校验移到工作线程，首次缓存构造及 BM25 延迟打开增加进程内互斥。保留原同步入口和 SSRF 策略。 | 各检索模式线程位置、8 线程首次获取、DNS 策略和异步调用回归 |

下载回归还发现一个直接阻塞验收的兼容问题：`UploadFileResponse` 传入当前 Starlette 已移除的 `method` 参数。已移除此参数，并由同一 HTTP 下载回归验证。

新增回归集中在 `backend/tests/test_arch_*_regressions.py` 六个文件，共 78 项。认证测试夹具补充有效 `user_id`；AI 配置校验测试夹具适配 async 入口，保留原有断言目的。

## 验证记录

后端命令从 `backend/` 运行；浏览器命令从 `frontend/` 运行。测试未读取现有业务数据库。

| 检查 | 结果与边界 |
| --- | --- |
| `.venv/bin/python -m pytest tests -q --tb=short` | 最终冻结版本 **653 passed，13 warnings，264.94 秒**；包含 78 项新增架构回归 |
| AI 调用方、SSE、UX、日志分析组合回归 | 86 passed；覆盖最后补充的调用方改动 |
| 新增审计回归、既有审计及日志追问回归 | 50 passed；覆盖独立审查补充的最终状态和正文省略 |
| `.venv/bin/ruff check app tests integration main.py --no-fix --output-format concise` | PASS |
| `git diff --check` | PASS |
| `.venv/bin/python -m unittest discover -s integration -p 'test_*.py'` | 3 passed；验证集成脚本目标保护 |
| `integration/runtime_acceptance.py` | PASS；独立全新本机 MySQL 8.4、真实 Redis、生产生命周期和 BM25 |
| `node tests/ux-e2e.cjs` | PASS；附件/RAG/SSE/引用、历史恢复、停止、模型失败重试、390px 输入区 |
| `node tests/documents-e2e.cjs` | 部分通过；TXT 上传/分块分页、全文修改/重建/检索/认证下载、替换文件、DOCX 表格检索已通过。扫描 PDF 因本机缺少 Tesseract 阻塞，整个脚本未通过 |
| `node tests/route-lifecycle-e2e.cjs` | PASS；正常登录恢复授权路由、刷新/菜单刷新、多段根菜单、退出注销动态路由、重新登录及延迟窗口后使用 |

真实依赖验收使用全新临时 MySQL datadir、随机 loopback 端口和脚本生成的临时数据库，覆盖自动迁移、重复重启保留数据、Redis owner fencing、启动锁串行化、健康探针、业务限流及真实索引进程 SIGKILL 后的持久任务恢复。验收后临时服务已停止。

13 项 warning 来自既有 422 状态常量弃用及菜单序列化提示，本轮未扩展处理这些提示。最终全量日志位于本机 `/tmp/fastcore-arch-pytest-acceptance.log`。

普通用户视角走查为 AI 模拟走查：从工作台正常登录并进入 AI 对话，检查空态、发送/完成反馈、新对话、无匹配历史提示、搜索及刷新后重新打开会话；文档管理入口及空态可用。所走任务未发现阻碍完成的问题。该走查使用隔离 SQLite、模拟 Redis 和确定性本地模型，不代表真实首次用户研究。

## 独立审查与版本

开始时保留了源文件快照和 SHA-256；实现与用户此前改动分开比较，未以 HEAD 差异替代本次基线。

- AI、文件补偿、分页和下载：全新上下文只读审查完成，未发现阻塞 P1/P2；另执行了隔离取消、任务上限和多线程初始化检查。
- 认证、审计、种子、生命周期及最后补充的聊天调用方：首轮发现一项 P2，已复现并修复。提交失败被异常处理器转换为 409/503 时，原审计可能残留未发送的成功响应；普通后台/流式失败也可能保留请求正文。现在按最终状态和异常统一省略失败正文；第二轮独立复验通过，原 P2 已关闭，无新增 P1/P2 阻塞问题。
- 第二轮审查独立运行相关测试 50 passed，并复验 500/409/503 提交失败、已发送 202/206 的后台/流式失败，以及成功脱敏、内容 opt-out、直接错误响应、禁用审计和忽略路由等兼容行为。

本机基线、候选快照和逐文件哈希位于：

`/var/folders/lv/t5gkrrk97fg6p3849hl_ndmc0000gn/T/fastcore-arch-fixes-_krmsz6u/`

## 证据位置

- 真实 MySQL/Redis：`/var/folders/lv/t5gkrrk97fg6p3849hl_ndmc0000gn/T/fastcore-integration-vf90chxf/runtime-results.json`
- 脱敏运行态结果、当前源文件哈希及用户走查记录：`.local/acceptance/architecture-20261022-439v1as_/`
- 聊天浏览器：`.local/acceptance/2026-10-21-b5ohkp/`
- 文档浏览器：`.local/acceptance/2026-10-21-Jh737s/documents-results.json`
- 授权路由浏览器：`.local/acceptance/2026-10-21-cTpP6a/`
- 普通用户走查隔离实例：`/var/folders/lv/t5gkrrk97fg6p3849hl_ndmc0000gn/T/fastcore-arch-userwalk-e83o4pyd/`

`.local/acceptance` 为忽略的本机验收产物。目录中的日期由执行器生成；本报告日期使用 Asia/Shanghai。原始日志、临时数据库等只供本机诊断，分享时优先使用脱敏结果与截图。

## 剩余边界

- 未验证 PostgreSQL、真实外部模型供应商、真实向量模型下载/Chroma 完整向量链路、生产发布及滚动版本兼容。
- 完整文档浏览器验收仍受 OCR 环境限制；未安装或修改全局 OCR 运行环境。
- 后续可靠性补充已覆盖新格式上传文件的自动回收；历史纯 UUID 文件及归属行物理删除的文件保守保留，需离线核对。
- 后续可靠性补充已将记忆提取改为持久化队列，满载不跳过，进程强制退出后由租约恢复；独立审计仍不保证在进程被强制终止时落盘。

后续补充的设计、迁移、恢复条件及验证入口见 [AI 后台任务与上传文件恢复](AI_BACKGROUND_RELIABILITY.md)。本报告上方的 653 项通过是补充前的架构验收记录，不能替代补充后的回归结果。
