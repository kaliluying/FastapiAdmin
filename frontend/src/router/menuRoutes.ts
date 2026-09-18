import type { MenuTable } from "@/api/module_platform/menu";
import { MenuTypeEnum } from "@/enums/system/menu.enum";
import type { AppRouteRecord, RouteMeta } from "@/types/router";

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

function mapMenuNode(item: MenuTable): AppRouteRecord {
  const childrenRaw = item.children?.filter((c) => c.type !== MenuTypeEnum.BUTTON) ?? [];
  const children = childrenRaw.length ? childrenRaw.map((c) => mapMenuNode(c)) : undefined;

  const path = (item.route_path ?? "").trim();
  const name = item.route_name || undefined;
  const redirect = item.redirect?.trim() || undefined;

  const hasKids = !!(children && children.length > 0);
  let component: string | undefined;
  // 目录只负责组织子路由，不挂中间层组件。这样 Layout 下的 RouterView
  // 可以直接跳到真正的叶子页面，避免目录壳被重复缓存并触发重复请求。
  if (!hasKids && (item.component_path ?? "").trim()) {
    component = toComponentImportPath(item.component_path!);
  }

  const meta: RouteMeta = {
    title: item.title ?? "",
    icon: item.icon || undefined,
    hidden: !!item.hidden,
    keepAlive: item.keep_alive ?? true,
    affix: !!item.affix,
    fixedTab: !!item.affix,
    isHide: !!item.hidden,
    isHideTab: !!item.is_hide_tab,
    link: item.link || undefined,
    isIframe: !!item.is_iframe,
    activePath: item.active_path || undefined,
    showBadge: !!item.show_badge,
    showTextBadge: item.show_text_badge || undefined,
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
  const mapped = normalized.map((m) => mapMenuNode(m));
  return normalizeAppRouteChildPaths(mapped);
}
