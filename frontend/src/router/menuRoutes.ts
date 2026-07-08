import type { MenuTable } from "@/api/module_platform/menu";
import { MenuTypeEnum } from "@/enums/system/menu.enum";
import type { AppRouteRecord, RouteMeta } from "@/types/router";

export const ROUTE_COMPONENT_LAYOUT_REF = "/index/index";
export const ROUTE_COMPONENT_NESTED_PARENT_REF = "/nested/router-view-parent";

function joinAbsolutePath(parentAbs: string, segmentPath: string): string {
  const seg = segmentPath.replace(/^\/+/, "");
  const base = parentAbs.replace(/\/$/, "");
  if (!seg) return base;
  return `${base}/${seg}`;
}

function normalizeMenuNestedPaths(items: MenuTable[], parentAbsolutePath = ""): MenuTable[] {
  return items.map((node) => {
    const raw = (node.route_path ?? "").trim();
    const canonical = raw
      ? raw.startsWith("/")
        ? raw
        : parentAbsolutePath
          ? joinAbsolutePath(parentAbsolutePath, raw)
          : `/${raw}`
      : parentAbsolutePath;

    const children = node.children?.length
      ? normalizeMenuNestedPaths(node.children, canonical)
      : undefined;
    return { ...node, children };
  });
}

function normalizeAppRouteChildPaths(
  routes: AppRouteRecord[],
  parentAbsolutePath = ""
): AppRouteRecord[] {
  return routes.map((route) => {
    const path = (route.path ?? "").trim();

    if (/^https?:\/\//i.test(path)) {
      return {
        ...route,
        children: route.children?.length
          ? normalizeAppRouteChildPaths(route.children, parentAbsolutePath)
          : route.children,
      };
    }

    const currentAbs = parentAbsolutePath
      ? joinAbsolutePath(parentAbsolutePath, path)
      : path.startsWith("/")
        ? path
        : `/${path}`;

    const children = route.children?.length
      ? normalizeAppRouteChildPaths(route.children, currentAbs)
      : route.children;

    return { ...route, children };
  });
}

function toComponentImportPath(componentPath: string): string {
  const t = componentPath.trim().replace(/^\/+/, "");
  return t ? `/${t}` : "";
}

function mapMenuNode(item: MenuTable, depth = 0): AppRouteRecord {
  const childrenRaw = item.children?.filter((c) => c.type !== MenuTypeEnum.BUTTON) ?? [];
  const children = childrenRaw.length
    ? childrenRaw.map((c) => mapMenuNode(c, depth + 1))
    : undefined;

  const path = (item.route_path ?? "").trim();
  const name = item.route_name || undefined;
  const redirect = item.redirect?.trim() || undefined;

  const hasKids = !!(children && children.length > 0);
  const isDirectory = item.type === MenuTypeEnum.CATALOG;

  let component: string | undefined;
  if (isDirectory || (hasKids && !(item.component_path ?? "").trim())) {
    component = depth === 0 ? ROUTE_COMPONENT_LAYOUT_REF : ROUTE_COMPONENT_NESTED_PARENT_REF;
  } else if ((item.component_path ?? "").trim()) {
    component = toComponentImportPath(item.component_path!);
  }

  const meta: RouteMeta = {
    title: item.title ?? "",
    icon: item.icon || undefined,
    hidden: !!item.hidden,
    keepAlive: item.keep_alive ?? true,
    affix: !!item.affix,
    fixedTab: !!item.affix,
    alwaysShow: !!item.always_show,
    isHide: !!item.hidden,
    isHideTab: !!item.is_hide_tab,
    link: item.link || undefined,
    isIframe: !!item.is_iframe,
    activePath: item.active_path || undefined,
    showBadge: !!item.show_badge,
    showTextBadge: item.show_text_badge || undefined,
    client: item.client,
  };

  return {
    path,
    name,
    component,
    redirect,
    meta,
    children,
  };
}

export function backendMenusToAppRoutes(menus: MenuTable[]): AppRouteRecord[] {
  const roots = menus.filter((m) => m.type !== MenuTypeEnum.BUTTON);
  const normalized = normalizeMenuNestedPaths(roots);
  const mapped = normalized.map((m) => mapMenuNode(m, 0));
  return normalizeAppRouteChildPaths(mapped);
}
