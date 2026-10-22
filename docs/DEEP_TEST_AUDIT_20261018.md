# 深度测试与遗留代码审计（2026-10-18）

## 范围与结论

基线：`7e42322d9c265d3d1a1163b5539381ab942e0a20`，`main`，开始时工作区干净。本次修改未提交。

针对单组织后台的认证与权限、模块注册、上传与知识库、菜单转换和注册、AI 流式对话及测试入口进行审计；后端与前端分别由只读子代理检查，整合后由不继承实现对话的独立子代理审查完整差异及必要调用链。

修复三个产品缺陷和一处失效验收脚本，清理有引用证据的遗留代码。最终后端 **576 项**、前端 **191 项**、工具链 **10 项**测试通过。没有删除测试文件或有效业务断言，没有添加 skip/xfail 或降低检查要求。扫描 PDF 浏览器验收受 OCR 环境阻塞，未将整套文档验收计为通过。

## 修复与删除证据

| 问题 | 原行为与证据 | 本次处理与回归 |
| --- | --- | --- |
| 上传重名误删已有目标 | `save_upload_stream` 的 `xb` 打开失败后仍无条件 `unlink`，会删除已有文件或符号链接。通用上传和知识库都调用这一入口 | 独占创建成功后才取得清理归属。3 个上传入口 × 普通文件/符号链接，共 6 项保留已有内容回归 |
| 取消上传遗留部分文件 | `CancelledError` 不进入原有 `except Exception`，临时文件残留 | 在 `finally` 清理由本次创建但未完成的目标，取消继续传播。新增取消回归，保留尺寸/read/write 失败清理检查；同步取得文件归属避免异步打开与归属标记之间的取消窗口，正文仍异步写入 |
| 一级多段菜单路径被截断 | 后端允许 `/tools/reports`，转换器却注册成 `/tools`。新增真实 Vue Router 回归先失败，修后通过 | 保留完整路径，测试注册、导航、注销及静态壳保留；浏览器进一步通过实际 API 保存菜单、侧栏点击、刷新恢复和登出清理验证 |
| 日志追问验收仍依赖旧传输 | `log-followup-e2e.cjs` 监听 WebSocket，并等待已不再显示的“已连接”；当前产品使用 POST + SSE、“就绪” | 复用现有 `observeSse` / `drainSse`。保留立即追问、上下文失效、降级不落库、HTTP 追问、审计脱敏全部断言，隔离浏览器通过 |

删除前用包含隐藏文件的全仓搜索核对代码、测试、配置、文档和动态注册；排除 `.git`、`.codegraph`、依赖目录、构建产物及验收产物。

- 后端 `ws_db_getter`、`get_current_user_ws`、`_verify_token`：只有定义和这组函数内部的引用。实际 HTTP 使用 `get_current_user`；实际兼容 WS 使用 `_resolve_ws_auth → _verify_ws_ticket → _verify_session`。模块清单没有按名称装载被删函数，认证及 WS 回归仍通过。
- 前端 `AuthAPI.createWsTicket`：仅定义和无消费者的页面测试 mock；`VITE_APP_WS_ENDPOINT`：仅三份环境文件、类型声明和隔离启动赋值，没有运行态读取。删除这些项及页面测试中的闲置 WebSocket stub，保留页面测试。
- `normalizeMenuNestedPaths`、`normalizeAppRouteChildPaths` 及唯一辅助函数：计算规范路径但从不写回，只重复复制树。`mapMenuNode` 已重建树，真正路径规范化在 `MenuProcessor.normalizeMenuPaths`。删除前后保持路径、组件、按钮过滤、输入不变及子列表独立的契约测试。
- Ruff 清理一个未使用的 `select` 导入和三处导入排序。历史迁移仅整理导入，未改变迁移逻辑或删除历史脚本。

明确保留：后端 WS/ticket 兼容接口及鉴权、注销、权限撤销测试；旧会话形状、历史迁移和已裁剪模块不再注册的回归。这些仍约束当前兼容性和安全行为，名称带 `legacy` 不构成删除理由。没有因缺少静态调用就删除公共 API、ORM 字段、装配钩子或持久化数据。

## 验证结果

命令从对应子项目目录执行；浏览器脚本从仓库根执行。

| 检查 | 结果 |
| --- | --- |
| 基线 `TESTING=1 ENVIRONMENT=dev .venv/bin/pytest -q tests` | 566 passed，12 warnings |
| 最终同一后端全套命令 | 576 passed，12 warnings，约 249 秒 |
| 10 项新增上传检查替换回 HEAD 旧函数，仅在进程内替换 | 7 failed（6 碰撞 + 1 取消）、3 passed（原有尺寸/read/write 清理保护），未回滚工作区 |
| 安全、auth_session、ai_chat_ws、ai_chat_ux 局部回归 | 79 passed |
| `corepack pnpm test` | 46 文件、191 passed；基线为 190 passed |
| `corepack pnpm build` | vue-tsc 和生产构建通过 |
| `corepack pnpm run test:tooling` | 10 passed，无 skip |
| `.venv/bin/ruff check . --no-fix --no-cache --output-format concise` | 通过；基线有 4 处导入问题，均已修复 |
| `corepack pnpm exec eslint "src/**/*.{vue,ts,js}"` | 0 error；既有登录背景组件 1 处多空行 warning，未扩展为无关格式化 |
| 10 个改动前端 TS/CJS 文件定向 Prettier、`git diff --check` | 通过 |
| `.venv/bin/python -m unittest discover -s integration -p 'test_*.py'` | 3 项安全前置检查通过，未连接真实服务 |
| `node frontend/tests/ux-e2e.cjs --preflight` | 依赖与 Chrome 可用 |
| `node frontend/tests/log-followup-e2e.cjs` | 通过，含 375/1440px 明暗截图 |
| `node frontend/tests/route-lifecycle-e2e.cjs` | 通过，含新增多段路径持久化、侧栏导航和刷新恢复 |
| `node frontend/tests/documents-e2e.cjs` | 未整体通过：TXT 上传/分块分页、全文纠错/重新索引/下载、文件替换、DOCX 表格检索均通过，随后扫描 PDF OCR 失败 |

新增路由浏览器断言的首轮曾在导航完成前检查旧页面 URL；修为明确等待目标 URL 后重跑通过，没有放宽产品结果断言。失败产物仍保留。

测试没有生成行覆盖率百分比；覆盖保留依据是原测试全部保留、新增用例能够击中旧缺陷、修复后完整回归通过，不将测试数量当作行覆盖率。

## 用户视角走查与证据

可用性：AI 模拟已知测试账号的管理员，通过实际页面完成任务，不代表真实首次用户研究。

| 用户目标 | 入口和实际反馈 | 状态 |
| --- | --- | --- |
| 查询运行日志 | 登录 → 首页“AI 对话”入口；空态给出可直接查询运行日志的说明；发送后显示“正在分析日志证据”和“生成中”，结束后回到“就绪” | PASS |
| 继续缩小时间范围并确认依据 | 输入“继续缩小到5分钟” → 回答 → “查看 1 条依据”；依据面板显示“最近 5 分钟 · ERROR”，保留关键词与请求 ID | PASS |
| 结束日志追问 | 关闭依据后点击“结束日志追问”；恢复普通查询说明，消息仍可见 | PASS |
| 打开多段地址菜单 | 浏览器回归从侧栏点击新增菜单，页面、标签和路由保持一致；刷新可恢复，登出移除动态路由 | PASS |

本次走查没有发现阻碍上述目标的问题。未覆盖辅助技术、所有设备及其他页面。手动走查的临时启动器在退出时因 `node -e` 没有脚本路径导致自动保留产物报错；实际操作和手动截图已保存，临时服务已关闭，不将该启动器运行算作额外自动化通过项。

本机证据位于忽略目录，新克隆不会包含：

- [日志追问结果](../.local/acceptance/2026-10-18-Zrmh0h/log-followup-results.json)、[手动走查截图](../.local/acceptance/2026-10-18-Zrmh0h/manual-log-followup.png)
- [路由生命周期结果](../.local/acceptance/2026-10-18-wAhytU/route-lifecycle.json)、[多段路由截图](../.local/acceptance/2026-10-18-wAhytU/multi-segment-route.png)
- [文档部分成功与 OCR 失败](../.local/acceptance/2026-10-18-sYFgGv/documents-results.json)

## 剩余障碍与边界

1. 当前 `pdftoppm` 可定位，`tesseract` 不在可执行路径；扫描 PDF 还要求中英文语言包。没有删除或跳过 OCR 断言，也没有安装系统软件。补齐独立 OCR 环境后重跑 `documents-e2e.cjs`。
2. 后端单测使用临时 SQLite、模拟 Redis；浏览器使用真实页面/API/持久化、隔离 SQLite/本地 BM25 和确定性模型。没有验证真实 MySQL/PostgreSQL、Redis、Chroma 服务恢复、远程 embedding/模型供应商、生产反代或部署。本次没有调用外部模型。
3. 上传回归覆盖文件名碰撞、符号链接、尺寸、读写错误和协程取消；没有演练进程强杀、断电、网络文件系统或外部进程同时替换目标路径。
4. 基线和最终均有 12 条 Starlette 422 弃用及 Pydantic 菜单序列化 warning；前端有 Vite 配置未来 native loader 警告。它们未导致当前测试失败，未通过屏蔽警告处理。
5. 审计深查上述高风险路径并运行全套已配置测试，不代表对全仓每个导出或动态调用作出“绝无遗留代码”的证明。未提交、推送或发布。
