# Quiet Operations Admin Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Quiet Operations design foundation, application shell, dashboard, authentication surface, and consistent system-management pages without changing backend contracts.

**Architecture:** Keep the current Vue 3, Element Plus, Pinia, router, and auto-import architecture. Define semantic design tokens and CSS variables in one source, map them into Element Plus, then apply them through the existing layout and CRUD components; page-specific components only compose those shared primitives.

**Tech Stack:** Vue 3.5, TypeScript 6, Vite 7, Element Plus 2.13, Pinia 3, SCSS, Tailwind 4, Vitest 4, Vue Test Utils, pnpm 9.

## Global Constraints

- Preserve all existing API request shapes, permission checks, route names, and data semantics.
- Do not add another UI framework or animation library.
- Use `pnpm` for every frontend command.
- Quiet Operations is the default light theme; dark and system themes remain functional.
- Default radius is 6px for panels and controls; floating surfaces may use up to 8px.
- Motion durations are 120–180ms for controls, 160–220ms for page entry, and about 200ms for overlays.
- All nonessential motion must respect `prefers-reduced-motion`.
- Verify 375px, 768px, 1024px, and 1440px widths.
- Do not commit `.superpowers/`, `frontend/web/`, `courseware/`, runtime data, archives, or other unrelated untracked files.

---

## File Map

**Theme ownership**

- `frontend/src/styles/core/_fa-tokens.scss`: SCSS constants and semantic CSS-variable source.
- `frontend/src/styles/core/app.scss`: page, panel, typography, focus, density, and utility contracts.
- `frontend/src/styles/element-plus/_theme.scss`: compile-time Element Plus color mapping.
- `frontend/src/styles/element-plus/_overrides.scss`: light-theme component alignment.
- `frontend/src/styles/element-plus/_dark.scss`: dark-theme semantic overrides.
- `frontend/src/styles/animations/router-transition.scss`: restrained page transitions and reduced-motion behavior.

**Shell ownership**

- `frontend/src/components/layouts/_fa-layouts.scss`: layout background, spacing, responsive behavior.
- `frontend/src/components/layouts/fa-menus/fa-sidebar-menu/index.vue`: sidebar brand and navigation shell.
- `frontend/src/components/layouts/fa-menus/fa-sidebar-menu/widgets/FaSidebarSubmenu.vue`: menu item states.
- `frontend/src/components/layouts/fa-header-bar/index.vue`: breadcrumb and global tools.
- `frontend/src/components/layouts/fa-work-tab/index.vue`: stable work-tab strip.

**Reusable page primitives**

- Create `frontend/src/components/layouts/fa-page-header/index.vue`: title, description, status, primary and secondary actions.
- Create `frontend/src/components/feedback/fa-async-state/index.vue`: loading, empty, error, forbidden, and partial-failure presentation.

**Page ownership**

- `frontend/src/views/home/index.vue` and `frontend/src/views/home/modules/*.vue`: operations dashboard.
- `frontend/src/components/views/fa-login/**`: login composition and styling.
- `frontend/src/views/module_system/**/index.vue` and `frontend/src/views/module_platform/menu/index.vue`: management-page composition.

---

### Task 1: Semantic Theme And Density Contract

**Files:**
- Modify: `frontend/src/styles/core/_fa-tokens.scss`
- Modify: `frontend/src/styles/core/app.scss`
- Modify: `frontend/src/styles/element-plus/_theme.scss`
- Modify: `frontend/src/styles/element-plus/_overrides.scss`
- Modify: `frontend/src/styles/element-plus/_dark.scss`
- Modify: `frontend/src/styles/animations/router-transition.scss`
- Modify: `frontend/src/config/setting.ts`
- Modify: `frontend/src/config/setting.spec.ts`
- Create: `frontend/src/__tests__/quiet-operations-theme.test.ts`

**Interfaces:**
- Produces: CSS variables `--fa-color-*`, `--fa-space-*`, `--fa-radius-*`, `--fa-motion-*`, and `--fa-control-height`.
- Consumes: current runtime `--theme-color`, `--default-bg-color`, and Element Plus CSS variables.

- [ ] **Step 1: Write the failing source-contract test**

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(__dirname, "..", path), "utf-8");

describe("Quiet Operations theme contract", () => {
  it("defines semantic surface, radius, density, and motion tokens", () => {
    const tokens = source("styles/core/_fa-tokens.scss");
    expect(tokens).toContain("--fa-color-surface");
    expect(tokens).toContain("--fa-color-sidebar");
    expect(tokens).toContain("--fa-radius-panel: 6px");
    expect(tokens).toContain("--fa-control-height: 36px");
    expect(tokens).toContain("--fa-motion-page: 200ms");
  });

  it("supports reduced motion and a real dark surface hierarchy", () => {
    expect(source("styles/animations/router-transition.scss")).toContain("prefers-reduced-motion");
    const dark = source("styles/element-plus/_dark.scss");
    expect(dark).toContain("--fa-color-surface-raised");
    expect(dark).toContain("--fa-color-border");
  });

  it("uses Quiet Operations teal as the default configurable brand color", () => {
    expect(source("config/setting.ts")).toContain('"#2d7d72"');
  });
});
```

- [ ] **Step 2: Run the test and verify the contract is missing**

Run: `cd frontend && pnpm vitest run src/__tests__/quiet-operations-theme.test.ts`
Expected: FAIL because the semantic Quiet Operations variables do not exist.

- [ ] **Step 3: Define and map the minimal token set**

Add the semantic contract to `_fa-tokens.scss`, then consume it from the other style files:

```scss
:root {
  --fa-color-canvas: #f3f5f6;
  --fa-color-surface: #ffffff;
  --fa-color-surface-raised: #ffffff;
  --fa-color-sidebar: #18232d;
  --fa-color-sidebar-active: #263842;
  --fa-color-accent: #2d7d72;
  --fa-color-text: #26333d;
  --fa-color-text-muted: #68747c;
  --fa-color-border: #dfe5e8;
  --fa-radius-control: 5px;
  --fa-radius-panel: 6px;
  --fa-radius-overlay: 8px;
  --fa-control-height: 36px;
  --fa-motion-control: 150ms;
  --fa-motion-page: 200ms;
}

html.dark {
  --fa-color-canvas: #0d1318;
  --fa-color-surface: #151d23;
  --fa-color-surface-raised: #1b252c;
  --fa-color-text: #e7edef;
  --fa-color-text-muted: #9cabb3;
  --fa-color-border: #2c3941;
}
```

Remove decorative orb/grid backgrounds and the 100px dialog-radius override. Map Element Plus surfaces, borders, text, controls, table rows, overlays, focus rings, and dark mode to the semantic variables.

Make `#2d7d72` the first `themeColorPresets` value in `config/setting.ts`, while preserving the remaining user-selectable presets and runtime `setElementThemeColor()` behavior. Update `config/setting.spec.ts` to assert the new first preset.

- [ ] **Step 4: Add reduced-motion behavior**

```scss
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

- [ ] **Step 5: Verify theme tests and compile**

Run: `cd frontend && pnpm vitest run src/__tests__/quiet-operations-theme.test.ts src/config/setting.spec.ts && pnpm type-check`
Expected: both commands PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/styles frontend/src/config/setting.ts frontend/src/config/setting.spec.ts frontend/src/__tests__/quiet-operations-theme.test.ts
git commit -m "feat(frontend): add Quiet Operations theme tokens"
```

### Task 2: Application Shell, Sidebar, Header, And Tabs

**Files:**
- Modify: `frontend/src/components/layouts/_fa-layouts.scss`
- Modify: `frontend/src/components/layouts/fa-menus/fa-sidebar-menu/index.vue`
- Modify: `frontend/src/components/layouts/fa-menus/fa-sidebar-menu/widgets/FaSidebarSubmenu.vue`
- Modify: `frontend/src/components/layouts/fa-header-bar/index.vue`
- Modify: `frontend/src/components/layouts/fa-work-tab/index.vue`
- Create: `frontend/src/__tests__/quiet-operations-layout.test.ts`

**Interfaces:**
- Consumes: semantic tokens from Task 1 and current settings-store menu modes.
- Produces: stable `.app-layout`, `.fa-sidebar-shell`, `.fa-header-shell`, and `.worktab-tags-shell` contracts.

- [ ] **Step 1: Write the failing layout contract test**

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(__dirname, "..", path), "utf-8");

describe("Quiet Operations shell", () => {
  it("uses semantic surfaces without decorative gradients", () => {
    const layout = read("components/layouts/_fa-layouts.scss");
    expect(layout).toContain("var(--fa-color-canvas)");
    expect(layout).not.toContain("radial-gradient");
    expect(layout).not.toContain("backdrop-filter");
  });

  it("keeps the header and tabs dimensionally stable", () => {
    expect(read("components/layouts/fa-header-bar/index.vue")).toContain("fa-header-shell");
    expect(read("components/layouts/fa-work-tab/index.vue")).toContain("fa-worktab-shell");
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `cd frontend && pnpm vitest run src/__tests__/quiet-operations-layout.test.ts`
Expected: FAIL on missing semantic classes and existing radial gradients.

- [ ] **Step 3: Refactor shell composition**

Add stable semantic classes without changing component events or stores:

```vue
<div class="fa-header-shell w-full">
  <div class="fa-header-main">
    <div class="fa-header-context">
      <!-- existing menu button, refresh, breadcrumb and menu variants -->
    </div>
    <div id="app-header-toolbar" class="fa-header-tools">
      <!-- existing search, theme, settings and user controls -->
    </div>
  </div>
  <FaWorkTab />
</div>
```

Use a 48–60px stable header track, a solid canvas, 16–22px responsive content padding, and sidebar selected states that remain identifiable without color alone. Preserve all current menu modes and settings toggles.

- [ ] **Step 4: Stabilize work-tab interactions**

Use a fixed toolbar track, ellipsis for long labels, `focus-visible` rings, and no width-changing hover effects. Keep existing close, bookmark, overflow and context-menu actions.

- [ ] **Step 5: Run focused and existing shell tests**

Run: `cd frontend && pnpm vitest run src/__tests__/quiet-operations-layout.test.ts src/App.spec.ts src/config/setting.spec.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/layouts frontend/src/__tests__/quiet-operations-layout.test.ts
git commit -m "feat(frontend): refine application shell"
```

### Task 3: Reusable Page Header And Async States

**Files:**
- Create: `frontend/src/components/layouts/fa-page-header/index.vue`
- Create: `frontend/src/components/feedback/fa-async-state/index.vue`
- Create: `frontend/src/components/layouts/fa-page-header/FaPageHeader.spec.ts`
- Create: `frontend/src/components/feedback/fa-async-state/FaAsyncState.spec.ts`

**Interfaces:**
- Produces: `FaPageHeaderProps { title: string; description?: string; status?: string }`.
- Produces: `FaAsyncStateProps { state: "loading" | "empty" | "error" | "forbidden" | "partial"; title?: string; description?: string }`.
- Slots: page header `status`, `actions`; async state `default`, `action`.

- [ ] **Step 1: Write failing component tests**

```ts
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import FaPageHeader from "./index.vue";

describe("FaPageHeader", () => {
  it("renders semantic title, description and actions", () => {
    const wrapper = mount(FaPageHeader, {
      props: { title: "用户管理", description: "维护账号与访问范围" },
      slots: { actions: "<button>新建用户</button>" },
    });
    expect(wrapper.get("h1").text()).toBe("用户管理");
    expect(wrapper.text()).toContain("维护账号与访问范围");
    expect(wrapper.get("button").text()).toBe("新建用户");
  });
});
```

```ts
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import FaAsyncState from "./index.vue";

describe("FaAsyncState", () => {
  it("announces an error and exposes retry action", () => {
    const wrapper = mount(FaAsyncState, {
      props: { state: "error", title: "加载失败" },
      slots: { action: "<button>重试</button>" },
    });
    expect(wrapper.attributes("role")).toBe("alert");
    expect(wrapper.text()).toContain("加载失败");
    expect(wrapper.get("button").text()).toBe("重试");
  });
});
```

- [ ] **Step 2: Run tests and verify imports fail**

Run: `cd frontend && pnpm vitest run src/components/layouts/fa-page-header/FaPageHeader.spec.ts src/components/feedback/fa-async-state/FaAsyncState.spec.ts`
Expected: FAIL because both components are missing.

- [ ] **Step 3: Implement focused components**

Use semantic HTML and existing `FaSvgIcon`/Element Plus primitives. `FaAsyncState` renders a skeleton for loading, `ElEmpty` for empty, and an alert block for error/forbidden/partial; it must not own request logic.

- [ ] **Step 4: Run component tests**

Run: `cd frontend && pnpm vitest run src/components/layouts/fa-page-header/FaPageHeader.spec.ts src/components/feedback/fa-async-state/FaAsyncState.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/layouts/fa-page-header frontend/src/components/feedback/fa-async-state
git commit -m "feat(frontend): add operational page primitives"
```

### Task 4: Operations Dashboard

**Files:**
- Modify: `frontend/src/views/home/index.vue`
- Modify: `frontend/src/views/home/modules/banner.vue`
- Modify: `frontend/src/views/home/modules/online-user-card.vue`
- Modify: `frontend/src/views/home/modules/visit-stat-card.vue`
- Modify: `frontend/src/views/home/modules/visit-trend-card.vue`
- Modify: `frontend/src/views/home/modules/recent-activity-card.vue`
- Create: `frontend/src/views/home/home-dashboard.spec.ts`

**Interfaces:**
- Consumes: `FaPageHeader` and existing home data sources.
- Produces: four stable metric blocks, usage trend, actionable issues, and explicit demo-data labeling when data is static.

- [ ] **Step 1: Write the failing dashboard contract test**

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("operations dashboard", () => {
  const home = readFileSync(resolve(__dirname, "index.vue"), "utf-8");

  it("shows system health and marks static metrics as sample data", () => {
    expect(home).toContain("运营总览");
    expect(home).toContain("示例数据");
    expect(home).toContain("平均响应");
    expect(home).toContain("待处理事项");
  });
});
```

- [ ] **Step 2: Run the test and verify missing content**

Run: `cd frontend && pnpm vitest run src/views/home/home-dashboard.spec.ts`
Expected: FAIL because the current page does not expose the full operations contract.

- [ ] **Step 3: Recompose the dashboard**

Use an unframed page header, a four-column metric grid, a two-column trend/action band, and a final activity/status band. Keep static values in a clearly named `demoMetrics` constant and render `示例数据` until a real endpoint exists.

- [ ] **Step 4: Add responsive rules**

Use four columns at 1440px, two at 768–1024px, and one at 375px. Give charts an explicit `min-height` and prevent metric labels from resizing cards.

- [ ] **Step 5: Verify dashboard and build**

Run: `cd frontend && pnpm vitest run src/views/home/home-dashboard.spec.ts && pnpm type-check`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/views/home
git commit -m "feat(frontend): redesign operations dashboard"
```

### Task 5: Authentication Surface

**Files:**
- Modify: `frontend/src/views/module_system/auth/login/index.vue`
- Modify: `frontend/src/components/views/fa-login/_fa-login.scss`
- Modify: `frontend/src/components/views/fa-login/backdrops/FaLoginLeftView.vue`
- Modify: `frontend/src/components/views/fa-login/panels/*.vue`
- Modify: `frontend/src/components/views/fa-login/widgets/FaAuthTopBar.vue`
- Test: `frontend/src/components/views/fa-login/forms/FaLoginAccountForm.spec.ts`
- Create: `frontend/src/components/views/fa-login/FaLoginShell.spec.ts`

**Interfaces:**
- Consumes: existing authentication forms, validation, routing, system logo and system name.
- Produces: responsive Quiet Operations auth shell without changing login behavior.

- [ ] **Step 1: Add a failing shell test**

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("login shell", () => {
  const css = readFileSync(resolve(__dirname, "_fa-login.scss"), "utf-8");
  it("uses semantic surfaces and mobile constraints", () => {
    expect(css).toContain("var(--fa-color-canvas)");
    expect(css).toContain("@media");
    expect(css).not.toContain("radial-gradient");
  });
});
```

- [ ] **Step 2: Run the login tests and verify the new contract fails**

Run: `cd frontend && pnpm vitest run src/components/views/fa-login/FaLoginShell.spec.ts src/components/views/fa-login/forms/FaLoginAccountForm.spec.ts`
Expected: the new shell test FAILS while the existing form test remains PASS.

- [ ] **Step 3: Restyle without touching authentication flow**

Keep all form components, emits, stores, and redirect logic. Use a solid contextual left panel on desktop, an unframed login form area, visible focus states, stable button height, and a single-column mobile composition.

- [ ] **Step 4: Verify authentication tests**

Run: `cd frontend && pnpm vitest run src/components/views/fa-login/FaLoginShell.spec.ts src/components/views/fa-login/forms/FaLoginAccountForm.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/views/module_system/auth/login frontend/src/components/views/fa-login
git commit -m "feat(frontend): refine authentication experience"
```

### Task 6: System And Platform Management Pages

**Files:**
- Modify: `frontend/src/views/module_system/user/index.vue`
- Modify: `frontend/src/views/module_system/role/index.vue`
- Modify: `frontend/src/views/module_system/dept/index.vue`
- Modify: `frontend/src/views/module_system/dict/index.vue`
- Modify: `frontend/src/views/module_system/params/index.vue`
- Modify: `frontend/src/views/module_system/log/index.vue`
- Modify: `frontend/src/views/module_platform/menu/index.vue`
- Create: `frontend/src/__tests__/management-page-contract.test.ts`

**Interfaces:**
- Consumes: existing `FaSearchBar`, `FaTableHeader`, `FaTable`, `FaDialog`, `FaPageHeader`, permissions, hooks, and APIs.
- Produces: consistent page title, filter, table, pagination, drawer/dialog, and dangerous-action hierarchy.

- [ ] **Step 1: Write a failing cross-page contract test**

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const pages = [
  "views/module_system/user/index.vue",
  "views/module_system/role/index.vue",
  "views/module_system/dept/index.vue",
  "views/module_system/dict/index.vue",
  "views/module_system/params/index.vue",
  "views/module_system/log/index.vue",
  "views/module_platform/menu/index.vue",
];

describe("management page contract", () => {
  for (const page of pages) {
    it(`${page} uses the operational page shell`, () => {
      const source = readFileSync(resolve(__dirname, "..", page), "utf-8");
      expect(source).toContain("<FaPageHeader");
      expect(source).toContain("fa-management-page");
    });
  }
});
```

- [ ] **Step 2: Run the test and verify all pages fail the new contract**

Run: `cd frontend && pnpm vitest run src/__tests__/management-page-contract.test.ts`
Expected: FAIL for pages that do not yet use the common shell.

- [ ] **Step 3: Normalize composition without rewriting CRUD logic**

For each page, add `FaPageHeader`, wrap search/table content in `.fa-management-page`, preserve current permission directives and hooks, and keep one primary creation action. Retain user-page department tree as a peer panel, not a card nested inside another card.

- [ ] **Step 4: Normalize dialogs and destructive actions**

Use drawers for simple create/edit flows where existing form APIs allow it; keep complex existing dialogs where conversion would alter behavior. Ensure delete confirmations name the target and impact. Do not change payloads or endpoint calls.

- [ ] **Step 5: Run management and permission tests**

Run: `cd frontend && pnpm vitest run src/__tests__/management-page-contract.test.ts src/__tests__/permission-helper.test.ts && pnpm type-check`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/views/module_system frontend/src/views/module_platform/menu frontend/src/__tests__/management-page-contract.test.ts
git commit -m "feat(frontend): unify management page experience"
```

### Task 7: Foundation Verification And Visual QA

**Files:**
- Modify only if verification reveals defects in files owned by Tasks 1–6.
- Create: `frontend/src/__tests__/quiet-operations-accessibility.test.ts`

**Interfaces:**
- Consumes: complete Phase 1 UI.
- Produces: verified light/dark, responsive, keyboard, reduced-motion, test, and build evidence.

- [ ] **Step 1: Add an accessibility contract test**

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("global accessibility contracts", () => {
  it("keeps skip navigation and visible focus styles", () => {
    const layout = readFileSync(resolve(__dirname, "../components/layouts/index.vue"), "utf-8");
    const app = readFileSync(resolve(__dirname, "../styles/core/app.scss"), "utf-8");
    expect(layout).toContain('href="#app-content"');
    expect(app).toContain(":focus-visible");
  });
});
```

- [ ] **Step 2: Run the complete frontend verification**

Run:

```bash
cd frontend
pnpm type-check
pnpm test
pnpm build
```

Expected: all commands exit 0.

- [ ] **Step 3: Start the app for visual QA**

Run: `cd frontend && pnpm dev --host 127.0.0.1`
Expected: Vite prints a local URL and remains running.

- [ ] **Step 4: Inspect required viewports**

Use browser screenshots at 375px, 768px, 1024px, and 1440px for login, dashboard, user management, and menu management. Repeat dashboard and one management page in dark mode. Verify no overlap, horizontal overflow, clipped labels, hover layout shift, invisible focus, or color-only status.

- [ ] **Step 5: Run verification again after visual fixes**

Run: `cd frontend && pnpm type-check && pnpm test && pnpm build`
Expected: PASS after any scoped fixes.

- [ ] **Step 6: Commit**

```bash
git add frontend
git commit -m "test(frontend): verify Quiet Operations foundation"
```
