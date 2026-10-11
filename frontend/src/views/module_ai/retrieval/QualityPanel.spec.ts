import { defineComponent, ref } from "vue";
import { flushPromises, shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import QualityPanel from "./QualityPanel.vue";

const api = vi.hoisted(() => ({
  evaluations: vi.fn(),
  feedbackList: vi.fn(),
  evaluate: vi.fn(),
  review: vi.fn(),
}));
vi.mock("@/api/module_ai/quality", () => ({ default: api }));
vi.mock("@stores", () => ({ useUserStore: () => ({ basicInfo: { is_superuser: true } }) }));
vi.mock("@vueuse/core", () => ({ useMediaQuery: () => ref(false) }));
const panel = defineComponent({ template: "<div><slot /><slot name='footer' /></div>" });
const input = defineComponent({
  name: "ElInput",
  props: ["modelValue", "rows"],
  emits: ["update:modelValue"],
  template:
    "<input :value='modelValue' @input=\"$emit('update:modelValue', $event.target.value)\" />",
});
const button = defineComponent({
  props: ["loading"],
  emits: ["click"],
  template: "<button :disabled='loading' @click=\"$emit('click')\"><slot /></button>",
});
const stubs = {
  ElCard: panel,
  ElTabs: panel,
  ElTabPane: panel,
  ElForm: panel,
  ElFormItem: panel,
  ElInput: input,
  ElButton: button,
  ElSelect: true,
  ElOption: true,
  ElTable: true,
  ElTableColumn: true,
  ElPagination: true,
  ElInputNumber: true,
  ElDescriptions: panel,
  ElDescriptionsItem: panel,
  ElDialog: panel,
  FaAsyncState: defineComponent({
    template: "<div role='alert'>加载失败<slot name='action' /></div>",
  }),
};
const mountPanel = () => shallowMount(QualityPanel, { props: { bases: [] }, global: { stubs } });

beforeEach(() => {
  vi.resetAllMocks();
  api.evaluations.mockResolvedValue({ data: { data: { items: [], total: 0 } } });
  api.feedbackList.mockResolvedValue({ data: { data: { items: [], total: 0 } } });
});

describe("retrieval quality", () => {
  it("rejects malformed labels before calling the API", async () => {
    const wrapper = mountPanel();
    await flushPromises();
    wrapper
      .findAllComponents(input)
      .find((component) => component.props("rows") === 8)!
      .vm.$emit("update:modelValue", '[{"query":"x","expected_document_ids":[-1]}]');
    await wrapper
      .findAll("button")
      .find((item) => item.text() === "运行评测")!
      .trigger("click");
    expect(wrapper.text()).toContain("问题集格式不正确");
    expect(api.evaluate).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it("keeps the newest refresh after an older request fails", async () => {
    let rejectOld!: (reason: Error) => void;
    api.evaluations.mockReturnValueOnce(
      new Promise((_resolve, reject) => {
        rejectOld = reject;
      })
    );
    const wrapper = mountPanel();
    api.evaluations.mockResolvedValueOnce({ data: { data: { items: [], total: 7 } } });
    await wrapper
      .findAll("button")
      .find((item) => item.text() === "刷新历史")!
      .trigger("click");
    await flushPromises();
    rejectOld(new Error("stale"));
    await flushPromises();
    expect(wrapper.findComponent({ name: "FaAsyncState" }).exists()).toBe(false);
    expect(wrapper.findAllComponents({ name: "ElPagination" })[0]!.attributes("total")).toBe("7");
    wrapper.unmount();
  });
});
