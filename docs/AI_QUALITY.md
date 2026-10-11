# 回答反馈与检索质量评测

[文档目录](README.md) · [用量与模型验证](AI_USAGE_AND_MODEL_CHECKS.md) · [文档维护](DOCUMENT_MANAGEMENT.md)

AI 质量功能提供回答反馈、管理员处理和可重复的检索评测。反馈用于人工复盘；评测针对检索结果，不生成对话模型回答，也不会自动调整模型或训练参数。检索仍使用当前 embedding 配置，远程 embedding 可能调用外部服务。

## 回答反馈

用户可对自己已保存会话中的回答标记 `helpful` 或 `incorrect`，并填写最多 2000 字符的说明。反馈绑定 `session_id` 和 `run_id`，服务端核对回答归属与引用权限；历史记录中已不再保留的回答不能提交。反馈列表默认只展示当前用户的数据。

| 操作     | API（相对 API 前缀）            | 权限                                      |
| -------- | ------------------------------- | ----------------------------------------- |
| 提交反馈 | `POST /ai/quality/feedback`     | `module_ai:chat:ws`，自己的回答           |
| 查询反馈 | `GET /ai/quality/feedback`      | `module_ai:chat:ws`；查看全部需超级管理员 |
| 处理反馈 | `PUT /ai/quality/feedback/{id}` | 超级管理员及 `module_ai:retrieval:test`   |

处理状态为 `pending` 或 `resolved`。解决反馈必须填写处理说明，更新携带 `expected_revision`；并发版本冲突返回 409，避免覆盖其他管理员的处理。

## 检索评测

在检索页面的质量面板创建具名数据集，选择 1–20 个知识库、1–20 条用例和 `top_k`（1–20）。每条用例包含非空查询（最多 1000 字符）和 1–20 个预期文档 ID。后端检查知识库与文档访问权限。

`POST /ai/quality/evaluation` 执行评测，`GET /ai/quality/evaluation` 查询自己的历史；均需要 `module_ai:retrieval:test`。查询历史时再次检查数据权限。管理员反馈处理也位于质量面板。

| 指标     | 每条用例的定义                                            |
| -------- | --------------------------------------------------------- |
| Hit rate | 前 `top_k` 个结果是否命中任一预期文档，命中为 1，否则为 0 |
| Recall   | 命中的不同预期文档数 / 预期文档总数                       |
| MRR      | 第一个命中预期文档的结果排名的倒数；未命中为 0            |

总指标为各用例指标的算术平均。结果按分块返回，`top_k` 和 MRR 的排名按分块结果计算；同一文档多个分块可占多个位置。反馈数量和这些指标不直接衡量回答事实正确性。

报告保存用例结果、配置及 `dataset_hash`。比较历史时保持查询、预期文档、知识库范围、用例顺序和 `top_k` 一致；前端以相同 hash 寻找前次评测。文档内容、索引、检索模式和 embedding 版本也会影响结果，复盘时一并记录。

## 实现与验证

后端位于 `backend/app/plugin/module_ai/quality/`，模型通过 AI 清单注册，迁移为 `20261011_ai_quality`。检索复用 `KnowledgeService`，反馈复用已保存会话和引用校验；前端入口为检索页质量面板与回答反馈组件。

```bash
# backend/
.venv/bin/python -m pytest tests/test_ai_quality.py -q

# 仓库根目录，隔离浏览器链路
node frontend/tests/quality-e2e.cjs
```

这些检查使用测试数据库和确定性模型，覆盖归属、权限、版本冲突、指标及页面操作；真实供应商与生产数据效果见[测试与验收](TESTING.md)中的独立验收要求。
