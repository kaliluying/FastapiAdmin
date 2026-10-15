import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";
import { afterEach, describe, expect, it } from "vitest";
import FaChatInput from "./FaChatInput.vue";
import FaRuntimeLogReport from "./FaRuntimeLogReport.vue";
import type { RuntimeLogResult } from "../types";

const wrappers: ReturnType<typeof mount>[] = [];
afterEach(() => wrappers.splice(0).forEach((wrapper) => wrapper.unmount()));

describe("chat composer", () => {
  const create = (sending = false) => {
    const wrapper = mount(FaChatInput, {
      props: { sending },
      global: { plugins: [ElementPlus], stubs: { FaSvgIcon: true } },
    });
    wrappers.push(wrapper);
    return wrapper;
  };

  it("never sends Enter while confirming Chinese IME input", async () => {
    const wrapper = create();
    const input = wrapper.get("textarea");
    await input.setValue("分析日志");
    await input.trigger("compositionstart");
    await input.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("send")).toBeUndefined();
    await input.trigger("compositionend", { data: "志" });
    await input.trigger("keydown", { key: "Enter", isComposing: true });
    await input.trigger("keydown", { key: "Enter", keyCode: 229 });
    await input.trigger("keydown", { key: "Enter", shiftKey: true });
    expect(wrapper.emitted("send")).toBeUndefined();
    await input.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("send")).toEqual([["分析日志", undefined]]);
  });

  it("allows preparing the next question and preserves it on stop", async () => {
    const wrapper = create(true);
    expect(wrapper.get("textarea").attributes("disabled")).toBeUndefined();
    await wrapper.get("textarea").setValue("下一条问题");
    await wrapper.get("textarea").trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("send")).toBeUndefined();
    await wrapper.get('[aria-label="停止生成"]').trigger("click");
    expect(wrapper.emitted("stop")).toHaveLength(1);
    await wrapper.setProps({ sending: false });
    await wrapper.get('[aria-label="发送消息"]').trigger("click");
    expect(wrapper.emitted("send")).toEqual([["下一条问题", undefined]]);
  });

  it("clears only the sent draft when delayed stream headers arrive", async () => {
    const wrapper = create();
    await wrapper.get("textarea").setValue("原问题");
    wrapper.vm.clearDraft("原问题");
    await wrapper.vm.$nextTick();
    expect((wrapper.get("textarea").element as HTMLTextAreaElement).value).toBe("");
    await wrapper.get("textarea").setValue("下一条新草稿");
    wrapper.vm.clearDraft("原问题");
    await wrapper.vm.$nextTick();
    expect((wrapper.get("textarea").element as HTMLTextAreaElement).value).toBe("下一条新草稿");
  });
});

describe("runtime log evidence", () => {
  it("separates queries and makes empty/truncated evidence explicit", () => {
    const result: RuntimeLogResult = {
      start_time: "2026-10-04T10:00:00",
      end_time: "2026-10-04T11:00:00",
      matched_count: 10,
      returned_count: 4,
      truncated: true,
      notice: "仅本实例日志文件",
      scanned_files: ["fastcore.log", "fastcore.2026-10-03.log.gz"],
      query_index: 1,
      query: { minutes: 60, levels: ["ERROR"], keyword: "timeout", correlation_id: "request42" },
    };
    const wrapper = mount(FaRuntimeLogReport, {
      props: {
        results: [
          result,
          { ...result, query_index: 2, matched_count: 0, returned_count: 0, truncated: false },
        ],
      },
    });
    wrappers.push(wrapper);
    expect(wrapper.findAll(".query-card")).toHaveLength(2);
    expect(wrapper.text()).toContain("日志不完整");
    expect(wrapper.text()).toContain("fastcore.2026-10-03.log.gz");
    expect(wrapper.text()).toContain("不能据此判断系统正常");
    expect(wrapper.text()).toContain("request42");
    expect(
      wrapper.findAll("details").every((details) => details.attributes("open") === undefined)
    ).toBe(true);
  });
});
