import { mount } from "@vue/test-utils";
import { reactive, ref, toRefs } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FaAuthTopBar from "./FaAuthTopBar.vue";

const { changeTheme, reload, animation, switchTheme, changeLanguage } = vi.hoisted(() => ({
  changeTheme: vi.fn(),
  reload: vi.fn(),
  animation: vi.fn(),
  switchTheme: vi.fn(),
  changeLanguage: vi.fn(),
}));
const settings = reactive({
  isDark: false,
  systemThemeColor: "#3B73E8",
  setElementTheme: changeTheme,
  reload,
});
vi.mock("@stores", () => ({
  useSettingsStore: () => settings,
  useUserStore: () => ({ setLanguage: changeLanguage }),
}));
vi.mock("pinia", () => ({ storeToRefs: (store: object) => toRefs(store) }));
vi.mock("vue-i18n", () => ({ useI18n: () => ({ locale: ref("zh"), t: (key: string) => key }) }));
vi.mock("@/hooks/core/useHeaderBar", () => ({
  useHeaderBar: () => ({ shouldShowThemeToggle: true, shouldShowLanguage: true }),
}));
vi.mock("@/hooks/core/useTheme", () => ({ useTheme: () => ({ switchThemeStyles: switchTheme }) }));
vi.mock("@utils", () => ({ themeAnimation: animation }));
vi.mock("@/locales", () => ({
  languageOptions: [
    { value: "zh", label: "中文" },
    { value: "en", label: "English" },
  ],
}));
vi.mock("@/config", () => ({
  default: { systemInfo: { name: "FastCore" }, systemMainColor: ["#3B73E8", "#0F9D77"] },
}));

function renderTopBar() {
  return mount(FaAuthTopBar, {
    attachTo: document.body,
    props: { panelAlign: "right" },
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        FaLogo: true,
        FaSvgIcon: true,
        ElPopover: { template: '<div><slot name="reference" /><slot /></div>' },
        ElDropdown: { template: '<div><slot /><slot name="dropdown" /></div>' },
        ElDropdownMenu: { template: "<div><slot /></div>" },
        ElDropdownItem: true,
      },
    },
  });
}

describe("login settings accessibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    settings.isDark = false;
  });
  afterEach(() => vi.unstubAllGlobals());

  it("uses named native buttons and exposes selected theme colors", async () => {
    const wrapper = renderTopBar();
    const buttons = wrapper.findAll("button");
    expect(buttons.length).toBe(7);
    for (const button of buttons) {
      expect(button.attributes("type")).toBe("button");
      expect(button.attributes("aria-label")).toBeTruthy();
    }
    expect(wrapper.get('.color-dot[aria-pressed="true"]').attributes("aria-label")).toContain(
      "#3B73E8"
    );
    await wrapper.get('button[aria-label="主题色 #0F9D77"]').trigger("click");
    expect(changeTheme).toHaveBeenCalledWith("#0F9D77");
    expect(reload).toHaveBeenCalledOnce();
    wrapper.unmount();
  });

  it("reveals mobile settings and returns focus to the trigger on Escape", async () => {
    const wrapper = renderTopBar();
    const trigger = wrapper.get(".auth-mobile-settings");
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(trigger.attributes("aria-controls")).toBe("auth-page-settings");
    await trigger.trigger("click");
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(wrapper.get("#auth-page-settings").classes()).toContain(
      "auth-top-bar-actions-panel--open"
    );
    await wrapper.get("header").trigger("keydown", { key: "Escape" });
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger.element);
    wrapper.unmount();
  });

  it("switches theme without view-transition animation when motion is reduced", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true }))
    );
    const wrapper = renderTopBar();
    await wrapper.get(".theme-btn").trigger("click");
    expect(switchTheme).toHaveBeenCalledWith("dark");
    expect(animation).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it("retains the existing theme animation when motion is allowed", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false }))
    );
    const wrapper = renderTopBar();
    await wrapper.get(".theme-btn").trigger("click");
    expect(animation).toHaveBeenCalledOnce();
    expect(switchTheme).not.toHaveBeenCalled();
    wrapper.unmount();
  });
});
