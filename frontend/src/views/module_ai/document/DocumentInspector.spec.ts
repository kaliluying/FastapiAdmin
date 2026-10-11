import { defineComponent } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DocumentInspector from "./DocumentInspector.vue";

const api = vi.hoisted(() => ({
  chunks: vi.fn(),
  content: vi.fn(),
  save: vi.fn(),
  confirm: vi.fn(),
  maintain: true,
}));
vi.mock("@/api/module_ai/knowledge", () => ({
  default: {
    listChunks: api.chunks,
    documentContent: api.content,
    updateDocumentContent: api.save,
  },
}));
vi.mock("@/hooks/core/useAuth", () => ({ useAuth: () => ({ hasAuth: () => api.maintain }) }));
vi.mock("element-plus", () => ({
  ElMessage: { success: vi.fn(), error: vi.fn() },
  ElMessageBox: { confirm: api.confirm },
}));
const panel = defineComponent({ template: "<div><slot/><slot name='action'/></div>" });
const button = defineComponent({
  props: ["disabled"],
  emits: ["click"],
  template: `<button :disabled="disabled" @click="$emit('click')"><slot/></button>`,
});
const input = defineComponent({
  props: ["modelValue"],
  emits: ["update:modelValue"],
  template: `<textarea :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"/>`,
});
const stubs = {
  ElDialog: panel,
  ElButton: button,
  ElUpload: panel,
  ElPagination: true,
  ElInput: input,
  FaAsyncState: panel,
};
const document = {
  id: 3,
  knowledge_base_id: 2,
  file_name: "guide.pdf",
  file_type: "pdf",
  file_size: 40,
  parse_status: "success",
  index_status: "success",
  chunk_count: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
  api.maintain = true;
  api.chunks.mockResolvedValue({
    data: {
      data: {
        items: [{ id: 4, chunk_index: 0, content: "完整正文\n后续内容", token_count: 9 }],
        total: 1,
      },
    },
  });
  api.content.mockResolvedValue({ data: { data: "原始正文" } });
  api.save.mockResolvedValue({});
  api.confirm.mockResolvedValue("confirm");
});
const open = async () => {
  const wrapper = mount(DocumentInspector, { props: { document: null }, global: { stubs } });
  await wrapper.setProps({ document });
  await flushPromises();
  return wrapper;
};
const click = async (wrapper: Awaited<ReturnType<typeof open>>, text: string) => {
  await wrapper
    .findAll("button")
    .find((button) => button.text() === text)!
    .trigger("click");
  await flushPromises();
};

describe("document inspection", () => {
  it("shows full chunk text and retains zero-based source numbering", async () => {
    const wrapper = await open();
    expect(wrapper.text()).toContain("分块 0");
    expect(wrapper.find("pre").text()).toBe("完整正文\n后续内容");
    expect(api.chunks).toHaveBeenCalledWith(3, { page_no: 1, page_size: 10 });
    wrapper.unmount();
  });
  it("loads source and confirms TXT conversion before saving", async () => {
    const wrapper = await open();
    await click(wrapper, "纠错全文");
    await wrapper.find("textarea").setValue("修正后的正文");
    await click(wrapper, "保存纠错并重新索引");
    expect(api.confirm).toHaveBeenCalledWith(expect.stringContaining("转换为 TXT"), "保存纠错", {
      type: "warning",
    });
    expect(api.save).toHaveBeenCalledWith(3, "修正后的正文");
    expect(wrapper.emitted("changed")).toHaveLength(1);
    wrapper.unmount();
  });
  it("keeps reading available without maintenance permission", async () => {
    api.maintain = false;
    const wrapper = await open();
    expect(wrapper.text()).toContain("完整分块");
    expect(wrapper.text()).not.toContain("纠错全文");
    expect(wrapper.text()).not.toContain("替换文件");
    wrapper.unmount();
  });
  it("disables maintenance while replacement is pending", async () => {
    const wrapper = await open();
    await wrapper.setProps({
      document: { ...document, index_status: "pending", replacement_pending: true },
    });
    const edit = wrapper.findAll("button").find((item) => item.text() === "纠错全文")!;
    expect(edit.attributes("disabled")).toBeDefined();
    expect(wrapper.text()).toContain("当前原文件和分块仍保留");
    wrapper.unmount();
  });
});
