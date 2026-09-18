import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import { backendMenusToAppRoutes } from "./menuRoutes";
import { RouteTransformer } from "./core/RouteTransformer";
import { RouteValidator } from "./core/RouteValidator";

type AnyRoute = {
  path?: string;
  component?: unknown;
  children?: AnyRoute[];
  meta?: { link?: string; isIframe?: boolean };
};

function findMenuFixture(): string | undefined {
  return [
    path.resolve(process.cwd(), "../backend/app/scripts/data/platform_menu.json"),
    path.resolve(process.cwd(), "backend/app/scripts/data/platform_menu.json"),
  ].find((candidate) => existsSync(candidate));
}

function flatten(routes: AnyRoute[]): AnyRoute[] {
  return routes.flatMap((route) => [route, ...flatten(route.children ?? [])]);
}

describe("动态菜单路由不变量", () => {
  it("目录不挂中间层组件，叶子页面保持可渲染", () => {
    const fixture = findMenuFixture();
    expect(fixture).toBeTruthy();

    const menus = JSON.parse(readFileSync(fixture!, "utf-8"));
    const routes = backendMenusToAppRoutes(menus) as AnyRoute[];
    expect(new RouteValidator().validate(routes as any).valid).toBe(true);

    for (const route of flatten(routes)) {
      if (route.children?.length) {
        expect(route.component, `目录 ${route.path} 不应挂中间层组件`).toBeUndefined();
        continue;
      }

      const external = Boolean(route.meta?.link || route.meta?.isIframe);
      if (!external) {
        expect(route.component, `叶子 ${route.path} 缺少 component`).toBeTruthy();
      }
    }
  });

  it("转换后目录保持无组件，子页面使用相对路径挂到 RootLayout", () => {
    const loader = {
      load: (componentPath: string) => `component:${componentPath}`,
      loadIframe: () => "iframe-component",
    } as any;
    const routes = backendMenusToAppRoutes([
      {
        id: 1,
        name: "系统管理",
        type: 1,
        route_name: "System",
        route_path: "/system",
        title: "系统管理",
        children: [
          {
            id: 2,
            name: "用户管理",
            type: 2,
            route_name: "User",
            route_path: "user",
            component_path: "module_system/user/index",
            title: "用户管理",
          },
        ],
      },
    ] as any);

    const transformed = new RouteTransformer(loader, { shellChild: true }).transform(routes[0]!);
    expect(transformed.component).toBeUndefined();
    expect(transformed.children?.[0]?.path).toBe("user");
    expect(transformed.children?.[0]?.component).toBe("component:/module_system/user/index");
  });

  it("Vue Router 能跳过无组件目录并命中叶子页面", async () => {
    const page = { render: () => null };
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: "/",
          component: page,
          children: [
            {
              path: "system",
              children: [{ path: "user", component: page }],
            },
          ],
        },
      ],
    });

    await router.push("/system/user");
    expect(router.currentRoute.value.matched).toHaveLength(3);
    expect(router.currentRoute.value.matched[1]?.components).toBeUndefined();
    expect(router.currentRoute.value.matched.at(-1)?.components?.default).toBe(page);
  });
});
