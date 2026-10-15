# FastCore 项目协作约束

本文件只规定本仓库的特殊约束；通用授权、工作区保护和验收要求遵循用户级规则。整体架构与开发路径见 `docs/ARCHITECTURE_AND_DEVELOPMENT.md`，实际命令和配置以当前代码、`backend/pyproject.toml`、`frontend/package.json` 及环境文件为准。

## 工作范围

- 活跃应用代码位于 `backend/` 和 `frontend/`。先确认调用链，再确定修改范围。
- 后端是单组织后台。AI 默认提供，允许复制后的新项目整套裁剪；按 `docs/MODULE_DEVELOPMENT.md` 处理注册、依赖、菜单与数据保留。业务模块采用显式注册，不引入目录扫描或运行时插件开关。

## 业务模块开发

- 新增业务模块前，先阅读 [标准模块模板：分类管理](docs/STANDARD_MODULE_TEMPLATE.md)，参考 `backend/app/api/v1/module_demo/category/` 和 `frontend/src/views/module_demo/category/` 中的分类管理范例，按实际业务约束适配。
- 范例接口和导航仅在 `ENVIRONMENT=dev` 启用。正式业务使用独立的功能组、路由名和权限前缀，并在范例的开发环境条件之外注册。

## 后端边界

- 后端命令从 `backend/` 执行。`backend/main.py` 在导入配置前设置 `ENVIRONMENT`；独立脚本复用配置时保持这个顺序。
- 基础 API 由 `app/init_app.py:register_routers()` 注册；业务模块在 `app/config/modules.py` 登记，通过 `app/core/modules.py` 统一接入路由、模型、权限、种子和生命周期。新增或裁剪功能先读 `docs/MODULE_DEVELOPMENT.md`，将业务接入信息保留在模块内部。AI 同时核对 `app/plugin/module_ai/plugin.toml` 和 `module.py`。
- 知识库文档跨文件、关系库、Chroma 和检索索引。修改上传、索引或删除链路时核对各处状态与失败恢复，避免只检查单层结果。

## 数据库迁移

- Alembic 的实际版本目录是 `backend/app/alembic/versions/`。生成迁移后审查脚本及其数据影响；需要随代码交付的迁移应纳入版本管理，实际提交仍按用户授权执行。
- 开发和生产启动都会在 Redis 锁下自动迁移、初始化并校验数据库；`main.py bootstrap --env=prod` 与 `main.py migrate --env=prod` 可用于部署前预执行。启动服务或运行迁移前，确认环境文件、数据库目标和迁移的数据影响。裁剪功能保留历史迁移及已有业务数据，菜单清理需显式执行。

## 前端路由与验证

- 登录后的授权菜单来自用户信息，经过 `src/router/MenuProcessor.ts` 转换，再由 `src/router/core/RouteRegistry.ts` 注册。页面存在但无法访问时，沿用户菜单、转换、注册和守卫检查。
- 后端测试的 `backend/tests/conftest.py` 使用临时 SQLite 和模拟 Redis；这只证明测试环境行为。跨数据库、接口、前端或浏览器的功能，按用户级端到端验收规则取得运行证据。
- `frontend/package.json` 的 `lint` 脚本会修复或重写文件；运行前确认修改范围，验证后检查差异。
