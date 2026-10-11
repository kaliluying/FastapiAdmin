# FastCore 品牌迁移

FastCore 不保留 `FastapiAdmin` / `fastapiadmin` 兼容别名。现有部署启用新版本前，必须完成数据库、应用配置、Redis 前缀、日志文件名和本地项目目录迁移。

## 迁移顺序

1. 停止后端、前端构建发布、文档索引任务和其他会写入数据库或日志的进程。
2. 备份关系库、私有文件、Chroma/BM25 索引和日志。备份文件放在应用目录外的私有位置。
3. 创建新数据库 `fastcore`，使用与旧库相同的字符集、排序规则和授权；导出旧库并导入新库。
4. 对比表结构、行数和关键业务记录，确认新库可读后再删除旧数据库。不要在源库仍有连接时删除。
5. 将环境文件的 `DATABASE_NAME` 改为 `fastcore`，`TITLE`、前端 `VITE_APP_TITLE` 和包名改为 `FastCore`。
6. 停止 Redis 写入后，清理旧的 `fastapiadmin:*`、`fastapi-admin-cache:*` 和自动登录前缀；新版本只使用 `fastcore:*`、`fastcore-cache:*` 和 `fastcore:auto_login:*`。Redis 缓存与锁不迁移。
7. 将 `fastapiadmin.log` 及轮转归档改名为 `fastcore.log`，然后启动新版本并检查日志、健康检查、登录和数据库读写。
8. 将本地 checkout 目录改为 `FastCore`，重新选择 IDE/Codex 中保存的项目路径；不要直接覆盖旧目录。

## 本项目开发环境记录

本仓库的开发库已从 `fastapi` 迁移为 `fastcore`：15 张表、111 条记录及有效表结构逐项核对后删除旧库。迁移前 SQL 备份和核对摘要位于本机忽略目录 `.local/rename-backup/`，不会提交到仓库。

本地项目目录为 `/Users/gml/code/FastCore`。31 个日志文件已改名并核对字节内容；历史日志正文保留原始记录，运行时新日志使用 `fastcore.log`。Codex 需要在项目列表中重新选择新路径。

## 验收

```bash
cd backend
.venv/bin/python -m pytest tests -q -p no:cacheprovider
.venv/bin/ruff check app tests main.py --no-fix --output-format concise
cd ../frontend
corepack pnpm test
corepack pnpm build
```

另外检查新库能登录、Redis `fastcore-cache` 能命中并过期、日志分析只读取 `fastcore.log` 及其归档。全库静态搜索不应再出现旧品牌字符串；历史日志压缩内容和私有迁移备份不属于源码搜索范围。
