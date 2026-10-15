# AI 对话流协议

当前管理端使用 `POST /ai/chat/stream` 返回 SSE，每条回答对应一次 HTTP 请求。沿用现有 Bearer 令牌、角色权限、知识库数据范围及模型配置，不需要单独申请 WebSocket ticket，也没有新增依赖。

## 请求与事件

请求为 `ChatQuerySchema` JSON，包含 `request_id`、`message`、可选 `session_id`、`files`、`knowledge_base_ids` 和日志追问上下文。实际部署路径包含统一 API 前缀，例如 `/api/v1/ai/chat/stream`。请求仍使用 `module_ai:chat:ws` 权限码，避免已有角色失去聊天权限；旧 `/ai/chat/ws` 和 ticket 接口保留兼容。

HTTP 200 响应为 `text/event-stream`。每个 `data:` 帧包含一条 JSON 事件并带回 `request_id`：

| 事件                       | 含义                                          |
| -------------------------- | --------------------------------------------- |
| `stage`                    | 检索、生成、查询日志或分析阶段                |
| `chunk`                    | 本次回答的文本片段                            |
| `citations`                | 本次回答依据                                  |
| `tool_call` / `log_result` | 日志工具调用与查询摘要                        |
| `warning` / `error`        | 降级提示或失败原因                            |
| `done`                     | 正常结束；可携带会话、回答或日志追问上下文 ID |

普通对话只有在回答与引用完成数据库提交后才发送 `done`；日志分析沿用不保存到普通会话的规则。流关闭但未收到终态时，界面标记中断，并允许用户手动重试。已经收到 `done` 的回答不会因连接尾部错误被改为失败。

## 生命周期与失败处理

前端通过现有 Axios 请求实例的 Fetch adapter 读取响应流，保留公共认证与错误处理。开流前的过期令牌可按已有流程刷新并重发；开始读取回答后不会自动重发，以免重复生成或重复计费。响应头确认前保留原草稿；确认后仅清空仍与已发送内容一致的草稿，用户新输入会保留。

停止、切换会话或离开页面使用 AbortController 取消本次请求。后端主动监听断开，包括模型尚未返回片段的等待阶段，并逐层关闭 ChatService、RAG 和 SDK 生成器，等待用量账本收尾及数据库会话退出。取消并非撤销已经提交的回答，也不能撤销供应商已产生的费用。

后端使用容量为 1 的队列限制慢消费者缓冲，每 15 秒发送注释心跳。流使用独立数据库会话，避免依赖于 HTTP 鉴权阶段已关闭的会话；异常清理期间不再向已失去消费者的队列写入。请求正文和回答从操作审计载荷中省略。

响应设置 `Cache-Control: no-cache, no-transform` 和 `X-Accel-Buffering: no`。生产反向代理还需允许长响应并及时转发事件；当前本地浏览器验收不证明生产代理的缓冲、压缩或超时行为。

实现参考 CodeVault `patterns/sse-connection-manager` 的有界缓冲与断开清理原则。本项目每次请求只有一个回答流，复用 ChatService 事件即可，不需要新增订阅、广播或全局连接管理。

## 验证与证据（2026-10-14）

后端全量回归 561 项通过；补充清理异常分支后，SSE 定向回归 7 项通过。覆盖认证、请求校验、帧编码、心跳、慢消费者、等待模型时断开、嵌套 SDK 关闭顺序及清理异常不阻塞。真实角色回归同时验证 SSE 和旧 WebSocket 的知识库创建者范围。

前端全量 185 项通过，类型检查与构建通过。新增回归覆盖 UTF-8 分块、CR/LF 分帧、多行数据、截断、令牌刷新、取消不重发、错误响应释放、完成后尾部错误及草稿保护。改动文件的 Ruff、ESLint、Stylelint 与 Prettier 检查通过。

真实 Chrome 在隔离 SQLite、模拟 Redis 和确定性模型下验证了对话、附件进入 RAG、引用与历史持久化、停止生成、失败重试、新草稿保留、日志分析、用量与反馈。事件证据来自实际 HTTP 响应体。浏览器截图与 JSON 保留在忽略目录 `.local/acceptance/`，每次运行都有工作区差异摘要。

```bash
# 从仓库根目录执行，各脚本顺序运行
node frontend/tests/ux-e2e.cjs
node frontend/tests/log-analysis-e2e.cjs
node frontend/tests/model-usage-e2e.cjs
node frontend/tests/quality-e2e.cjs
```

以上检查没有访问生产数据库、真实 Redis、远程 embedding 或付费模型供应商，也没有发布或部署。
