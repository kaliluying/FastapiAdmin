import { computed, defineComponent, KeepAlive, ref } from "vue";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DocumentPage from "@/views/module_ai/document/index.vue";
import KnowledgeAPI from "@/api/module_ai/knowledge";
import { ElMessage } from "element-plus";

const visibility = ref("visible");
vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@vueuse/core")>()),
  useDocumentVisibility: () => visibility,
}));
vi.mock("element-plus", async (importOriginal) => ({
  ...(await importOriginal<typeof import("element-plus")>()),
  ElMessage: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

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
    uploadDocument: vi
      .fn()
      .mockResolvedValue({ data: { data: { id: 8, index_status: "pending" } } }),
    reindexDocument: vi
      .fn()
      .mockResolvedValue({ data: { data: { id: 8, index_status: "success" } } }),
  },
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({ query: {} }),
}));

const stubs = {
  ElButton: {
    emits: ["click"],
    props: ["disabled", "loading"],
    template: '<button :disabled="disabled || loading" @click="$emit(\'click\')"><slot /></button>',
  },
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
  ElTable: defineComponent({
    props: { data: { type: Array, default: () => [] } },
    provide() {
      return { tableRows: computed(() => this.data) };
    },
    template: "<div><slot /></div>",
  }),
  ElTableColumn: {
    inject: { tableRows: { default: () => [] } },
    template: '<div><slot v-for="row in tableRows" :row="row" /></div>',
  },
  ElTag: { template: "<span><slot /></span>" },
  ElTooltip: { template: "<span><slot /></span>" },
  ElUpload: {
    props: ["disabled", "httpRequest"],
    template: '<div data-test="upload-control" :data-disabled="disabled"><slot /></div>',
  },
  FaAsyncState: {
    props: ["state", "title", "description"],
    template: '<div :data-state="state">{{ title }}{{ description }}<slot name="action" /></div>',
  },
  FaAiPageHeader: { template: '<header><slot name="actions" /></header>' },
};

const pendingDocument = {
  id: 8,
  knowledge_base_id: 1,
  file_name: "产品手册.txt",
  file_type: "txt",
  file_size: 12,
  parse_status: "pending",
  index_status: "pending",
  chunk_count: 0,
};
const listResponse = (indexStatus = "pending", parseStatus = "pending", errorMessage = "") => ({
  data: {
    data: {
      items: [
        {
          ...pendingDocument,
          index_status: indexStatus,
          parse_status: parseStatus,
          error_message: errorMessage,
        },
      ],
      total: 1,
    },
  },
});
const listDocument = vi.mocked(KnowledgeAPI.listDocument);
let wrapper: VueWrapper;
const mountPage = async () => {
  wrapper = mount(DocumentPage, { global: { stubs } });
  await flushPromises();
  return wrapper;
};
const button = (text: string) => wrapper.findAll("button").find((item) => item.text() === text)!;

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  visibility.value = "visible";
  listDocument.mockReset().mockResolvedValue({ data: { data: { items: [], total: 0 } } } as never);
  vi.mocked(KnowledgeAPI.reindexDocument)
    .mockReset()
    .mockResolvedValue({ data: { data: { index_status: "success" } } } as never);
});
afterEach(() => {
  wrapper?.unmount();
  vi.useRealTimers();
});

describe("Knowledge document page", () => {
  it("opens the upload dialog before a knowledge base is selected", async () => {
    await mountPage();

    const uploadButton = wrapper.findAll("button").find((button) => button.text() === "上传文档");
    expect(uploadButton).toBeDefined();

    await uploadButton!.trigger("click");

    expect(wrapper.find('[data-test="upload-dialog"]').exists()).toBe(true);
    expect(wrapper.get('[data-test="upload-control"]').attributes("data-disabled")).toBe("true");
  });

  it("polls processing rows without replacing the table and stops at a terminal state", async () => {
    listDocument
      .mockResolvedValueOnce(listResponse("indexing", "parsing") as never)
      .mockResolvedValue(listResponse("success", "success") as never);
    await mountPage();
    expect(wrapper.text()).toContain("正在解析");
    expect(button("重新索引").attributes("disabled")).toBeDefined();
    await vi.advanceTimersByTimeAsync(2000);
    expect(wrapper.text()).toContain("可检索");
    await vi.advanceTimersByTimeAsync(10000);
    expect(listDocument).toHaveBeenCalledTimes(2);
  });

  it("limits legacy pending polling and allows a manual recovery", async () => {
    listDocument.mockResolvedValue(listResponse() as never);
    await mountPage();
    await vi.advanceTimersByTimeAsync(120000);
    expect(listDocument).toHaveBeenCalledTimes(61);
    expect(wrapper.text()).toContain("自动刷新已暂停");
    expect(button("重新索引").attributes("disabled")).toBeUndefined();
    await vi.advanceTimersByTimeAsync(60000);
    expect(listDocument).toHaveBeenCalledTimes(61);
    listDocument.mockResolvedValue(listResponse("success", "success") as never);
    await button("刷新状态").trigger("click");
    await flushPromises();
    expect(wrapper.text()).not.toContain("自动刷新已暂停");
    expect(wrapper.text()).toContain("可检索");
  });

  it("recovers from polling errors while keeping the rows, filters, and page", async () => {
    listDocument.mockResolvedValue(listResponse() as never);
    await mountPage();
    const page = wrapper.vm as unknown as {
      query: { file_name: string; page_no: number; knowledge_base_id: number };
    };
    Object.assign(page.query, { file_name: "手册", page_no: 3, knowledge_base_id: 1 });
    listDocument.mockRejectedValueOnce(new Error("offline"));
    await vi.advanceTimersByTimeAsync(2000);
    expect(wrapper.text()).toContain("文档状态刷新失败");
    expect(wrapper.text()).toContain("等待处理");
    listDocument.mockResolvedValue(
      listResponse("failed", "success", "索引服务超时，请重试") as never
    );
    await vi.advanceTimersByTimeAsync(2000);
    expect(wrapper.text()).toContain("索引失败");
    expect(wrapper.text()).toContain("索引服务超时，请重试");
    expect(wrapper.text()).not.toContain("文档状态刷新失败");
    expect(listDocument).toHaveBeenLastCalledWith(
      expect.objectContaining({ file_name: "手册", page_no: 3, knowledge_base_id: 1 })
    );
  });

  it("pauses after three consecutive failures and can be retried manually", async () => {
    listDocument
      .mockResolvedValueOnce(listResponse() as never)
      .mockRejectedValue(new Error("offline"));
    await mountPage();
    await vi.advanceTimersByTimeAsync(6000);
    expect(listDocument).toHaveBeenCalledTimes(4);
    expect(wrapper.text()).toContain("文档状态刷新失败");
    await vi.advanceTimersByTimeAsync(10000);
    expect(listDocument).toHaveBeenCalledTimes(4);
    listDocument.mockResolvedValue(listResponse("success", "success") as never);
    await button("刷新状态").trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain("可检索");
    expect(wrapper.text()).not.toContain("文档状态刷新失败");
  });

  it("pauses in a hidden tab and on unmount", async () => {
    listDocument.mockResolvedValue(listResponse() as never);
    await mountPage();
    visibility.value = "hidden";
    await flushPromises();
    await vi.advanceTimersByTimeAsync(10000);
    expect(listDocument).toHaveBeenCalledTimes(1);
    visibility.value = "visible";
    await flushPromises();
    expect(listDocument).toHaveBeenCalledTimes(2);
    wrapper.unmount();
    await vi.advanceTimersByTimeAsync(10000);
    expect(listDocument).toHaveBeenCalledTimes(2);
  });

  it("ignores an old polling response after a new query completes", async () => {
    listDocument.mockResolvedValue(listResponse() as never);
    await mountPage();
    let resolveOld!: (value: unknown) => void;
    listDocument.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveOld = resolve;
      }) as never
    );
    await vi.advanceTimersByTimeAsync(2000);
    listDocument.mockResolvedValue(listResponse("success", "success") as never);
    await button("查询").trigger("click");
    await flushPromises();
    resolveOld(listResponse("failed", "failed", "过时的错误"));
    await flushPromises();
    expect(wrapper.text()).toContain("可检索");
    expect(wrapper.text()).not.toContain("过时的错误");
    await vi.advanceTimersByTimeAsync(10000);
    expect(listDocument).toHaveBeenCalledTimes(3);
  });

  it("pauses when a cached view is deactivated and refreshes on activation", async () => {
    const shown = ref(true);
    listDocument.mockResolvedValue(listResponse() as never);
    wrapper = mount(
      defineComponent({
        components: { DocumentPage, KeepAlive },
        setup: () => ({ shown }),
        template: '<KeepAlive><DocumentPage v-if="shown" /></KeepAlive>',
      }),
      { global: { stubs } }
    );
    await flushPromises();
    expect(listDocument).toHaveBeenCalledTimes(1);
    shown.value = false;
    await flushPromises();
    await vi.advanceTimersByTimeAsync(10000);
    expect(listDocument).toHaveBeenCalledTimes(1);
    shown.value = true;
    await flushPromises();
    expect(listDocument).toHaveBeenCalledTimes(2);
  });

  it("keeps upload feedback and preserves the active query", async () => {
    await mountPage();
    const page = wrapper.vm as unknown as {
      query: { file_name: string; page_no: number };
      uploadForm: { knowledge_base_id: number };
    };
    Object.assign(page.query, { file_name: "existing", page_no: 2 });
    await button("上传文档").trigger("click");
    page.uploadForm.knowledge_base_id = 1;
    const upload = wrapper.findComponent(stubs.ElUpload);
    await upload.props("httpRequest")({ file: new File(["资料"], "guide.txt") });
    expect(ElMessage.success).toHaveBeenCalledWith("文档已接收，等待处理；处理完成后可检索");
    expect(listDocument).toHaveBeenLastCalledWith(
      expect.objectContaining({ file_name: "existing", page_no: 2 })
    );
  });

  it("prevents duplicate reindex requests and reports actual completion", async () => {
    listDocument.mockResolvedValue(listResponse("failed", "success") as never);
    await mountPage();
    let complete!: (value: unknown) => void;
    vi.mocked(KnowledgeAPI.reindexDocument).mockReturnValueOnce(
      new Promise((resolve) => {
        complete = resolve;
      }) as never
    );
    await button("重新索引").trigger("click");
    await button("重新索引").trigger("click");
    expect(KnowledgeAPI.reindexDocument).toHaveBeenCalledTimes(1);
    expect(ElMessage.success).not.toHaveBeenCalled();
    complete({ data: { data: { index_status: "success" } } });
    await flushPromises();
    expect(ElMessage.success).toHaveBeenCalledWith("索引重建完成，文档已可检索");
  });

  it("releases the reindex lock after failure and loads the persisted failure", async () => {
    listDocument.mockResolvedValue(
      listResponse("failed", "failed", "请重新上传可解析的文件") as never
    );
    vi.mocked(KnowledgeAPI.reindexDocument).mockRejectedValueOnce(new Error("failed"));
    await mountPage();
    await button("重新索引").trigger("click");
    await flushPromises();
    expect(button("重新索引").attributes("disabled")).toBeUndefined();
    expect(wrapper.text()).toContain("解析失败");
    expect(wrapper.text()).toContain("请重新上传可解析的文件");
    expect(ElMessage.success).not.toHaveBeenCalled();
  });
});
