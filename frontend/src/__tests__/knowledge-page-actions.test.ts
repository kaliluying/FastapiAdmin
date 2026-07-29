import { computed, defineComponent } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import KnowledgePage from "@/views/module_ai/knowledge/index.vue";

const { routerPush } = vi.hoisted(() => ({ routerPush: vi.fn() }));

vi.mock("@/api/module_ai/knowledge", () => ({
  default: {
    listKnowledgeBase: vi.fn().mockResolvedValue({
      data: {
        data: {
          items: [
            {
              id: 7,
              name: "产品手册",
              description: "产品资料",
              is_enabled: true,
              indexed_document_count: 1,
              indexing_document_count: 0,
              failed_document_count: 0,
            },
          ],
          total: 1,
        },
      },
    }),
  },
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: routerPush }),
}));

const TableStub = defineComponent({
  props: { data: { type: Array, default: () => [] } },
  provide() {
    return { tableRows: computed(() => this.data) };
  },
  template: "<div><slot /></div>",
});

const TableColumnStub = defineComponent({
  inject: { tableRows: { default: () => [] } },
  template: '<div><slot v-for="row in tableRows" :row="row" /></div>',
});

const stubs = {
  ElButton: { template: "<button @click=\"$emit('click')\"><slot /></button>" },
  ElCard: { template: "<section><slot /></section>" },
  ElDialog: true,
  ElForm: { template: "<form><slot /></form>" },
  ElFormItem: { template: "<div><slot /></div>" },
  ElInput: true,
  ElOption: true,
  ElPagination: true,
  ElSelect: true,
  ElSwitch: true,
  ElTable: TableStub,
  ElTableColumn: TableColumnStub,
  ElTag: { template: "<span><slot /></span>" },
  FaAiPageHeader: true,
  FaAsyncState: true,
};

describe("Knowledge page actions", () => {
  it("routes the upload action to the selected knowledge base", async () => {
    const wrapper = mount(KnowledgePage, { global: { stubs } });
    await flushPromises();

    const uploadButton = wrapper.findAll("button").find((button) => button.text() === "上传文档");
    expect(uploadButton).toBeDefined();

    await uploadButton!.trigger("click");

    expect(routerPush).toHaveBeenCalledWith({
      path: "/module_ai/document",
      query: { knowledge_base_id: 7, upload: "1" },
    });
  });
});
