import { flushPromises, shallowMount, type VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ChatPage from "@/views/module_ai/chat/index.vue";
import type { ChatMessage, UploadedFile } from "@/views/module_ai/chat/types";

const { createSession, getDetail, clearDraft } = vi.hoisted(() => ({
  createSession: vi.fn(),
  getDetail: vi.fn(),
  clearDraft: vi.fn(),
}));
vi.mock("@/api/module_ai/chat", () => ({
  default: {
    createSession,
    getSessionDetail: getDetail,
  },
}));
vi.mock("@/api/module_ai/knowledge", () => ({
  default: {
    optionselect: vi.fn().mockResolvedValue({ data: { data: [] } }),
  },
}));
vi.mock("@/api/module_system/auth", () => ({
  default: {
    createWsTicket: vi.fn().mockResolvedValue({ data: { data: { ticket: "test-ticket" } } }),
  },
}));
vi.mock("element-plus", () => ({
  ElMessage: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
  ElMessageBox: { confirm: vi.fn().mockResolvedValue(true) },
}));
vi.mock("@vueuse/core", () => ({
  useMediaQuery: () => false,
  useElementBounding: () => ({ top: { value: 0 } }),
  useWindowSize: () => ({ height: { value: 1000 } }),
}));

class TestSocket {
  static OPEN = 1;
  static CLOSED = 3;
  static instances: TestSocket[] = [];
  readyState = 1;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  sent: Record<string, any>[] = [];
  constructor() {
    TestSocket.instances.push(this);
  }
  send(data: string) {
    this.sent.push(JSON.parse(data));
  }
  close() {
    this.readyState = 3;
  }
  event(type: string, requestId: string, extra = {}) {
    this.onmessage?.({ data: JSON.stringify({ type, request_id: requestId, ...extra }) });
  }
}

interface Page {
  messages: ChatMessage[];
  sending: boolean;
  error: string;
  processStage: string;
  currentSessionId: string | null;
  handleSendMessage: (message: string, files?: UploadedFile[]) => Promise<void>;
  handleNewSession: () => void;
  stopGeneration: () => void;
  handleSelectSession: (session: { id: string }) => Promise<void>;
  retryMessage: (id: string) => void;
  toggleConnection: () => void;
}
let wrapper: VueWrapper;
let page: Page;
let socket: TestSocket;
beforeEach(async () => {
  vi.stubGlobal("WebSocket", TestSocket);
  vi.stubEnv("VITE_APP_WS_ENDPOINT", "ws://localhost:8000");
  TestSocket.instances = [];
  clearDraft.mockClear();
  createSession.mockReset().mockResolvedValue({ data: { code: 200, data: { id: "session-one" } } });
  getDetail.mockReset();
  wrapper = shallowMount(ChatPage, {
    global: {
      stubs: {
        ElSplitter: { template: "<div><slot /></div>" },
        ElSplitterPanel: { template: "<div><slot /></div>" },
        ElContainer: { template: "<div><slot /></div>" },
        ElHeader: { template: "<div><slot /></div>" },
        ElMain: { template: "<div><slot /></div>" },
        ElFooter: { template: "<div><slot /></div>" },
        FaSidebar: {
          setup: (_, { expose }) => {
            expose({ loadSessions: vi.fn() });
          },
          template: "<div />",
        },
        FaChatMessages: {
          setup: (_, { expose }) => {
            expose({ scrollToBottom: vi.fn() });
          },
          template: "<div />",
        },
        FaChatInput: {
          setup: (_, { expose }) => {
            expose({ clearDraft });
          },
          template: "<div />",
        },
      },
    },
  });
  await flushPromises();
  page = wrapper.vm as unknown as Page;
  socket = TestSocket.instances[0]!;
  socket.onopen?.();
});
afterEach(() => {
  wrapper.unmount();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("chat request lifecycle", () => {
  it("invalidates pending session creation on connection loss without replaying", async () => {
    let resolve!: (response: unknown) => void;
    createSession.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        })
    );
    const pending = page.handleSendMessage("断线前的问题");
    socket.onclose?.();
    page.toggleConnection();
    await flushPromises();
    const reconnected = TestSocket.instances[1]!;
    reconnected.onopen?.();
    resolve({ data: { code: 200, data: { id: "late-session" } } });
    await pending;
    expect(socket.sent).toHaveLength(0);
    expect(reconnected.sent).toHaveLength(0);
    expect(clearDraft).not.toHaveBeenCalled();
    expect(page.currentSessionId).toBeNull();
    expect(page.sending).toBe(false);
  });
  it("waits for done, sends attachment text, and binds sources to the answer", async () => {
    await page.handleSendMessage("附件有什么？", [
      {
        id: "file",
        name: "notes.txt",
        type: ".txt",
        size: 12,
        status: "ready",
        content: "独有暗号青苹果",
      },
    ]);
    const request = socket.sent[0]!;
    expect(page.sending).toBe(true);
    expect(clearDraft).toHaveBeenCalledOnce();
    expect(request.files[0].content).toBe("独有暗号青苹果");
    await page.handleSendMessage("重复问题");
    expect(socket.sent).toHaveLength(1);
    socket.event("chunk", "old-request", { content: "串话" });
    socket.event("stage", request.request_id, { stage: "generating" });
    socket.event("citations", request.request_id, {
      citations: [{ id: "1", title: "notes.txt", snippet: "独有暗号青苹果" }],
    });
    socket.event("chunk", request.request_id, { content: "青苹果" });
    expect(page.messages[1]?.content).toBe("青苹果");
    expect(page.processStage).toBe("generating");
    socket.event("done", request.request_id);
    expect(page.sending).toBe(false);
    expect(page.messages[1]?.loading).toBe(false);
    expect(page.messages[1]?.citations?.[0]?.title).toBe("notes.txt");
  });

  it("stops generation and ignores chunks after a session switch", async () => {
    await page.handleSendMessage("问题");
    const request = socket.sent[0]!;
    page.stopGeneration();
    expect(socket.sent[1]).toEqual({ type: "cancel", request_id: request.request_id });
    expect(page.messages[1]?.stopped).toBe(true);
    page.handleNewSession();
    socket.event("chunk", request.request_id, { content: "晚到的数据" });
    expect(page.messages).toHaveLength(0);
    expect(page.sending).toBe(false);
  });

  it("keeps draft when session creation fails and suppresses late creation", async () => {
    createSession.mockRejectedValueOnce(new Error("offline"));
    await page.handleSendMessage("保留草稿");
    expect(clearDraft).not.toHaveBeenCalled();
    expect(page.sending).toBe(false);
    expect(page.error).toContain("草稿已保留");
    let resolve!: (response: unknown) => void;
    createSession.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        })
    );
    const pending = page.handleSendMessage("未完成创建");
    page.handleNewSession();
    resolve({ data: { code: 200, data: { id: "obsolete" } } });
    await pending;
    expect(page.currentSessionId).toBeNull();
    expect(socket.sent).toHaveLength(0);
  });

  it("makes failures retryable and restores history sources", async () => {
    await page.handleSendMessage("原问题");
    socket.event("error", socket.sent[0]!.request_id, { message: "模型不可用" });
    expect(page.messages[1]?.error).toBe("模型不可用");
    page.retryMessage(page.messages[1]!.id);
    await flushPromises();
    expect(clearDraft).toHaveBeenCalledOnce();
    expect(socket.sent[1]?.message).toBe("原问题");
    getDetail.mockResolvedValue({
      data: {
        code: 200,
        data: {
          runs: [
            {
              messages: [
                { role: "assistant", content: "已保存", citations: [{ id: "1", title: "原文" }] },
              ],
            },
          ],
        },
      },
    });
    await page.handleSelectSession({ id: "saved" });
    expect(page.messages[0]?.citations?.[0]?.title).toBe("原文");
    expect(page.sending).toBe(false);
  });

  it("blocks sends during session loading and ignores a late session response", async () => {
    let resolve!: (response: unknown) => void;
    getDetail.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        })
    );
    const pending = page.handleSelectSession({ id: "previous" });
    await page.handleSendMessage("不能发到旧会话");
    expect(socket.sent).toHaveLength(0);
    page.handleNewSession();
    resolve({
      data: {
        code: 200,
        data: { runs: [{ messages: [{ role: "assistant", content: "晚到的历史" }] }] },
      },
    });
    await pending;
    expect(page.messages).toHaveLength(0);
    expect(page.currentSessionId).toBeNull();
  });
});
