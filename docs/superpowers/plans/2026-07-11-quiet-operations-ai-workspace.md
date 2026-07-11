# Quiet Operations AI Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the AI/RAG module into a coherent operational workspace with visible retrieval evidence, document processing states, responsive layouts, and complete async feedback.

**Architecture:** Build small presentation components around the existing `module_ai` API clients and keep request ownership in the current pages. The chat page uses a responsive three-column shell; knowledge, document, retrieval, memory, and model pages reuse the same page header and async-state primitives from the foundation plan.

**Tech Stack:** Vue 3.5, TypeScript 6, Vite 7, Element Plus 2.13, Pinia 3, SCSS, Markdown-It, Vitest 4, Vue Test Utils, pnpm 9.

## Global Constraints

- Complete `2026-07-11-quiet-operations-admin-foundation.md` first.
- Preserve all `frontend/src/api/module_ai/*.ts` request paths and payload shapes unless a UI-only progress callback can be added without changing the HTTP body.
- Do not invent retrieval metadata or parse progress that the backend does not return.
- Do not add a heavy animation library.
- Use existing Iconify/Remix Icon or Element Plus icons; do not use emoji as structural icons.
- AI stages use meaningful state transitions and respect `prefers-reduced-motion`.
- Verify 375px, 768px, 1024px, and 1440px widths.
- Use `pnpm` for every frontend command.
- Do not commit unrelated untracked files or generated browser artifacts.

---

## File Map

**Shared AI presentation**

- Create `frontend/src/views/module_ai/components/FaAiPageHeader.vue`: selected knowledge base, service status, and page actions.
- Create `frontend/src/views/module_ai/components/FaAiProcessStatus.vue`: retrieval/generation or document-processing stages.
- Create `frontend/src/views/module_ai/components/FaCitationList.vue`: numbered sources and expandable snippets.

**Chat**

- `frontend/src/views/module_ai/chat/index.vue`: workspace orchestration and responsive panels.
- `frontend/src/views/module_ai/chat/components/FaSidebar.vue`: sessions.
- `frontend/src/views/module_ai/chat/components/FaChatNavbar.vue`: conversation context.
- `frontend/src/views/module_ai/chat/components/FaChatMessages.vue`: message list and async status.
- `frontend/src/views/module_ai/chat/components/FaMessageItem.vue`: answer/citation presentation.
- `frontend/src/views/module_ai/chat/components/FaChatInput.vue`: stable composer.
- `frontend/src/views/module_ai/chat/components/FaWelcomeScreen.vue`: focused empty state.

**Knowledge lifecycle**

- `frontend/src/views/module_ai/knowledge/index.vue`
- `frontend/src/views/module_ai/document/index.vue`
- `frontend/src/views/module_ai/retrieval/index.vue`
- `frontend/src/views/module_ai/memory/index.vue`
- `frontend/src/views/module_ai/memory-manage/index.vue`
- `frontend/src/views/module_ai/model-config/index.vue`

---

### Task 1: Shared AI Process And Citation Components

**Files:**
- Create: `frontend/src/views/module_ai/components/FaAiPageHeader.vue`
- Create: `frontend/src/views/module_ai/components/FaAiProcessStatus.vue`
- Create: `frontend/src/views/module_ai/components/FaCitationList.vue`
- Create: `frontend/src/views/module_ai/components/ai-components.spec.ts`

**Interfaces:**
- Produces: `AiStage = "idle" | "retrieving" | "reranking" | "generating" | "complete" | "error"`.
- Produces: `AiCitation { id: string; title: string; snippet?: string; source?: string; score?: number }`.
- Produces: page-header slots `actions` and `context`.

- [ ] **Step 1: Write failing component tests**

```ts
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import FaAiProcessStatus from "./FaAiProcessStatus.vue";
import FaCitationList from "./FaCitationList.vue";

describe("AI workspace primitives", () => {
  it("announces the current process stage", () => {
    const wrapper = mount(FaAiProcessStatus, { props: { stage: "retrieving" } });
    expect(wrapper.attributes("aria-live")).toBe("polite");
    expect(wrapper.text()).toContain("正在检索");
  });

  it("renders numbered expandable citations", () => {
    const wrapper = mount(FaCitationList, {
      props: { citations: [{ id: "1", title: "权限管理指南", snippet: "角色可关联查询权限" }] },
    });
    expect(wrapper.text()).toContain("权限管理指南");
    expect(wrapper.get("button").attributes("aria-expanded")).toBe("false");
  });
});
```

- [ ] **Step 2: Run tests and verify components are missing**

Run: `cd frontend && pnpm vitest run src/views/module_ai/components/ai-components.spec.ts`
Expected: FAIL on unresolved component imports.

- [ ] **Step 3: Implement presentation-only components**

`FaAiProcessStatus` maps the six stages to stable labels and semantic icons. `FaCitationList` owns only expand/collapse state and emits `select(citation)`; it never fetches content. `FaAiPageHeader` wraps the foundation `FaPageHeader`.

- [ ] **Step 4: Run component tests**

Run: `cd frontend && pnpm vitest run src/views/module_ai/components/ai-components.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/views/module_ai/components
git commit -m "feat(frontend): add AI workspace primitives"
```

### Task 2: Responsive Three-Column Chat Workspace

**Files:**
- Modify: `frontend/src/views/module_ai/chat/index.vue`
- Modify: `frontend/src/views/module_ai/chat/types.ts`
- Modify: `frontend/src/views/module_ai/chat/components/FaSidebar.vue`
- Modify: `frontend/src/views/module_ai/chat/components/FaChatNavbar.vue`
- Modify: `frontend/src/views/module_ai/chat/components/FaChatMessages.vue`
- Modify: `frontend/src/views/module_ai/chat/components/FaMessageItem.vue`
- Modify: `frontend/src/views/module_ai/chat/components/FaChatInput.vue`
- Modify: `frontend/src/views/module_ai/chat/components/FaWelcomeScreen.vue`
- Create: `frontend/src/views/module_ai/chat/chat-workspace.spec.ts`

**Interfaces:**
- Consumes: current `AiChatAPI`, `KnowledgeAPI`, session selection, WebSocket flow, and components from Task 1.
- Produces: `ChatWorkspacePanel = "sessions" | "conversation" | "evidence"` for responsive drawers.
- Preserves: existing create, rename, delete, switch, send, stop, reconnect, and knowledge-base selection behavior.

- [ ] **Step 1: Write a failing workspace contract test**

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("AI chat workspace", () => {
  const source = readFileSync(resolve(__dirname, "index.vue"), "utf-8");
  it("contains sessions, conversation and evidence regions", () => {
    expect(source).toContain('aria-label="会话列表"');
    expect(source).toContain('aria-label="对话内容"');
    expect(source).toContain('aria-label="回答依据"');
    expect(source).toContain("FaAiProcessStatus");
  });
});
```

- [ ] **Step 2: Run the focused chat tests and verify failure**

Run: `cd frontend && pnpm vitest run src/views/module_ai/chat/chat-workspace.spec.ts src/__tests__/chat-session-switch.test.ts src/__tests__/chat-thinking-message.test.ts`
Expected: the new contract FAILS; existing behavior tests remain PASS.

- [ ] **Step 3: Recompose the page without changing data flow**

Create explicit grid regions:

```vue
<div class="ai-chat-workspace">
  <aside class="ai-chat-sessions" aria-label="会话列表">
    <FaSidebar />
  </aside>
  <main class="ai-chat-conversation" aria-label="对话内容">
    <FaChatNavbar />
    <FaChatMessages />
    <FaChatInput />
  </main>
  <aside class="ai-chat-evidence" aria-label="回答依据">
    <FaAiProcessStatus :stage="processStage" />
    <FaCitationList :citations="activeCitations" />
  </aside>
</div>
```

Derive `processStage` from states already available in the page. If the current backend response has no structured citations, render an explicit “当前回答未提供可定位引用” state instead of fabricating sources.

- [ ] **Step 4: Implement responsive panels**

At 1024px make evidence collapsible; below 768px move sessions and evidence into separate Element Plus drawers while keeping the composer fixed inside the conversation column. Preserve stable heights and prevent message streaming from resizing the shell.

- [ ] **Step 5: Verify chat behavior and types**

Run: `cd frontend && pnpm vitest run src/views/module_ai/chat/chat-workspace.spec.ts src/__tests__/chat-session-switch.test.ts src/__tests__/chat-thinking-message.test.ts src/views/module_ai/chat/components/FaSidebar.spec.ts && pnpm type-check`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/views/module_ai/chat
git commit -m "feat(frontend): redesign AI chat workspace"
```

### Task 3: Knowledge Base Management

**Files:**
- Modify: `frontend/src/views/module_ai/knowledge/index.vue`
- Test: `frontend/src/__tests__/knowledge-page-actions.test.ts`
- Create: `frontend/src/views/module_ai/knowledge/knowledge-workspace.spec.ts`

**Interfaces:**
- Consumes: current `KnowledgeAPI` list/create/update/delete calls and route navigation.
- Produces: knowledge rows with document count, index summary, update time, and direct upload/retrieval actions when returned by the API.

- [ ] **Step 1: Write the failing page-state test**

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("knowledge workspace", () => {
  const source = readFileSync(resolve(__dirname, "index.vue"), "utf-8");
  it("uses shared page and async-state primitives", () => {
    expect(source).toContain("<FaAiPageHeader");
    expect(source).toContain("<FaAsyncState");
    expect(source).toContain("上传文档");
    expect(source).toContain("检索测试");
  });
});
```

- [ ] **Step 2: Run tests and verify the shared shell is missing**

Run: `cd frontend && pnpm vitest run src/views/module_ai/knowledge/knowledge-workspace.spec.ts src/__tests__/knowledge-page-actions.test.ts`
Expected: the new contract FAILS and existing action tests PASS.

- [ ] **Step 3: Recompose knowledge management**

Use a page header, compact filters, one primary “新建知识库” action, a table/list with returned counts and statuses, and `FaAsyncState` for loading/empty/error. Keep current post-create prompt, upload navigation, retrieval navigation, and delete payload.

- [ ] **Step 4: Verify knowledge tests**

Run: `cd frontend && pnpm vitest run src/views/module_ai/knowledge/knowledge-workspace.spec.ts src/__tests__/knowledge-page-actions.test.ts src/__tests__/knowledge-api.test.ts && pnpm type-check`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/views/module_ai/knowledge frontend/src/__tests__/knowledge-page-actions.test.ts
git commit -m "feat(frontend): refine knowledge base management"
```

### Task 4: Document Upload And Processing States

**Files:**
- Modify: `frontend/src/views/module_ai/document/index.vue`
- Test: `frontend/src/__tests__/knowledge-document-page.test.ts`
- Create: `frontend/src/views/module_ai/document/document-workspace.spec.ts`

**Interfaces:**
- Consumes: `KnowledgeAPI.listDocument`, `uploadDocument`, `reindexDocument`, `deleteDocument`, and returned `parse_status`/`index_status`.
- Produces: explicit upload, parse, index, complete, and failure presentation based only on returned fields.

- [ ] **Step 1: Write a failing status contract test**

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("document workspace", () => {
  const source = readFileSync(resolve(__dirname, "index.vue"), "utf-8");
  it("maps backend processing states and exposes retry", () => {
    expect(source).toContain("documentStatusMeta");
    expect(source).toContain("解析失败");
    expect(source).toContain("重新索引");
    expect(source).toContain("<FaAsyncState");
  });
});
```

- [ ] **Step 2: Run document tests and verify failure**

Run: `cd frontend && pnpm vitest run src/views/module_ai/document/document-workspace.spec.ts src/__tests__/knowledge-document-page.test.ts`
Expected: the new contract FAILS.

- [ ] **Step 3: Implement deterministic status mapping**

```ts
const documentStatusMeta = (row: KnowledgeDocument) => {
  if (row.parse_status === "failed") return { label: "解析失败", type: "danger" as const };
  if (row.index_status === "failed") return { label: "索引失败", type: "danger" as const };
  if (row.index_status === "success") return { label: "可检索", type: "success" as const };
  if (row.index_status === "indexing") return { label: "正在索引", type: "warning" as const };
  if (row.parse_status === "success") return { label: "等待索引", type: "info" as const };
  return { label: "等待处理", type: "info" as const };
};
```

The backend writes `pending`, `indexing`, `success`, and `failed`; use only those values. Keep upload validation and request body unchanged. Show `error_message` for failures and use reindex as the retry action for failed indexing.

- [ ] **Step 4: Verify document tests**

Run: `cd frontend && pnpm vitest run src/views/module_ai/document/document-workspace.spec.ts src/__tests__/knowledge-document-page.test.ts && pnpm type-check`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/views/module_ai/document frontend/src/__tests__/knowledge-document-page.test.ts
git commit -m "feat(frontend): expose document processing states"
```

### Task 5: Retrieval Test Workspace

**Files:**
- Modify: `frontend/src/views/module_ai/retrieval/index.vue`
- Create: `frontend/src/views/module_ai/retrieval/retrieval-workspace.spec.ts`

**Interfaces:**
- Consumes: existing knowledge options and `KnowledgeAPI.testRetrieval`.
- Produces: query area, collapsible advanced parameters, and ranked result list using returned content, metadata, and distance.

- [ ] **Step 1: Write the failing retrieval layout test**

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("retrieval test workspace", () => {
  const source = readFileSync(resolve(__dirname, "index.vue"), "utf-8");
  it("separates primary query from advanced settings and results", () => {
    expect(source).toContain("高级设置");
    expect(source).toContain("检索结果");
    expect(source).toContain("result-rank");
    expect(source).toContain("<FaAsyncState");
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `cd frontend && pnpm vitest run src/views/module_ai/retrieval/retrieval-workspace.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Recompose retrieval testing**

Keep knowledge-base and query controls visible. Move `top_k` into a collapsible “高级设置” area. Render ranked hits as unframed rows with source metadata, content, and returned distance; show empty, loading, no-result, and request-error states separately.

- [ ] **Step 4: Verify retrieval page and types**

Run: `cd frontend && pnpm vitest run src/views/module_ai/retrieval/retrieval-workspace.spec.ts && pnpm type-check`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/views/module_ai/retrieval
git commit -m "feat(frontend): redesign retrieval testing"
```

### Task 6: Memory And Model Operations

**Files:**
- Modify: `frontend/src/views/module_ai/memory/index.vue`
- Modify: `frontend/src/views/module_ai/memory-manage/index.vue`
- Modify: `frontend/src/views/module_ai/model-config/index.vue`
- Create: `frontend/src/views/module_ai/memory/memory-workspace.spec.ts`
- Create: `frontend/src/views/module_ai/model-config/model-config-workspace.spec.ts`

**Interfaces:**
- Consumes: current memory/session CRUD, permissions, detail dialogs, and model-config API.
- Produces: scannable memory scope/status views and a model health summary that never exposes a full secret.

- [ ] **Step 1: Write failing page contracts**

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("AI operations pages", () => {
  it("uses shared AI headers for memory and model configuration", () => {
    const memory = readFileSync(resolve(__dirname, "index.vue"), "utf-8");
    const model = readFileSync(resolve(__dirname, "../model-config/index.vue"), "utf-8");
    expect(memory).toContain("<FaAiPageHeader");
    expect(model).toContain("<FaAiPageHeader");
    expect(model).toContain("openai_api_key_configured");
    expect(model).not.toContain("config?.openai_api_key }}");
  });
});
```

- [ ] **Step 2: Run tests and verify shared headers are missing**

Run: `cd frontend && pnpm vitest run src/views/module_ai/memory/memory-workspace.spec.ts src/views/module_ai/model-config/model-config-workspace.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Normalize memory pages**

Keep existing table hooks and permissions. Add page headers, expose memory type/scope/update/status in scan order, use the common async states, and preserve existing create, edit, detail and delete behavior.

- [ ] **Step 4: Normalize model configuration**

Present service status, chat model, embedding provider/model, Chroma collection and storage path as grouped description rows. Display API key only as “已配置/未配置”; never render a secret value.

- [ ] **Step 5: Verify memory/model tests and permissions**

Run: `cd frontend && pnpm vitest run src/views/module_ai/memory/memory-workspace.spec.ts src/views/module_ai/model-config/model-config-workspace.spec.ts src/__tests__/permission-helper.test.ts && pnpm type-check`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/views/module_ai/memory frontend/src/views/module_ai/memory-manage frontend/src/views/module_ai/model-config
git commit -m "feat(frontend): refine AI memory and model operations"
```

### Task 7: AI Workspace Verification And Visual QA

**Files:**
- Modify only if verification reveals defects in Task 1–6 files.
- Create: `frontend/src/__tests__/ai-workspace-responsive.test.ts`

**Interfaces:**
- Consumes: complete AI workspace and foundation design system.
- Produces: test, build, responsive, dark-mode, keyboard, and streaming-state evidence.

- [ ] **Step 1: Add a responsive contract test**

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("AI workspace responsive contract", () => {
  it("defines tablet and mobile panel behavior", () => {
    const chat = readFileSync(resolve(__dirname, "../views/module_ai/chat/index.vue"), "utf-8");
    expect(chat).toContain("@media");
    expect(chat).toContain("1024px");
    expect(chat).toContain("768px");
    expect(chat).toContain("ElDrawer");
  });
});
```

- [ ] **Step 2: Run the complete frontend suite**

Run:

```bash
cd frontend
pnpm type-check
pnpm test
pnpm build
```

Expected: all commands exit 0.

- [ ] **Step 3: Start the application**

Run: `cd frontend && pnpm dev --host 127.0.0.1`
Expected: Vite prints a local URL and remains running.

- [ ] **Step 4: Perform browser-visible QA**

Capture and inspect AI chat, knowledge, document, retrieval, memory, and model pages at 375px, 768px, 1024px, and 1440px. Check both themes on chat, document, and retrieval. Verify session switching, streaming/thinking, empty citations, upload failure, processing status, no results, API failure, drawer focus, keyboard navigation, and reduced motion.

- [ ] **Step 5: Re-run verification after scoped fixes**

Run: `cd frontend && pnpm type-check && pnpm test && pnpm build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend
git commit -m "test(frontend): verify AI workspace redesign"
```
