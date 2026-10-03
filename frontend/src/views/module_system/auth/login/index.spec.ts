import { flushPromises, mount } from "@vue/test-utils";
import { computed, defineComponent, onMounted, reactive, ref, watch } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Login from "./index.vue";

const { login, validate, replace, notification } = vi.hoisted(() => ({
  login: vi.fn(),
  validate: vi.fn(),
  replace: vi.fn(),
  notification: vi.fn(),
}));
vi.mock("@stores", () => ({
  useUserStore: () => ({ login, isLogin: false }),
  useSettingsStore: () => ({ showGuide: false }),
  useAppStore: () => ({ showGuide: vi.fn() }),
}));
vi.mock("@/api/module_system/auth", () => ({
  default: { getCaptcha: vi.fn().mockResolvedValue({ data: { data: { enable: false } } }) },
}));
vi.mock("@utils", () => ({ Auth: {}, HttpError: class extends Error {} }));
vi.mock("element-plus", () => ({ ElNotification: notification }));
vi.mock("@/components/views/fa-login/widgets/FaAuthTopBar.vue", () => ({
  default: { template: "<div />" },
}));
vi.mock("@/components/views/fa-login/widgets/FaEnterpriseIntro.vue", () => ({
  default: { template: "<div />" },
}));

Object.assign(globalThis, {
  computed,
  onMounted,
  reactive,
  ref,
  watch,
  useI18n: () => ({ t: (key: string) => key, locale: ref("zh") }),
  useRouter: () => ({ replace, resolve: (path: string) => ({ path, query: {} }) }),
  useRoute: () => ({ query: {} }),
});

const AccountForm = defineComponent({
  name: "FaLoginAccountForm",
  setup(_props, { expose }) {
    expose({ validate });
  },
  template: "<button @click=\"$emit('submit')\">登录</button>",
});

describe("login submission locking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    login.mockResolvedValue(undefined);
    validate.mockResolvedValue(true);
    replace.mockResolvedValue(undefined);
  });

  function renderLogin() {
    return mount(Login, {
      global: {
        stubs: {
          FaLoginAccountForm: AccountForm,
          FaLoginCenterBackdrop: true,
          FaLoginThirdPartySection: true,
        },
      },
    });
  }

  it("locks before validation and keeps the lock until login resolves", async () => {
    const validation = Promise.withResolvers<boolean>();
    const authentication = Promise.withResolvers<void>();
    validate.mockReturnValue(validation.promise);
    login.mockReturnValue(authentication.promise);
    const wrapper = renderLogin();
    await flushPromises();
    await wrapper.get("button").trigger("click");
    await wrapper.get("button").trigger("click");
    expect(validate).toHaveBeenCalledOnce();
    expect(login).not.toHaveBeenCalled();
    validation.resolve(true);
    await flushPromises();
    await wrapper.get("button").trigger("click");
    expect(login).toHaveBeenCalledOnce();
    authentication.resolve();
    await flushPromises();
    expect(replace).toHaveBeenCalledOnce();
    wrapper.unmount();
  });

  it("releases the lock after failed validation or a failed login", async () => {
    const wrapper = renderLogin();
    await flushPromises();
    validate.mockResolvedValueOnce(false);
    await wrapper.get("button").trigger("click");
    await flushPromises();
    expect(login).not.toHaveBeenCalled();
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    login.mockRejectedValueOnce(new Error("登录失败"));
    await wrapper.get("button").trigger("click");
    await flushPromises();
    await wrapper.get("button").trigger("click");
    await flushPromises();
    expect(login).toHaveBeenCalledTimes(2);
    expect(replace).toHaveBeenCalledOnce();
    log.mockRestore();
    wrapper.unmount();
  });
});
