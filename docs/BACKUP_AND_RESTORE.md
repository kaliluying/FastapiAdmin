# 数据备份与恢复

[文档目录](README.md) · [后端部署](../backend/README.md) · [测试与验收](TESTING.md)

提供独立离线 CLI，不启动应用、不迁移数据库，也不直接覆盖正在使用的数据。所有命令从 `backend/` 执行。

## 备份范围与一致性前提

备份包含选定环境的完整关系数据库、`storage/knowledge` 原件、私有上传目录、Chroma 持久化目录及 BM25 索引。数据库使用 SQLite backup API、MySQL `mysqldump` 或 PostgreSQL `pg_dump` custom 格式，保留数据库原生结构和数据，不通过 JSON 重建表。

**必须先停止所有后端实例、文档处理/索引工作进程及其他数据库和文件写入方，等待任务收尾。** `--writers-stopped` 是操作人的明确确认，程序无法证明停机。分别复制正在写入的数据库与索引无法获得跨存储一致快照；MySQL `--single-transaction` 也不能解决跨文件和非事务表一致性。不得在备份期间进行 DDL。

不备份环境文件、`SECRET_KEY`、连接凭据、日志、Redis 会话/限流缓存、模型下载缓存或代码。配置和密钥必须通过独立的受保护渠道保管；恢复 AI 模型密钥需要与备份时相同的 `SECRET_KEY`。数据库仍包含用户密码哈希、加密 API 密钥、聊天及业务数据，原件也可能敏感，备份不可放进 Web 静态目录、Git 或公开网盘。ZIP 本身不加密；应保存到私有加密磁盘/备份存储。

备份文件权限为 `0600`；恢复根目录为 `0700`，文件为 `0600`。源路径、子项和目标路径禁止符号链接；仅接受普通文件和目录。源、备份及恢复目录应由可信管理员管理，备份期间不得改动。自定义配置可能使用相对目录，命令须在 `backend/` 下执行，保持与应用相同的工作目录。

## 创建与检查

先在项目外准备私有备份目录，确认当前环境文件指向的数据库和存储是需要备份的目标，再执行：

```bash
umask 077
mkdir -p /private/fastcore-backups
uv run python -m app.scripts.backup create --env=prod \
  --writers-stopped --output=/private/fastcore-backups/2026-10-11.zip
uv run python -m app.scripts.backup verify /private/fastcore-backups/2026-10-11.zip
```

目录示例须替换为实际可写的私有磁盘路径。已有输出不覆盖；输出不能位于被备份的存储源内。失败时不会发布 ZIP，暂存文件自动清理；进程被强制终止可能留下 `.backup-*` 私有暂存目录，确认无活动进程后人工清理。

MySQL/PostgreSQL 需要与数据库服务版本兼容的 `mysqldump`/`pg_dump`。CLI 不安装系统软件；缺少工具、权限不足或连接失败会中止。MySQL 备份账号需要读取表及导出触发器、存储过程和事件的权限。密码不会进入命令参数、清单或正常日志；工具错误文本被隐藏，避免意外打印连接信息。

清单记录格式版本、UTC 创建时间、停写前提、数据库类型、存储存在情况、所有文件大小和 SHA-256。验证拒绝缺失/额外文件、长度或摘要变化、重复条目、路径穿越和特殊文件。**SHA-256 用于发现损坏，不证明备份来源可信**；清单和文件一起被恶意重写不能被此机制识别。只恢复可信管理员保管的备份。

## 恢复到新的离线目录

```bash
uv run python -m app.scripts.backup restore \
  /private/fastcore-backups/2026-10-11.zip \
  --target=/private/fastcore-restore-drill
```

恢复目标必须不存在，父目录必须已存在。程序先校验整个归档，在私有暂存目录恢复并复核摘要，SQLite 再执行 `integrity_check`，最后发布完整目录。失败不会覆盖目标或现有应用数据；同目标并发恢复会被锁拒绝。强制终止可能残留 `.restore-*` 和 `.目标名.restore.lock`，确认恢复进程已退出后再清理。

恢复目录结构：

```text
fastcore-restore-drill/
  database.db        # SQLite；MySQL 是 database.sql；PostgreSQL 是 database.dump
  knowledge/         # 存在时恢复，包含空目录
  upload/
  chroma/
  bm25/
```

CLI 到这里完成离线文件恢复，**不会连接或导入 MySQL/PostgreSQL，也不会切换生产实例**。先使用隔离目标完成下面的数据库恢复与检索演练，再安排受控停机切换。不要向已初始化或有数据的数据库导入，也不要执行开发启动或 bootstrap 预先建表。

## 数据库恢复演练

### SQLite

直接用恢复的 `database.db` 查询关系表并检查约束。隔离应用配置中 `DATABASE_TYPE=sqlite`，`DATABASE_NAME=/private/fastcore-restore-drill/database`（应用会追加 `.db`）。不要把生产环境文件改成演练配置。

### MySQL

由管理员在隔离服务新建专用的空数据库和最小授权账号。核对 `information_schema.tables`、`routines`、`triggers` 与 `events` 中该库均为空，记录目标主机、端口和数据库名。通过 `mysql --login-path=restore-drill` 或权限 `0600` 的客户端配置文件提供连接信息；不要把密码写到 shell 参数。向空库导入，例如：

```bash
mysql --login-path=restore-drill --database=fastcore_restore_drill \
  < /private/fastcore-restore-drill/database.sql
```

示例登录路径和数据库名必须事先由管理员设置。MySQL DDL 不保证全导入回滚，失败可能留下部分结构；失败目标不能继续作为完整恢复结果，只能重新准备新的空库重试。导出包含触发器、过程及事件，导入前审查其执行权限及 DEFINER；隔离演练服务关闭 event scheduler，避免执行定时事件。

### PostgreSQL

在隔离服务以 `template0` 创建新的空数据库，使用专用账号及私有 `.pgpass`/服务文件配置连接。核对目标数据库没有用户表、视图、序列和函数，不使用 `--clean` 删除既有对象：

```bash
pg_restore --dbname=service=restore-drill --exit-on-error --single-transaction \
  --no-owner --no-acl /private/fastcore-restore-drill/database.dump
```

`--no-owner --no-acl` 让空库中的对象归恢复账号所有；生产授权须单独审查后重建。扩展、所有权、字符集/排序规则和服务端版本兼容性需要在隔离服务验证，不能仅靠文件校验判定成功。

## 文件、索引与上线验收

演练和上线均须保持四类存储同一份备份。知识原件应部署到目标后端的 `storage/knowledge/`；上传目录、`CHROMA_PERSIST_DIR`、`BM25_INDEX_DIR` 按目标配置映射到恢复后的目录，禁止逐个覆盖当前活动目录。历史数据库可能仍有旧绝对原件路径，换部署路径时须检查相关记录；当前新增记录使用根目录相对路径。

在与备份兼容的应用/Chroma/Whoosh 版本下完成：

1. 查询用户/文档/分块及其关系，核对数量、状态和抽样内容；检查数据库约束。
2. 下载或打开知识原件和上传文件，核对摘要。
3. 使用已存向量查询 Chroma，使用关键词查询 BM25，确认两者命中文档与关系库记录对应。
4. 在隔离应用执行登录、文档列表、原件下载和一次带来源引用的知识库问答；确认必要权限及模型密钥可解密。真实模型调用需要单独授权的供应商凭据及预算。
5. 停机切换数据库和所有存储后再启动生产应用；保留旧环境供回退，且不要把切换后的新写入回滚丢弃。Redis 会话不随备份恢复，用户须重新登录。

磁盘校验和索引查询成功不等于生产问答已验收。备份工具不自动安装依赖、迁移数据库、重建索引、管理保留策略或定时任务；这些由现有运维方式承担。

## 自动验证与设计依据

```bash
PYTHONPATH=backend backend/.venv/bin/python -m unittest discover \
  -s backend/tests -p test_backup.py -v
```

上面测试命令从仓库根目录执行。临时目录中创建 SQLite 数据与外键约束、原件、真实 Chroma/Whoosh 索引；索引创建子进程退出后备份，恢复后在新的子进程查询两种索引并校验 SQL/文件。另覆盖停写确认、禁止覆盖、符号链接/路径穿越、损坏归档、失败清理和缺少客户端；MySQL/PostgreSQL 只验证原生命令边界与离线产物流程，**未取得真实服务导入证据**。

适配 CodeVault `Staged Immutable Installation` 的暂存、完整性门禁、不可变产物和失败清理约束；备份文件通过不覆盖的原子 hard-link 发布，恢复到同文件系统的私有暂存目录后提交。没有引入安装注册表或通用云存储 Adapter，因为当前是单一离线文件系统工作流。

AI 已整套裁剪的项目仅备份关系数据库和共享 upload 存储；AI 仍注册时保留原有完整存储集合。归档校验与恢复仍支持之前的完整备份，不能用裁剪后的基础备份代替被保留的 AI 历史数据备份。
