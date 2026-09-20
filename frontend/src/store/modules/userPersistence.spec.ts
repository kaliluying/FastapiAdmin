import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createApp } from "vue";

import {
  clearLegacyUserRouteCache,
  USER_STORE_PERSISTED_FIELDS,
  USER_STORE_PERSIST_KEY,
} from "./userPersistence";
import { useUserStore } from "./user.store";

describe("用户 Store 持久化", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("不再持久化动态路由状态", () => {
    expect(USER_STORE_PERSISTED_FIELDS).not.toContain("routeList");
    expect(USER_STORE_PERSISTED_FIELDS).not.toContain("hasGetRoute");
  });

  it("清理旧版本留下的菜单路由缓存，但保留登录信息", () => {
    localStorage.setItem(
      USER_STORE_PERSIST_KEY,
      JSON.stringify({
        isLogin: true,
        info: { id: 1, username: "admin" },
        routeList: [{ name: "旧项目菜单" }],
        hasGetRoute: true,
      })
    );

    expect(clearLegacyUserRouteCache(localStorage)).toBe(true);
    expect(JSON.parse(localStorage.getItem(USER_STORE_PERSIST_KEY) || "{}")).toEqual({
      isLogin: true,
      info: { id: 1, username: "admin" },
    });
  });

  it("遇到无法解析的旧数据时不删除认证状态", () => {
    const raw = "not-json";
    localStorage.setItem(USER_STORE_PERSIST_KEY, raw);

    expect(clearLegacyUserRouteCache(localStorage)).toBe(false);
    expect(localStorage.getItem(USER_STORE_PERSIST_KEY)).toBe(raw);
  });

  it("Pinia hydration 时忽略旧动态路由并净化存储项", () => {
    localStorage.setItem(
      USER_STORE_PERSIST_KEY,
      JSON.stringify({
        isLogin: true,
        info: { id: 1 },
        routeList: [{ name: "旧项目菜单" }],
        hasGetRoute: true,
      })
    );

    const pinia = createPinia();
    pinia.use(piniaPluginPersistedstate);
    createApp({}).use(pinia);
    setActivePinia(pinia);
    const userStore = useUserStore(pinia);

    expect(userStore.routeList).toEqual([]);
    expect(userStore.hasGetRoute).toBe(false);

    const persisted = JSON.parse(localStorage.getItem(USER_STORE_PERSIST_KEY) || "{}");
    expect(persisted).not.toHaveProperty("routeList");
    expect(persisted).not.toHaveProperty("hasGetRoute");
  });
});
