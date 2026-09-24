# 前端开发

前端使用 Vue 3、Vite、TypeScript、Pinia、Vue Router 与 Element Plus。它负责登录交互、系统管理页面、授权菜单导航和 AI 工作界面；后端负责最终的认证与权限校验。跨端关系见[架构与开发指南](../docs/ARCHITECTURE_AND_DEVELOPMENT.md)。依赖版本与脚本以 `package.json` 为准。

## 本地运行

要求 Node.js 20.19+，包管理器版本见 `package.json` 的 `packageManager`。`pnpm dev` 加载 `.env` 和 `.env.development`；后者的同名值会覆盖前者。启动前核对 `VITE_APP_BASE_API`、`VITE_API_BASE_URL` 和 `VITE_APP_WS_ENDPOINT` 与实际后端一致，不要直接假设 `.env.example` 中的地址就是当前开发地址。

```bash
# 在 frontend/ 下
pnpm install
pnpm dev
```

开发时，浏览器通过 `VITE_APP_BASE_API` 请求同源 API，`vite.config.ts` 将请求代理到 `VITE_API_BASE_URL`；AI 对话的 WebSocket 使用单独的 `VITE_APP_WS_ENDPOINT`。修改环境文件后重启开发服务器。

## 运行结构

| 路径 | 职责 |
| --- | --- |
| `src/main.ts`、`src/plugins/index.ts` | 创建应用并依次注册 Pinia、Router、指令、国际化和组件库 |
| `src/store/modules/user.store.ts` | 登录、用户信息、授权菜单与退出清理 |
| `src/router/staticRoutes.ts` | 登录、错误页、布局与首页等静态壳路由 |
| `src/router/MenuProcessor.ts`、`src/router/menuRoutes.ts` | 从用户信息中的后端菜单生成前端路由记录 |
| `src/router/core/RouteRegistry.ts`、`src/router/beforeEach.ts` | 校验、动态注册、权限导航与注销 |
| `src/api/`、`src/views/` | API 封装与业务页面 |

路由使用 Hash 模式。登录后，用户信息中的授权菜单经转换再挂到静态布局下；页面组件存在不表示用户有路由或接口权限。新增业务页时核对后端菜单的路径、名称、组件映射及权限码，再验证刷新和退出后的路由状态。当前路由代码不会依据 `VITE_ACCESS_MODE` 切换菜单来源，实际来源是用户信息中的 `routeList`。

## 验证与构建

```bash
# 在 frontend/ 下，按改动范围选择
pnpm test
pnpm type-check
pnpm build
```

`pnpm test` 运行 Vitest；`pnpm build` 包含类型检查并生成 `dist/`。`pnpm lint` 会执行带 `--fix`、`--write` 的脚本，可能改写多个文件，运行后要检查差异。修改用户可见流程时，还要用浏览器验证登录、菜单权限、目标页面、空态和错误态；单元测试与构建不能单独证明跨端功能完成。

设计系统与页面样式见 [`src/styles/README.md`](src/styles/README.md)，具体行为以当前组件实现为准。
