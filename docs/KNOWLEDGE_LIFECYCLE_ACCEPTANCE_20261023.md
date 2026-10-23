# 知识文档生命周期重构验收

日期：2026-10-23（Asia/Shanghai）。基线：`1b88ee86aa76463d19df66ad9e3dcee4494739d3`，分支 `main`，未提交工作区。仓库包含其他已有修改；本报告仅覆盖知识文档生命周期的职责迁移及其直接调用方。

## 实现与保持条件

- `knowledge/document_lifecycle.py` 集中文档上传、替换、内容更新、索引重建、状态恢复、删除及跨存储清理；上传孤儿核对通过 `reconcile_orphan_uploads()` 进入，内部实现为 `_upload_recovery.py`。
- `KnowledgeService` 保留知识库 CRUD、文档只读与检索；知识库删除委托生命周期模块清理文档，并传递原有注入的存储依赖。
- Controller、两个恢复轮询任务、相关测试和隔离验收启动器均迁移到新入口。旧 Python 文档写接口与 `upload_recovery` 导入路径已移除，HTTP 路径、权限与响应语义保持。
- 保留 SQL 原子认领、租约、重试、提交结果不确定时保留文件，以及加锁后确认无引用再回收的行为。未新增依赖、队列、Leader 或数据库迁移。
- AST 比对确认：迁移后的 19 个类方法在归一化类名和辅助函数调用后与原实现一致；`_upload_recovery.py` 与原文件逐字节一致。

## 自动化验证

后端命令从 `backend/` 执行：

```sh
uv run pytest tests/plugin/module_ai/knowledge tests/test_upload_reconciliation.py tests/test_arch_knowledge_regressions.py tests/test_security_regressions.py tests/test_api_module_ai.py tests/test_ai_quality.py -q
.venv/bin/python -m unittest discover -s integration -p 'test_*.py'
```

结果：相关 pytest **177 项通过**，集成运行器 unittest **6 项通过**。pytest 默认使用临时 SQLite 与模拟 Redis；不能代替真实依赖验收。本次修改涉及的 12 个知识模块及回归文件通过 Ruff 检查、格式检查；`git diff --check` 通过。

提交前，将本次暂存内容导出为独立目录，排除其他尚未提交的工作区修改后，使用现有后端虚拟环境复跑同一组 pytest，结果为 **177 项通过（23.25 秒）**。隔离副本及日志位于 `/var/folders/lv/t5gkrrk97fg6p3849hl_ndmc0000gn/T/fastcore-lifecycle-staged-p33r0dyx/pytest.log`；本项只证明该提交内容在当前已安装依赖下的相关测试行为。此后仅调整两份集成脚本的三处导入排序，暂存内容中的 15 个 Python 文件均通过 Ruff 检查。

另启动专用临时 MySQL、Redis 实例，绑定本机随机非默认端口，运行：

```sh
.venv/bin/python integration/runtime_acceptance.py \
  --mysql-port 51553 --redis-port 51554 --disposable-services
```

全套验收返回 **0**。临时服务已停止，未使用业务数据库。

| 验收范围 | 结果 | 证据文件 |
| --- | --- | --- |
| HTTP 登录、权限拒绝、上传、索引、检索、下载、替换与删除清理 | PASS | `http-results.json` |
| 上传和替换提交/回滚回执丢失、忙事务跳过、生产恢复循环回收孤儿文件 | PASS | `verify-reliability-13794.json` |
| 真实索引进程 SIGKILL、SQL 租约接管、两次生产生命周期重启与停止 | PASS | `runtime-results.json`、`recovered-13966.json`、`recovered-13968.json` |
| 浏览器登录导航、新建知识库、上传、可检索状态、问答引用和刷新后历史 | PASS | `browser-results.json`、`browser-document.png`、`browser-citation-detail.png` |
| MySQL 原生备份/恢复、文件哈希和外键校验 | PASS | `backup-results.json` |
| 现有迁移的真实数据库升级与数据保留 | PASS | `migration-results.json` |

证据目录：

```text
/var/folders/lv/t5gkrrk97fg6p3849hl_ndmc0000gn/T/fastcore-integration-frn12ah_
```

本机启动器及日志：`/tmp/fastcore-lifecycle-real-acceptance.py`、`/tmp/fc-lifecycle-gpkk9wb2/acceptance.log`。审查输入的逐文件 SHA-256 清单：`/tmp/fastcore-lifecycle-review-manifest.json`，该清单的 SHA-256 为 `977090c790d8e93a1e0bfc3ee65f97f43d3c3c277c97701121b9395bceed0c90`。以上均为临时本地产物。

## 独立审查

使用未继承实现对话的新上下文只读审查，审查者在开始和结束时确认 HEAD 及清单内 17 个文件哈希一致，未发现本次重构引入的可确认缺陷。审查范围包括入口及 monkeypatch 迁移、HTTP 契约与权限、SQL 状态和认领、租约重试、提交不确定与清理顺序、双循环恢复，以及知识库删除的依赖传递。审查者另以纯内存检查确认删除时传递同一依赖对象、文档和知识库 ID，以及空库/非空库的提交归属。

审查者读取了运行结果及对应断言，没有再次运行上述 pytest、unittest 或真实服务。验收 JSON 自身未包含源码哈希，逐文件清单在验收完成后生成；不能声称运行记录与审查快照之间具有独立的源码哈希关联。

## 用户流程与验证边界

浏览器证据来自自动化页面操作：以管理员角色从菜单进入知识库，创建并上传文档，等待“可用于检索和问答”，选择知识库问答并打开引用，刷新后重新打开历史。已查看文档列表截图，上传入口、索引状态和后续操作可见。本次没有 UI 代码修改，也没有单独执行无预设路线的交互可用性走查；不将脚本运行结果表述为真实用户研究。

真实依赖验收覆盖 MySQL、Redis、HTTP、文件解析与 BM25。模型使用确定性的本地替身，未访问外部模型服务；真实 Embedding 与 Chroma 向量全链路、生产部署、长时间运行、UI 错误态与移动端文档编辑均未验收。知识测试中的临时真实索引检查仅证明其测试场景。

## 设计适配

CodeVault 本次可核验记录：查询 `scheduler-reconciliation`、`bounded-dispatcher`，查询 ID `d00225256a08401a9588155662b377fe`。实际评估并适配 `scheduler-reconciliation` 的 SQL 事实来源与轮询核对原则，继续使用现有 SQL 条件认领；不采用其全局 Leader 与进程内 Scheduler 投影。统计为 1 次查询、1 条适配决定；其他命中不计为已评估或采用。

消融检查保留了承担权限、事务和副作用顺序的生命周期入口，移除了旧写操作转发入口，未增加通用存储协议或框架。
