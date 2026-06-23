import type { AppRouteRecord } from "@/types/router";

export const CUSTOM_DISABLED_ROUTE_PREFIXES = [
  "/dashboard/analysis",
  "/dashboard/screen",
  "/module_monitor",
  "/module_example",
  "/module_ai",
  "/module_application/ai",
] as const;

const DISABLED_ROUTE_PREFIXES = new Set(
  CUSTOM_DISABLED_ROUTE_PREFIXES.map((path) => normalizeRoutePath(path))
);

export function filterCustomDisabledRoutes(routes: AppRouteRecord[]): AppRouteRecord[] {
  return filterRoutes(routes);
}

function filterRoutes(routes: AppRouteRecord[], parentPath = ""): AppRouteRecord[] {
  return routes.reduce<AppRouteRecord[]>((acc, route) => {
    const normalizedPath = resolveRoutePath(route.path, parentPath);

    if (isDisabledRoute(normalizedPath)) {
      return acc;
    }

    const nextRoute: AppRouteRecord = { ...route };
    if (route.children) {
      nextRoute.children = filterRoutes(route.children, normalizedPath);
    }

    acc.push(nextRoute);
    return acc;
  }, []);
}

function isDisabledRoute(path: string): boolean {
  for (const prefix of DISABLED_ROUTE_PREFIXES) {
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      return true;
    }
  }
  return false;
}

function resolveRoutePath(path: AppRouteRecord["path"], parentPath: string): string {
  const rawPath = String(path ?? "").trim();
  const routePath = normalizeRoutePath(rawPath);
  if (!routePath) {
    return parentPath;
  }
  if (!parentPath || rawPath.startsWith("/")) {
    return routePath;
  }
  return normalizeRoutePath(`${parentPath}/${routePath.replace(/^\/+/, "")}`);
}

function normalizeRoutePath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) {
    return "";
  }
  return `/${trimmed.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}
