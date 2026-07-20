import type { AppRouteRecord } from "@/types/router";
import { useUserStore } from "@stores";

import { backendMenusToAppRoutes } from "./menuRoutes";
import { ROUTE_COMPONENT_LAYOUT } from "./staticRoutes";

/**
 * 菜单 → `AppRouteRecord`：仅将后端授权菜单转换为动态路由。
 */

function joinAbsolutePath(parentAbs: string, segmentPath: string): string {
  const seg = segmentPath.replace(/^\/+/, "");
  const base = parentAbs.replace(/\/$/, "");
  if (!seg) return base;
  return `${base}/${seg}`;
}

export class MenuProcessor {
  async getMenuList(): Promise<AppRouteRecord[]> {
    return this.normalizeMenuPaths(await this.processBackendMenu());
  }

  /** 优先用用户信息里附带的 `menus`，与守卫拉用户信息顺序一致，避免重复打菜单树接口 */
  private async processBackendMenu(): Promise<AppRouteRecord[]> {
    const userStore = useUserStore();
    const fromUser = userStore.routeList;
    if (Array.isArray(fromUser) && fromUser.length > 0) {
      const routes = backendMenusToAppRoutes(fromUser);
      return this.filterEmptyMenus(routes);
    }
    return [];
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
