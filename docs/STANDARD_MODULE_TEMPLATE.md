# 标准业务模块模板：分类管理

这是供二开复制的可运行范例。仅 `ENVIRONMENT=dev` 注册 `/demo/category`，初始化种子提供「开发范例 → 分类管理」菜单。生产环境不注册范例接口、不导入范例菜单，也不会将已有范例菜单返回给登录用户。范例不写入分类样例记录，也不自动给普通角色授权。

## 从哪里开始读

| 文件 | 职责 |
| --- | --- |
| `backend/app/api/v1/module_demo/category/model.py` | 业务字段、数据库约束、通用审计和软删除字段 |
| `backend/app/api/v1/module_demo/category/schema.py` | 输入校验、查询条件、输出字段 |
| `backend/app/api/v1/module_demo/category/service.py` | 业务用例、数据范围、名称冲突、批量删除校验 |
| `backend/app/api/v1/module_demo/category/controller.py` | HTTP 请求、权限声明、响应和操作日志接入 |
| `backend/app/api/v1/module_demo/__init__.py` | 功能组的路由导出 |
| `backend/app/core/permission_catalog.py` | 统一权限代码目录，检查后端与菜单声明是否遗漏 |
| `frontend/src/api/module_demo/category.ts` | 前端请求与业务类型 |
| `frontend/src/views/module_demo/category/index.vue` | 筛选、分页、排序、新增、编辑、删除和失败反馈 |
| `backend/app/alembic/versions/20261004_demo_category.py` | 已有数据库的增量建表迁移 |
| `backend/tests/test_standard_category.py` | 接口行为、校验、权限、事务及迁移回归 |
| `frontend/tests/category-e2e.cjs` | 真实浏览器、HTTP、SQLite、操作日志和响应式验收 |

沿「页面 → 前端请求 → Controller → CategoryService → 数据库」阅读。通用读取、分页和软删除直接复用 `CRUDBase`；没有额外的 `crud.py` 转发层。只有出现专属查询或存储职责时才拆出数据层。

## 接口契约

| 方法与路径 | 权限 | 行为 |
| --- | --- | --- |
| `GET /demo/category/list` | `module_demo:category:query` | 分页查询、名称筛选、状态筛选与排序 |
| `GET /demo/category/detail/{id}` | `module_demo:category:detail` | 查询一条可访问记录 |
| `POST /demo/category/create` | `module_demo:category:create` | 创建分类 |
| `PUT /demo/category/update/{id}` | `module_demo:category:update` | 提交完整业务字段，修改分类 |
| `DELETE /demo/category/delete` | `module_demo:category:delete` | 请求体为 ID 数组，最多 100 条 |

创建和更新的业务字段：

```json
{
  "name": "办公用品",
  "order": 10,
  "status": 0,
  "description": "日常办公物资"
}
```

- `name` 去除首尾空白后长度为 1–64；`order` 为 0–999999；`status` 为 0（启用）或 1（停用）。
- 客户端不能传入 `id`、`created_id` 等审计字段；额外字段返回 422。
- 排序示例：`order_by=[{"order":"asc"}]`，作为 JSON 字符串放在查询参数中。只允许业务白名单字段，增加 ID 排序保证同值记录的分页顺序稳定。
- 列表返回项目统一的 `data.items`、`data.total`、`data.page_no`、`data.page_size`、`data.has_next`。
- 无功能权限返回 403；记录不存在或超出数据范围返回 404；名称冲突返回 409；输入或排序不合法返回 422。
- 不缓存范例列表，新增、修改后直接刷新数据库结果；有实际性能需求时再引入缓存与失效策略。

## 必须保留的规则

1. **功能权限与数据权限都生效。** 每个接口声明自己的 `AuthPermission`；读取、更新定位和删除均经过带认证的 `CRUDBase`。普通角色沿用「仅本人／全部」数据范围，超级管理员沿用现有豁免规则。
2. **名称冲突由数据库最终裁决。** `(created_id, name)` 唯一；不同创建人允许同名，同一创建人不允许重复。名称比较遵循目标数据库的排序规则；本范例没有实现跨数据库统一的大小写折叠。
3. **软删除保留名称。** 同一创建人不能以已删除分类的名称重新创建。复制到其他业务时，如果希望删除后允许复用，需要一起修改数据库约束和回归检查。
4. **请求拥有事务。** `CategoryService` 只执行 `flush`，不自行 `commit`；`db_getter` 在请求成功时提交，失败时回滚。CLI 或后台直接调用时，调用方需要显式管理事务。
5. **批量删除先完整校验。** 存在不存在或不可访问的 ID 时整批拒绝；去重后的合法 ID 才交给共享软删除入口。
6. **审计信息来自登录用户。** 创建人、更新人和删除人由服务端写入；`OperationLogRoute` 接入现有操作日志。复制到包含敏感正文的业务时，核对日志策略，必要时使用 `x-audit-payload: false`。

## 在本地查看范例

先核对目标环境文件和数据库。以下命令会修改所选数据库；本次验收没有对你的日常数据库运行这些命令。

开发环境启动会按项目当前策略初始化结构和增量种子。已有安装如果需要显式补齐迁移与新菜单，在 `backend/` 执行：

```bash
uv run main.py migrate --env=dev
uv run main.py bootstrap --env=dev
uv run main.py run --env=dev
```

`bootstrap` 会执行项目的完整增量初始化，包含其他尚未应用的迁移和缺失种子；执行前应审查当前迁移链及数据库目标。不要用 `reset` 安装范例。

前端在 `frontend/` 执行 `pnpm dev`。重新登录或刷新授权菜单后，超级管理员可访问 `#/demo/category`。普通角色需要在角色管理中明确分配分类页面及相应按钮权限，并选择数据范围。单独访问 URL 不会授予权限。

生产部署无需手动删除范例代码。使用 `--env=prod`，范例接口不注册，超级管理员也不能通过该接口访问分类。已有范例菜单和数据不自动删除；环境隔离只影响接口和用户导航，不修改历史数据。

数据库模型及迁移保持跨环境一致，避免生成误删表的迁移或破坏已有迁移链。生产按正常流程应用迁移，保留未启用的 `demo_category` 表；结构检查仍校验该表。正常生产启动不会自动修改结构。不要通过删迁移文件来关闭范例；迁移降级会删除该表及其中数据，应只在明确需要删除范例数据时使用。

## 复制成新业务模块

以供应商管理为例，先选一个最小真实流程：「录入名称 → 保存 → 列表可见」。

1. 复制后端 `category/`、前端 API 和页面；统一替换 `Category/category`、表名、路由名称与权限前缀。不要替换整个仓库。
   正式业务放入独立的 `module_业务名`，使用自己的路由名和权限前缀，并在范例的开发环境条件之外注册；不要沿用 `module_demo:`、`Demo` 或 `DemoCategory`。
2. 先定义新业务的不变量：字段、唯一性范围、数据归属、删除语义。同步修改 ORM 约束、Schema、用例和测试；不要照搬分类的重名规则。
3. 在功能组 `__init__.py` 导出 Router；新功能组在 `app/init_app.py:register_routers()` 显式注册，并沿用限流依赖。现有功能组内扩展不需要另建插件 manifest。
4. 将模型加入 `InitializeData.prepare_init_models`，供初始化和 Alembic 加载。创建新的迁移，`down_revision` 指向当时实际 head；不要修改本范例或已经应用的迁移。审查唯一约束、外键、升级数据影响和降级行为。
5. 在 `platform_menu.json` 添加目录、页面和按钮权限，并将代码登记到 `permission_catalog.py`；新增功能组时同步扩展权限前缀检查。`route_name` 必须唯一；页面 `component_path` 对应真实 Vue 文件。普通角色授权由管理员明确配置；如确实需要默认授权，再单独修改 `sys_role_menus.json`。
6. 保留输入、事务、权限和失败检查，先跑通新增及列表的真实浏览器路径，再扩展编辑、删除或批量行为。

复制后，至少应能证明：成功写入可刷新读取、失败不留下半成品、普通用户不能访问其他人的数据、只有查询权限不能修改、危险操作有明确对象与影响。

## 验证命令与证据边界

后端命令从 `backend/` 执行：

```bash
uv run --no-sync pytest tests/test_standard_category.py tests/test_permission_simplification.py -q
uv run --no-sync pytest tests/test_demo_environment.py tests/core/test_startup_policy.py -q
uv run --no-sync ruff check app/api/v1/module_demo tests/test_standard_category.py app/alembic/versions/20261004_demo_category.py --no-fix
```

前端命令从 `frontend/` 执行：

```bash
pnpm type-check
pnpm exec eslint src/api/module_demo/category.ts src/views/module_demo/category/index.vue
pnpm exec stylelint src/views/module_demo/category/index.vue
node tests/category-e2e.cjs
node tests/category-prod-e2e.cjs
```

浏览器脚本复用 `ux-e2e.cjs` 的隔离环境：临时 SQLite、模拟 Redis、独立服务端口和真实 Chrome。端口 8009、5179 被占用时会拒绝复用；结束后关闭服务，证据路径打印到输出中。运行需要 Node 能解析 `playwright` 且本机已安装 Chrome；Codex 环境可通过现有运行时的 `NODE_PATH` 使用 Playwright，无需修改项目依赖。

浏览器验收覆盖授权菜单接入、新增、编辑和停用、刷新、重名错误保留输入、删除、SQL 软删除和操作日志；另在 375、768、1024、1440 像素宽度检查布局和表单。SQLite 检查和方言 DDL 编译不代表真实 MySQL/PostgreSQL 或生产验收。

`category-prod-e2e.cjs` 在隔离数据库中先保留开发范例旧菜单，再以生产配置注册真实应用：验证超级管理员登录后没有范例导航、直接页面地址不可访问、全部范例接口返回 404，并通过真实的只读结构检查。它仍使用测试启动夹具和模拟 Redis，不代表线上部署验收。

本范例采用 CodeVault `vertical-feature-module` 的纵向聚拢与显式组装原则。保留有职责的四个后端文件，直接复用共享能力，未增加通用生成框架或只有一次实现的 Repository 接口。
