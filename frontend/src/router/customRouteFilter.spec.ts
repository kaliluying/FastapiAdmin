import { describe, expect, it } from "vitest";
import type { AppRouteRecord } from "@/types/router";

import { CUSTOM_DISABLED_ROUTE_PREFIXES, filterCustomDisabledRoutes } from "./customRouteFilter";

describe("filterCustomDisabledRoutes", () => {
  it("recursively removes customized disabled routes without mutating the input", () => {
    const routes: AppRouteRecord[] = [
      {
        path: "/system",
        name: "System",
        meta: { title: "System" },
      },
      {
        path: "/system/role",
        name: "Role",
        meta: { title: "Role" },
        children: [
          {
            path: "permission",
            name: "RolePermission",
            meta: { title: "Permission" },
          },
          {
            path: "audit",
            name: "RoleAudit",
            meta: { title: "Audit" },
          },
          {
            path: "settings/report",
            name: "RoleSettingsReport",
            meta: { title: "Settings Report" },
          },
        ],
      },
      {
        path: "/ai",
        name: "Ai",
        meta: { title: "AI" },
      },
    ];

    const originalRoutesSnapshot = structuredClone(routes);
    const filtered = filterCustomDisabledRoutes(routes);
    const role = filtered.find((route) => route.path === "/system/role");

    expect(filtered.map((route) => route.path)).toEqual(["/system", "/system/role"]);
    expect(role?.children?.map((route) => route.path)).toEqual([
      "permission",
      "audit",
      "settings/report",
    ]);
    expect(routes).toEqual(originalRoutesSnapshot);
  });

  it("can preserve customized disabled routes for super administrators", () => {
    const routes: AppRouteRecord[] = [
      {
        path: "/ai",
        name: "Ai",
        meta: { title: "AI" },
      },
    ];

    const filtered = filterCustomDisabledRoutes(routes, { includeDisabledRoutes: true });

    expect(filtered.map((route) => route.path)).toEqual(["/ai"]);
  });

  it("does not retain removed module prefixes", () => {
    expect(CUSTOM_DISABLED_ROUTE_PREFIXES).not.toContain("/monitor");
    expect(CUSTOM_DISABLED_ROUTE_PREFIXES).not.toContain("/module_monitor");
    expect(CUSTOM_DISABLED_ROUTE_PREFIXES).not.toContain("/example");
    expect(CUSTOM_DISABLED_ROUTE_PREFIXES).not.toContain("/module_example");
  });
});
