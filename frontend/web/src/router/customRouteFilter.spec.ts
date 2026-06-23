import { describe, expect, it } from "vitest";
import type { AppRouteRecord } from "@/types/router";

import { filterCustomDisabledRoutes } from "./customRouteFilter";

describe("filterCustomDisabledRoutes", () => {
  it("recursively removes customized disabled routes without mutating the input", () => {
    const routes: AppRouteRecord[] = [
      {
        path: "/home",
        name: "Home",
        meta: { title: "Home" },
      },
      {
        path: "/dashboard",
        name: "Dashboard",
        meta: { title: "Dashboard" },
        children: [
          {
            path: "workplace",
            name: "DashboardWorkplace",
            meta: { title: "Workplace" },
          },
          {
            path: "analysis",
            name: "DashboardAnalysis",
            meta: { title: "Analysis" },
          },
        ],
      },
      {
        path: "module_monitor",
        name: "ModuleMonitor",
        meta: { title: "Monitor" },
      },
    ];

    const filtered = filterCustomDisabledRoutes(routes);
    const dashboard = filtered.find((route) => route.path === "/dashboard");
    const originalDashboard = routes.find((route) => route.path === "/dashboard");

    expect(filtered.map((route) => route.path)).toEqual(["/home", "/dashboard"]);
    expect(dashboard?.children?.map((route) => route.path)).toEqual(["workplace"]);
    expect(originalDashboard?.children?.map((route) => route.path)).toEqual([
      "workplace",
      "analysis",
    ]);
  });
});
