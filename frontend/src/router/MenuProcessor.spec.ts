import { describe, expect, it } from "vitest";

import { backendMenusToAppRoutes } from "./menuRoutes";
import { isSuperAdministrator } from "./superAdmin";

describe("isSuperAdministrator", () => {
  it("recognizes the explicit superuser flag", () => {
    expect(isSuperAdministrator({ is_superuser: true })).toBe(true);
  });

  it("falls back to the SUPER_ADMIN role code", () => {
    expect(
      isSuperAdministrator({
        is_superuser: undefined,
        roles: [{ id: 1, name: "超级管理员", code: "SUPER_ADMIN" }],
      })
    ).toBe(true);
  });
});

describe("backendMenusToAppRoutes", () => {
  it("keeps button permissions out of dynamic routes", () => {
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
    ] as any);

    expect(JSON.stringify(routes)).toContain("用户管理");
    expect(JSON.stringify(routes)).not.toContain("UserCreateButton");
    expect(JSON.stringify(routes)).not.toContain("module_system/user/create");
  });
});
