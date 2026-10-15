# 模块增删改指南

FastCore 供新项目复制后独立开发。认证、用户、角色、菜单权限、审计记录、健康检查和共享上传属于基础能力；业务模块通过 `backend/app/config/modules.py` 显式注册。默认提供分类范例、首页监控展示和完整 AI，不需要时可在新项目中裁剪。

## 新增功能

从[分类管理范例](STANDARD_MODULE_TEMPLATE.md)复制最小完整流程，后端主要代码保留在自己的功能目录，前端使用对应 API 和视图目录。新模块的 `module.py` 是接入信息的拥有方，例如：

```python
from pathlib import Path
from app.core.modules import ModuleSpec

def get_module() -> ModuleSpec:
    return ModuleSpec(
        name="business",
        routers=("app.api.v1.module_business:business_router",),
        model_modules=("app.api.v1.module_business.supplier.model",),
        permissions=frozenset(f"module_business:supplier:{action}" for action in ("query", "detail", "create", "update", "delete")),
        seed_dir=Path(__file__).parent / "data",
    )
```

只需在 `app/config/modules.py` 添加 `"app.api.v1.module_business.module:get_module"`。路由、模型、权限目录、种子和必要的生命周期由统一组装处理，不再分别修改 `init_app.py`、`InitializeData.prepare_init_models` 和核心权限目录。Router 应包含自己的功能组前缀；普通业务无需 AI 的 TOML 清单。

菜单种子放在模块的 `data/platform_menu.json`，页面 `component_path` 对应真实 Vue 文件。普通角色由管理员明确授权；需要默认授权时，本模块提供 `data/sys_role_menus.json`。种子只补齐，不覆盖管理员修改，不自动删除旧数据。

共享认证、事务、分页、审计与 HTTP 客户端沿用现有入口。新模块应使用自己的表名、权限前缀和路由名；先定义数据归属、唯一性、软删除语义和错误反馈，再扩展功能。

`development_only` 只控制路由、种子、钩子和用户菜单；仍安装的模块模型跨环境加载，保留现有迁移行为。正式业务不设置此标志。真正裁剪应移除注册项和源码。

## 修改功能

| 修改 | 同步位置 |
| --- | --- |
| 新增或调整字段 | ORM、Schema、前端 API 类型、表单默认值／编辑回填／校验、列表展示、相关检查 |
| 调整持久化结构 | 在目标开发库生成新迁移，审查升级／降级与已有数据影响；保留已应用迁移 |
| 修改权限 | Controller、模块权限目录、页面按钮、菜单种子；已有角色授权另行迁移或管理 |
| 修改路径或名称 | Router、前端 API、菜单路径／组件／路由名、引用方与检查；已有菜单不会由种子覆盖 |
| 更换内部实现 | 保持跨模块公开用例；避免调用方直接访问其他模块内部存储 |

请求事务由共享依赖负责，业务 Service 使用 `flush`，失败不留下半成品。增添字段后，不能只改表单或类型声明，应证明服务端校验和刷新、重启后的读取行为。

所有环境启动都会自动迁移、初始化并校验目标数据库。生成迁移时会忽略当前模型不拥有的历史表，减少裁剪后意外生成删表操作；仍须人工审查迁移。明确永久删表时编写独立、已审查的迁移。

## 裁剪功能

在新项目副本操作，先检查模块调用方与资源归属。停用正在运行的服务，保留备份，再执行：

1. 从 `app/config/modules.py` 删除模块入口。
2. 删除对应后端源码、前端 API／视图和依赖这些源码的模块测试。分类范例目录为 `app/api/v1/module_demo/`、`src/api/module_demo/`、`src/views/module_demo/`；AI 目录为 `app/plugin/module_ai/`、`src/api/module_ai/`、`src/views/module_ai/`。删除首页监控展示时移除 dashboard 注册项和 `monitoring/dashboard.py`，保留核心 health 接口与审计记录。
3. 新数据库不导入被删除模块的模型和种子；已有数据库显式清理模块菜单与授权关系。先预览，例如裁剪 AI 后，从 `backend/` 执行：

   ```bash
   uv run --no-sync python -m app.scripts.prune_menus --env=prod --permission-prefix module_ai: --route-name AI
   ```

   核对目标和数量后，再添加 `--apply`。清理命令会拒绝仍注册的权限前缀、目录／页面路由及包含其他已注册功能入口的菜单树；被删除页面下复用基础权限的按钮按页面归属清理，不影响其他页面的授权。只删除目标菜单及其角色关系。清理可重复执行，不删除业务表、原件、索引或迁移历史。

4. 删除模块专用依赖并更新锁文件。AI 包在 `pyproject.toml` 的 `ai` 依赖组，默认 `uv sync` 仍安装完整 AI。整套裁剪后移除 `ai` 组及 `tool.uv.default-groups` 中的 `ai`，重新 `uv lock` 并导出生产 requirements。已有依赖不变时可先 `uv sync --no-default-groups --group dev` 验证基础环境；安装基础生产环境也可用 `requirements-core.txt`。
5. 重新登录，验证菜单、直接页面路径、API、基础后台和构建。首页根据用户信息的 `modules` 隐藏已裁剪的监控展示，AI 快捷入口来自有效菜单。

后台测试有历史上分散在 `tests/test_ai_*.py` 等位置的 AI 用例，整套裁剪时也须删除对应测试及其引用；保留基础和新业务的检查。裁剪与删除业务数据是独立操作，勿通过迁移 downgrade 关闭功能。通用上传被头像等基础能力复用，不能作为独立文件管理页面一起删除。

## 依赖导出与验收

从 `backend/` 执行：

```bash
# 默认完整安装的生产依赖
uv export --no-hashes --no-dev --no-emit-project --group ai --output-file requirements.txt
# 不含 AI 与开发工具的基础生产依赖
uv export --no-hashes --no-default-groups --no-emit-project --output-file requirements-core.txt
# 模块与菜单清理回归
uv run --no-sync pytest tests/core/test_modules.py tests/core/test_startup_policy.py tests/test_standard_category.py -q
# 隔离副本、真实 Redis、真实浏览器和裁剪后的独立基础 Python 环境
uv run --no-sync python integration/skeleton_acceptance.py
```

裁剪 AI 组后，完整依赖导出命令去掉 `--group ai`。隔离验收需要本地 `redis-server`、已安装的前后端依赖和 Chrome，并在独立 Python 环境安装固定版本的基础包（缓存未命中时从包仓库下载）；不会复用已有 Redis、数据库或环境文件。验收结束关闭本轮服务，证据保留在输出的临时目录。添加 `--interactive` 可在自动验收后进行界面走查，Ctrl-C 关闭隔离服务。

验收证明供应商副本的新增、字段校验、权限拒绝、刷新与重启持久化，以及物理删除 demo/dashboard/AI 后的启动、菜单和前端构建；不调用真实模型服务，不代表 MySQL/PostgreSQL 或生产部署验收。
