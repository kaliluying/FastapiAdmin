import type { AppRouteRecord } from "@/types/router";
import type { UserInfo } from "@/api/module_system/user";
import { useUserStore } from "@stores";
import { useAppMode } from "@/hooks/core/useAppMode";

import {
  mergeAppRouteRecords,
  ROUTE_COMPONENT_LAYOUT,
} from "./staticRoutes";
import { filterCustomDisabledRoutes } from "./customRouteFilter";
import { isSuperAdministrator } from "./superAdmin";
import { backendMenusToAppRoutes } from "./menuRoutes";

/**
 * 菜单 → `AppRouteRecord`：后端 `MenuTable`、前端内置路由、混合模式合并；供守卫注册动态路由。
 * `getMenuList` 依 `useAppMode` 分支；meta 对齐后端 keep_alive、目录占位组件。
 */

/** 前端模式并入菜单的内置路由；后端菜单陈旧时也作为隐藏路由兜底。 */
export const builtinFrontendRoutes: AppRouteRecord[] = [
  {
    path: "/module_ai",
    name: "ModuleAiFallback",
    component: ROUTE_COMPONENT_LAYOUT,
    meta: { title: "AI能力", hidden: true, isHide: true },
    children: [
      {
        path: "/module_ai/document",
        name: "ModuleAiDocumentFallback",
        component: "/module_ai/document/index",
        meta: { title: "文档管理", hidden: true, isHide: true },
      },
      {
        path: "/module_ai/retrieval",
        name: "ModuleAiRetrievalFallback",
        component: "/module_ai/retrieval/index",
        meta: { title: "检索测试", hidden: true, isHide: true },
      },
    ],
  },
];

function routeKey(route: AppRouteRecord): string {
  return route.path?.trim() || (route.name ? String(route.name) : "");
}

export function mergeMissingBuiltinRoutes(
  menuRoutes: AppRouteRecord[],
  fallbackRoutes: AppRouteRecord[]
): AppRouteRecord[] {
  const merged = menuRoutes.map((route) => ({ ...route }));

  for (const fallback of fallbackRoutes) {
    const key = routeKey(fallback);
    const existing = merged.find((route) => routeKey(route) === key);

    if (!existing) {
      merged.push({ ...fallback });
      continue;
    }

    if (fallback.children?.length) {
      existing.children = mergeMissingBuiltinRoutes(existing.children ?? [], fallback.children);
    }
  }

  return merged;
}

function joinAbsolutePath(parentAbs: string, segmentPath: string): string {
  const seg = segmentPath.replace(/^\/+/, "");
  const base = parentAbs.replace(/\/$/, "");
  if (!seg) return base;
  return `${base}/${seg}`;
}

export class MenuProcessor {
  async getMenuList(): Promise<AppRouteRecord[]> {
    const { isFrontendMode, isMixedMenuMode } = useAppMode();
    const userStore = useUserStore();
    const isSuperAdmin = isSuperAdministrator(userStore.info);

    let menuList: AppRouteRecord[];
    if (isMixedMenuMode.value) {
      menuList = await this.processMixedMenu();
    } else if (isFrontendMode.value) {
      menuList = await this.processFrontendMenu();
    } else {
      menuList = await this.processBackendMenu();
    }

    return this.normalizeMenuPaths(
      filterCustomDisabledRoutes(menuList, {
        includeDisabledRoutes: isSuperAdmin,
      })
    );
  }

  private async processFrontendMenu(): Promise<AppRouteRecord[]> {
    const userStore = useUserStore();
    let menuList = [...builtinFrontendRoutes];

    if (isSuperAdministrator(userStore.info)) {
      return this.filterEmptyMenus(menuList);
    }

    const roles = userStore.info?.roles;

    if (roles && roles.length > 0) {
      const roleCodes = this.extractRoleCodesFromUserRoles(roles);
      if (roleCodes.length > 0) {
        menuList = this.filterMenuByRoles(menuList, roleCodes);
      }
    }

    return this.filterEmptyMenus(menuList);
  }

  private extractRoleCodesFromUserRoles(roles: NonNullable<UserInfo["roles"]>): string[] {
    const codes = new Set<string>();
    for (const role of roles) {
      const r = role as { code?: string; name?: string };
      const c = r.code?.trim();
      if (c) codes.add(c);
      const n = r.name?.trim();
      if (n && /^R_[A-Z0-9_]+$/i.test(n)) codes.add(n);
    }
    return Array.from(codes);
  }

  private async processMixedMenu(): Promise<AppRouteRecord[]> {
    let backend: AppRouteRecord[] = [];
    try {
      backend = await this.processBackendMenu();
    } catch (e) {
      console.warn("[MenuProcessor] mixed：后端菜单获取失败，本次仅挂载前端路由", e);
    }
    const frontend = await this.processFrontendMenu();
    const merged = mergeAppRouteRecords(backend, frontend);
    return this.filterEmptyMenus(merged);
  }

  /** 优先用用户信息里附带的 `menus`，与守卫拉用户信息顺序一致，避免重复打菜单树接口 */
  private async processBackendMenu(): Promise<AppRouteRecord[]> {
    const userStore = useUserStore();
    const fromUser = userStore.routeList;
    if (Array.isArray(fromUser) && fromUser.length > 0) {
      const routes = backendMenusToAppRoutes(fromUser);
      return this.filterEmptyMenus(mergeMissingBuiltinRoutes(routes, builtinFrontendRoutes));
    }
    return [];
  }

  private filterMenuByRoles(menu: AppRouteRecord[], roleCodes: string[]): AppRouteRecord[] {
    return menu.reduce((acc: AppRouteRecord[], item) => {
      const itemRoles = item.meta?.roles;
      const hasPermission = !itemRoles || itemRoles.some((role) => roleCodes?.includes(role));

      if (hasPermission) {
        const filteredItem = { ...item };
        if (filteredItem.children?.length) {
          filteredItem.children = this.filterMenuByRoles(filteredItem.children, roleCodes);
        }
        acc.push(filteredItem);
      }

      return acc;
    }, []);
  }

  private filterEmptyMenus(menuList: AppRouteRecord[]): AppRouteRecord[] {
    return menuList
      .map((item) => {
        if (item.children && item.children.length > 0) {
          const filteredChildren = this.filterEmptyMenus(item.children);
          return {
            ...item,
            children: filteredChildren,
          };
        }
        return item;
      })
      .filter((item) => {
        if ("children" in item) {
          return true;
        }

        if (item.meta?.isIframe === true || item.meta?.link) {
          return true;
        }

        if (item.component && item.component !== "" && item.component !== ROUTE_COMPONENT_LAYOUT) {
          return true;
        }

        return false;
      });
  }

  validateMenuList(menuList: AppRouteRecord[]): boolean {
    return Array.isArray(menuList) && menuList.length > 0;
  }

  private normalizeMenuPaths(menuList: AppRouteRecord[], parentPath = ""): AppRouteRecord[] {
    return menuList.map((item) => {
      const fullPath = this.buildFullPath(item.path || "", parentPath);

      const children = item.children?.length
        ? this.normalizeMenuPaths(item.children, fullPath)
        : item.children;

      const redirect = item.redirect || this.resolveDefaultRedirect(children);

      return {
        ...item,
        path: fullPath,
        redirect,
        children,
      };
    });
  }

  private resolveDefaultRedirect(children?: AppRouteRecord[]): string | undefined {
    if (!children?.length) {
      return undefined;
    }

    for (const child of children) {
      if (this.isNavigableRoute(child)) {
        return child.path;
      }

      const nestedRedirect = this.resolveDefaultRedirect(child.children);
      if (nestedRedirect) {
        return nestedRedirect;
      }
    }

    return undefined;
  }

  private isNavigableRoute(route: AppRouteRecord): boolean {
    return Boolean(
      route.path &&
      route.path !== "/" &&
      !route.meta?.link &&
      route.meta?.isIframe !== true &&
      route.component &&
      route.component !== ""
    );
  }

  private buildFullPath(path: string, parentPath: string): string {
    if (!path) return "";

    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    if (path.startsWith("/")) {
      return path;
    }

    if (parentPath) {
      const cleanParent = parentPath.replace(/\/$/, "");
      const cleanChild = path.replace(/^\//, "");
      return `${cleanParent}/${cleanChild}`;
    }

    return `/${path}`;
  }
}
