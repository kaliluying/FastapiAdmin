import { defineComponent, ref } from "vue";
import { shallowMount, flushPromises, type VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ChatPage from "./index.vue";

const api = vi.hoisted(() => ({ status: vi.fn(), create: vi.fn() }));
vi.mock("@/api/module_ai/chat", () => ({
  default: { getRuntimeLogStatus: api.status, createSession: api.create },
}));
vi.mock("@/api/module_ai/knowledge", () => ({
  default: { optionselect: vi.fn().mockResolvedValue({ data: { data: [] } }) },
}));
vi.mock("@/api/module_system/auth", () => ({
  default: {
    createWsTicket: vi.fn().mockResolvedValue({ data: { data: { ticket: "isolated" } } }),
  },
}));
vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@vueuse/core")>()),
  useMediaQuery: () => ref(false),
  useElementBounding: () => ({ top: ref(100) }),
  useWindowSize: () => ({ height: ref(1000) }),
}));

class Socket {
  static OPEN = 1;
  static CLOSED = 3;
  static current: Socket;
  readyState = Socket.OPEN;
  onopen?: () => void;
  onmessage?: (event: { data: string }) => void;
  send = vi.fn();
  constructor() {
    Socket.current = this;
  }
  close() {}
}
const Panel = defineComponent({ template: "<div><slot /></div>" });
let wrapper: VueWrapper;

beforeEach(async () => {
  vi.clearAllMocks();
  vi.stubEnv("VITE_APP_WS_ENDPOINT", "ws://127.0.0.1:8009");
  api.status.mockResolvedValue({ data: { data: { can_query: true, enabled: true } } });
  api.create.mockResolvedValue({ data: { success: true, data: { id: "ordinary-session" } } });
  vi.stubGlobal("WebSocket", Socket);
  wrapper = shallowMount(ChatPage, {
    global: {
      stubs: {
        ElSplitter: Panel,
        ElSplitterPanel: Panel,
        ElContainer: Panel,
        ElHeader: Panel,
        ElMain: Panel,
        ElFooter: Panel,
        FaChatInput: defineComponent({
          name: "FaChatInput",
          template: "<div />",
          methods: { clearDraft() {} },
        }),
        FaSidebar: defineComponent({
          name: "FaSidebar",
          template: "<div />",
          methods: { loadSessions() {} },
        }),
        FaChatMessages: defineComponent({
          name: "FaChatMessages",
          props: ["messages"],
          template: "<div />",
          methods: { scrollToBottom() {} },
        }),
      },
    },
  });
  await flushPromises();
  Socket.current.onopen?.();
});

afterEach(() => {
  wrapper.unmount();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("built-in runtime log tool", () => {
  it("rejects mixed sources without sending and retries with the original context token", async () => {
    const input = wrapper.getComponent({ name: "FaChatInput" });
    const send = async (question: string, files?: unknown[]) => {
      input.vm.$emit("send", question, files);
      await flushPromises();
      return JSON.parse(Socket.current.send.mock.calls.at(-1)![0]);
    };
    const receive = async (requestId: string, event: Record<string, unknown>) => {
      Socket.current.onmessage?.({ data: JSON.stringify({ ...event, request_id: requestId }) });
      await flushPromises();
    };
    const first = await send("查询错误");
    const original = "a".repeat(32);
    await receive(first.request_id, { type: "done", log_context_id: original });
    await send("混用附件", [{ name: "draft.txt", status: "ready", content: "draft" }]);
    expect(Socket.current.send).toHaveBeenCalledTimes(1);
    const failed = await send("缩小到15分钟");
    await receive(failed.request_id, { type: "error", message: "临时模型故障" });
    const failedMessage = wrapper.getComponent({ name: "FaChatMessages" }).props("messages").at(-1);
    const next = await send("改成5分钟");
    await receive(next.request_id, { type: "done", log_context_id: "b".repeat(32) });
    wrapper.getComponent({ name: "FaChatMessages" }).vm.$emit("retry", failedMessage.id);
    await flushPromises();
    expect(JSON.parse(Socket.current.send.mock.calls.at(-1)![0]).log_context_id).toBe(original);
  });

  it("keeps filters-only followup tokens and clears expired context without ambiguous retry", async () => {
    const send = async (question: string) => {
      wrapper.getComponent({ name: "FaChatInput" }).vm.$emit("send", question);
      await flushPromises();
      return JSON.parse(Socket.current.send.mock.calls.at(-1)![0]);
    };
    const first = await send("分析错误");
    const token = "a".repeat(32);
    Socket.current.onmessage?.({
      data: JSON.stringify({ type: "done", request_id: first.request_id, log_context_id: token }),
    });
    await flushPromises();
    expect(wrapper.text()).toContain("日志追问中");
    const followup = await send("再缩小到15分钟");
    expect(followup.log_context_id).toBe(token);
    Socket.current.onmessage?.({
      data: JSON.stringify({
        type: "error",
        request_id: followup.request_id,
        error_code: "log_context_expired",
        message: "查询条件已失效",
      }),
    });
    await flushPromises();
    const failed = wrapper.getComponent({ name: "FaChatMessages" }).props("messages").at(-1);
    wrapper.getComponent({ name: "FaChatMessages" }).vm.$emit("retry", failed.id);
    await flushPromises();
    expect(Socket.current.send).toHaveBeenCalledTimes(2);
    expect(wrapper.text()).not.toContain("日志追问中");
    expect((await send("重新描述完整条件")).log_context_id).toBeNull();
  });

  it("shows degraded warnings and blocks retry during the server cooldown", async () => {
    wrapper.getComponent({ name: "FaChatInput" }).vm.$emit("send", "分析错误");
    await flushPromises();
    const payload = JSON.parse(Socket.current.send.mock.calls[0]![0]);
    for (const event of [
      { type: "warning", message: "未读取日志" },
      { type: "error", error_code: "log_rate_limited", retry_after: 3, message: "稍后重试" },
    ]) {
      Socket.current.onmessage?.({
        data: JSON.stringify({ ...event, request_id: payload.request_id }),
      });
    }
    await flushPromises();
    const failed = wrapper.getComponent({ name: "FaChatMessages" }).props("messages").at(-1);
    expect(failed.warning).toBe("未读取日志");
    expect(failed.retryUntil).toBeGreaterThan(Date.now());
    wrapper.getComponent({ name: "FaChatMessages" }).vm.$emit("retry", failed.id);
    await flushPromises();
    expect(Socket.current.send).toHaveBeenCalledTimes(1);
  });

  it("reports real stages, keeps both tool queries and opens evidence only on demand", async () => {
    wrapper.getComponent({ name: "FaChatInput" }).vm.$emit("send", "分析错误");
    await flushPromises();
    const payload = JSON.parse(Socket.current.send.mock.calls[0]![0]);
    expect(wrapper.find('[aria-label="回答依据"]').exists()).toBe(false);
    expect(wrapper.getComponent({ name: "FaAiProcessStatus" }).props("stage")).toBe("preparing");
    const receive = (event: Record<string, unknown>) =>
      Socket.current.onmessage?.({
        data: JSON.stringify({ ...event, request_id: payload.request_id }),
      });
    receive({ type: "stage", stage: "routing" });
    await flushPromises();
    expect(wrapper.getComponent({ name: "FaAiProcessStatus" }).props("stage")).toBe("routing");
    receive({ type: "log_result", query_index: 1, matched_count: 8, returned_count: 4 });
    receive({ type: "log_result", query_index: 2, matched_count: 2, returned_count: 2 });
    receive({ type: "stage", stage: "analyzing" });
    await flushPromises();
    const messages = wrapper.getComponent({ name: "FaChatMessages" }).props("messages");
    expect(
      messages[1].logResults.map((result: { query_index: number }) => result.query_index)
    ).toEqual([1, 2]);
    expect(wrapper.getComponent({ name: "FaAiProcessStatus" }).props("stage")).toBe("analyzing");
    receive({ type: "done" });
    await flushPromises();
    expect(wrapper.find(".request-progress").exists()).toBe(false);
    wrapper.getComponent({ name: "FaChatMessages" }).vm.$emit("show-citations", messages[1].id);
    await flushPromises();
    expect(wrapper.find('[aria-label="回答依据"]').exists()).toBe(true);
    expect(wrapper.getComponent({ name: "FaRuntimeLogReport" }).props("results")).toHaveLength(2);
  });

  it("sends a normal question without precreating a session or client-side log filters", async () => {
    wrapper.getComponent({ name: "FaChatInput" }).vm.$emit("send", "分析错误");
    await flushPromises();
    expect(api.create).not.toHaveBeenCalled();
    const payload = JSON.parse(Socket.current!.send.mock.calls[0]![0]);
    expect(payload).not.toHaveProperty("log_query");
    expect(payload.knowledge_base_ids).toEqual([]);
    expect(payload.session_id).toBeNull();
    Socket.current!.onmessage?.({
      data: JSON.stringify({
        type: "error",
        request_id: payload.request_id,
        message: "模型连接失败",
      }),
    });
    await flushPromises();
    const messages = wrapper.getComponent({ name: "FaChatMessages" }).props("messages");
    wrapper.getComponent({ name: "FaChatMessages" }).vm.$emit("retry", messages[1]!.id);
    await flushPromises();
    expect(JSON.parse(Socket.current!.send.mock.calls[1]![0]).message).toBe("分析错误");
    expect(api.create).not.toHaveBeenCalled();
  });

  it("uses the server-assigned session for subsequent ordinary questions", async () => {
    Socket.current.onopen?.();
    wrapper.getComponent({ name: "FaChatInput" }).vm.$emit("send", "普通知识问题");
    await flushPromises();
    const payload = JSON.parse(Socket.current.send.mock.calls[0]![0]);
    expect(Socket.current.send.mock.calls).toHaveLength(1);
    expect(wrapper.getComponent({ name: "FaChatMessages" }).props("messages")).toHaveLength(2);
    Socket.current.onmessage?.({
      data: JSON.stringify({
        type: "done",
        request_id: payload.request_id,
        session_id: "server-session",
      }),
    });
    await flushPromises();
    expect(wrapper.getComponent({ name: "FaChatMessages" }).props("messages")[1].loading).toBe(
      false
    );
    wrapper.getComponent({ name: "FaChatInput" }).vm.$emit("send", "下一条问题");
    await flushPromises();
    expect(JSON.parse(Socket.current.send.mock.calls[1]![0]).message).toBe("下一条问题");
    expect(JSON.parse(Socket.current.send.mock.calls[1]![0]).session_id).toBe("server-session");
    expect(api.create).not.toHaveBeenCalled();
  });
});
