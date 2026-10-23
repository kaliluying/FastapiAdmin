# AI 用量、调用额度与模型能力验证

[文档目录](README.md) · [质量评测](AI_QUALITY.md) · [测试与验收](TESTING.md)

模型配置页可用当前输入验证普通回答、流式输出和工具调用，使用同一 LangChain Provider 适配器，不保存临时配置。按钮明确说明最多发出 3 次供应商调用，会计入额度并可能产生供应商费用。每项 20 秒超时，不执行工具；工具验证必须实际返回指定工具及合法参数。模型列表仅用于选择，不能证明能力。测试使用 SDK HTTP/SSE 替身，没有执行真实付费供应商请求。

## 用量与额度

- 本人接口 `GET /ai/chat/usage` 需要 `module_ai:chat:ws`，只按认证用户查询，外部 `user_id` 参数不能改变查询对象。聊天页和模型页复用用量面板。
- 管理接口 `GET /ai/chat/usage/admin?user_id=...&day=YYYY-MM-DD` 需要模型查询权限且必须是超级管理员，可选择用户与统计日期；返回各模型、用途、状态的调用数、供应商返回的 Token 和平均毫秒耗时。
- `PUT /ai/chat/usage/quota/{user_id}` 需要模型更新权限且必须是超级管理员。`daily_limit=null` 默认不限；`0` 禁止后续请求；大于 0 限制每日调用次数。修改额度不会清零已用次数。
- “每日”固定使用 `Asia/Shanghai` 自然日，账本起始时间使用 UTC，跨日请求计入开始预留时的日期。
- 普通回答、流式输出、日志工具规划/后续分析每次供应商请求、后台记忆提取、能力验证全部计量。一次用户提问可能产生多次调用。失败与取消也消耗调用次数，因为供应商可能已执行并计费。
- 先在独立数据库事务中原子增加当日次数、写入 `pending` 调用账本，再请求供应商。额度判断与增加在同一条数据库 UPDATE 中，不能通过并发请求越额。存储不可用时不发送模型请求，避免绕过额度。
- SDK 自动重试关闭，一个账本记录对应一个应用供应商调用。用户重试是新调用；供应商自身内部重试不属于应用可见边界。
- 完成/失败/取消后独立写入结果，不受聊天会话回滚影响。结果更新最多等待 3 秒，失败或超时不会丢弃已预留记录，也不会导致回答失败；保留 `pending`，管理员可看到未收敛调用。进程被强制退出也可能留下此状态。
- Token 只读取 SDK 归一化用量或 Provider 返回的字段。缺少返回值保持 `null`，面板显示未知及未知次数；已知 Token 合计仅覆盖返回用量的调用，不推测未知调用，也不推测价格和金额。
- 不保存 Prompt、供应商响应、API Key 或错误正文到账本。

## 设计与验证边界

适配 CodeVault `ai-provider-compatibility` Pattern 的意图：供应商差异集中在已有 Adapter，能力检查和账本直接复用它，不新增 HTTP 客户端或自动 fallback。事务、额度与未知用量藏在 `chat/usage.py`，没有新增纯转发 Service。数据表注册于 `chat.usage_model`，迁移 `20261011_ai_usage` 接在文档管理迁移之后。

可重复验证：

```bash
cd backend
.venv/bin/python -m pytest tests/test_ai_usage.py tests/test_ai_capabilities.py tests/test_ai_usage_api.py tests/test_ai_chat_service.py tests/test_ai_log_analysis.py tests/test_ai_log_followup.py -q
cd ../frontend
corepack pnpm exec vitest run src/views/module_ai/model-config/model-usage.spec.ts
corepack pnpm exec vue-tsc --noEmit
```

SQLite 真实 SQL 回归覆盖 20 路并发、额度为 0、身份隔离、失败、取消、流式提前关闭、工具多轮、后台记忆标记、结果写入失败保留账本；HTTP/SSE 替身覆盖 OpenAI Chat Completions、Responses 和 Anthropic 三协议及用量解析。这些 SQLite 回归不证明正式支持的 MySQL/PostgreSQL 并发行为；真实供应商行为和实际计费也需在相应环境验收。隔离浏览器入口为 `node frontend/tests/model-usage-e2e.cjs`（仓库根目录）；单元测试不能代替完整 UI 验收。
