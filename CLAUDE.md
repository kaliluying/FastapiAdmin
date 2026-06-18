# CLAUDE.md

这个文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目概述

这是一个前后端分离的管理后台系统：
- **后端**：FastAPI + SQLAlchemy + Alembic，支持多数据库（MySQL/PostgreSQL/SQLite）
- **前端**：Vue 3 + TypeScript + Element Plus + Pinia

## 常用命令

### 后端（backend/）

**启动开发服务器**：
```bash
cd backend
python main.py run --env=dev
```

**数据库迁移**：
```bash
# 生成迁移脚本
python main.py revision --env=dev

# 应用迁移
python main.py upgrade --env=dev
```

**环境说明**：
- `--env=dev`：开发环境（默认）
- `--env=prod`：生产环境

### 前端（frontend/）

**开发**：
```bash
cd frontend
pnpm install      # 或 pnpm i
pnpm dev          # 启动开发服务器
```

**构建**：
```bash
pnpm build        # 默认构建
pnpm build:dev    # 开发环境构建
pnpm build:test   # 测试环境构建
pnpm build:pro    # 生产环境构建
```

**代码质量**：
```bash
pnpm lint              # 运行所有 lint 检查和自动修复
pnpm lint:eslint       # ESLint 检查
pnpm lint:prettier     # Prettier 格式化
pnpm lint:stylelint    # Stylelint 样式检查
pnpm ts:check          # TypeScript 类型检查
```

**提交规范**：
```bash
pnpm commit            # 使用 Commitizen 提交（推荐）
```

### Docker 部署

```bash
# 启动所有服务（MySQL + Redis + Backend + Nginx）
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 架构设计

### 后端架构

**核心目录结构**：
```
backend/app/
├── api/v1/              # API 路由，按模块组织
│   ├── module_system/   # 系统模块（用户、角色、权限、菜单）
│   ├── module_common/   # 通用模块（文件上传、字典）
│   ├── module_application/  # 应用模块（业务功能）
│   └── module_monitor/  # 监控模块（日志、性能）
├── core/                # 核心组件
│   ├── base_crud.py     # CRUD 基类
│   ├── base_model.py    # SQLAlchemy Model 基类
│   ├── base_schema.py   # Pydantic Schema 基类
│   ├── database.py      # 数据库会话管理
│   ├── dependencies.py  # 依赖注入
│   ├── security.py      # JWT 认证和权限
│   ├── middlewares.py   # 中间件（CORS、日志、限流）
│   └── exceptions.py    # 异常处理
├── common/              # 公共资源
│   ├── enums/           # 枚举定义
│   └── ...
├── config/              # 配置管理
│   └── setting.py       # Pydantic Settings
├── plugin/              # 插件和初始化
│   └── init_app.py      # 应用初始化（注册路由、中间件等）
├── utils/               # 工具函数
└── alembic/             # 数据库迁移脚本
```

**关键设计模式**：

1. **模块化 API 设计**：每个业务模块包含 `router.py`（路由）、`crud.py`（数据库操作）、`schema.py`（数据验证）、`model.py`（数据模型）

2. **基类抽象**：
   - `BaseCRUD`：统一的 CRUD 操作（`core/base_crud.py`）
   - `BaseModel`：所有 Model 继承，自动添加 `id`、`created_at`、`updated_at` 等字段
   - `BaseSchema`：Pydantic Schema 基类

3. **依赖注入系统**（`core/dependencies.py`）：
   - `get_db()`：数据库会话
   - `get_current_user()`：当前登录用户
   - `check_permission()`：权限检查

4. **多数据库支持**：通过环境变量配置，支持 MySQL (asyncmy)、PostgreSQL (asyncpg)、SQLite (aiosqlite)

5. **中间件链**（`core/middlewares.py`）：
   - CORS 跨域
   - 请求日志记录
   - 接口限流（fastapi-limiter）
   - 异常捕获

### 前端架构

**核心目录结构**：
```
frontend/src/
├── views/                    # 页面视图
│   ├── module_system/        # 系统管理页面
│   ├── module_common/        # 通用功能页面
│   ├── module_application/   # 应用功能页面
│   ├── module_monitor/       # 监控页面
│   └── dashboard/            # 仪表板
├── api/                      # API 请求封装
├── router/                   # 路由配置
├── store/                    # Pinia 状态管理
│   ├── modules/              # 状态模块
│   └── index.ts
├── components/               # 组件
│   ├── common/               # 通用组件
│   └── ...
├── composables/              # 组合式函数
├── utils/                    # 工具函数
├── types/                    # TypeScript 类型定义
├── constants/                # 常量定义
├── enums/                    # 枚举定义
├── directives/               # 自定义指令
├── plugins/                  # 插件
├── layouts/                  # 布局组件
├── styles/                   # 全局样式
└── lang/                     # 国际化
```

**关键技术点**：

1. **自动导入**：
   - `unplugin-auto-import`：自动导入 Vue API、VueRouter、Pinia
   - `unplugin-vue-components`：自动导入组件（Element Plus、自定义组件）

2. **路由权限**：
   - 基于后端返回的菜单动态生成路由
   - 路由守卫进行权限验证

3. **状态管理**：
   - Pinia 模块化管理
   - `pinia-plugin-persistedstate` 持久化

4. **API 封装**：
   - Axios 统一封装（`src/api/`）
   - 请求拦截器自动添加 Token
   - 响应拦截器统一错误处理

5. **UI 组件**：
   - Element Plus（主 UI 框架）
   - Echarts（图表）
   - CodeMirror（代码编辑器）
   - WangEditor（富文本编辑器）

### 前后端协作

**API 版本控制**：后端 API 统一前缀 `/api/v1/`

**认证流程**：
1. 前端调用 `/api/v1/auth/login` 登录
2. 后端返回 JWT token
3. 前端存储 token 到 localStorage
4. 后续请求在 Header 中携带 `Authorization: Bearer {token}`
5. 后端通过 `get_current_user()` 依赖注入验证用户身份

**权限控制**：
- 后端：基于 RBAC（角色-权限）模型，在路由层通过 `check_permission()` 检查
- 前端：通过指令 `v-permission` 控制按钮/元素显示

**数据字典**：系统配置存储在 `sys_param` 表中（站点名称、版权信息、文档链接等）

## 开发注意事项

### 后端

1. **CLI 工具**：所有命令通过 `main.py` 执行，基于 Typer 构建

2. **环境变量**：配置文件在 `backend/env/`，通过 `--env` 参数选择

3. **日志系统**：使用 Loguru，日志文件在 `backend/logs/`

4. **数据库会话**：
   - 使用异步 SQLAlchemy
   - Session 生命周期由 FastAPI 依赖注入管理
   - 不要手动创建 Session

5. **Alembic 迁移**：
   - 修改 Model 后必须生成迁移脚本
   - 迁移脚本在 `backend/app/alembic/versions/`
   - 部署前必须执行 `upgrade`

6. **静态文件**：存储在 `backend/static/`，通过 `/api/v1/static/` 访问

7. **集成 AI 功能**：已集成 LangChain（OpenAI、Anthropic），相关代码在业务模块中

### 前端

1. **包管理器**：强制使用 pnpm（preinstall 钩子限制）

2. **Node 版本**：需要 Node >= 18.0.0

3. **Husky 钩子**：
   - pre-commit：自动运行 lint-staged（格式化和检查）
   - commit-msg：验证提交信息格式（Commitizen）

4. **环境模式**：
   - `dev`：开发环境
   - `test`：测试环境
   - `pro`：生产环境
   - 配置文件：`.env.development`、`.env.test`、`.env.production`

5. **图标系统**：使用 `@element-plus/icons-vue` 和 UnoCSS icon

6. **样式方案**：
   - UnoCSS（原子化 CSS）
   - SCSS（组件样式）
   - 全局样式在 `src/styles/`

7. **TypeScript**：严格模式，构建前会运行类型检查

### 测试

- 后端测试文件在 `backend/tests/`
- 使用 pytest 框架（需要手动运行）

### Docker 部署

- MySQL 默认密码：`FastApi123abc`
- 默认数据库：`admin`
- Redis 端口：6379
- 后端端口：8001
- Nginx 端口：80、443（HTTPS）

## 数据库

**默认表前缀**：
- `sys_`：系统表（用户、角色、权限、菜单、部门、岗位、字典）
- 业务表：根据模块自定义

**关键系统表**：
- `sys_user`：用户表
- `sys_role`：角色表
- `sys_permission`：权限表
- `sys_menu`：菜单表
- `sys_param`：系统参数配置表（重要）
