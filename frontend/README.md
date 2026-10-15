# FastCore 管理端

管理端使用 Vue 3、Vite、TypeScript、Pinia、Vue Router 与 Element Plus，提供登录、系统管理和 AI 工作界面。后端负责最终认证与权限校验。跨端关系见[架构指南](../docs/ARCHITECTURE_AND_DEVELOPMENT.md)，依赖与脚本以 `package.json` 为准。

## 本地运行

要求 Node.js 22.22.2+（22.x）、24.15+（24.x）或 26+，通过 Corepack 使用 `package.json` 的 `packageManager` 指定版本。所有命令从 `frontend/` 执行。

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

Vite 加载 `.env` 和 `.env.development`，后者覆盖同名值。启动前核对 `VITE_APP_BASE_API`（浏览器 API 前缀）、`VITE_API_BASE_URL`（开发代理目标）与实际后端配置。修改环境文件后重启开发服务器。 AI 对话通过同一 HTTP 代理发送 `POST /ai/chat/stream` 并读取 SSE，沿用登录令牌和刷新流程；详见[对话流协议](../docs/AI_CHAT_STREAMING.md)。

## 运行结构

| 路径（相对 frontend/）                                         | 职责                                             |
| -------------------------------------------------------------- | ------------------------------------------------ |
| `src/main.ts`、`src/plugins/index.ts`                          | 应用与 Pinia、Router、指令、国际化、组件库的注册 |
| `src/store/modules/user.store.ts`                              | 登录、用户信息、授权菜单和退出清理               |
| `src/router/staticRoutes.ts`                                   | 登录、错误页、布局与首页等静态路由               |
| `src/router/MenuProcessor.ts`、`src/router/menuRoutes.ts`      | 将用户信息中的后端菜单转成路由记录               |
| `src/router/core/RouteRegistry.ts`、`src/router/beforeEach.ts` | 动态注册、权限导航、失败回滚与注销               |
| `src/api/`、`src/views/`                                       | API 封装与业务页面                               |

路由采用 Hash 模式，动态菜单来源是用户信息中的 `routeList`，不会依据 `VITE_ACCESS_MODE` 切换。页面文件存在不表示用户拥有路由或接口权限。新增业务页需核对后端菜单路径、名称、组件映射与权限码，并验证刷新、退出和重新登录。

## 构建与验证

```bash
# 新 checkout 首次先生成自动导入类型声明
corepack pnpm exec vite build
corepack pnpm type-check
corepack pnpm test
corepack pnpm build
```

Vite 生成的 `src/types/import/` 自动导入声明属于忽略产物，首次纯类型检查前需运行 Vite。常规 `build` 包含类型检查并生成 `dist/`。`lint` 带 `--fix`、`--write`，会重写文件，运行后检查差异。

单测、构建与浏览器验收的适用范围见[测试与验收](../docs/TESTING.md)。视觉规范见[样式说明](src/styles/README.md)；新增业务从[分类模块模板](../docs/STANDARD_MODULE_TEMPLATE.md)开始。
