import { createApp, nextTick } from "vue";
import { createPinia, setActivePinia } from "pinia";
import persistedState from "pinia-plugin-persistedstate";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SystemThemeEnum } from "@/enums/appEnum";
import { SETTING_DEFAULT_CONFIG } from "@/config/setting";
import { useSettingsStore } from "./setting.store";

vi.mock("@/hooks/core/useTheme", () => ({ useTheme: vi.fn() }));
vi.mock("@stores", () => ({ useSettingsStore: () => useSettingsStore() }));
vi.mock("@utils", async () => ({
  ...(await import("@/utils/ui")),
  formatToDate: () => "2026-10-04",
  StorageConfig: { THEME_KEY: "sys-theme" },
}));

function initializeStore() {
  const pinia = createPinia().use(persistedState);
  createApp({}).use(pinia);
  setActivePinia(pinia);
  return useSettingsStore();
}

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 0;
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute("class");
  document.documentElement.removeAttribute("style");
  localStorage.clear();
});

describe("single theme state", () => {
  it("applies, persists, restores and resets the same theme and color", async () => {
    let store = initializeStore();
    store.setGlopTheme(SystemThemeEnum.DARK, SystemThemeEnum.AUTO);
    store.setElementTheme("#722ed1");
    await nextTick();
    expect(store.isDark).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.getPropertyValue("--el-color-primary")).toBe("#722ed1");

    store.$dispose();
    store = initializeStore();
    await nextTick();
    expect(store.systemThemeMode).toBe(SystemThemeEnum.AUTO);
    expect(store.systemThemeColor).toBe("#722ed1");
    expect(store.isDark).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.getPropertyValue("--el-color-primary")).toBe("#722ed1");

    store.resetSettings();
    await nextTick();
    expect(store.systemThemeType).toBe(SETTING_DEFAULT_CONFIG.systemThemeType);
    expect(store.systemThemeMode).toBe(SETTING_DEFAULT_CONFIG.systemThemeMode);
    expect(store.systemThemeColor).toBe(SETTING_DEFAULT_CONFIG.systemThemeColor);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.style.getPropertyValue("--el-color-primary")).toBe("#3267d6");
    store.$dispose();
  });
});
