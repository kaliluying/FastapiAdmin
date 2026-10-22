import { describe, expect, it } from "vitest";

import { backendMenusToAppRoutes } from "./menuRoutes";

describe("backendMenusToAppRoutes", () => {
  it("keeps button permissions out of dynamic routes", () => {
    const menus = [
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
            permission: "module_system:user:query",
            route_name: "User",
            route_path: "user",
            component_path: "module_system/user/index",
            title: "用户管理",
            children: [
              {
                id: 3,
                name: "新增",
                type: 3,
                permission: "module_system:user:create",
                title: "新增",
                route_name: "UserCreateButton",
                route_path: "create",
                component_path: "module_system/user/create",
              },
            ],
          },
        ],
      },
    ] as any;
    const original = structuredClone(menus);
    const routes = backendMenusToAppRoutes(menus);

    expect(JSON.stringify(routes)).toContain("用户管理");
    expect(JSON.stringify(routes)).not.toContain("UserCreateButton");
    expect(JSON.stringify(routes)).not.toContain("module_system/user/create");
    expect(routes[0]?.path).toBe("/system");
    expect(routes[0]?.children?.[0]?.path).toBe("user");
    expect(routes[0]?.children?.[0]?.component).toBe("/module_system/user/index");
    expect(menus).toEqual(original);
    expect(routes[0]?.children).not.toBe(menus[0].children);
  });
});
