# 视觉升级 Spec 落地概览（Quiet Luxury Operations）

> UI Designer 已完成 `frontend/src/styles/VISUAL_UPGRADE_SPEC.md` 中 D 段顺序的全部 apply，并验证构建通过。

## 已落地的改动（Phase 1–5）

### A. P0 缺陷修复
- **A1 深色卡片浮白**：新增 `--fa-surface-sheen-top/bottom`（浅色白渐变 / 深色透明+极淡顶光），替换 `_overrides.scss .el-card`、`core/app.scss @mixin fa-card-base`、`core/app.scss .fa-table-card` 三处硬编码白渐变 → 系统级修掉深色浮白并加纵深。
- **A2 主色漂移**：`tailwind.css --fa-primary: var(--theme-color)` 跟随运行时主题色；语义色从 OKLCH 静态值改回与 `_fa-tokens.scss` 单源一致的 hex，消除双值漂移。

### B. Token 支柱补全
- **B1 排版**：新建 `core/_fa-type.scss`（字体族 / 字号阶梯 12→36 / 行高 / 字重 / `tabular-nums`），`index.html` 加 Inter 字体 link，全局 `html` 应用 Inter。
- **B2 间距**：`tailwind.css :root` 加 `--fa-space-1…16`（4px 基线 11 级）。

### C. 美化模式（8 模块）
- **C1/C6 表面分层 + 暗色精修**：`--fa-elevation-1/2/3`（浅/深各一套）；`.el-card:hover` 用 elevation-3 + `translateY`；`_dark.scss` 修 `.el-table th` 深色浮白 + 深色表面边框。
- **C2/C3/C5 数据卡 / 侧边栏 / 按钮**：新建 `core/_fa-stat.scss`（`.fa-stat-card` / `.fa-empty` / `.fa-brand-gradient`）；`_overrides.scss` 加侧边栏品牌化（active 左侧 accent 竖条 + 图标圆容器）+ `.el-button--primary` 光泽。
- **C4 微交互**：新建 `core/_fa-motion.scss`（`fa-rise` stagger / `fa-skeleton` shimmer + `prefers-reduced-motion`）；新建 `src/directives/business/countUp.ts` 并注册为 `v-count-up`。

### 挂载点
`index.scss` 在 core 段 `@use` 了 `fa-type` / `fa-surface` / `fa-stat` / `fa-motion` 四个新 partial。

## Phase 6 — 业务模板接入（让美化在运行态可见）
把 C2/C7 的纯样式基类接到真实组件：
- **首页统计卡（修首页深色浮白）**：`views/home/modules/visit-stat-card.vue`、`online-user-card.vue` 的 scoped 背景从硬编码白渐变改为 `--fa-surface-sheen-*` + `--default-box-color` —— **补掉 A1 全局修复未覆盖到的组件级白渐变（首页深色卡片此前仍浮白）**；阴影改 `--fa-elevation-1` + hover `--fa-elevation-3` + 抬升；文字色改 `--fa-gray-900/600`；数字加 `tabular-nums`。
- **空状态插图化（C7 落地）**：`components/feedback/fa-async-state/index.vue` 的 empty 分支用 `.fa-empty` 块（内联 SVG 插图 + title + desc + action）替换 `<ElEmpty>`；这是全站表格/列表空状态统一入口，覆盖面最大。
- **首页指标条/待办卡一致化**：`views/home/index.vue` 的 `.demo-metric-card` / `.pending-section` 改 sheen + `--fa-card-border` + `--fa-elevation-1` + 圆角 12px + hover 抬升；`.demo-metric-value/label` 改 `--fa-text-*/--fa-gray-*` + tabular-nums。

## 验证结论
- `pnpm run build`（vue-tsc + vite）：类型检查通过、3430 模块转换通过。
- 初版在 `tailwind.css`（`//` 注释非法）已修正为 `/* */`；grep 确认无残留。
- `vite build --outDir dist-verify` 验证（Phase 1–5）：**`✓ built in 1m 33s`，零 SCSS/TS 报错**。
- 业务接入后再跑 `vite build --outDir dist-verify`：**`✓ built in 1m 17s`，零报错** → 全部改动（含业务模板）编译打包通过。
- `dist-verify/` 临时目录已清理（`.gitignore` 仅忽略 `dist`）。

## 尚未做的（可选下一步）
- 可沉淀 `docs/design-system.md` 把 token 总表与组件规范固定下来，防回归。
- 其余业务页（列表/表单/详情）可按同套 token 逐步统一，非必须。

## 相关文件
- Spec 文档：`frontend/src/styles/VISUAL_UPGRADE_SPEC.md`
- 可预览原型：`dashboard-beautify-preview.html`（设计意图可视化）
- 评审报告：`UI_DESIGN_REVIEW.md`
