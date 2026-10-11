import { defineComponent } from "vue";
import { flushPromises, shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UsagePanel from "./UsagePanel.vue";
import ModelPage from "./index.vue";

const fixtures = vi.hoisted(() => ({
  user: { basicInfo: { is_superuser: true } },
  own: vi.fn(),
  admin: vi.fn(),
  quota: vi.fn(),
  config: vi.fn(),
  check: vi.fn(),
}));
vi.mock("@stores", () => ({ useUserStore: () => fixtures.user }));
vi.mock("@/hooks/core/useAuth", () => ({ useAuth: () => ({ hasAuth: () => true }) }));
vi.mock("@/api/module_ai/chat", () => ({
  default: {
    getUsage: fixtures.own,
    getAdminUsage: fixtures.admin,
    updateUsageQuota: fixtures.quota,
    getModelConfig: fixtures.config,
    checkModelCapabilities: fixtures.check,
  },
}));
const Panel = defineComponent({ template: "<div><slot /><slot name='header' /></div>" });
const Form = defineComponent({
  setup(_, { expose }) {
    expose({ validate: () => Promise.resolve(true) });
  },
  template: "<form><slot /></form>",
});
const Button = defineComponent({
  emits: ["click"],
  template: "<button @click=\"$emit('click')\"><slot /></button>",
});
const stubs = {
  ElCard: Panel,
  ElButton: Button,
  ElForm: Form,
  ElFormItem: Panel,
  ElTag: true,
  ElOption: true,
  ElAutocomplete: true,
  ElDescriptionsItem: true,
  ElDescriptions: true,
  ElTableColumn: true,
  ElSelect: true,
  ElInputNumber: true,
  ElInput: true,
  ElDivider: true,
  FaAiPageHeader: true,
  FaAsyncState: true,
  FaTable: true,
  UsagePanel: true,
};
const summary = {
  user_id: 1,
  day: "2026-10-11",
  timezone: "Asia/Shanghai",
  calls: 2,
  daily_limit: null,
  remaining: null,
  items: [],
  users: [{ id: 1, username: "admin" }],
};

beforeEach(() => {
  vi.clearAllMocks();
  fixtures.user.basicInfo.is_superuser = true;
  fixtures.own.mockResolvedValue({ data: { data: summary } });
  fixtures.admin.mockResolvedValue({ data: { data: summary } });
  fixtures.quota.mockResolvedValue({ data: { data: summary } });
  fixtures.config.mockResolvedValue({
    data: {
      data: {
        chat_protocol: "openai",
        openai_base_url: "https://fixture.invalid/v1",
        openai_model: "fixture",
        openai_api_key_configured: true,
      },
    },
  });
  fixtures.check.mockResolvedValue({
    data: {
      data: {
        protocol: "openai",
        model: "fixture",
        results: [{ capability: "tools", status: "failed", message: "未调用工具", latency_ms: 10 }],
      },
    },
  });
});

describe("AI usage and capability controls", () => {
  it("self-only panel never requests other users even for a superuser", async () => {
    const wrapper = shallowMount(UsagePanel, {
      global: { stubs, directives: { loading: () => undefined } },
    });
    await flushPromises();
    expect(fixtures.own).toHaveBeenCalledOnce();
    expect(fixtures.admin).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("今日 AI 用量");
    expect(wrapper.text()).toContain("未知调用不按 0 计算");
    wrapper.unmount();
  });
  it("administrator can save an unlimited quota and non-superuser uses self scope", async () => {
    const wrapper = shallowMount(UsagePanel, {
      props: { selfOnly: false },
      global: { stubs, directives: { loading: () => undefined } },
    });
    await flushPromises();
    expect(fixtures.admin).toHaveBeenCalledWith(undefined);
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "保存额度")!
      .trigger("click");
    await flushPromises();
    expect(fixtures.quota).toHaveBeenCalledWith(1, null);
    wrapper.unmount();
    fixtures.user.basicInfo.is_superuser = false;
    const own = shallowMount(UsagePanel, {
      props: { selfOnly: false },
      global: { stubs, directives: { loading: () => undefined } },
    });
    await flushPromises();
    expect(fixtures.own).toHaveBeenCalledOnce();
    expect(own.text()).toContain("今日 AI 用量");
    own.unmount();
  });
  it("failed usage load offers retry", async () => {
    fixtures.own.mockRejectedValueOnce(new Error("fixture"));
    const wrapper = shallowMount(UsagePanel, {
      global: { stubs, directives: { loading: () => undefined } },
    });
    await flushPromises();
    expect(wrapper.findComponent({ name: "FaAsyncState" }).exists()).toBe(true);
    wrapper.unmount();
  });
  it("model check is user-triggered and describes three billed requests", async () => {
    const wrapper = shallowMount(ModelPage, {
      global: { stubs, directives: { loading: () => undefined, auth: () => undefined } },
    });
    await flushPromises();
    expect(fixtures.check).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("最多 3 次调用");
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "验证 3 项能力")!
      .trigger("click");
    await flushPromises();
    expect(fixtures.check).toHaveBeenCalledWith(
      expect.objectContaining({ openai_model: "fixture", chat_protocol: "openai" })
    );
    wrapper.unmount();
  });
});
