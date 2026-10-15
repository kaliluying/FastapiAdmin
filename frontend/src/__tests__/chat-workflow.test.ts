import { flushPromises, shallowMount, type VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ChatPage from "@/views/module_ai/chat/index.vue";
import type { ChatMessage, UploadedFile } from "@/views/module_ai/chat/types";

const { createSession, getDetail, clearDraft, streamRequest } = vi.hoisted(() => ({
  createSession: vi.fn(),
  getDetail: vi.fn(),
  clearDraft: vi.fn(),
  streamRequest: vi.fn(),
}));
vi.mock("@/api/module_ai/chat", () => ({
  default: {
    createSession,
    getSessionDetail: getDetail,
    stream: streamRequest,
    getRuntimeLogStatus: vi.fn().mockResolvedValue({ data: { data: { can_query: false } } }),
  },
}));
vi.mock("@/api/module_ai/knowledge", () => ({
  default: {
    optionselect: vi.fn().mockResolvedValue({ data: { data: [] } }),
  },
}));
vi.mock("@/api/module_ai/quality", () => ({
  default: { feedbackList: vi.fn().mockResolvedValue({ data: { data: { items: [] } } }) },
}));
vi.mock("element-plus", () => ({
  ElMessage: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
  ElMessageBox: { confirm: vi.fn().mockResolvedValue(true) },
}));
vi.mock("@vueuse/core", () => ({
  useIntervalFn: () => ({ pause: vi.fn(), resume: vi.fn() }),
  useMediaQuery: () => false,
  useElementBounding: () => ({ top: { value: 0 } }),
  useWindowSize: () => ({ height: { value: 1000 } }),
}));

class TestStream {
  sent: Record<string, any>[] = [];
  signals: AbortSignal[] = [];
  callbacks: ((data: string) => void)[] = [];
  reject!: (reason: Error) => void;
  event(type: string, requestId: string, extra = {}) {
    this.callbacks.at(-1)?.(JSON.stringify({ type, request_id: requestId, ...extra }));
  }
}

interface Page {
  messages: ChatMessage[];
  sending: boolean;
  error: string;
  processStage: string;
  currentSessionId: string | null;
  isMobileDrawerOpen: boolean;
  mobileSidebarRef: { loadSessions: () => void };
  handleSendMessage: (message: string, files?: UploadedFile[]) => Promise<void>;
  handleNewSession: () => void;
  stopGeneration: () => void;
  handleSelectSession: (session: { id: string }) => Promise<void>;
  retryMessage: (id: string) => void;
}
let wrapper: VueWrapper;
let page: Page;
let stream: TestStream;
beforeEach(async () => {
  stream = new TestStream();
  streamRequest.mockReset().mockImplementation((body, signal, onData, onOpen) => {
    stream.sent.push(body);
    stream.signals.push(signal);
    stream.callbacks.push(onData);
    onOpen();
    return new Promise((_, reject) => {
      stream.reject = reject;
    });
  });
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
});
afterEach(() => {
  wrapper.unmount();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("chat request lifecycle", () => {
  it("refreshes a previously opened mobile history only after completion", () => {
    const loadSessions = vi.fn();
    page.mobileSidebarRef = { loadSessions };
    void page.handleSendMessage("窄屏新对话");
    const request = stream.sent[0]!;
    stream.event("chunk", request.request_id, { content: "回答" });
    expect(loadSessions).not.toHaveBeenCalled();
    stream.event("done", request.request_id, { session_id: "new-mobile-session" });
    expect(loadSessions).toHaveBeenCalledOnce();
  });

  it("closes the session drawer after success or a new conversation, and keeps it on failure", async () => {
    page.isMobileDrawerOpen = true;
    getDetail.mockRejectedValueOnce(new Error("unavailable"));
    await page.handleSelectSession({ id: "saved" });
    expect(page.isMobileDrawerOpen).toBe(true);
    getDetail.mockResolvedValueOnce({ data: { code: 200, data: { runs: [] } } });
    await page.handleSelectSession({ id: "saved" });
    expect(page.isMobileDrawerOpen).toBe(false);
    page.isMobileDrawerOpen = true;
    page.handleNewSession();
    expect(page.isMobileDrawerOpen).toBe(false);
  });

  it("links all failed attempts to the confirmed answer and prevents replay from recovered failures", async () => {
    void page.handleSendMessage("原问题");
    stream.event("error", stream.sent[0]!.request_id, { message: "暂不可用" });
    const first = page.messages[1]!;
    page.retryMessage(first.id);
    const second = page.messages[3]!;
    expect(first.retriedMessageId).toBeUndefined();
    stream.event("error", stream.sent[1]!.request_id, { message: "仍不可用" });
    page.retryMessage(second.id);
    const saved = page.messages[5]!;
    stream.event("chunk", stream.sent[2]!.request_id, { content: "重试成功" });
    expect(first.retriedMessageId).toBeUndefined();
    stream.event("done", stream.sent[2]!.request_id, { session_id: "saved" });
    expect(first.retriedMessageId).toBe(saved.id);
    expect(second.retriedMessageId).toBe(saved.id);
    page.retryMessage(first.id);
    page.retryMessage(second.id);
    expect(stream.sent).toHaveLength(3);
    expect(clearDraft).toHaveBeenCalledOnce();
  });

  it("does not mark a stopped retry successful when late completion arrives", async () => {
    void page.handleSendMessage("原问题");
    stream.event("error", stream.sent[0]!.request_id, { message: "暂不可用" });
    const failed = page.messages[1]!;
    page.retryMessage(failed.id);
    page.stopGeneration();
    stream.event("done", stream.sent[1]!.request_id, { session_id: "late" });
    expect(failed.retriedMessageId).toBeUndefined();
  });

  it("ignores late completion after stream failure without replaying or precreating a session", async () => {
    void page.handleSendMessage("断线前的问题");
    const request = stream.sent[0]!;
    stream.reject(new Error("连接中断"));
    await flushPromises();
    stream.event("done", request.request_id, { session_id: "late-session" });
    expect(stream.sent).toHaveLength(1);
    expect(clearDraft).toHaveBeenCalledOnce();
    expect(createSession).not.toHaveBeenCalled();
    expect(page.currentSessionId).toBeNull();
    expect(page.sending).toBe(false);
  });
  it("waits for done, sends attachment text, and binds sources to the answer", async () => {
    void page.handleSendMessage("附件有什么？", [
      {
        id: "file",
        name: "notes.txt",
        type: ".txt",
        size: 12,
        status: "ready",
        content: "独有暗号青苹果",
      },
    ]);
    const request = stream.sent[0]!;
    expect(page.sending).toBe(true);
    expect(clearDraft).toHaveBeenCalledOnce();
    expect(request.files[0].content).toBe("独有暗号青苹果");
    void page.handleSendMessage("重复问题");
    expect(stream.sent).toHaveLength(1);
    stream.event("chunk", "old-request", { content: "串话" });
    stream.event("stage", request.request_id, { stage: "generating" });
    stream.event("citations", request.request_id, {
      citations: [{ id: "1", title: "notes.txt", snippet: "独有暗号青苹果" }],
    });
    stream.event("chunk", request.request_id, { content: "青苹果" });
    expect(page.messages[1]?.content).toBe("青苹果");
    expect(page.processStage).toBe("generating");
    stream.event("done", request.request_id);
    expect(page.sending).toBe(false);
    expect(page.messages[1]?.loading).toBe(false);
    expect(page.messages[1]?.citations?.[0]?.title).toBe("notes.txt");
  });

  it("keeps a saved answer successful when the connection tail fails after done", async () => {
    void page.handleSendMessage("已保存的问题");
    stream.event("chunk", stream.sent[0]!.request_id, { content: "已保存" });
    stream.event("done", stream.sent[0]!.request_id, { session_id: "saved" });
    stream.reject(new Error("connection tail closed"));
    await flushPromises();
    expect(page.error).toBe("");
    expect(page.currentSessionId).toBe("saved");
    expect(page.messages[1]?.error).toBeUndefined();
    expect(stream.sent).toHaveLength(1);
  });

  it("stops generation and ignores chunks after a session switch", async () => {
    void page.handleSendMessage("问题");
    const request = stream.sent[0]!;
    page.stopGeneration();
    expect(stream.signals[0]?.aborted).toBe(true);
    expect(page.messages[1]?.stopped).toBe(true);
    page.handleNewSession();
    stream.event("chunk", request.request_id, { content: "晚到的数据" });
    expect(page.messages).toHaveLength(0);
    expect(page.sending).toBe(false);
  });

  it("keeps draft when sending fails and suppresses completion after a new conversation", async () => {
    streamRequest.mockRejectedValueOnce(new Error("offline"));
    void page.handleSendMessage("保留草稿");
    await flushPromises();
    expect(clearDraft).not.toHaveBeenCalled();
    expect(page.sending).toBe(false);
    expect(page.error).toContain("offline");
    void page.handleSendMessage("等待服务端会话");
    const request = stream.sent[0]!;
    page.handleNewSession();
    stream.event("done", request.request_id, { session_id: "obsolete" });
    expect(page.currentSessionId).toBeNull();
    expect(stream.signals[0]?.aborted).toBe(true);
    expect(createSession).not.toHaveBeenCalled();
  });

  it("makes failures retryable and restores history sources", async () => {
    void page.handleSendMessage("原问题");
    stream.event("error", stream.sent[0]!.request_id, { message: "模型不可用" });
    expect(page.messages[1]?.error).toBe("模型不可用");
    page.retryMessage(page.messages[1]!.id);
    await flushPromises();
    expect(clearDraft).toHaveBeenCalledOnce();
    expect(stream.sent[1]?.message).toBe("原问题");
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
    void page.handleSendMessage("不能发到旧会话");
    expect(stream.sent).toHaveLength(0);
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
