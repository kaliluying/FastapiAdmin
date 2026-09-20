import { createMemoryHistory, createRouter } from "vue-router";
import { describe, expect, it } from "vitest";

import { HOME_ROUTE_NAME, staticRoutes } from "./staticRoutes";
import { navigateToHome } from "./homeNavigation";

describe("后台 Logo 首页导航", () => {
  it("使用稳定的 Home 路由名，不受持久化旧首页路径影响", async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: staticRoutes,
    });

    const persistedHomePath = "/dashboard";
    expect(router.resolve(persistedHomePath).name).toBe("CatchAll404");

    await router.push("/404");
    await navigateToHome(router);

    expect(router.currentRoute.value.name).toBe(HOME_ROUTE_NAME);
    expect(router.currentRoute.value.path).toBe("/home");
  });
});
