# 业务模块生成器

[文档目录](README.md) · [模块增删改](MODULE_DEVELOPMENT.md) · [标准模块模板](STANDARD_MODULE_TEMPLATE.md)

用本地 CLI 创建一个独立功能组和一个 CRUD 资源。生成器不加载应用配置、不连接数据库或 Redis，也不启动服务。默认输出完整差异，只有添加 `--apply` 才写入源码。

## 使用

从 `backend/` 执行，先预览：

```bash
uv run --no-sync main.py generate-module \
  --module business --resource supplier --title 供应商 --module-title 业务管理
```

确认差异后写入：

```bash
uv run --no-sync main.py generate-module \
  --module business --resource supplier --title 供应商 --module-title 业务管理 --apply

uv run --no-sync pytest tests/test_business_supplier.py -q
```

`--module-title` 可省略，默认使用 `--title`。模块名和资源名是 1–20 位小写 `snake_case`，不得使用 Python 关键字；例如 `purchase`、`purchase_order`。显示名称是 1–40 位文字、数字、空格或 `_ - · （ ） ( )`，不支持引号、标记或代码。资源显示名不要带“管理”，页面自动添加该后缀。

## 生成内容

上述命令新增 12 个文件，并更新一个注册项：

| 路径                                                          | 内容                                                         |
| ------------------------------------------------------------- | ------------------------------------------------------------ |
| `backend/app/api/v1/module_business/__init__.py`、`module.py` | 路由、模型、权限和菜单种子的显式接入                         |
| `backend/app/api/v1/module_business/supplier/`                | 包入口、ORM、Schema、Service、Controller                     |
| `backend/app/api/v1/module_business/data/platform_menu.json`  | 目录、页面及按钮权限                                         |
| `backend/app/alembic/versions/gen_*_business_supplier.py`     | 基于当前唯一 head 的增量建表迁移                             |
| `backend/tests/test_business_supplier.py`                     | CRUD、校验、权限、事务、迁移和 MySQL/PostgreSQL DDL 编译回归 |
| `frontend/src/api/module_business/supplier.ts`                | 请求与 TypeScript 类型                                       |
| `frontend/src/views/module_business/supplier/index.vue`       | 筛选、分页、排序、新增、编辑、删除及错误反馈                 |
| `backend/app/config/modules.py`                               | 追加 `app.api.v1.module_business.module:get_module`          |

生成的接口为 `/business/supplier/*`，权限为 `module_business:supplier:*`，表名为 `business_supplier`，ORM 类名为 `BusinessSupplierModel`，菜单路由名为 `Business`、`BusinessSupplier`。ORM 类名带模块前缀，避免 `user` 等资源与核心模型同名。正式业务在开发和生产环境均注册，不沿用范例的 `development_only` 条件。

默认字段为 `name`、`order`、`status`、`description`，外加项目共享的审计和软删除字段。约束与[分类模板](STANDARD_MODULE_TEMPLATE.md)一致：名称去空白、创建人名下唯一、软删除保留名称、请求管理事务、批量删除先完整校验。它们是起始业务规则，生成后应根据实际需求一起修改 ORM、Schema、前端、迁移和测试。

模板独立保存在 `backend/app/scripts/module_templates/`，删除 `module_demo` 源码后仍可生成；维护共享范例行为时需同步模板，并运行生成产物回归。

## 写入保护

- 已有功能组、输出文件、注册入口、模型类名、表名或菜单路由冲突时拒绝生成；没有覆盖参数。表名校验包含带类型注解的声明，模块名不得占用前端基础路由，资源名不得为 `module`（保留给模块注册入口）。首版不向已有功能组追加资源。
- 拒绝目标路径及祖先中的符号链接，包括失效链接。模块清单只接受一次赋值的字符串字面量元组，不执行动态清单。
- Alembic 必须只有一个 head。应用计划前重新检查清单、head 和输出目标；发布注册项前再次检查清单与迁移链。
- 新文件以排他创建方式写入，最后原子替换模块清单。正常写入失败或中断异常会清理本次新建文件，保留原有内容。
- 进程被强杀、断电或并发人工改目录不属于多文件事务保证。若出现未注册的生成文件，先检查 Git 差异再处理；不要通过覆盖或删除已有业务来重试。

## 生成后的验收

1. 审查字段、唯一性、归属及删除语义，检查迁移的升级和降级。若生成后又调整表结构，在首次应用前同步新建迁移；已应用的迁移应保留，另建增量迁移。
2. 运行生成的后端回归，在 `frontend/` 执行 `pnpm type-check`，按项目命令检查新 API 和页面。
3. 核对目标数据库与待执行迁移后，再启动服务或执行 `bootstrap`。所有环境启动都会迁移、初始化和校验数据库；生成命令本身不做这些操作。
4. 超级管理员重新登录查看“业务管理 → 供应商管理”。在角色管理中明确授予普通角色相应菜单、按钮和数据范围；生成器不自动授予角色权限。
5. 从正常菜单进入，验证新增、重名错误、编辑、删除、刷新和重启读取；同时验证无权限用户及其他创建人的数据隔离。

### 迁移降级与数据保护

升级遇到已有业务表时跳过建表；空数据库则由 bootstrap 按 ORM 建表。因此，仅凭 Alembic 版本无法证明表由本迁移创建。生成的迁移在目标表存在时明确报错并拒绝自动降级，保留表、数据和当前迁移版本；即使表是本迁移新建的，也采用同一保护策略。目标表不存在时允许回退该版本。

确需删表时，先备份并验证恢复，再审查单独编写的破坏性迁移；不要通过 `stamp` 绕过检查，也不要用降级代替模块裁剪。跨多个版本的降级可能在到达本保护前执行其他迁移，本检查不保证整条降级链原子回滚。修复模板只影响之后新生成的迁移，不会覆盖已有生成文件或重写已应用的历史迁移；已有项目需单独核对其降级实现。

自动化隔离验收从 `backend/` 执行：

```bash
uv run --no-sync pytest tests/scripts/test_module_generator.py -q
uv run --no-sync python integration/skeleton_acceptance.py
```

集成脚本在临时副本中实际调用生成 CLI，运行产物测试，再增加邮箱字段、修改名称上限，验证浏览器操作、重启持久化和物理裁剪。需要本地 Redis、Chrome、已安装的项目依赖及安装基础 Python 依赖的网络或缓存。仅使用隔离 SQLite 和独立真实 Redis；测试夹具加载开发配置后切换生产模块运行策略，不代表生产配置、真实 MySQL/PostgreSQL 或部署验收。

## 上游参考与范围

2026-10-24 核对 FastapiAdmin 上游提交 `f9263b27fa8ad4da486ac989c7222c06e034fae6` 的 `backend/app/modules/generator/gencode/`、`backend/templates/` 与 `frontend/web/src/views/module_generator/gencode/`。

上游的字段增改查开关、控件及字典映射、“配置 → 预览 → 生成”流程、模板输入防护值得参考。其插件发现、服务端写源码及直接创建数据库菜单的接入方式不适用于 FastCore 的显式注册和种子流程。本版沿用 FastCore 已验收的分类业务实现，提供独立迁移和测试，不搬入上游生成器服务。

首版不含数据库反向导入、可视化字段设计、主子表、批量 ZIP 下载和既有模块重新生成。后续有真实字段配置需求时，再沿用当前预览与安全写入入口扩展。

模块组织适配 CodeVault `vertical-feature-module`：接入信息留在模块内，核心只增加注册项；生成产物通过 API/浏览器与持久化链路验收，不额外引入运行时插件系统。
