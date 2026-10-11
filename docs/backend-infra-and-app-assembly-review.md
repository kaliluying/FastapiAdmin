# 后端「基础设施与应用组装」只读梳理

> 历史只读研究快照，且当前为本地未提交材料。以下行号、CLI、初始化和迁移判断可能已过时，不作为现行部署说明；当前事实见[架构指南](ARCHITECTURE_AND_DEVELOPMENT.md)与[后端说明](../backend/README.md)。

范围：`backend/main.py`、`app/init_app.py`、`app/config/`、`app/core/`、`app/scripts/`、`app/alembic/`、`pyproject.toml`/`requirements.txt`、`tests/`。
所有结论均附 `文件:行号`，未修改任何文件。

## 1. 启动流程

| 步骤 | 位置 | 说明 |
|---|---|---|
| CLI 入口 | `main.py:12`、`main.py:235` | Typer 应用；子命令 `run`/`reset`/`revision`/`upgrade` |
| 先设 ENVIRONMENT | `main.py:61`、`main.py:110`、`main.py:198`、`main.py:225` | 必须在 import settings/logger 前；`main.py:58-60` 注释说明 `app.core.logger` 顶层即调用 `setup_logger()` |
| 清缓存 | `main.py:113`、`main.py:201`、`main.py:228` | `get_settings.cache_clear()`，否则 `lru_cache` 会复用旧环境 |
| dev 开启 reload | `main.py:77-79` | `reload_dirs=["app"]`，`log_config=None` 交 loguru |
| create_app | `main.py:15-36` | 顺序：FastAPI(**FASTAPI_CONFIG) → exceptions → middlewares → routers → files → docs |
| 配置装配 | `app/config/setting.py:273-292` | `docs_url/redoc_url=None`，自定义文档在 `init_app.py:173-199` |
| 中间件 | `init_app.py:139-144` | `MIDDLEWARE_LIST[::-1]` 逐个 `import_module` 后 `add_middleware` |
| 路由 | `init_app.py:151-164` | common/platform/system + AI WS/HTTP，均挂 `RateLimiter` 依赖 |
| lifespan | `init_app.py:82-131` | 见下 |

lifespan 内部顺序（`init_app.py:84-99`）：

1. `app.state.redis` 从何而来：`import_modules_async(EVENT_LIST, app=app, status=True)`（`init_app.py:84`）→ `EVENT_LIST` 由 `REDIS_ENABLE` 决定（`setting.py:235-240`）→ `database.redis_connect(app, status=True)`（`database.py:213-251`）内部执行 `app.state.redis = rd`（`database.py:240`）并 `ping()`。
2. 全局事件加载完成日志 `init_app.py:85`。
3. 启动锁 `_startup_schema_lock`（`init_app.py:49-78`，键 `fastcore:startup:schema`，`expire=300`，30s 续期，120s 超时）。
4. `run_startup_migration()`（`init_app.py:29-45`）→ 线程内 `upgrade_database()`（`scripts/migrate.py:10-26`）。
5. `InitializeData().init_db()`（`scripts/initialize.py:57-69`）：`load_ai_models()` → `create_tables()`（`database.py:113-121`）→ `ensure_schema_indexes()`（`database.py:182-199`）→ 种子导入。
6. `initialize_ai_plugin()`（`init_app.py:90`，`core/plugins.py:184-197`，钩子 `chat.model_config_service:initialize_runtime_chat_model_config`，见 `plugin/module_ai/plugin.toml:27`）。
7. `cache_util.init(redis=...)`（`init_app.py:91`）。
8. `FastAPILimiter.init(...)`（`init_app.py:93-98`）。
9. 任一步异常 → `logger.error` + `raise SystemExit(1)`（`init_app.py:100-102`）。
10. 关闭：`cache_util.clear()`（`init_app.py:119`）→ `FastAPILimiter.close()` → 事件 `status=False` → `async_engine.dispose()`（`init_app.py:125-128`）。

中间件实际执行顺序（由 `setting.py:222-233` 列表逆序注册）：`CORS → RequestLog → SecurityHeaders → GZip → CorrelationId → 路由`，与 `setting.py:225` 注释一致。

## 2. 配置体系

- 加载：`setting.py:317-321`，`env = os.getenv("ENVIRONMENT")`，文件 `env/.env.{env}`，无环境变量时退化为 `env/.env`；`extra="ignore"`（`setting.py:19`）。
- 实际存在：`env/.env.dev`、`env/.env.dev.example`、`env/.env.prod.example`（无 `.env.prod`）。
- 分组（`setting.py`）：环境/服务器 26-32；API 文档 37-45；日志级别 50；CORS 55-60；JWT+R‑BAC 白名单+登录防爆破 65-76；数据库连接池 81-102；Redis 107-113；验证码 118-121；OAuth 127-137；外部 HTTP 142-143；操作日志 149-165；Gzip 170-172；安全头 177；静态 182-185；上传 190-201；Swagger 资源 206-209；限流 214-216。
- AI/向量检索配置**不在** `setting.py`，而在 `app/plugin/module_ai/config.py:18-37`（`AiPluginSettings`，同样的 `ENV_DIR/.env.{env}` 选择逻辑，`config.py:47-53`），含 `MODEL_ALLOWED_HOSTS`。
- 多环境遗留（存在于 env 模板，代码零引用）：`DEMO_ENABLE`、`DATABASE_AUTO_CREATE_TABLES`（`.env.dev.example:26,30`）、`CHROMA_HOST`/`CHROMA_PORT`/`CHROMA_SSL`（`.env.dev` 独有）。`.env.dev` 无 `EMBEDDING_PROVIDER`/`RETRIEVAL_*`，靠默认值（`module_ai/config.py:24-36`）。

## 3. 数据访问层

- 模块导入即建引擎：`database.py:109-110`（同步 + 异步）。
- 异步 URL 按方言拼装：MySQL `mysql+asyncmy`、PG `postgresql+asyncpg`、SQLite `sqlite+aiosqlite`（`setting.py:242-253`）；同步 URL `pymysql`/`psycopg`（`setting.py:255-266`）。SQLite 分支不传 `pool_size/max_overflow`（`database.py:72-80` vs `81-93`）。
- 会话工厂：`database.py:99-105`，`autocommit`/`autoflush`/`expire_on_commit` 来自配置；`AUTOFETCH` 作为 `AUTOFLUSH` 的旧别名（`database.py:102`）。
- 请求级会话：`dependencies.py:32-49`，写方法（POST/PUT/PATCH/DELETE）提交，读方法回滚以释放事务；WS 用只读会话 `dependencies.py:52-55`。
- Base 约定：`MappedBase(AsyncAttrs, DeclarativeBase)`（`base_model.py:21`）、`ModelMixin`（id/uuid/is_deleted/created_time/updated_time/deleted_time，`base_model.py:68-111`）、`UserMixin`（created_id/updated_id/deleted_id + 三个 `selectin` 关系，`base_model.py:124-193`）。
- 兼容点：Alembic 用 `ASYNC_DB_URI`（`alembic/env.py:34`）；种子日期字符串递归转 `datetime/date/time`（`initialize.py:316-334`，注释标明为 PostgreSQL 兼容）；`ensure_schema_indexes` 为旧库补复合索引（`database.py:182-199`）。

## 4. Redis 用途与降级

| 用途 | 位置 | 键 |
|---|---|---|
| 会话/令牌 | `dependencies.py:87,107`；`auth/service.py:332-344` | `access_token:*`、`refresh_token:*`、`user_session:*`（`common/enums.py:16-19`） |
| 滑动过期 | `dependencies.py:114-135`（`TTL < 一半` 时续期） | 同上 |
| 权限缓存 + 版本失效 | `dependencies.py:25,150-176` | `auth:permissions:{version}:{uid}` |
| 分布式启动锁 | `init_app.py:49-78` | `fastcore:startup:schema` |
| 页面缓存 | `cache_util.py:17-56`；`menu/controller.py:59,74,88,102`、`role/controller.py:72-125` | `fastcore-cache:{ns}:{md5}` |
| 限流 | `init_app.py:93-98`、`http_limit.py:10-42` | `fastcore:request_limiter:`（`setting.py:214`） |
| 登录防爆破/锁定 | `auth/service.py:106-148`（`INCR` + `LOCK`） | `auth:login:failure:*`、`auth:login:lock:*` |
| 验证码 | `RedisInitKeyConfig.CAPTCHA_CODES`（`enums.py:19`） | — |
| 一次性票据（原子消费） | `dependencies.py:316`、`auth/service.py:396,621`、`oauth_service.py:360,441` | WS/自动登录/OAuth ticket |
| WS 会话 | `plugin/module_ai/chat/ws.py:29` | — |

降级：`RedisCURD` 各方法吞异常并返回 `None/[]/False/-1`（`redis_crud.py:28-30,44-46,65-67,169-171,197-199,233-235,283-285,298-300`）；`cache_util` 在 `_REDIS is None` 或 `_ENABLE=False` 时直通原函数（`cache_util.py:34-35`）；权限缓存异常回退关系对象（`dependencies.py:164-166`）。
但 `REDIS_ENABLE=False` 时启动锁会直接失败：`EVENT_LIST` 返回 `[None]`（`setting.py:238`）→ `app.state.redis` 永不设置 → `init_app.py:86` 抛 `AttributeError` → `init_app.py:100-102` `SystemExit(1)`，即 Redis 实际是启动硬依赖。

## 5. 中间件 / 异常 / 日志 / 上下文

- CORS：`middlewares.py:32-41`；RequestLog：`:44-95`（含 `_hydrate_session_id` 从 JWT `sub` 取 session_id，`:50-78`，返回 `X-Process-Time`）。
- GZip：`:98-100`；SecurityHeaders（HSTS 由 `HSTS_ENABLE` 控制）：`:103-115`。
- Trace id：`CorrelationIdMiddleware`（`:118-131`）读取/生成 `X-Correlation-ID`，写入 ContextVar（`request_context.py:6-16`），由 loguru patcher 注入日志（`logger.py:20-22`），并作为 CORS 暴露头（`setting.py:60`）。
- 请求上下文：`RequestContext` dataclass（`request_context.py:21-29`）。
- 客户端 IP：仅信任 `TRUSTED_PROXY_IPS` 内的直连代理，从右向左取第一个不可信跳（`client_ip.py:36-61`）。
- 异常处理：`exceptions.py:52-126` 注册 CustomException/HTTPException/RequestValidationError/ResponseValidationError/SQLAlchemyError(IntegrityError 分流 409)/ValueError/兜底 Exception；`CustomException` 默认 500（`:15-32`）。
- 日志：`logger.py:40-79`，stdout + `logs/fastcore.log`（`rotation="00:00"`、`retention=30`、gz），StdLogging→loguru 桥接；级别取 `settings.LOGGER_LEVEL`（`:11-17`）。

## 6. 迁移与初始化

- 分工：`initialize.py` 负责建骨架表 + 幂等补种子（`initialize.py:57-69`）；`migrate.py` 只做 `upgrade head`，无 head 时返回 `False` 跳过（`migrate.py:20-25`）。`main.py reset` 走反射删表 → `create_tables` → 种子（`main.py:133-173`）。
- 启动建表补种子的风险：应用每次启动都会 `create_all`+补种子（`init_app.py:87-88`），`create_all` 只建缺失表、不补列（`database.py:113-121`）；`ensure_schema_indexes` 也只补少量复合索引（`database.py:182-199`）。因此模型变更不会自动落到已有库；`reset` 后 alembic 未 stamp（`main.py:167-171` 只 create_all），已有库再次 `upgrade head` 的基线状态不确定。
- **实际只有 1 个迁移文件，不是 3 个**：`app/alembic/versions/` 仅 `20260924_remove_params_and_dict.py`（`app/alembic/versions/` 目录列表）；`backend/alembic/versions/` 为空目录。
  - `20260924_remove_params_and_dict.py:16-33`：`down_revision=None`（首版），删除 `platform_menu` 中 `Dict`/`Params` 根及其子菜单与 `sys_role_menus` 关联，并 `drop_table` `sys_dict_data`/`sys_dict_type`/`sys_param`；`downgrade()` 显式不恢复（`:36-37`）。
- 种子内容：`app/scripts/data/` 7 个 JSON（`platform_menu` 2 条、`sys_role` 3、`sys_user` 3、`sys_user_roles` 3、`sys_role_menus` 10、`sys_login_log` 6、`sys_operation_log` 8）。
- 幂等策略：角色按 `code`、用户按 `username`、关联表按 `(role_id,menu_id)`/`(user_id,role_id)` 去重（`initialize.py:92-152`）；菜单递归按 `permission`/`route_name` 匹配（`:255-296`）；日志表仅空表写入（`:154-164`）；已有用户密码不覆盖（`:225`）。

## 7. 测试策略

- `tests/conftest.py:27-34` 在 import 应用前写入临时 SQLite（`DATABASE_NAME` 指向 `tempfile` 路径）、`POOL_SIZE=1`、`MAX_OVERFLOW=1`、固定 `SECRET_KEY`；`:36-44` 再冗余覆盖 `settings` 属性。
- Redis 替换：手写 `_mock_redis` + `AsyncMock` 提供 get/set/incr/getdel/delete/keys/exists/ttl/expire/hash 等（`:51-174`），并 `patch("redis.asyncio.Redis.from_url")`（`:176`）；`FastAPILimiter.init/close` 打桩（`:177-178`），`RateLimiter.__call__`/`WebSocketRateLimiter.__call__` 置为 no-op（`:186-191`）。
- lifespan 替换：`_test_lifespan`（`:223-228`）只做 `run_startup_migration()` + `init_db()` + `app.state.redis=_mock_redis`，然后重置 admin 密码为 `admin123`（`:210-220`）；因此**不覆盖** AI 初始化、cache_util 初始化、限流器初始化、启动锁与关闭流程。注意 `:231-237` 创建了两个 app 共享同一 DB。
- 辅助断言：`assert_route`（`:281-317`），`expected_status=None` 时仅断言非 404，且请求抛异常时静默 `return`（`:308-312`）。
- 覆盖方向：路由存在性（`test_api_module_*`、`test_removed_modules.py`）、健康检查（`test_main.py`、`tests/plugin` 之外）、认证会话与 Redis 一次性票据（`test_auth_session.py`）、权限菜单加固与单组织收敛（`test_permission_*`、`tests/core/test_single_org_runtime.py`）、安全回归（`test_security_regressions.py`：SSRF、路径穿越、上传限流、数据权限）、AI/RAG（`tests/plugin/module_ai/**`）、迁移（`tests/scripts/test_migrate.py` 用临时目录验证 `upgrade_database()` 真能建表）、种子菜单（`tests/scripts/test_skeleton_seed_menu.py`）。
- 明显未覆盖：`cache_util` 的序列化/缓存命中路径；`CorrelationIdMiddleware`/`SecurityHeadersMiddleware`/`GZip`；`exceptions.py` 多数 handler；`_startup_schema_lock` 并发与续期；真实（非临时）迁移链的基线；`main.py` CLI（`run`/`reset`/`revision`）。

## 8. 发现的问题与不一致

| # | 问题 | 证据 |
|---|---|---|
| 1 | `RATE_LIMITER_TIMES`/`RATE_LIMITER_SECONDS` 定义后从未生效，路由硬编码 200/10 | 定义 `setting.py:215-216`；仅定义处出现；实际 `init_app.py:156-164` |
| 2 | JSON 日志三配置完全未接线（`LOG_JSON_FILE_ENABLE` 等） | `setting.py:149-151`；`logger.py:56-73` 无 jsonl sink；全仓仅定义处引用 |
| 3 | 死配置：`LJDOC_URL`、`TEMPLATE_DIR`、`DOWNLOAD_DIR` 零引用 | `setting.py:44`、`path_conf.py:19,28` |
| 4 | env 模板遗留键被 `extra="ignore"` 静默忽略 | `DEMO_ENABLE`/`DATABASE_AUTO_CREATE_TABLES`（`.env.dev.example:26,30`）、`CHROMA_HOST/PORT/SSL`（`.env.dev`）；`setting.py:19` |
| 5 | `path_conf.py:27` 存在乱码注释 `# ??????` | `path_conf.py:27-28` |
| 6 | requirements.txt 是 pyproject 全量固定导出，基本一致；差异仅声明粒度与 dev 缺失 | `requirements.txt` 138 项 vs `pyproject.toml:7-48` 40 项主依赖；`cryptography/greenlet/langchain-anthropic` 由 `>=` 变 `==`，`psycopg[binary]`→`psycopg`、`uvicorn[standard]`→`uvicorn`；`pyproject.toml:50-55` 的 pytest/ruff/fakeredis/pytest-asyncio 不在 requirements（注释 `pyproject.toml:58` 已说明） |
| 7 | `requirements.txt` 未钉 `alembic` 之外的 `mako` 等由导出附带，正文声明缺失不影响安装 | 同上 |
| 8 | 命名/注释不一致：`AUTOFETCH` 别名语义 | `setting.py:93` vs `database.py:102` |
| 9 | `main.py:77-78` 的 `reload_dirs=["app"]` 与 `reload_includes=["main.py"]` 依赖 uvicorn 细节；生产无影响 | `main.py:73-82` |
| 10 | 中间件捕获 `CustomException` 后返回 `ErrorResponse`（HTTP 200 语义由 `common/response` 决定），会掩盖真实状态码 | `middlewares.py:93-95` |
| 11 | lifespan 异常兜底过宽：AI/缓存/限流任一失败即 `SystemExit(1)`，且 `REDIS_ENABLE=False` 必崩 | `init_app.py:100-102`、`setting.py:238`、`init_app.py:86` |
| 12 | 种子含全局硬编码 `pbkdf2-sha256` 密码散列（`sys_user.json`），非仅首次部署也随包分发 | `app/scripts/data/sys_user.json`；`initialize.py:225` 说明不覆盖已有密码 |
| 13 | 测试辅助 `assert_route` 吞异常 + 仅断言非 404，可能掩盖真实 500 | `conftest.py:308-317` |
| 14 | 测试残留物：`tests/__pycache__/test_alembic_baseline.cpython-*.pyc` 存在但源文件已删除 | `tests/__pycache__/` 列表 vs `tests/` 实际文件 |
| 15 | 无 `.git` 目录，无法核对迁移/测试文件的提交状态 | 仓库根目录列表 |
