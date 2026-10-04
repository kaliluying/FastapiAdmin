# FastapiAdmin 项目协作约束

本文件只规定本仓库的特殊约束；通用授权、工作区保护和验收要求遵循用户级规则。整体架构与开发路径见 `docs/ARCHITECTURE_AND_DEVELOPMENT.md`，实际命令和配置以当前代码、`backend/pyproject.toml`、`frontend/package.json` 及环境文件为准。

## 工作范围

- 活跃应用代码位于 `backend/` 和 `frontend/`。先确认调用链，再确定修改范围。
- 后端是单组织后台，AI 知识库和对话属于核心能力。不要依据旧文档恢复多租户、SaaS 或可选 AI 插件行为。

## 业务模块开发

- 新增业务模块前，先阅读 [标准模块模板：分类管理](docs/STANDARD_MODULE_TEMPLATE.md)，参考 `backend/app/api/v1/module_demo/category/` 和 `frontend/src/views/module_demo/category/` 中的分类管理范例，按实际业务约束适配。
- 范例接口和导航仅在 `ENVIRONMENT=dev` 启用。正式业务使用独立的功能组、路由名和权限前缀，并在范例的开发环境条件之外注册。

## 后端边界

- 后端命令从 `backend/` 执行。`backend/main.py` 在导入配置前设置 `ENVIRONMENT`；独立脚本复用配置时保持这个顺序。
- 通用 API 路由由 `app/init_app.py:register_routers()` 注册；AI 路由、模型和启动钩子由 `app/plugin/module_ai/plugin.toml` 声明，并通过 `app/core/plugins.py` 装配。新增或排查 AI 接口时核对清单、导出的路由对象和实际注册结果。
- 知识库文档跨文件、关系库、Chroma 和检索索引。修改上传、索引或删除链路时核对各处状态与失败恢复，避免只检查单层结果。

## 数据库迁移

- Alembic 的实际版本目录是 `backend/app/alembic/versions/`。生成迁移后审查脚本及其数据影响；需要随代码交付的迁移应纳入版本管理，实际提交仍按用户授权执行。
- 开发环境启动会执行已有迁移并初始化数据库；生产环境启动只检查结构，首次部署用 `main.py bootstrap --env=prod`，后续迁移用 `main.py migrate --env=prod`。启动服务或运行迁移前，确认所用环境文件及数据库目标，避免改动非目标数据。

## 前端路由与验证

- 登录后的授权菜单来自用户信息，经过 `src/router/MenuProcessor.ts` 转换，再由 `src/router/core/RouteRegistry.ts` 注册。页面存在但无法访问时，沿用户菜单、转换、注册和守卫检查。
- 后端测试的 `backend/tests/conftest.py` 使用临时 SQLite 和模拟 Redis；这只证明测试环境行为。跨数据库、接口、前端或浏览器的功能，按用户级端到端验收规则取得运行证据。
- `frontend/package.json` 的 `lint` 脚本会修复或重写文件；运行前确认修改范围，验证后检查差异。
