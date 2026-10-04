import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter, type RouteRecordRaw } from "vue-router";
import type { AppRouteRecord } from "@/types/router";
import { IframeRouteManager, ROOT_LAYOUT_ROUTE_NAME } from "../staticRoutes";
import { ComponentLoader } from "./ComponentLoader";
import { RouteRegistry } from "./RouteRegistry";
import { RouteTransformer } from "./RouteTransformer";

const page = { render: () => null };

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: "/",
        name: ROOT_LAYOUT_ROUTE_NAME,
        component: page,
        children: [{ path: "home", name: "Home", component: page }],
      },
      { path: "/login", name: "Login", component: page },
    ],
  });
}

function menuRoute(name: string, path = `/${name.toLowerCase()}`): AppRouteRecord {
  return { name, path, component: "/test/page", meta: { title: name } };
}

describe("RouteRegistry 批量注册", () => {
  beforeEach(() => {
    IframeRouteManager.getInstance().clear();
    sessionStorage.clear();
    vi.spyOn(ComponentLoader.prototype, "load").mockReturnValue(() => Promise.resolve(page));
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    IframeRouteManager.getInstance().clear();
    sessionStorage.clear();
  });

  it("iframe getAll 返回原列表，原地恢复会更新实际缓存", () => {
    const manager = IframeRouteManager.getInstance();
    const routes = manager.getAll();
    const iframe = menuRoute("Iframe");
    manager.add(iframe);
    expect(manager.getAll()).toBe(routes);
    expect(routes).toEqual([iframe]);
    routes.splice(0, routes.length);
    expect(manager.getAll()).toEqual([]);
  });

  it("转换器不为无名子路由生成名称，多个无名子页面仍可按路径导航", () => {
    const router = createTestRouter();
    const registry = new RouteRegistry(router);
    const children = [menuRoute("First", "/tools/first"), menuRoute("Second", "/tools/second")];
    children.forEach((child) => {
      child.name = undefined;
    });
    const root = { ...menuRoute("Tools"), children };
    root.name = undefined;
    const transformed = new RouteTransformer(new ComponentLoader(), { shellChild: true }).transform(
      root
    );
    expect(transformed.children?.map((child) => child.name)).toEqual([undefined, undefined]);

    registry.register([root]);
    expect(router.hasRoute("Dyn_0_tools")).toBe(true);
    for (const path of ["/tools/first", "/tools/second"]) {
      const matched = router.resolve(path).matched;
      expect(matched).toHaveLength(3);
      expect(matched[1]?.name).toBe("Dyn_0_tools");
      expect(matched[2]?.name).toBeUndefined();
    }
    registry.unregister();
    expect(router.getRoutes().some((route) => route.path.startsWith("/tools"))).toBe(false);
  });

  it.each([false, true])("生成的一级名称与显式名称冲突时整批拒绝（子路由：%s）", (nested) => {
    const router = createTestRouter();
    const registry = new RouteRegistry(router);
    const root = menuRoute("Tools");
    root.name = undefined;
    const duplicate = menuRoute("Dyn_0_tools", nested ? "/tools/child" : "/other");
    if (nested) root.children = [duplicate];
    const addRoute = vi.spyOn(router, "addRoute");
    const transform = vi.spyOn(RouteTransformer.prototype, "transform");

    expect(() => registry.register(nested ? [root] : [root, duplicate])).toThrow("路由名称重复");
    expect(transform).not.toHaveBeenCalled();
    expect(addRoute).not.toHaveBeenCalled();
    expect(registry.isRegistered()).toBe(false);
  });

  it("不同分支的深层子路由重名时整批拒绝", () => {
    const router = createTestRouter();
    const registry = new RouteRegistry(router);
    const addRoute = vi.spyOn(router, "addRoute");
    const roots = ["First", "Second"].map((name) => ({
      ...menuRoute(name),
      children: [{ ...menuRoute(`${name}Group`), children: [menuRoute("Duplicate")] }],
    }));
    expect(() => registry.register(roots)).toThrow("路由名称重复");
    expect(addRoute).not.toHaveBeenCalled();
    expect(registry.isRegistered()).toBe(false);
  });

  it("整批拒绝后续保留路径，不先注册有效菜单，并允许重试", () => {
    const router = createTestRouter();
    const registry = new RouteRegistry(router);
    const addRoute = vi.spyOn(router, "addRoute");
    const transform = vi.spyOn(RouteTransformer.prototype, "transform");
    const originalRoutes = router.getRoutes();

    expect(() =>
      registry.register([menuRoute("Users"), menuRoute("Conflict", "/login/test")])
    ).toThrow("系统保留路径冲突");
    expect(transform).not.toHaveBeenCalled();
    expect(addRoute).not.toHaveBeenCalled();
    expect(router.getRoutes()).toEqual(originalRoutes);
    expect(registry.isRegistered()).toBe(false);

    registry.register([menuRoute("Users")]);
    expect(router.hasRoute("Users")).toBe(true);
  });

  it("后续配置校验失败时，整批不注册", () => {
    const router = createTestRouter();
    const registry = new RouteRegistry(router);
    const invalid = menuRoute("Invalid");
    invalid.component = undefined;

    expect(() => registry.register([menuRoute("Users"), invalid])).toThrow("验证失败");
    expect(router.hasRoute("Users")).toBe(false);
    expect(registry.isRegistered()).toBe(false);
  });

  it.each([false, true])("拒绝整批重复名称（嵌套：%s），不覆盖已规划的路由", (nested) => {
    const router = createTestRouter();
    const registry = new RouteRegistry(router);
    const duplicate = menuRoute("Users", "/duplicate");
    const later = nested ? { ...menuRoute("System"), children: [duplicate] } : duplicate;
    const addRoute = vi.spyOn(router, "addRoute");

    expect(() => registry.register([menuRoute("Users"), later])).toThrow("路由名称重复");
    expect(addRoute).not.toHaveBeenCalled();
    expect(registry.isRegistered()).toBe(false);
  });

  it("已有一级名称保持跳过语义，注销时保留原路由", () => {
    const router = createTestRouter();
    router.addRoute(ROOT_LAYOUT_ROUTE_NAME, {
      path: "existing",
      name: "Existing",
      component: page,
    });
    const original = router.resolve({ name: "Existing" }).matched.at(-1);
    const registry = new RouteRegistry(router);

    registry.register([menuRoute("Existing", "/different"), menuRoute("Users")]);
    expect(router.resolve({ name: "Existing" }).matched.at(-1)).toBe(original);
    registry.unregister();
    expect(router.hasRoute("Existing")).toBe(true);
    expect(router.hasRoute("Users")).toBe(false);
  });

  it("子路由名称不能替换静态壳路由", () => {
    const router = createTestRouter();
    const registry = new RouteRegistry(router);
    const originalRoutes = router.getRoutes();

    expect(() =>
      registry.register([
        menuRoute("Users"),
        { ...menuRoute("System"), children: [menuRoute("Home", "/system/child")] },
      ])
    ).toThrow("已有路由名称冲突");
    expect(router.getRoutes()).toEqual(originalRoutes);
    expect(registry.isRegistered()).toBe(false);
  });

  it("转换中途异常时恢复 iframe 缓存，不修改输入，重试可成功", () => {
    const router = createTestRouter();
    const registry = new RouteRegistry(router);
    const manager = IframeRouteManager.getInstance();
    const existingIframe = menuRoute("ExistingIframe");
    manager.add(existingIframe);
    const iframe = menuRoute("Iframe");
    iframe.meta.isIframe = true;
    const later = menuRoute("Later");
    const transform = RouteTransformer.prototype.transform;
    const failingTransform = vi
      .spyOn(RouteTransformer.prototype, "transform")
      .mockImplementation(function (this: RouteTransformer, route, ...args) {
        const transformed = transform.call(this, route, ...args);
        if (route.name === "Later") throw new Error("transform failed");
        return transformed;
      });
    const addRoute = vi.spyOn(router, "addRoute");

    expect(() => registry.register([iframe, later])).toThrow("transform failed");
    expect(manager.getAll()).toEqual([existingIframe]);
    expect(later.meta.isFirstLevel).toBeUndefined();
    expect(addRoute).not.toHaveBeenCalled();
    expect(registry.isRegistered()).toBe(false);
    failingTransform.mockRestore();

    registry.register([iframe, later]);
    expect(router.hasRoute("Later")).toBe(true);
    registry.unregister();
    expect(manager.getAll()).toEqual([existingIframe]);
  });

  it.each([false, true])(
    "addRoute 抛错时清除所有新增路由（抛错前已插入：%s）",
    (insertBeforeThrow) => {
      const router = createTestRouter();
      const registry = new RouteRegistry(router);
      const originalRoutes = router.getRoutes();
      const first = menuRoute("Users");
      first.meta.isIframe = true;
      const originalAddRoute = router.addRoute;
      const failingAddRoute = vi
        .spyOn(router, "addRoute")
        .mockImplementation((parent: string | RouteRecordRaw, route?: RouteRecordRaw) => {
          if (typeof parent !== "string") return originalAddRoute(parent);
          if (route?.name === "Later") {
            if (insertBeforeThrow) originalAddRoute(parent, route);
            throw new Error("addRoute failed");
          }
          return originalAddRoute(parent, route!);
        });

      expect(() => registry.register([first, menuRoute("Later")])).toThrow("addRoute failed");
      expect(router.getRoutes()).toEqual(originalRoutes);
      expect(IframeRouteManager.getInstance().getAll()).toEqual([]);
      expect(registry.isRegistered()).toBe(false);
      failingAddRoute.mockRestore();

      registry.register([first, menuRoute("Later")]);
      expect(router.hasRoute("Users")).toBe(true);
      expect(router.hasRoute("Later")).toBe(true);
      registry.unregister();
      expect(IframeRouteManager.getInstance().getAll()).toEqual([]);
    }
  );

  it("真实 Vue Router 子路径解析失败时也清除已插入的父路由", () => {
    const router = createTestRouter();
    const registry = new RouteRegistry(router);
    const originalRoutes = router.getRoutes();
    const badChild = menuRoute("BadChild", "/system/:broken(");

    expect(() =>
      registry.register([
        menuRoute("Users"),
        { ...menuRoute("System"), children: [menuRoute("GoodChild", "/system/good"), badChild] },
      ])
    ).toThrow();
    expect(router.getRoutes()).toEqual(originalRoutes);
    expect(registry.isRegistered()).toBe(false);
  });

  it("生成匿名一级名称，重复注册幂等，注销与重新进入不残留", async () => {
    const router = createTestRouter();
    const registry = new RouteRegistry(router);
    const unnamed = menuRoute("Unnamed", "/tools");
    unnamed.name = undefined;
    registry.register([unnamed]);
    const addRoute = vi.spyOn(router, "addRoute");
    registry.register([menuRoute("Ignored")]);
    expect(addRoute).not.toHaveBeenCalled();
    expect(router.hasRoute("Dyn_0_tools")).toBe(true);

    registry.unregister();
    registry.unregister();
    expect(registry.isRegistered()).toBe(false);
    expect(router.hasRoute("Dyn_0_tools")).toBe(false);
    registry.register([menuRoute("Users")]);
    await router.push("/users");
    expect(router.currentRoute.value.name).toBe("Users");
    expect(router.currentRoute.value.matched[0]?.name).toBe(ROOT_LAYOUT_ROUTE_NAME);
    expect(router.hasRoute("Ignored")).toBe(false);
  });

  it("注册与注销统一维护 iframe 缓存，再次注册不恢复旧菜单", () => {
    const router = createTestRouter();
    const registry = new RouteRegistry(router);
    const iframe = menuRoute("OldIframe");
    iframe.meta.isIframe = true;
    registry.register([iframe]);
    expect(JSON.parse(sessionStorage.getItem("iframeRoutes")!)[0].name).toBe("OldIframe");
    registry.unregister();
    registry.unregister();
    expect(sessionStorage.getItem("iframeRoutes")).toBeNull();
    expect(IframeRouteManager.getInstance().getAll()).toEqual([]);
    expect(router.hasRoute("OldIframe")).toBe(false);
    expect(router.hasRoute("Home")).toBe(true);
    registry.register([menuRoute("NewUser")]);
    expect(router.hasRoute("NewUser")).toBe(true);
    expect(sessionStorage.getItem("iframeRoutes")).toBeNull();
  });

  it("iframe 缓存保存失败时回滚路由和内存缓存，允许重试", () => {
    const router = createTestRouter();
    const originalRoutes = router.getRoutes();
    const registry = new RouteRegistry(router);
    const iframe = menuRoute("Iframe");
    iframe.meta.isIframe = true;
    const save = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });
    expect(() => registry.register([iframe])).toThrow("storage unavailable");
    expect(router.getRoutes()).toEqual(originalRoutes);
    expect(registry.isRegistered()).toBe(false);
    expect(IframeRouteManager.getInstance().getAll()).toEqual([]);
    save.mockRestore();
    registry.register([iframe]);
    expect(router.hasRoute("Iframe")).toBe(true);
    expect(registry.isRegistered()).toBe(true);
  });

  it("空授权菜单仍可注册与清理，不影响静态路由", () => {
    const router = createTestRouter();
    const registry = new RouteRegistry(router);
    const originalRoutes = router.getRoutes();
    registry.register([]);
    expect(registry.isRegistered()).toBe(true);
    registry.unregister();
    expect(router.getRoutes()).toEqual(originalRoutes);
    expect(registry.isRegistered()).toBe(false);
  });
});
