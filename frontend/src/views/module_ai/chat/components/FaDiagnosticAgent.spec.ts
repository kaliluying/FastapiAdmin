import { defineComponent, ref } from "vue";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import ElementPlus, { ElOption, ElSelect } from "element-plus";
import { createI18n } from "vue-i18n";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AgentSubmissionRejected, type AgentEvent, type AgentRun } from "@/api/module_ai/agent";
import FaDiagnosticAgent from "./FaDiagnosticAgent.vue";

const api = vi.hoisted(() => ({
  createRun: vi.fn(),
  listRuns: vi.fn(),
  getRun: vi.fn(),
  cancelRun: vi.fn(),
  knowledge: vi.fn(),
  logStatus: vi.fn(),
}));
vi.mock("@/api/module_ai/agent", () => ({
  AgentSubmissionRejected: class extends Error {},
  default: {
    createRun: api.createRun,
    listRuns: api.listRuns,
    getRun: api.getRun,
    cancelRun: api.cancelRun,
  },
}));
vi.mock("@/api/module_ai/knowledge", () => ({
  default: { optionselect: api.knowledge },
}));
vi.mock("@/api/module_ai/chat", () => ({
  default: { getRuntimeLogStatus: api.logStatus },
}));

const response = <T>(data: T) => ({ data: { data } });
const event = (seq: number, type = "started", data = {}): AgentEvent => ({
  seq,
  type,
  message: `执行记录 ${seq}`,
  data,
  created_at: "2026-10-24T12:00:00",
});
const run = (overrides: Partial<AgentRun> = {}): AgentRun => ({
  run_id: "run-1",
  goal: "排查接口超时",
  status: "running",
  created_at: "2026-10-24T12:00:00",
  updated_at: "2026-10-24T12:00:00",
  result: null,
  error: null,
  knowledge_base_ids: [1],
  use_runtime_logs: false,
  model_calls: 1,
  tool_calls: 1,
  attempts: 1,
  last_seq: 1,
  citations: [],
  events: [event(1)],
  ...overrides,
});
const evidenceRun = () =>
  run({
    status: "succeeded",
    last_seq: 3,
    result: "敏感诊断正文",
    citations: [{ id: "secret-doc", title: "敏感资料标题", snippet: "敏感引用片段" }],
    events: [
      event(1),
      {
        ...event(2, "tool_completed", {
          name: "search_knowledge",
          query: "敏感查询条件",
          citations: [{ snippet: "事件内敏感片段" }],
        }),
        message: "敏感执行记录",
      },
      event(3, "succeeded"),
    ],
  });
function expectNoEvidence(wrapper: VueWrapper) {
  const state = wrapper.vm as unknown as {
    run: AgentRun;
    runs: AgentRun[];
    selectedCitation: unknown;
  };
  expect(state.run).toMatchObject({ result: null, citations: [], events: [] });
  expect(state.selectedCitation).toBeNull();
  expect(
    state.runs.every((item) => !item.result && !item.citations.length && !item.events.length)
  ).toBe(true);
  expect(wrapper.find('[aria-label="诊断结果"]').exists()).toBe(false);
  expect(wrapper.find(".fa-citation-item").exists()).toBe(false);
  expect(wrapper.find(".agent-citation").exists()).toBe(false);
  expect(wrapper.findAll(".agent-events li")).toHaveLength(0);
  expect(wrapper.text()).not.toContain("敏感");
}
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};
const Overlay = defineComponent({
  props: ["modelValue"],
  emits: ["update:modelValue"],
  template: '<section v-if="modelValue"><slot /></section>',
});
const global = {
  plugins: [ElementPlus, createI18n({ legacy: false, locale: "zh", messages: { zh: {} } })],
  stubs: { ElDrawer: Overlay, ElDialog: Overlay },
};
const wrappers: VueWrapper[] = [];

async function create(open = true) {
  const wrapper = mount(FaDiagnosticAgent, { props: { modelValue: open }, global });
  wrappers.push(wrapper);
  await flushPromises();
  return wrapper;
}
async function prepare(wrapper: VueWrapper) {
  await wrapper.get("textarea").setValue("排查接口超时");
  wrapper.findAllComponents(ElSelect)[1]!.vm.$emit("update:modelValue", [1]);
  await flushPromises();
}
async function choose(wrapper: VueWrapper, id = "run-1") {
  wrapper.findAllComponents(ElSelect)[0]!.vm.$emit("update:modelValue", id);
  await flushPromises();
}
async function click(wrapper: VueWrapper, text: string) {
  const button = wrapper.findAll("button").find((item) => item.text() === text);
  expect(button, `button ${text}`).toBeDefined();
  await button!.trigger("click");
  await flushPromises();
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
  vi.setSystemTime(new Date(2026, 9, 24, 12, 0, 0));
  vi.resetAllMocks();
  api.knowledge.mockResolvedValue(response([{ id: 1, name: "操作手册" }]));
  api.logStatus.mockResolvedValue(response({ can_query: false, enabled: true }));
  api.listRuns.mockResolvedValue(response([]));
  api.createRun.mockResolvedValue(response(run()));
  api.getRun.mockResolvedValue(response(run()));
  api.cancelRun.mockResolvedValue(response(run({ status: "cancelled", last_seq: 2 })));
});
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("read-only diagnostic agent", () => {
  it("copies the diagnostic result as complete Markdown", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const result = "## 诊断结果\n\n- 检查连接池\n- 查看日志\n\n```sql\nSELECT 1;\n```";
    api.getRun.mockResolvedValue(response(run({ status: "succeeded", result })));
    const wrapper = await create();
    await choose(wrapper);
    await wrapper.get('[aria-label="复制诊断结果"]').trigger("click");
    await flushPromises();
    expect(writeText).toHaveBeenCalledExactlyOnceWith(result);
  });

  it("does not load while closed and permits non-admin knowledge-only diagnostics", async () => {
    const wrapper = await create(false);
    expect(api.listRuns).not.toHaveBeenCalled();
    await wrapper.setProps({ modelValue: true });
    await flushPromises();
    expect(wrapper.text()).toContain("暂无诊断任务");
    expect(wrapper.text()).toContain("请至少选择一个知识库");
    expect(wrapper.get('input[type="checkbox"]').attributes("disabled")).toBeDefined();
    await wrapper.get("textarea").setValue("排查接口超时");
    await wrapper.get("form").trigger("submit");
    expect(api.createRun).not.toHaveBeenCalled();
    await prepare(wrapper);
    await wrapper.get("form").trigger("submit");
    await flushPromises();
    expect(api.createRun).toHaveBeenCalledWith({
      request_id: expect.any(String),
      goal: "排查接口超时",
      knowledge_base_ids: [1],
      use_runtime_logs: false,
    });
    expect(wrapper.text()).toContain("仅做只读诊断，不修改业务数据");
  });

  it("validates goal and knowledge limits, and requires both runtime-log status flags", async () => {
    api.logStatus.mockResolvedValue(response({ can_query: true, enabled: false }));
    const wrapper = await create();
    await prepare(wrapper);
    await wrapper.get("textarea").setValue(" ".repeat(5));
    await wrapper.get("form").trigger("submit");
    await wrapper.get("textarea").setValue("a".repeat(4001));
    await wrapper.get("form").trigger("submit");
    await wrapper.get("textarea").setValue("排查问题");
    wrapper.findAllComponents(ElSelect)[1]!.vm.$emit(
      "update:modelValue",
      Array.from({ length: 11 }, (_, i) => i + 1)
    );
    await flushPromises();
    await wrapper.get("form").trigger("submit");
    expect(api.createRun).not.toHaveBeenCalled();
    expect(wrapper.get('input[type="checkbox"]').attributes("disabled")).toBeDefined();
  });

  it("allows log-only runs when logs are available and recovers source/list loading errors", async () => {
    api.knowledge.mockRejectedValueOnce(new Error("offline"));
    api.logStatus.mockRejectedValueOnce(new Error("offline"));
    api.listRuns.mockRejectedValueOnce(new Error("offline"));
    const wrapper = await create();
    expect(wrapper.text()).toContain("知识库加载失败");
    expect(wrapper.text()).toContain("最近任务加载失败");
    api.logStatus.mockResolvedValue(response({ can_query: true, enabled: true }));
    await click(wrapper, "重试加载数据来源");
    await click(wrapper, "刷新列表");
    expect(wrapper.text()).not.toContain("加载失败");
    await wrapper.get("textarea").setValue("检查最近错误日志");
    await wrapper.get('input[type="checkbox"]').setValue(true);
    await wrapper.get("form").trigger("submit");
    await flushPromises();
    expect(api.createRun).toHaveBeenCalledWith(
      expect.objectContaining({
        knowledge_base_ids: [],
        use_runtime_logs: true,
      })
    );
  });

  it("prevents double submission and reuses the original request and payload after uncertainty", async () => {
    const pending = deferred<ReturnType<typeof response<AgentRun>>>();
    api.createRun.mockReturnValueOnce(pending.promise);
    const wrapper = await create();
    await prepare(wrapper);
    await wrapper.get("form").trigger("submit");
    await wrapper.get("form").trigger("submit");
    expect(api.createRun).toHaveBeenCalledTimes(1);
    const body = { ...api.createRun.mock.calls[0]![0] };
    pending.reject(new Error("connection lost"));
    await flushPromises();
    expect(wrapper.text()).toContain("提交结果未确认");
    expect(wrapper.get("textarea").attributes("disabled")).toBeDefined();
    await click(wrapper, "重试提交（避免重复创建）");
    expect(api.createRun).toHaveBeenCalledTimes(2);
    expect(api.createRun.mock.calls[1]![0]).toEqual(body);
    expect(wrapper.text()).not.toContain("提交结果未确认");
    await wrapper.get("form").trigger("submit");
    expect(api.createRun).toHaveBeenCalledTimes(2);
  });

  it.each([
    [403, "没有查询该知识库的权限"],
    [409, "最多同时运行 3 个活动任务"],
    [422, "诊断目标不符合要求"],
  ])(
    "unlocks editing and starts a fresh request after HTTP %s rejects submission",
    async (_status, message) => {
      api.createRun.mockRejectedValueOnce(new AgentSubmissionRejected(String(message)));
      const wrapper = await create();
      await prepare(wrapper);
      await wrapper.get("form").trigger("submit");
      await flushPromises();
      const firstId = api.createRun.mock.calls[0]![0].request_id;
      expect(wrapper.text()).toContain(message);
      expect(wrapper.text()).not.toContain("重试提交（避免重复创建）");
      expect(wrapper.get("textarea").attributes("disabled")).toBeUndefined();
      await wrapper.get("textarea").setValue("修改后的诊断目标");
      await wrapper.get("form").trigger("submit");
      await flushPromises();
      expect(api.createRun).toHaveBeenCalledTimes(2);
      expect(api.createRun.mock.calls[1]![0]).toEqual(
        expect.objectContaining({
          goal: "修改后的诊断目标",
          request_id: expect.not.stringMatching(firstId),
        })
      );
    }
  );

  it("ignores outdated source responses when retries overlap within the same view", async () => {
    api.knowledge.mockRejectedValueOnce(new Error("offline"));
    const wrapper = await create();
    const oldKnowledge = deferred<ReturnType<typeof response<{ id: number; name: string }[]>>>();
    const oldLogs =
      deferred<ReturnType<typeof response<{ can_query: boolean; enabled: boolean }>>>();
    api.knowledge
      .mockReturnValueOnce(oldKnowledge.promise)
      .mockResolvedValueOnce(response([{ id: 2, name: "新授权知识库" }]));
    api.logStatus
      .mockReturnValueOnce(oldLogs.promise)
      .mockResolvedValueOnce(response({ can_query: false, enabled: true }));
    const retry = wrapper.findAll("button").find((item) => item.text() === "重试加载数据来源")!;
    await Promise.all([retry.trigger("click"), retry.trigger("click")]);
    await flushPromises();
    oldKnowledge.resolve(response([{ id: 1, name: "旧知识库" }]));
    oldLogs.resolve(response({ can_query: true, enabled: true }));
    await flushPromises();
    expect(api.knowledge).toHaveBeenCalledTimes(3);
    const labels = wrapper.findAllComponents(ElOption).map((option) => option.props("label"));
    expect(labels).toContain("新授权知识库");
    expect(labels).not.toContain("旧知识库");
    expect(wrapper.get('input[type="checkbox"]').attributes("disabled")).toBeDefined();
  });

  it("creates fresh request IDs for subsequent tasks even where randomUUID is unavailable", async () => {
    vi.stubGlobal("crypto", { getRandomValues: crypto.getRandomValues.bind(crypto) });
    api.createRun.mockResolvedValue(response(run({ status: "succeeded" })));
    const wrapper = await create();
    await prepare(wrapper);
    await wrapper.get("form").trigger("submit");
    await flushPromises();
    await wrapper.get("form").trigger("submit");
    await flushPromises();
    const ids = api.createRun.mock.calls.map(([body]) => body.request_id);
    expect(ids).toHaveLength(2);
    expect(ids[0]).toMatch(/^[a-f0-9]{32}$/);
    expect(ids[1]).not.toBe(ids[0]);
  });

  it("merges incremental events by seq and displays recovery, results and citation snippets", async () => {
    const tool = event(2, "tool_completed", {
      name: "search_knowledge",
      query: "接口超时",
      returned_count: 2,
      raw_results: "不要展示原始结果",
    });
    api.getRun
      .mockResolvedValueOnce(response(run({ last_seq: 2, events: [event(1), tool] })))
      .mockResolvedValueOnce(
        response(
          run({
            status: "succeeded",
            last_seq: 4,
            events: [tool, event(3, "recovering"), event(4, "succeeded")],
            result: "## 排查建议\n检查连接池。<script>alert('xss')</script>",
            citations: [{ id: "doc-1", title: "接口运维手册", snippet: "检查连接池配置" }],
          })
        )
      );
    const wrapper = await create();
    await prepare(wrapper);
    await wrapper.get("form").trigger("submit");
    await flushPromises();
    expect(api.getRun.mock.calls[0]![1]).toBe(1);
    expect(wrapper.findAll(".agent-events li")).toHaveLength(2);
    expect(wrapper.text()).toContain("工具：知识库检索");
    expect(wrapper.text()).toContain("返回 2 条证据");
    await wrapper.get(".agent-tool-toggle").trigger("click");
    expect(wrapper.text()).toContain("接口超时");
    expect(wrapper.text()).not.toContain("不要展示原始结果");
    await vi.advanceTimersByTimeAsync(1500);
    await flushPromises();
    expect(api.getRun.mock.calls[1]![1]).toBe(2);
    expect(wrapper.findAll(".agent-events li")).toHaveLength(4);
    expect(wrapper.text()).toContain("恢复执行");
    expect(wrapper.get('[aria-label="诊断结果"]').text()).toContain("检查连接池");
    expect(wrapper.find(".markdown-content script").exists()).toBe(false);
    await wrapper.get(".fa-citation-item__title").trigger("click");
    await flushPromises();
    expect(wrapper.get(".agent-citation").text()).toBe("检查连接池配置");
    await vi.advanceTimersByTimeAsync(6000);
    expect(api.getRun).toHaveBeenCalledTimes(2);
  });

  it("keeps last_seq monotonic when a stale response arrives", async () => {
    api.getRun
      .mockResolvedValueOnce(response(run({ last_seq: 5, events: [event(5)] })))
      .mockResolvedValueOnce(response(run({ last_seq: 3, events: [event(3)] })))
      .mockResolvedValueOnce(
        response(run({ status: "succeeded", last_seq: 6, events: [event(6)] }))
      );
    const wrapper = await create();
    await choose(wrapper);
    await vi.advanceTimersByTimeAsync(3000);
    await flushPromises();
    expect(api.getRun.mock.calls.map((call) => call[1])).toEqual([0, 5, 5]);
    expect(wrapper.findAll(".agent-events li")).toHaveLength(3);
  });

  it("uses received event sequences instead of summary last_seq and drains terminal event batches", async () => {
    api.createRun.mockResolvedValue(
      response(
        run({
          status: "succeeded",
          last_seq: 5,
          events: [],
        })
      )
    );
    api.getRun
      .mockResolvedValueOnce(
        response(
          run({
            status: "succeeded",
            last_seq: 5,
            events: [event(1), event(2)],
            result: "已完成诊断",
          })
        )
      )
      .mockResolvedValueOnce(
        response(
          run({
            status: "succeeded",
            last_seq: 5,
            events: [event(2), event(3), event(4), event(5, "succeeded")],
            result: "已完成诊断",
          })
        )
      );
    const wrapper = await create();
    await prepare(wrapper);
    await wrapper.get("form").trigger("submit");
    await flushPromises();
    expect(api.getRun.mock.calls[0]![1]).toBe(0);
    await vi.advanceTimersByTimeAsync(1500);
    await flushPromises();
    expect(api.getRun.mock.calls[1]![1]).toBe(2);
    expect(wrapper.findAll(".agent-events li")).toHaveLength(5);
    await vi.advanceTimersByTimeAsync(3000);
    expect(api.getRun).toHaveBeenCalledTimes(2);
  });

  it("preserves running status after a network error and resumes on explicit retry", async () => {
    api.getRun
      .mockResolvedValueOnce(response(run()))
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(
        response(run({ status: "failed", error: "模型服务暂不可用", last_seq: 2 }))
      );
    const wrapper = await create();
    await choose(wrapper);
    await vi.advanceTimersByTimeAsync(1500);
    await flushPromises();
    expect(wrapper.text()).toContain("任务状态尚未确认");
    expect(wrapper.get('.agent-detail [role="status"]').text()).toBe("诊断中");
    await vi.advanceTimersByTimeAsync(6000);
    expect(api.getRun).toHaveBeenCalledTimes(2);
    await click(wrapper, "重试更新");
    expect(api.getRun.mock.calls[2]![1]).toBe(0);
    expect(wrapper.text()).toContain("模型服务暂不可用");
    expect(wrapper.text()).not.toContain("任务状态尚未确认");
    expect(wrapper.get('.agent-detail [role="status"]').text()).toBe("诊断失败");
  });

  it("restores selected tasks and ignores detail responses from a previous selection", async () => {
    const previous = deferred<ReturnType<typeof response<AgentRun>>>();
    api.listRuns.mockResolvedValue(response([run(), run({ run_id: "run-2" })]));
    api.getRun
      .mockReturnValueOnce(previous.promise)
      .mockResolvedValueOnce(
        response(run({ run_id: "run-2", status: "cancelled", goal: "第二个目标", last_seq: 3 }))
      );
    const wrapper = await create();
    await choose(wrapper);
    const signal = api.getRun.mock.calls[0]![2] as AbortSignal;
    await choose(wrapper, "run-2");
    expect(signal.aborted).toBe(true);
    previous.resolve(response(run({ status: "failed", error: "旧错误" })));
    await flushPromises();
    expect(wrapper.get(".agent-goal").text()).toBe("第二个目标");
    expect(wrapper.text()).not.toContain("旧错误");
    expect(wrapper.text()).toContain("任务已取消");
    expect(api.getRun.mock.calls.map((call) => call[1])).toEqual([0, 0]);
  });

  it("clears a successful report, citations, open snippet and event data on detail 403, then restores from cursor zero", async () => {
    api.listRuns.mockResolvedValue(response([evidenceRun()]));
    api.getRun
      .mockResolvedValueOnce(response(evidenceRun()))
      .mockRejectedValueOnce(new Error("403: 知识库权限已撤销"))
      .mockResolvedValueOnce(response(evidenceRun()));
    const wrapper = await create();
    await choose(wrapper);
    await wrapper.get(".agent-tool-toggle").trigger("click");
    expect(wrapper.get('[aria-label="诊断结果"]').text()).toContain("敏感诊断正文");
    expect(wrapper.get(".agent-events").text()).toContain("敏感执行记录");
    expect(wrapper.get(".agent-events").text()).toContain("敏感查询条件");
    const state = wrapper.vm as unknown as { runs: AgentRun[] };
    expect(state.runs[0]).toMatchObject({ result: null, citations: [], events: [] });
    await wrapper.get(".fa-citation-item__title").trigger("click");
    expect(wrapper.get(".agent-citation").text()).toBe("敏感引用片段");
    await click(wrapper, "刷新状态");
    expectNoEvidence(wrapper);
    expect(wrapper.get('.agent-detail [role="status"]').text()).toBe("已完成");
    expect(wrapper.text()).toContain("任务状态尚未确认");
    await vi.advanceTimersByTimeAsync(6000);
    expect(api.getRun).toHaveBeenCalledTimes(2);
    await click(wrapper, "重试更新");
    expect(api.getRun.mock.calls.map((call) => call[1])).toEqual([0, 3, 0]);
    expect(wrapper.get('[aria-label="诊断结果"]').text()).toContain("敏感诊断正文");
    expect(wrapper.findAll(".agent-events li")).toHaveLength(3);
    expect(wrapper.text()).toContain("敏感资料标题");
    expect(wrapper.find(".agent-citation").exists()).toBe(false);
    expect(wrapper.text()).not.toContain("任务状态尚未确认");
  });

  it("removes evidence and the open citation on close and waits for fresh authorized detail on reopening", async () => {
    const reopened = deferred<ReturnType<typeof response<AgentRun>>>();
    api.getRun.mockResolvedValueOnce(response(evidenceRun())).mockReturnValueOnce(reopened.promise);
    const wrapper = await create();
    await choose(wrapper);
    await wrapper.get(".fa-citation-item__title").trigger("click");
    expect(wrapper.get(".agent-citation").text()).toBe("敏感引用片段");
    await wrapper.setProps({ modelValue: false });
    expectNoEvidence(wrapper);
    expect(api.cancelRun).not.toHaveBeenCalled();
    await wrapper.setProps({ modelValue: true });
    await flushPromises();
    expectNoEvidence(wrapper);
    expect(wrapper.get('.agent-detail [role="status"]').text()).toBe("已完成");
    expect(api.getRun.mock.calls.map((call) => call[1])).toEqual([0, 0]);
    reopened.resolve(response(evidenceRun()));
    await flushPromises();
    expect(wrapper.get('[aria-label="诊断结果"]').text()).toContain("敏感诊断正文");
    expect(wrapper.findAll(".agent-events li")).toHaveLength(3);
    expect(wrapper.text()).toContain("敏感资料标题");
    expect(wrapper.find(".agent-citation").exists()).toBe(false);
  });

  it("closes and unmounts without cancelling, aborts reads, and resumes only after reopening", async () => {
    const inFlight = deferred<ReturnType<typeof response<AgentRun>>>();
    api.getRun.mockResolvedValueOnce(response(run())).mockReturnValueOnce(inFlight.promise);
    const wrapper = await create();
    await choose(wrapper);
    await vi.advanceTimersByTimeAsync(1500);
    const signal = api.getRun.mock.calls[1]![2] as AbortSignal;
    await wrapper.setProps({ modelValue: false });
    expect(signal.aborted).toBe(true);
    inFlight.resolve(response(run({ last_seq: 2 })));
    await flushPromises();
    await vi.advanceTimersByTimeAsync(6000);
    expect(api.getRun).toHaveBeenCalledTimes(2);
    expect(api.cancelRun).not.toHaveBeenCalled();
    api.getRun.mockResolvedValue(response(run({ last_seq: 3 })));
    await wrapper.setProps({ modelValue: true });
    await flushPromises();
    expect(api.getRun.mock.calls[2]![1]).toBe(0);
    wrapper.unmount();
    wrappers.splice(wrappers.indexOf(wrapper), 1);
    await vi.advanceTimersByTimeAsync(6000);
    expect(api.getRun).toHaveBeenCalledTimes(3);
    expect(api.cancelRun).not.toHaveBeenCalled();
  });

  it.each([false, true])(
    "keeps late creation as a summary until fresh detail (reopen before response: %s)",
    async (reopenBeforeResponse) => {
      const pending = deferred<ReturnType<typeof response<AgentRun>>>();
      const detail = deferred<ReturnType<typeof response<AgentRun>>>();
      api.createRun.mockReturnValueOnce(pending.promise);
      api.getRun.mockReturnValueOnce(detail.promise);
      const wrapper = await create();
      await prepare(wrapper);
      await wrapper.get("form").trigger("submit");
      await wrapper.setProps({ modelValue: false });
      if (reopenBeforeResponse) await wrapper.setProps({ modelValue: true });
      pending.resolve(response(evidenceRun()));
      await flushPromises();
      expectNoEvidence(wrapper);
      expect(api.cancelRun).not.toHaveBeenCalled();
      if (!reopenBeforeResponse) {
        expect(api.getRun).not.toHaveBeenCalled();
        await wrapper.setProps({ modelValue: true });
      }
      await flushPromises();
      expectNoEvidence(wrapper);
      expect(api.getRun).toHaveBeenCalledWith("run-1", 0, expect.any(AbortSignal));
      detail.resolve(response(evidenceRun()));
      await flushPromises();
      expect(wrapper.get('[aria-label="诊断结果"]').text()).toContain("敏感诊断正文");
    }
  );

  it("cancels only through the explicit action and permits retry when cancellation is uncertain", async () => {
    api.cancelRun.mockRejectedValueOnce(new Error("offline"));
    api.getRun
      .mockResolvedValueOnce(response(run()))
      .mockResolvedValueOnce(response(run()))
      .mockResolvedValue(
        response(
          run({
            status: "cancelled",
            last_seq: 2,
            events: [event(2, "cancelled")],
          })
        )
      );
    const wrapper = await create();
    await choose(wrapper);
    await click(wrapper, "取消任务");
    expect(wrapper.text()).toContain("取消请求未确认");
    expect(wrapper.get('.agent-detail [role="status"]').text()).toBe("诊断中");
    await click(wrapper, "取消任务");
    expect(api.cancelRun).toHaveBeenCalledTimes(2);
    expect(api.cancelRun).toHaveBeenLastCalledWith("run-1");
    expect(wrapper.text()).toContain("任务已取消");
    await vi.advanceTimersByTimeAsync(3000);
    expect(api.getRun).toHaveBeenCalledTimes(3);
  });

  it("fetches the report through detail when cancel races with a completed task", async () => {
    api.cancelRun.mockResolvedValue(
      response(
        run({
          status: "succeeded",
          last_seq: 3,
          result: null,
          citations: [],
          events: [],
        })
      )
    );
    api.getRun.mockResolvedValueOnce(response(run())).mockResolvedValueOnce(
      response(
        run({
          status: "succeeded",
          last_seq: 3,
          events: [event(2), event(3, "succeeded")],
          result: "经过权限检查的诊断报告",
          citations: [{ id: "secure-doc", title: "授权资料" }],
        })
      )
    );
    const wrapper = await create();
    await choose(wrapper);
    await click(wrapper, "取消任务");
    expect(api.getRun).toHaveBeenCalledTimes(2);
    expect(api.getRun.mock.calls[1]![1]).toBe(1);
    expect(wrapper.get('[aria-label="诊断结果"]').text()).toContain("经过权限检查的诊断报告");
    expect(wrapper.text()).toContain("授权资料");
  });

  it("does not expose a completed report when detail rejects access after cancel", async () => {
    api.cancelRun.mockResolvedValue(
      response(
        run({
          status: "succeeded",
          last_seq: 3,
          result: null,
          citations: [],
          events: [],
        })
      )
    );
    api.getRun.mockResolvedValueOnce(response(run())).mockRejectedValueOnce(new Error("403"));
    const wrapper = await create();
    await choose(wrapper);
    await click(wrapper, "取消任务");
    expect(api.getRun).toHaveBeenCalledTimes(2);
    expect(wrapper.get('.agent-detail [role="status"]').text()).toBe("已完成");
    expect(wrapper.find('[aria-label="诊断结果"]').exists()).toBe(false);
    expect(wrapper.find(".fa-citation-item").exists()).toBe(false);
    expect(wrapper.text()).toContain("任务状态尚未确认");
    expect(wrapper.text()).not.toContain("未返回诊断正文");
  });

  it("stops polling when a cached page deactivates without cancelling its task", async () => {
    const show = ref(true);
    const open = ref(true);
    const Host = defineComponent({
      components: { FaDiagnosticAgent },
      setup: () => ({ show, open }),
      template: '<KeepAlive><FaDiagnosticAgent v-if="show" v-model="open" /></KeepAlive>',
    });
    const wrapper = mount(Host, { global });
    wrappers.push(wrapper);
    await flushPromises();
    await choose(wrapper);
    show.value = false;
    await flushPromises();
    expect(open.value).toBe(false);
    await vi.advanceTimersByTimeAsync(6000);
    expect(api.getRun).toHaveBeenCalledTimes(1);
    expect(api.cancelRun).not.toHaveBeenCalled();
  });

  it("keeps tool summaries visible and toggles paired arguments, results and citations", async () => {
    const started = event(2, "tool_started", {
      name: "search_knowledge",
      call_id: "search-1",
      attempt: 1,
      arguments: { query: "接口超时", top_k: 3 },
      reasoning: "不公开的推理",
    });
    api.getRun.mockResolvedValue(response(run({ events: [event(1), started], last_seq: 2 })));
    const wrapper = await create();
    await choose(wrapper);
    expect(wrapper.findAll(".agent-tool-card")).toHaveLength(1);
    expect(wrapper.get(".agent-tool-toggle").attributes("aria-expanded")).toBe("false");
    expect(wrapper.get(".agent-tool-toggle").attributes("type")).toBe("button");
    expect(wrapper.get(".agent-tool-card").text()).toContain("运行中");
    expect(wrapper.find(".agent-tool-body").exists()).toBe(false);
    expect(wrapper.find("pre").exists()).toBe(false);
    await wrapper.get(".agent-tool-toggle").trigger("click");
    expect(wrapper.get(".agent-tool-toggle").attributes("aria-expanded")).toBe("true");
    const bodyId = wrapper.get(".agent-tool-body").attributes("id");
    expect(wrapper.get(".agent-tool-toggle").attributes("aria-controls")).toBe(bodyId);
    expect(wrapper.get("pre").text()).toContain('"query": "接口超时"');

    api.getRun.mockResolvedValue(
      response(
        run({
          events: [
            {
              ...event(3, "tool_completed", {
                name: "search_knowledge",
                call_id: "search-1",
                attempt: 1,
                returned_count: 2,
                citations: [{ id: "tool-doc", title: "查询引用", snippet: "公开片段" }],
                raw_results: "不公开的原始结果",
              }),
              created_at: "2026-10-24T12:00:03",
              message: "找到连接池配置",
            },
          ],
          last_seq: 3,
        })
      )
    );
    await vi.advanceTimersByTimeAsync(3000);
    await flushPromises();
    expect(wrapper.findAll(".agent-tool-card")).toHaveLength(1);
    expect(wrapper.findAll(".agent-events > li")).toHaveLength(2);
    expect(wrapper.get(".agent-tool-card").text()).toContain("已完成");
    expect(wrapper.get(".agent-tool-card").text()).toContain("返回 2 条证据");
    expect(wrapper.get(".agent-tool-card").text()).toContain("耗时 00:03");
    expect(wrapper.get(".agent-tool-body").text()).toContain("找到连接池配置");
    await wrapper.get(".fa-citation-item__title").trigger("click");
    expect(wrapper.get(".agent-citation").text()).toBe("公开片段");
    await wrapper.get(".agent-tool-toggle").trigger("click");
    expect(wrapper.find(".agent-tool-body").exists()).toBe(false);
    expect(wrapper.get(".agent-tool-card").text()).toContain("返回 2 条证据");
    expect(wrapper.text()).not.toContain("不公开");
  });

  it("replaces public snapshots per model round and separates recovery attempts", async () => {
    api.getRun
      .mockResolvedValueOnce(
        response(
          run({
            events: [
              event(1, "model_call"),
              event(2, "analysis", { model_call: 1, text: "第一轮初稿", complete: false }),
              event(3, "analysis", {
                model_call: 1,
                text: "第一轮公开摘要",
                complete: true,
                reasoning: "私有推理",
              }),
              event(4, "model_call"),
              event(5, "analysis", { model_call: 2, text: "报告正在", complete: false }),
            ],
            last_seq: 5,
          })
        )
      )
      .mockResolvedValueOnce(
        response(
          run({
            events: [
              event(6, "analysis", { model_call: 2, text: "报告正在生成", complete: false }),
              event(7, "recovering"),
              event(8, "model_call"),
              event(9, "analysis", { model_call: 2, text: "恢复后的公开摘要", complete: false }),
              event(10, "analysis", { model_call: 3, reasoning: "私有推理", complete: false }),
            ],
            last_seq: 10,
          })
        )
      );
    const wrapper = await create();
    await choose(wrapper);
    expect(wrapper.findAll(".agent-analysis")).toHaveLength(2);
    expect(wrapper.text()).not.toContain("第一轮初稿");
    expect(wrapper.text()).toContain("生成中，供参考；最终以报告为准");
    await vi.advanceTimersByTimeAsync(1500);
    await flushPromises();
    const summaries = wrapper.findAll(".agent-analysis");
    expect(summaries).toHaveLength(3);
    expect(summaries[0]!.text()).toContain("第一轮公开摘要");
    expect(summaries[1]!.text()).toContain("报告正在生成");
    expect(summaries[1]!.text()).toContain("已中断");
    expect(summaries[2]!.text()).toContain("恢复后的公开摘要");
    expect(summaries[2]!.text()).toContain("生成中");
    expect(wrapper.text()).not.toContain("私有推理");
  });

  it.each(["failed", "cancelled"] as const)(
    "marks unfinished cards interrupted on %s",
    async (status) => {
      api.getRun.mockResolvedValue(
        response(
          run({
            status,
            events: [
              event(1, "model_call"),
              event(2, "analysis", { model_call: 1, text: "未完成的公开摘要", complete: false }),
              event(3, "tool_started", { name: "search_knowledge", call_id: "one", attempt: 1 }),
            ],
            last_seq: 3,
          })
        )
      );
      const wrapper = await create();
      await choose(wrapper);
      expect(wrapper.get(".agent-tool-card").text()).toContain("已中断");
      expect(wrapper.get(".agent-analysis").text()).toContain("已中断");
      expect(wrapper.get(".agent-analysis").text()).not.toContain("生成中");
      await wrapper.get(".agent-tool-toggle").trigger("click");
      expect(wrapper.text()).toContain("查询已中断，未收到完成结果");
    }
  );

  it("ticks independently of polling, resets stage time, and freezes terminal durations", async () => {
    api.getRun.mockResolvedValue(response(run()));
    const wrapper = await create();
    await choose(wrapper);
    const total = () => wrapper.get('[data-testid="agent-total-time"]').text();
    const stage = () => wrapper.get('[data-testid="agent-stage-time"]').text();
    expect(total()).toBe("00:00");
    await vi.advanceTimersByTimeAsync(1000);
    expect(total()).toBe("00:01");
    expect(stage()).toBe("00:01");
    expect(api.getRun).toHaveBeenCalledTimes(1);
    api.getRun.mockResolvedValue(
      response(
        run({
          events: [{ ...event(2, "model_call"), created_at: "2026-10-24T12:00:01" }],
          last_seq: 2,
        })
      )
    );
    await vi.advanceTimersByTimeAsync(1000);
    expect(total()).toBe("00:02");
    expect(stage()).toBe("00:01");
    api.getRun.mockResolvedValue(
      response(
        run({
          status: "succeeded",
          updated_at: "2026-10-24T12:00:03",
          events: [{ ...event(3, "succeeded"), created_at: "2026-10-24T12:00:03" }],
          last_seq: 3,
        })
      )
    );
    await vi.advanceTimersByTimeAsync(1000);
    expect(total()).toBe("00:03");
    expect(stage()).toBe("00:02");
    await vi.advanceTimersByTimeAsync(10000);
    expect(total()).toBe("00:03");
    expect(stage()).toBe("00:02");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("clears tool details, public summaries and timers on revoked detail access", async () => {
    const sensitive = run({
      events: [
        event(1, "model_call"),
        event(2, "analysis", { model_call: 1, text: "敏感公开摘要", complete: false }),
        event(3, "tool_started", {
          name: "search_knowledge",
          call_id: "secure",
          attempt: 1,
          arguments: { query: "敏感查询参数" },
        }),
      ],
      last_seq: 3,
    });
    api.getRun.mockResolvedValueOnce(response(sensitive)).mockRejectedValueOnce(new Error("403"));
    const wrapper = await create();
    await choose(wrapper);
    await wrapper.get(".agent-tool-toggle").trigger("click");
    expect(wrapper.text()).toContain("敏感查询参数");
    await vi.advanceTimersByTimeAsync(1500);
    await flushPromises();
    expectNoEvidence(wrapper);
    expect(wrapper.find(".agent-tool-body").exists()).toBe(false);
    expect(wrapper.find(".agent-analysis").exists()).toBe(false);
    expect(wrapper.get(".agent-stage").text()).toContain("状态待确认");
    const time = wrapper.get('[data-testid="agent-total-time"]').text();
    await vi.advanceTimersByTimeAsync(6000);
    expect(wrapper.get('[data-testid="agent-total-time"]').text()).toBe(time);
    expect(vi.getTimerCount()).toBe(0);
    api.getRun.mockResolvedValue(response(sensitive));
    await click(wrapper, "重试更新");
    expect(api.getRun.mock.calls[2]![1]).toBe(0);
    expect(wrapper.get(".agent-tool-toggle").attributes("aria-expanded")).toBe("false");
  });

  it("clears the ticking clock on close, restarts on authorized reopen and clears on unmount", async () => {
    const wrapper = await create();
    await choose(wrapper);
    await vi.advanceTimersByTimeAsync(1000);
    await wrapper.setProps({ modelValue: false });
    await vi.advanceTimersByTimeAsync(6000);
    expect(vi.getTimerCount()).toBe(0);
    await wrapper.setProps({ modelValue: true });
    await flushPromises();
    expect(wrapper.get('[data-testid="agent-total-time"]').text()).toBe("00:07");
    await vi.advanceTimersByTimeAsync(1000);
    expect(wrapper.get('[data-testid="agent-total-time"]').text()).toBe("00:08");
    wrapper.unmount();
    wrappers.splice(wrappers.indexOf(wrapper), 1);
    await vi.advanceTimersByTimeAsync(6000);
    expect(vi.getTimerCount()).toBe(0);
  });
});
