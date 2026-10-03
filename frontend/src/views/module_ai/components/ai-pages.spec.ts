import { defineComponent, ref } from "vue";
import { flushPromises, shallowMount, type VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MemoryPage from "../memory-manage/index.vue";
import ModelPage from "../model-config/index.vue";
import RetrievalPage from "../retrieval/index.vue";
import ChatPage from "../chat/index.vue";

const api = vi.hoisted(() => ({
  memoryList: vi.fn(),
  modelConfig: vi.fn(),
  bases: vi.fn(),
  retrieval: vi.fn(),
}));

vi.mock("@/api/module_ai/memory", () => ({ AiMemoryAPI: { list: api.memoryList } }));
vi.mock("@/api/module_ai/chat", () => ({ default: { getModelConfig: api.modelConfig } }));
vi.mock("@/api/module_ai/knowledge", () => ({
  default: { optionselect: api.bases, testRetrieval: api.retrieval },
}));
vi.mock("@/api/module_system/auth", () => ({
  default: { createWsTicket: vi.fn().mockResolvedValue({ data: { data: { ticket: "fixture" } } }) },
}));
vi.mock("@/hooks/core/useAuth", () => ({ useAuth: () => ({ hasAuth: () => true }) }));
vi.mock("vue-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue-router")>()),
  useRoute: () => ({ query: {} }),
}));
vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@vueuse/core")>()),
  useMediaQuery: () => ref(true),
  useElementBounding: () => ({ top: ref(122) }),
  useWindowSize: () => ({ height: ref(844), width: ref(390) }),
}));

const Panel = defineComponent({ template: "<div><slot /><slot name='header' /></div>" });
const Form = defineComponent({
  name: "ElForm",
  props: ["model"],
  template: "<form><slot /></form>",
});
const Button = defineComponent({
  emits: ["click"],
  template: "<button @click=\"$emit('click')\"><slot /></button>",
});
const stubs = {
  ElCard: Panel,
  ElForm: Form,
  ElFormItem: Panel,
  ElButton: Button,
  ElSplitter: Panel,
  ElSplitterPanel: Panel,
  ElContainer: Panel,
  ElHeader: Panel,
  ElMain: Panel,
  ElFooter: Panel,
  FaAsyncState: defineComponent({
    props: ["state", "title", "description"],
    template:
      "<div :role=\"state === 'error' ? 'alert' : undefined\">{{ title }} {{ description }}<slot name=\"action\" /></div>",
  }),
  FaTable: defineComponent({
    name: "FaTable",
    props: ["data", "pagination", "emptyText"],
    template: "<div>{{ emptyText }}</div>",
  }),
  FaTableHeader: defineComponent({ name: "FaTableHeader", template: "<div><slot /></div>" }),
  FaTableHeaderLeft: true,
  FaSearchBar: true,
  FaDialog: true,
  ElDrawer: true,
  ElDialog: true,
  ElDescriptions: true,
  ElSelect: true,
  ElInput: true,
};
const wrappers: VueWrapper[] = [];

beforeEach(() => {
  vi.clearAllMocks();
  api.memoryList.mockResolvedValue({ data: { data: { items: [], total: 0 } } });
  api.modelConfig.mockResolvedValue({
    data: {
      data: {
        chat_protocol: "openai",
        openai_model: "fixture-model",
        openai_base_url: "https://example.test",
        embedding_provider: "local",
      },
    },
  });
  api.bases.mockResolvedValue({ data: { data: [{ id: 1, name: "测试资料" }] } });
  api.retrieval.mockResolvedValue({ data: { data: { results: [] } } });
  vi.stubGlobal(
    "WebSocket",
    class {
      static OPEN = 1;
      close() {}
    }
  );
});

afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  vi.unstubAllGlobals();
});

describe("AI page responsive and recovery feedback", () => {
  it("mounts memory management directly and keeps rows and pagination after refresh failure", async () => {
    const item = { id: 1, key: "回答格式", value: "先给结论", memory_type: "user_preference" };
    api.memoryList.mockResolvedValueOnce({ data: { data: { items: [item], total: 1 } } });
    const wrapper = shallowMount(MemoryPage, { global: { stubs } });
    wrappers.push(wrapper);
    await flushPromises();
    api.memoryList.mockRejectedValueOnce(new Error("fixture-only failure"));
    wrapper.getComponent({ name: "FaTableHeader" }).vm.$emit("refresh");
    await flushPromises();
    expect(wrapper.get('[role="alert"]').text()).toContain("记忆列表加载失败");
    expect(wrapper.getComponent({ name: "FaTable" }).props("data")).toEqual([item]);
    expect(wrapper.getComponent({ name: "FaTable" }).props("pagination").total).toBe(1);
    await wrapper.get("button").trigger("click");
    await flushPromises();
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(wrapper.get("fa-dialog-stub").attributes("width")).toBe("min(92vw, 600px)");
  });

  it("shows recoverable model loading errors and uses one-column mobile details", async () => {
    api.modelConfig.mockRejectedValueOnce(new Error("fixture-only failure"));
    const wrapper = shallowMount(ModelPage, {
      global: { stubs, directives: { auth: {}, loading: {} } },
    });
    wrappers.push(wrapper);
    await flushPromises();
    expect(wrapper.get('[role="alert"]').text()).toContain("模型配置加载失败");
    expect(wrapper.get("el-descriptions-stub").attributes("column")).toBe("1");
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "重试")!
      .trigger("click");
    await flushPromises();
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
  });

  it("distinguishes retrieval idle, no matches, and a retryable error without clearing the question", async () => {
    const wrapper = shallowMount(RetrievalPage, { global: { stubs } });
    wrappers.push(wrapper);
    await flushPromises();
    expect(wrapper.text()).toContain("等待检索");
    const form = wrapper.getComponent({ name: "ElForm" }).props("model");
    form.query = "工作规则";
    form.knowledge_base_ids = [1];
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "检索")!
      .trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain("未找到匹配片段");
    api.retrieval.mockRejectedValueOnce(new Error("fixture-only failure"));
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "检索")!
      .trigger("click");
    await flushPromises();
    expect(wrapper.get('[role="alert"]').text()).toContain("检索失败");
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "重试检索")!
      .trigger("click");
    await flushPromises();
    expect(api.retrieval).toHaveBeenLastCalledWith({
      query: "工作规则",
      knowledge_base_ids: [1],
      top_k: 5,
    });
  });

  it("bounds chat to the available viewport instead of inheriting an unbounded flex height", () => {
    const wrapper = shallowMount(ChatPage, { global: { stubs } });
    wrappers.push(wrapper);
    expect(wrapper.get(".chat-workspace").attributes("style")).toContain("height: 710px");
    expect(wrapper.classes()).not.toContain("fa-full-height");
    expect(wrapper.find(".chat-footer").exists()).toBe(true);
    expect(wrapper.find(".evidence-panel").exists()).toBe(false);
  });
});
