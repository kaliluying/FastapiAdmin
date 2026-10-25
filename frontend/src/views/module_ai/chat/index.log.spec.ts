import { defineComponent, ref } from "vue";
import { shallowMount, flushPromises, type VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ChatPage from "./index.vue";

const api = vi.hoisted(() => ({
  status: vi.fn(),
  create: vi.fn(),
  stream: vi.fn(),
  detail: vi.fn(),
  feedback: vi.fn(),
  login: "test-login",
}));
vi.mock("@/api/module_ai/chat", () => ({
  default: {
    getRuntimeLogStatus: api.status,
    createSession: api.create,
    stream: api.stream,
    getSessionDetail: api.detail,
  },
}));
vi.mock("@/api/module_ai/quality", () => ({
  default: { feedbackList: api.feedback },
}));
vi.mock("@/utils/auth", () => ({ Auth: { getSessionKey: () => api.login } }));
vi.mock("@/api/module_ai/knowledge", () => ({
  default: { optionselect: vi.fn().mockResolvedValue({ data: { data: [] } }) },
}));
vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@vueuse/core")>()),
  useMediaQuery: () => ref(false),
  useElementBounding: () => ({ top: ref(100) }),
  useWindowSize: () => ({ height: ref(1000) }),
}));

const Sse = {
  current: {
    send: api.stream,
    onmessage: (event: { data: string }) => api.stream.mock.calls.at(-1)?.[2](event.data),
  },
};
const Panel = defineComponent({ template: "<div><slot /></div>" });
let wrapper: VueWrapper;

beforeEach(async () => {
  vi.clearAllMocks();
  sessionStorage.clear();
  api.login = "test-login";
  api.detail.mockResolvedValue({
    data: {
      success: true,
      data: {
        runs: [
          {
            run_id: "saved-run",
            messages: [
              { role: "user", content: "保存的问题" },
              { role: "assistant", content: "保存的回答", citations: [{ title: "来源" }] },
            ],
          },
        ],
      },
    },
  });
  api.feedback.mockResolvedValue({ data: { data: { items: [] } } });
  api.status.mockResolvedValue({ data: { data: { can_query: true, enabled: true } } });
  api.create.mockResolvedValue({ data: { success: true, data: { id: "ordinary-session" } } });
  api.stream.mockImplementation((_body, _signal, _onData, onOpen) => {
    onOpen();
    return new Promise(() => {});
  });
  wrapper = mountChat();
  await flushPromises();
});

function mountChat() {
  return shallowMount(ChatPage, {
    global: {
      stubs: {
        ElButton: defineComponent({
          emits: ["click"],
          template: "<button @click=\"$emit('click')\"><slot /></button>",
        }),
        ElSplitter: Panel,
        ElSplitterPanel: Panel,
        ElContainer: Panel,
        ElHeader: Panel,
        FaChatNavbar: Panel,
        ElMain: Panel,
        ElFooter: Panel,
        FaChatInput: defineComponent({
          name: "FaChatInput",
          props: ["disabled", "sending"],
          template: "<div />",
          methods: { clearDraft() {} },
        }),
        FaSidebar: defineComponent({
          name: "FaSidebar",
          props: ["currentSessionId"],
          template: "<div />",
          methods: { loadSessions() {} },
        }),
        FaChatMessages: defineComponent({
          name: "FaChatMessages",
          props: ["messages"],
          template: "<div />",
          methods: { scrollToBottom() {} },
        }),
        FaSvgIcon: true,
        ElDrawer: Panel,
        ElDialog: Panel,
      },
    },
  });
}

afterEach(() => {
  wrapper.unmount();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

async function saveConversation() {
  wrapper.getComponent({ name: "FaChatInput" }).vm.$emit("send", "保存的问题");
  await flushPromises();
  const payload = api.stream.mock.calls.at(-1)![0];
  Sse.current.onmessage({
    data: JSON.stringify({
      type: "done",
      request_id: payload.request_id,
      session_id: "saved-session",
    }),
  });
  await flushPromises();
}

async function remount() {
  wrapper.unmount();
  wrapper = mountChat();
  await flushPromises();
}

describe("conversation restoration", () => {
  it("rejects stale-login selections, sends and stream completions", async () => {
    wrapper.getComponent({ name: "FaChatInput" }).vm.$emit("send", "登录变化前的问题");
    await flushPromises();
    const payload = api.stream.mock.calls.at(-1)![0];
    api.login = "another-login";
    Sse.current.onmessage({
      data: JSON.stringify({
        type: "done",
        request_id: payload.request_id,
        session_id: "old-login-session",
      }),
    });
    wrapper.getComponent({ name: "FaChatInput" }).vm.$emit("stop");
    wrapper.getComponent({ name: "FaSidebar" }).vm.$emit("select-session", {
      id: "old-login-session",
      title: "旧登录会话",
    });
    wrapper.getComponent({ name: "FaChatInput" }).vm.$emit("send", "不能以旧上下文发送");
    await flushPromises();
    expect(api.detail).not.toHaveBeenCalled();
    expect(api.stream).toHaveBeenCalledTimes(1);
    expect(wrapper.getComponent({ name: "FaSidebar" }).props("currentSessionId")).toBeNull();
  });

  it.each(["detail", "feedback"])(
    "ignores a restoration if the login changes while %s is pending",
    async (stage) => {
      await saveConversation();
      const response = await api.detail();
      api.detail.mockClear();
      let resolve!: (value: unknown) => void;
      const pending = new Promise((done) => {
        resolve = done;
      });
      if (stage === "detail") api.detail.mockReturnValueOnce(pending);
      else api.feedback.mockReturnValueOnce(pending);
      await remount();
      api.login = "another-login";
      resolve(stage === "detail" ? response : null);
      await flushPromises();
      expect(wrapper.getComponent({ name: "FaChatMessages" }).props("messages")).toEqual([]);
      expect(wrapper.getComponent({ name: "FaSidebar" }).props("currentSessionId")).toBeNull();
    }
  );

  it("keeps restoration protection when a later historical selection also fails", async () => {
    await saveConversation();
    api.detail.mockRejectedValueOnce(new Error("network"));
    await remount();
    api.detail.mockRejectedValueOnce(new Error("still offline"));
    wrapper.getComponent({ name: "FaSidebar" }).vm.$emit("select-session", {
      id: "another-session",
      title: "另一段对话",
    });
    await flushPromises();
    expect(wrapper.getComponent({ name: "FaAsyncState" }).props("title")).toBe("对话恢复失败");
    expect(wrapper.getComponent({ name: "FaChatInput" }).props("disabled")).toBe(true);
  });

  it("treats successful but missing session detail as a recoverable failure", async () => {
    await saveConversation();
    api.detail.mockResolvedValueOnce({ data: { success: true, data: null } });
    await remount();
    expect(wrapper.getComponent({ name: "FaAsyncState" }).props("title")).toBe("对话恢复失败");
    expect(wrapper.getComponent({ name: "FaSidebar" }).props("currentSessionId")).toBeNull();
    expect(wrapper.getComponent({ name: "FaChatInput" }).props("disabled")).toBe(true);
    await remount();
    expect(wrapper.getComponent({ name: "FaChatMessages" }).props("messages")).toHaveLength(2);
  });

  it("remembers a selected historical conversation", async () => {
    wrapper.getComponent({ name: "FaSidebar" }).vm.$emit("select-session", {
      id: "selected-session",
      title: "历史对话",
    });
    await flushPromises();
    api.detail.mockClear();
    await remount();
    expect(api.detail).toHaveBeenCalledWith("selected-session");
  });

  it.each(["new-session", "delete-session"])("clears the bookmark on %s", async (event) => {
    await saveConversation();
    wrapper.getComponent({ name: "FaSidebar" }).vm.$emit(event, "saved-session");
    await flushPromises();
    await remount();
    expect(api.detail).not.toHaveBeenCalled();
    expect(wrapper.getComponent({ name: "FaChatMessages" }).props("messages")).toEqual([]);
    wrapper.getComponent({ name: "FaChatInput" }).vm.$emit("send", "新问题");
    await flushPromises();
    expect(api.stream.mock.calls.at(-1)![0].session_id).toBeNull();
  });

  it("ignores a bookmark from another login and never stores message bodies", async () => {
    await saveConversation();
    const saved = sessionStorage.getItem("ai-chat-active-session");
    expect(saved).not.toContain("保存的问题");
    api.login = "another-login";
    await remount();
    expect(api.detail).not.toHaveBeenCalled();
    expect(wrapper.getComponent({ name: "FaChatMessages" }).props("messages")).toEqual([]);
  });

  it("does not claim an unconfirmed stream was saved", async () => {
    wrapper.getComponent({ name: "FaChatInput" }).vm.$emit("send", "仍在生成");
    await flushPromises();
    await remount();
    expect(api.detail).not.toHaveBeenCalled();
    expect(wrapper.getComponent({ name: "FaChatMessages" }).props("messages")).toEqual([]);
  });

  it.each(["network", "response"])(
    "keeps the bookmark for retry after %s failure",
    async (failure) => {
      await saveConversation();
      if (failure === "network") api.detail.mockRejectedValueOnce(new Error("network"));
      else api.detail.mockResolvedValueOnce({ data: { success: false, msg: "暂时不可用" } });
      await remount();
      expect(wrapper.getComponent({ name: "FaAsyncState" }).props("title")).toBe("对话恢复失败");
      expect(wrapper.getComponent({ name: "FaChatInput" }).props("disabled")).toBe(true);
      wrapper.getComponent({ name: "FaChatInput" }).vm.$emit("send", "失败时不能误发新会话");
      await flushPromises();
      expect(api.stream).toHaveBeenCalledTimes(1);
      await remount();
      expect(api.detail).toHaveBeenCalledTimes(2);
      expect(wrapper.getComponent({ name: "FaChatMessages" }).props("messages")).toHaveLength(2);
    }
  );

  it.each(["new-session", "delete-session"])(
    "does not resurrect an in-flight restoration after %s",
    async (event) => {
      await saveConversation();
      const response = await api.detail();
      api.detail.mockClear();
      let resolve!: (value: unknown) => void;
      api.detail.mockImplementationOnce(
        () =>
          new Promise((done) => {
            resolve = done;
          })
      );
      await remount();
      expect(wrapper.getComponent({ name: "FaChatInput" }).props("disabled")).toBe(true);
      wrapper.getComponent({ name: "FaSidebar" }).vm.$emit(event, "saved-session");
      await flushPromises();
      resolve(response);
      await flushPromises();
      expect(wrapper.getComponent({ name: "FaChatMessages" }).props("messages")).toEqual([]);
      api.detail.mockClear();
      await remount();
      expect(api.detail).not.toHaveBeenCalled();
    }
  );

  it("does not commit a stale restoration while feedback is pending", async () => {
    await saveConversation();
    let resolve!: (value: unknown) => void;
    api.feedback.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        })
    );
    await remount();
    wrapper.getComponent({ name: "FaSidebar" }).vm.$emit("select-session", {
      id: "newer-selection",
      title: "另一段对话",
    });
    await flushPromises();
    resolve(null);
    await flushPromises();
    api.detail.mockClear();
    await remount();
    expect(api.detail).toHaveBeenCalledWith("newer-selection");
    expect(wrapper.getComponent({ name: "FaSidebar" }).props("currentSessionId")).toBe(
      "newer-selection"
    );
  });
});

describe("built-in runtime log tool", () => {
  it("automatically restores the saved conversation after a page remount", async () => {
    wrapper.getComponent({ name: "FaChatInput" }).vm.$emit("send", "保存的问题");
    await flushPromises();
    const payload = api.stream.mock.calls.at(-1)![0];
    Sse.current.onmessage({
      data: JSON.stringify({
        type: "done",
        request_id: payload.request_id,
        session_id: "saved-session",
      }),
    });
    await flushPromises();
    wrapper.unmount();
    wrapper = mountChat();
    await flushPromises();
    expect(api.detail).toHaveBeenCalledWith("saved-session");
    const messages = wrapper.getComponent({ name: "FaChatMessages" }).props("messages");
    expect(messages.map((message: { content: string }) => message.content)).toEqual([
      "保存的问题",
      "保存的回答",
    ]);
    expect(messages[1].runId).toBe("saved-run");
    expect(messages[1].citations).toEqual([{ title: "来源" }]);
    wrapper.getComponent({ name: "FaChatInput" }).vm.$emit("send", "继续追问");
    await flushPromises();
    expect(api.stream.mock.calls.at(-1)![0].session_id).toBe("saved-session");
  });

  it("opens diagnostics from a visible entry without sending ordinary chat messages", async () => {
    const button = wrapper.findAll("button").find((item) => item.text().includes("只读诊断 Agent"));
    expect(button).toBeDefined();
    await button!.trigger("click");
    await flushPromises();
    expect(wrapper.getComponent({ name: "FaDiagnosticAgent" }).props("modelValue")).toBe(true);
    expect(api.stream).not.toHaveBeenCalled();
    expect(api.create).not.toHaveBeenCalled();
  });

  it("rejects mixed sources without sending and retries with the original context token", async () => {
    const input = wrapper.getComponent({ name: "FaChatInput" });
    const send = async (question: string, files?: unknown[]) => {
      input.vm.$emit("send", question, files);
      await flushPromises();
      return Sse.current.send.mock.calls.at(-1)![0];
    };
    const receive = async (requestId: string, event: Record<string, unknown>) => {
      Sse.current.onmessage?.({ data: JSON.stringify({ ...event, request_id: requestId }) });
      await flushPromises();
    };
    const first = await send("查询错误");
    const original = "a".repeat(32);
    await receive(first.request_id, { type: "done", log_context_id: original });
    await send("混用附件", [{ name: "draft.txt", status: "ready", content: "draft" }]);
    expect(Sse.current.send).toHaveBeenCalledTimes(1);
    const failed = await send("缩小到15分钟");
    await receive(failed.request_id, { type: "error", message: "临时模型故障" });
    const failedMessage = wrapper.getComponent({ name: "FaChatMessages" }).props("messages").at(-1);
    const next = await send("改成5分钟");
    await receive(next.request_id, { type: "done", log_context_id: "b".repeat(32) });
    wrapper.getComponent({ name: "FaChatMessages" }).vm.$emit("retry", failedMessage.id);
    await flushPromises();
    expect(Sse.current.send.mock.calls.at(-1)![0].log_context_id).toBe(original);
  });

  it("keeps filters-only followup tokens and clears expired context without ambiguous retry", async () => {
    const send = async (question: string) => {
      wrapper.getComponent({ name: "FaChatInput" }).vm.$emit("send", question);
      await flushPromises();
      return Sse.current.send.mock.calls.at(-1)![0];
    };
    const first = await send("分析错误");
    const token = "a".repeat(32);
    Sse.current.onmessage?.({
      data: JSON.stringify({ type: "done", request_id: first.request_id, log_context_id: token }),
    });
    await flushPromises();
    expect(wrapper.text()).toContain("日志追问中");
    const followup = await send("再缩小到15分钟");
    expect(followup.log_context_id).toBe(token);
    Sse.current.onmessage?.({
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
    expect(Sse.current.send).toHaveBeenCalledTimes(2);
    expect(wrapper.text()).not.toContain("日志追问中");
    expect((await send("重新描述完整条件")).log_context_id).toBeNull();
  });

  it("shows degraded warnings and blocks retry during the server cooldown", async () => {
    wrapper.getComponent({ name: "FaChatInput" }).vm.$emit("send", "分析错误");
    await flushPromises();
    const payload = Sse.current.send.mock.calls[0]![0];
    for (const event of [
      { type: "warning", message: "未读取日志" },
      { type: "error", error_code: "log_rate_limited", retry_after: 3, message: "稍后重试" },
    ]) {
      Sse.current.onmessage?.({
        data: JSON.stringify({ ...event, request_id: payload.request_id }),
      });
    }
    await flushPromises();
    const failed = wrapper.getComponent({ name: "FaChatMessages" }).props("messages").at(-1);
    expect(failed.warning).toBe("未读取日志");
    expect(failed.retryUntil).toBeGreaterThan(Date.now());
    wrapper.getComponent({ name: "FaChatMessages" }).vm.$emit("retry", failed.id);
    await flushPromises();
    expect(Sse.current.send).toHaveBeenCalledTimes(1);
  });

  it("reports real stages, keeps both tool queries and opens evidence only on demand", async () => {
    wrapper.getComponent({ name: "FaChatInput" }).vm.$emit("send", "分析错误");
    await flushPromises();
    const payload = Sse.current.send.mock.calls[0]![0];
    expect(wrapper.find('[aria-label="回答依据"]').exists()).toBe(false);
    expect(wrapper.getComponent({ name: "FaAiProcessStatus" }).props("stage")).toBe("preparing");
    const receive = (event: Record<string, unknown>) =>
      Sse.current.onmessage?.({
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
    const payload = Sse.current!.send.mock.calls[0]![0];
    expect(payload).not.toHaveProperty("log_query");
    expect(payload.knowledge_base_ids).toEqual([]);
    expect(payload.session_id).toBeNull();
    Sse.current!.onmessage?.({
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
    expect(Sse.current!.send.mock.calls[1]![0].message).toBe("分析错误");
    expect(api.create).not.toHaveBeenCalled();
  });

  it("uses the server-assigned session for subsequent ordinary questions", async () => {
    wrapper.getComponent({ name: "FaChatInput" }).vm.$emit("send", "普通知识问题");
    await flushPromises();
    const payload = Sse.current.send.mock.calls[0]![0];
    expect(Sse.current.send.mock.calls).toHaveLength(1);
    expect(wrapper.getComponent({ name: "FaChatMessages" }).props("messages")).toHaveLength(2);
    Sse.current.onmessage?.({
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
    expect(Sse.current.send.mock.calls[1]![0].message).toBe("下一条问题");
    expect(Sse.current.send.mock.calls[1]![0].session_id).toBe("server-session");
    expect(api.create).not.toHaveBeenCalled();
  });
});
