import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import DocumentPage from "@/views/module_ai/document/index.vue";

vi.mock("@/api/module_ai/knowledge", () => ({
  default: {
    optionselect: vi.fn().mockResolvedValue({
      data: {
        data: [
          { id: 1, name: "产品手册" },
          { id: 2, name: "交付规范" },
        ],
      },
    }),
    listDocument: vi.fn().mockResolvedValue({ data: { data: { items: [], total: 0 } } }),
  },
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({ query: {} }),
}));

const stubs = {
  ElButton: { template: "<button @click=\"$emit('click')\"><slot /></button>" },
  ElCard: { template: "<section><slot /></section>" },
  ElDialog: {
    props: ["modelValue"],
    template: '<section v-if="modelValue" data-test="upload-dialog"><slot /></section>',
  },
  ElForm: { template: "<form><slot /></form>" },
  ElFormItem: { template: "<div><slot /></div>" },
  ElIcon: { template: "<i><slot /></i>" },
  ElInput: true,
  ElOption: true,
  ElPagination: true,
  ElSelect: true,
  ElTable: true,
  ElTableColumn: true,
  ElTag: true,
  ElTooltip: true,
  ElUpload: {
    props: ["disabled"],
    template: '<div data-test="upload-control" :data-disabled="disabled"><slot /></div>',
  },
  FaAsyncState: true,
};

describe("Knowledge document page", () => {
  it("opens the upload dialog before a knowledge base is selected", async () => {
    const wrapper = mount(DocumentPage, { global: { stubs } });
    await flushPromises();

    const uploadButton = wrapper.findAll("button").find((button) => button.text() === "上传文档");
    expect(uploadButton).toBeDefined();

    await uploadButton!.trigger("click");

    expect(wrapper.find('[data-test="upload-dialog"]').exists()).toBe(true);
    expect(wrapper.get('[data-test="upload-control"]').attributes("data-disabled")).toBe("true");
  });
});
