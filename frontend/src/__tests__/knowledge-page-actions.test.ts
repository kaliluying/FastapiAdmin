import { computed, defineComponent } from "vue";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import KnowledgePage from "@/views/module_ai/knowledge/index.vue";
import KnowledgeAPI from "@/api/module_ai/knowledge";

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
  props: ["prop"],
  inject: { tableRows: { default: () => [] } },
  template:
    '<div><template v-for="row in tableRows"><span v-if="prop">{{ row[prop] }}</span><slot :row="row" /></template></div>',
});

const stubs = {
  ElButton: { emits: ["click"], template: "<button @click=\"$emit('click')\"><slot /></button>" },
  ElCard: { template: "<section><slot /></section>" },
  ElDialog: true,
  ElDropdown: {
    template:
      "<button data-test=\"more-action\" @click=\"$emit('command', 'retrieve')\">更多</button>",
  },
  ElDropdownMenu: true,
  ElDropdownItem: true,
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
  FaAsyncState: {
    props: ["title", "description"],
    template: '<div>{{ title }}{{ description }}<slot name="action" /></div>',
  },
};

let wrapper: VueWrapper;
const list = vi.mocked(KnowledgeAPI.listKnowledgeBase);
const response = (processingCount: number) => ({
  data: {
    data: {
      items: [
        {
          id: 7,
          name: "产品手册",
          description: "产品资料",
          is_enabled: true,
          indexed_document_count: 1,
          indexing_document_count: processingCount,
          failed_document_count: 0,
        },
      ],
      total: 1,
    },
  },
});
beforeEach(() => {
  vi.useFakeTimers();
  list.mockReset().mockResolvedValue(response(0) as never);
});
afterEach(() => {
  wrapper?.unmount();
  vi.useRealTimers();
});

describe("Knowledge page actions", () => {
  it("routes the upload action to the selected knowledge base", async () => {
    wrapper = mount(KnowledgePage, { global: { stubs } });
    await flushPromises();

    const uploadButton = wrapper.findAll("button").find((button) => button.text() === "上传文档");
    expect(uploadButton).toBeDefined();

    await uploadButton!.trigger("click");

    expect(routerPush).toHaveBeenCalledWith({
      path: "/ai/document",
      query: { knowledge_base_id: 7, upload: "1" },
    });
  });

  it("keeps the retrieval action available in the compact menu", async () => {
    routerPush.mockClear();
    wrapper = mount(KnowledgePage, { global: { stubs } });
    await flushPromises();

    await wrapper.get('[data-test="more-action"]').trigger("click");

    expect(routerPush).toHaveBeenCalledWith({
      path: "/ai/retrieval",
      query: { knowledge_base_id: 7 },
    });
  });

  it("refreshes processing counts with the same query and stops after completion", async () => {
    list.mockResolvedValueOnce(response(1) as never).mockResolvedValue(response(0) as never);
    wrapper = mount(KnowledgePage, { global: { stubs } });
    await flushPromises();
    const page = wrapper.vm as unknown as { query: { name: string; page_no: number } };
    Object.assign(page.query, { name: "手册", page_no: 2 });
    await vi.advanceTimersByTimeAsync(2000);
    expect(list).toHaveBeenLastCalledWith(expect.objectContaining({ name: "手册", page_no: 2 }));
    expect(wrapper.text()).toContain("可检索");
    await vi.advanceTimersByTimeAsync(10000);
    expect(list).toHaveBeenCalledTimes(2);
  });

  it("limits old pending counts and offers manual refresh after an error", async () => {
    list.mockResolvedValue(response(1) as never);
    wrapper = mount(KnowledgePage, { global: { stubs } });
    await flushPromises();
    await vi.advanceTimersByTimeAsync(120000);
    expect(list).toHaveBeenCalledTimes(61);
    expect(wrapper.text()).toContain("自动刷新已暂停");
    await vi.advanceTimersByTimeAsync(10000);
    expect(list).toHaveBeenCalledTimes(61);
    list.mockRejectedValueOnce(new Error("offline"));
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "刷新状态")!
      .trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain("知识库状态刷新失败");
    expect(wrapper.text()).toContain("产品手册");
    list.mockResolvedValue(response(0) as never);
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "刷新状态")!
      .trigger("click");
    await flushPromises();
    expect(wrapper.text()).not.toContain("知识库状态刷新失败");
  });
});
