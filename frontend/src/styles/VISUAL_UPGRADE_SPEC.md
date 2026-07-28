# FastapiAdmin 视觉升级 Spec — Quiet Luxury Operations

> 作者：UI Designer ｜ 目标：在现有「Quiet Operations」克制风之上，把界面推到更精致的层次、质感、节奏与品牌感。
> 配套可视化原型：`dashboard-beautify-preview.html`（可直接浏览器打开看方向）。
> 适用工程：`frontend/`（Vue 3 + Element Plus，SCSS 经 `additionalData` 注入 + Tailwind v4）。
> 落地原则：**设计系统先行** — 先修 P0 真实缺陷、补 P1 token 支柱，再叠加美化模式；所有美化都用项目既有 token（`--theme-color` / `--default-box-color` / `--fa-card-border` …），不引入脱离 token 的硬编码。

---

## 0. 目录

- **A. P0 缺陷修复（必修，已验证真实存在）**
  - A1. 深色模式表面浮白（3 处硬编码白渐变）
  - A2. 主题色切换不同步（Tailwind `--fa-*` 漂移）
- **B. P1 token 支柱补全**
  - B1. Typography token（全局缺字体/字号阶梯）
  - B2. Spacing token（全局缺间距体系）
- **C. 美化模式（applyable，8 个模块）**
  - C1. 表面质感三级分层 ｜ C2. 数据卡片升级 `.fa-stat-card` ｜ C3. 侧边栏品牌化
  - C4. 微交互（count-up / 入场 stagger / shimmer）｜ C5. 按钮光泽 ｜ C6. 暗色精修 ｜ C7. 空状态 ｜ C8. 品牌渐变
- **D. 落地顺序 & 验证清单**

---

## A. P0 缺陷修复

### A1. 深色模式表面浮白

**根因（三处同一问题）**：表面背景用 `background: linear-gradient(180deg, rgb(255 255 255 / 96%), …), var(--default-box-color) !important` 强制白渐变。深色模式只覆写了 `--el-card-bg-color` **变量**，没碰 `background` 简写，所以 `!important` 的白渐变在深色下依旧生效 → 卡片/表格卡/卡片组件在深色下近白。

涉及文件与位置：

1. `src/styles/element-plus/_overrides.scss:631` — `.el-card`
2. `src/styles/core/app.scss:137` — `@mixin fa-card-base`（被 `.fa-card` / `.fa-card-sm` / `.fa-card-xs` 使用）
3. `src/styles/core/app.scss:253` — `.fa-table-card`

**系统级修复**：把白渐变抽成表面高光 token，深色下改为「透明 + 极淡顶光」，一次修三处并顺便给深色加了纵深。

**步骤 1 — `src/styles/tailwind.css` 的 `:root` 块（约 line 139 后）新增：**

```css
/* 表面高光：浅色为温润白渐变，深色为透明（让底色透出，仅留极淡顶光做纵深） */
--fa-surface-sheen-top: rgb(255 255 255 / 96%);
--fa-surface-sheen-bottom: rgb(248 251 255 / 92%);
```

**同文件 `.dark` 块（约 line 177 后）新增：**

```css
/* 深色：高光转透明 + 极淡冷调顶光，避免浮白并建立层叠感 */
--fa-surface-sheen-top: rgb(255 255 255 / 5%);
--fa-surface-sheen-bottom: transparent;
```

**步骤 2 — 替换三处硬编码渐变：**

- `_overrides.scss` line 632-634：
  ```scss
  // 旧：
  background:
    linear-gradient(180deg, rgb(255 255 255 / 98%), rgb(248 251 255 / 94%)),
    var(--default-box-color) !important;
  // 新：
  background:
    linear-gradient(180deg, var(--fa-surface-sheen-top), var(--fa-surface-sheen-bottom)),
    var(--default-box-color) !important;
  ```
- `core/app.scss` line 138-140（`@mixin fa-card-base`）：
  ```scss
  // 旧：
  background:
    linear-gradient(180deg, rgb(255 255 255 / 96%), rgb(248 251 255 / 92%)),
    var(--default-box-color);
  // 新：
  background:
    linear-gradient(180deg, var(--fa-surface-sheen-top), var(--fa-surface-sheen-bottom)),
    var(--default-box-color);
  ```
- `core/app.scss` line 253-255（`.fa-table-card`）：
  ```scss
  // 旧：
  background:
    linear-gradient(180deg, rgb(255 255 255 / 96%), rgb(248 251 255 / 94%)),
    var(--default-box-color);
  // 新：
  background:
    linear-gradient(180deg, var(--fa-surface-sheen-top), var(--fa-surface-sheen-bottom)),
    var(--default-box-color);
  ```

> 旧 `_overrides.scss:74` 的 `html.dark .el-card { --el-card-bg-color: … }` 可保留（无害），或删除由新方案接管。建议删除，避免双源。

---

### A2. 主题色切换不同步

**根因**：

- `_theme.scss` / `_overrides.scss` 注入 `--el-color-primary: #{$fa-primary}`（`$fa-primary:#4080ff`）。
- `tailwind.css:112` 定义 `--fa-primary: #3b82f6`（静态），并通过 `@theme` 映射为 Tailwind `--color-primary`。
- 这两值**不一致**，且 `--fa-primary` 不跟随运行时 `setElementThemeColor()` 写入的 `--theme-color`。
- 同理 `--fa-success/warning/danger/error/info` 用了 OKLCH 静态值，与 SCSS 单源 `$fa-*` 不一致。
- 结果：用户在设置面板切换主题色后，所有引用 `--fa-primary` / Tailwind `--color-primary` 的渐变、强调色**不跟随**。

**修复（最小改动、跟运行 theme 走）：**

`src/styles/tailwind.css` 的 `:root` 块（line 111-118）改为：

```css
/* 主色跟随运行时主题色（修复漂移） */
--fa-primary: var(--theme-color);
/* 次要品牌色（teal，无 SCSS 单源，保留） */
--fa-secondary: #2dd4bf;
/* 语义色对齐 SCSS 单源 _fa-tokens.scss，去掉 OKLCH 漂移 */
--fa-error: #fa896b;
--fa-info: #909399;
--fa-success: #13deb9;
--fa-warning: #ffae1f;
--fa-danger: #ff4d4f;
```

> 说明：`--theme-color` 运行时链为 `--theme-color → --main-color → --el-color-primary → 运行时 primary`，在 `:root` 解析期即生效。改完后 `--color-primary`（Tailwind）会随主题色切换。语义色固定为品牌色板（与 `$fa-*` SCSS 单源一致），不再用 OKLCH 导致双值漂移。

---

## B. P1 token 支柱补全

当前全项目无 `--font-*`、无 `--space-*`；字号/间距散落硬编码（Grep 验证无匹配）。

### B1. Typography token

**新增文件 `src/styles/core/_fa-type.scss`：**

```scss
// Typography tokens — Quiet Luxury Operations
:root {
  --fa-font-sans:
    "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei",
    sans-serif;
  --fa-font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

  // 字号阶梯（4px 基线上的节奏）
  --fa-text-xs: 0.75rem; /* 12 */
  --fa-text-sm: 0.875rem; /* 14 */
  --fa-text-base: 1rem; /* 16 */
  --fa-text-lg: 1.125rem; /* 18 */
  --fa-text-xl: 1.25rem; /* 20 */
  --fa-text-2xl: 1.5rem; /* 24 */
  --fa-text-3xl: 1.875rem; /* 30 */
  --fa-text-4xl: 2.25rem; /* 36 */

  // 行高
  --fa-leading-tight: 1.25;
  --fa-leading-snug: 1.4;
  --fa-leading-normal: 1.6;

  // 字重
  --fa-weight-regular: 400;
  --fa-weight-medium: 500;
  --fa-weight-semibold: 600;
  --fa-weight-bold: 700;
}

// 全局基线：字体族 + 抗锯齿 + 数字等宽
html {
  font-family: var(--fa-font-sans);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
// 表格/统计数字统一等宽对齐（tabular-nums）
.fa-num,
.el-statistic__number,
.mc-value {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
}
```

**字体加载**：`frontend/index.html` 的 `<head>` 内（`<link rel="shortcut icon">` 后）加入：

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap"
  rel="stylesheet"
/>
```

> 离线/内网环境：改为自托管 `@font-face`（把 woff2 放 `src/assets/fonts/`）。`system-ui` 兜底已就位，不加载也不崩。

**挂载**：`src/styles/index.scss` 的 `core/` 段（`@use "./core/app";` 之后）加入：

```scss
@use "./core/fa-type";
```

### B2. Spacing token

`src/styles/tailwind.css` 的 `:root` 块新增（建议放在 `--fa-focus-ring` 附近）：

```css
/* Spacing scale（4px 基线） */
--fa-space-1: 0.25rem; /* 4 */
--fa-space-2: 0.5rem; /* 8 */
--fa-space-3: 0.75rem; /* 12 */
--fa-space-4: 1rem; /* 16 */
--fa-space-5: 1.25rem; /* 20 */
--fa-space-6: 1.5rem; /* 24 */
--fa-space-8: 2rem; /* 32 */
--fa-space-10: 2.5rem; /* 40 */
--fa-space-12: 3rem; /* 48 */
--fa-space-16: 4rem; /* 64 */
```

> 用法：组件内 `padding: var(--fa-space-4)` 取代 `16px` 硬编码。后续迭代逐步替换散落值，把一致性从「人眼统一」推到「系统级统一」。

---

## C. 美化模式（applyable）

> 以下均挂既有 token；新增组件类以 `fa-` 前缀命名，避免与 EP 冲突。

### C1. 表面质感三级分层（elevation tokens）

`src/styles/tailwind.css` `:root` 新增：

```css
/* Elevation：三级层叠柔和阴影（浅色） */
--fa-elevation-1: 0 1px 2px rgb(11 18 32 / 4%), 0 1px 1px rgb(11 18 32 / 3%);
--fa-elevation-2: 0 6px 16px rgb(11 18 32 / 7%), 0 2px 4px rgb(11 18 32 / 4%);
--fa-elevation-3: 0 18px 48px rgb(11 18 32 / 9%), 0 6px 16px rgb(11 18 32 / 5%);
```

`.dark` 块新增：

```css
--fa-elevation-1: 0 1px 2px rgb(0 0 0 / 24%), 0 1px 1px rgb(0 0 0 / 16%);
--fa-elevation-2: 0 8px 20px rgb(0 0 0 / 30%), 0 2px 6px rgb(0 0 0 / 20%);
--fa-elevation-3: 0 24px 60px rgb(0 0 0 / 38%), 0 6px 18px rgb(0 0 0 / 24%);
```

升级 `.el-card:hover`（`_overrides.scss:644`）：

```scss
.el-card:hover {
  border-color: color-mix(in srgb, var(--theme-color) 16%, var(--fa-card-border)) !important;
  box-shadow: var(--fa-elevation-3) !important; // 取代原硬编码 0 22px 52px
  transform: translateY(-2px);
}
```

新增工具类（放 `core/app.scss` 或新建 `_fa-surface.scss`）：

```scss
.fa-surface-raised {
  background: var(--default-box-color);
  border: 1px solid var(--fa-card-border);
  border-radius: 10px;
  box-shadow: var(--fa-elevation-2);
}
```

### C2. 数据卡片升级 `.fa-stat-card`

新增 `src/styles/core/_fa-stat.scss`（并在 `index.scss` `@use "./core/fa-stat";`）：

```scss
.fa-stat-card {
  position: relative;
  overflow: hidden;
  padding: var(--fa-space-5);
  background:
    linear-gradient(180deg, var(--fa-surface-sheen-top), var(--fa-surface-sheen-bottom)),
    var(--default-box-color);
  border: 1px solid var(--fa-card-border);
  border-radius: 12px;
  box-shadow: var(--fa-elevation-1);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease,
    border-color 0.2s ease;

  // 顶部品牌色细条
  &::before {
    content: "";
    position: absolute;
    inset: 0 0 auto 0;
    height: 3px;
    background: linear-gradient(
      90deg,
      var(--theme-color),
      color-mix(in srgb, var(--theme-color) 45%, #6366f1)
    );
  }

  &:hover {
    box-shadow: var(--fa-elevation-3);
    transform: translateY(-3px);
    border-color: color-mix(in srgb, var(--theme-color) 18%, var(--fa-card-border));
  }

  .fa-stat-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    color: var(--theme-color);
    background: color-mix(in srgb, var(--theme-color) 12%, var(--default-box-color));
  }

  .fa-stat-value {
    margin-top: var(--fa-space-3);
    font-size: var(--fa-text-3xl);
    font-weight: var(--fa-weight-bold);
    line-height: var(--fa-leading-tight);
    color: var(--fa-gray-900);
    font-variant-numeric: tabular-nums;
  }

  .fa-stat-delta {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 2px 8px;
    font-size: var(--fa-text-xs);
    font-weight: var(--fa-weight-semibold);
    border-radius: 999px;
  }
  .fa-stat-delta--up {
    color: #0f9d6b;
    background: rgb(16 157 107 / 12%);
  }
  .fa-stat-delta--down {
    color: #e5484d;
    background: rgb(229 72 77 / 12%);
  }

  .fa-stat-spark {
    margin-top: var(--fa-space-3);
    width: 100%;
    height: 36px;
    display: block;
  }
}
```

**示例 Vue 用法（首页统计区）：**

```html
<div class="fa-stat-card">
  <span class="fa-stat-icon"
    ><el-icon><User /></el-icon
  ></span>
  <div class="fa-stat-value fa-num" v-count-up="1280">0</div>
  <span class="fa-stat-delta fa-stat-delta--up">▲ 12.4%</span>
  <svg class="fa-stat-spark" viewBox="0 0 120 36" preserveAspectRatio="none">
    <polyline
      fill="none"
      stroke="var(--theme-color)"
      stroke-width="2"
      points="0,30 20,24 40,26 60,16 80,18 100,8 120,10"
    />
  </svg>
</div>
```

### C3. 侧边栏品牌化

`src/styles/element-plus/_overrides.scss` 末尾新增（sidebar 背景已用 `--fa-color-sidebar`）：

```scss
// 菜单项激活态：左侧 accent 竖条 + 圆角浅底 + 图标圆容器
.el-menu-item,
.el-sub-menu__title {
  border-radius: 8px;
  margin: 2px 8px;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}
.el-menu-item.is-active {
  position: relative;
  color: var(--theme-color);
  background: color-mix(in srgb, var(--theme-color) 12%, transparent);
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 18px;
    border-radius: 0 3px 3px 0;
    background: var(--theme-color);
  }
}
// 菜单图标圆容器
.el-menu-item .el-icon,
.el-sub-menu__title .el-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--theme-color) 10%, transparent);
}
```

> 品牌区（logo + 标题）：在 `Layout/Sidebar` 组件加一个 `.fa-brand` 块（HTML 改动），样式用 `--fa-color-sidebar` 反白文字即可。

### C4. 微交互

新增 `src/styles/core/_fa-motion.scss`（`index.scss` 中 `@use "./core/fa-motion";`）：

```scss
// 卡片入场 stagger
@keyframes fa-rise {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.fa-rise {
  animation: fa-rise 0.42s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i, 0) * 60ms);
}
// 骨架屏 shimmer
@keyframes fa-shimmer {
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
}
.fa-skeleton {
  background: linear-gradient(
    90deg,
    var(--fa-gray-200) 25%,
    var(--fa-gray-300) 37%,
    var(--fa-gray-200) 63%
  );
  background-size: 800px 100%;
  animation: fa-shimmer 1.4s ease infinite;
  border-radius: 8px;
}
// 尊重 reduced-motion
@media (prefers-reduced-motion: reduce) {
  .fa-rise,
  .fa-skeleton {
    animation: none !important;
  }
}
```

**count-up 指令**（Vue，`src/directives/countUp.ts`，在 `main.ts` 注册 `app.directive("count-up", …)`）：

```ts
import type { Directive } from "vue";
export const countUp: Directive<HTMLElement, number> = {
  mounted(el, binding) {
    const target = binding.value ?? 0;
    const dur = 900;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.textContent = String(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },
};
```

### C5. 按钮光泽

`_overrides.scss` 的 `.el-button--primary`（line 596）增强：

```scss
.el-button--primary {
  border-color: var(--theme-color) !important;
  background-image: linear-gradient(180deg, color-mix(in srgb, #fff 14%, transparent), transparent);
  box-shadow: var(--fa-soft-shadow);

  &:hover:not(.is-disabled) {
    box-shadow:
      var(--fa-soft-shadow),
      0 6px 14px color-mix(in srgb, var(--theme-color) 16%, transparent) !important;
  }
}
```

### C6. 暗色精修

`src/styles/element-plus/_dark.scss` 的 `html.dark` 块补充：

```scss
html.dark {
  // 表格头在深色下原为硬编码浅色 #f6f9fd（bug），改为深色冷调
  --el-table-header-bg-color: #11171d;
}
.dark .el-table th.el-table__cell {
  background: #11171d !important;
  color: var(--fa-gray-300) !important;
}
// 深色表面微冷分层（配合 A1 的 sheen token）
.dark .fa-stat-card,
.dark .fa-surface-raised {
  border-color: rgb(255 255 255 / 10%);
}
```

> 这同时修掉 `.el-table th` 深色浮白（连带 bug）。

### C7. 空状态 `.fa-empty`

`_fa-stat.scss` 或新建 `_fa-empty.scss`：

```scss
.fa-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--fa-space-3);
  padding: var(--fa-space-12) var(--fa-space-4);
  text-align: center;
  color: var(--fa-gray-600);
}
.fa-empty__art {
  width: 120px;
  height: 96px;
  opacity: 0.9;
}
.fa-empty__title {
  font-size: var(--fa-text-lg);
  font-weight: var(--fa-weight-semibold);
  color: var(--fa-gray-800);
}
.fa-empty__desc {
  font-size: var(--fa-text-sm);
  max-width: 320px;
}
```

示例插画（内联 SVG，替代纯文字空态）：

```html
<div class="fa-empty">
  <svg class="fa-empty__art" viewBox="0 0 120 96" fill="none">
    <rect
      x="18"
      y="30"
      width="84"
      height="54"
      rx="8"
      stroke="var(--fa-gray-400)"
      stroke-width="2"
    />
    <path d="M18 44h84" stroke="var(--fa-gray-400)" stroke-width="2" />
    <circle cx="60" cy="62" r="12" stroke="var(--theme-color)" stroke-width="2" />
    <path
      d="M60 56v12M54 62h12"
      stroke="var(--theme-color)"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
  <div class="fa-empty__title">暂无数据</div>
  <div class="fa-empty__desc">还没有可显示的内容，创建后会在这里出现。</div>
  <el-button type="primary">立即创建</el-button>
</div>
```

### C8. 品牌渐变工具类

`_fa-stat.scss` 或 `_fa-surface.scss`：

```scss
.fa-brand-gradient {
  background: linear-gradient(
    135deg,
    var(--theme-color),
    color-mix(in srgb, var(--theme-color) 55%, #6366f1)
  );
  color: #fff;
}
```

> 用于登录页 hero、主 CTA 强调、页面头图。保持克制，不滥用。

---

## D. 落地顺序 & 验证清单

### 推荐顺序

1. **A1 + A2**（P0）— 先止血，改动小、风险低、收益最高。
2. **B1 + B2**（P1）— 补字体/间距 token，为后续组件统一打底。
3. **C1 + C6**（表面/暗色）— 质感升级，纯样式、影响面广。
4. **C2 + C3 + C5**（卡片/侧边栏/按钮）— 核心美化模块，需配合少量 Vue 模板改动。
5. **C4**（微交互）— count-up 指令 + stagger，最后叠加动效。
6. **C7 + C8**（空状态/品牌渐变）— 碎片点缀。

### 验证清单（PR 前自查）

- [ ] 浅色 / 深色下 `.el-card`、`.fa-card*`、`.fa-table-card` 均不浮白（A1）
- [ ] 切换主题色后，引用 `--fa-primary` / Tailwind `--color-primary` 的元素跟随变化（A2）
- [ ] `.el-table th` 在深色下为深色背景（C6 连带修复）
- [ ] 全站字体族生效，统计数字 `tabular-nums` 对齐（B1）
- [ ] 无新增脱离 token 的硬编码 hex（除必要的语义固定色）
- [ ] `prefers-reduced-motion` 下动效关闭（C4）
- [ ] 键盘 Tab 焦点环可见（已有 `:focus-visible`，未被覆盖）
- [ ] `pnpm run build` 通过、`pnpm run lint` 无新增报错

### 参考

- 可视化方向原型：`dashboard-beautify-preview.html`（含深浅切换按钮，右上角 ☾/☀）
- 设计评审报告：`UI_DESIGN_REVIEW.md`（评分卡 + 完整问题清单）
- 既有 token 真相：`tailwind.css`（运行时变量）、`_fa-tokens.scss`（SCSS 单源）、`_overrides.scss`（EP 覆写）
