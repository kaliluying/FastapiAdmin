/**
 * 路由注册表 —— 校验通过后批量 addRoute，支持注册/注销/重入判断。
 */
import type { RouteRecordRaw, Router } from "vue-router";
import type { AppRouteRecord } from "@/types/router";
import { ComponentLoader } from "./ComponentLoader";
import { RouteValidator } from "./RouteValidator";
import { RouteTransformer } from "./RouteTransformer";
import { IframeRouteManager, ROOT_LAYOUT_ROUTE_NAME } from "../staticRoutes";

/** 与静态壳层冲突的一级 path 段。菜单服务端禁止写入，前端保留兜底。 */
const RESERVED_SHELL_SEGMENTS = new Set([
  "auth",
  "changelog",
  "home",
  "login",
  "outside",
  "profile",
  "redirect",
  "401",
  "403",
  "404",
  "500",
]);

function pathFirstSegment(path: string): string {
  return (
    path
      .trim()
      .replace(/^\/+|\/+$/g, "")
      .split("/")
      .filter(Boolean)[0] ?? ""
  );
}

function registrationName(route: AppRouteRecord, index: number): AppRouteRecord {
  const explicit = typeof route.name === "string" ? route.name.trim() : "";
  if (explicit) return route;
  const seg = pathFirstSegment(route.path || "") || "route";
  const safe = seg.replace(/[^\w]/g, "_");
  return { ...route, name: `Dyn_${index}_${safe}` };
}

function routeNameKey(route: AppRouteRecord): string {
  return typeof route.name === "string" ? route.name : String(route.name ?? "");
}

export class RouteRegistry {
  private router: Router;
  private componentLoader: ComponentLoader;
  private validator: RouteValidator;
  private transformer: RouteTransformer;
  private removeRouteFns: (() => void)[] = [];
  private registered = false;

  constructor(router: Router) {
    this.router = router;
    this.componentLoader = new ComponentLoader();
    this.validator = new RouteValidator();
    this.transformer = new RouteTransformer(this.componentLoader, { shellChild: true });
  }

  register(menuList: AppRouteRecord[]): void {
    if (this.registered) {
      console.warn("[RouteRegistry] 路由已注册，跳过重复注册");
      return;
    }

    const validationResult = this.validator.validate(menuList);
    if (!validationResult.valid) {
      throw new Error(`路由配置验证失败: ${validationResult.errors.join(", ")}`);
    }
    validationResult.warnings.forEach((warning) => {
      console.warn(`[路由配置警告] ${warning}`);
    });

    const namedRoutes = menuList.map((route, index) => {
      const seg = pathFirstSegment(route.path || "");
      if (seg && RESERVED_SHELL_SEGMENTS.has(seg)) {
        throw new Error(`动态菜单路由与系统保留路径冲突: ${route.path}`);
      }
      return registrationName(route, index);
    });
    const names = new Set<string>();
    const prepareRoute = (route: AppRouteRecord): AppRouteRecord => {
      const name = routeNameKey(route);
      if (name) {
        if (names.has(name)) {
          throw new Error(`动态菜单路由名称重复: ${name}`);
        }
        if (this.router.hasRoute(name)) {
          throw new Error(`动态菜单子路由与已有路由名称冲突: ${name}`);
        }
        names.add(name);
      }
      return {
        ...route,
        meta: { ...route.meta },
        children: route.children?.map(prepareRoute),
      };
    };
    const routes = namedRoutes
      .filter((route) => !this.router.hasRoute(routeNameKey(route)))
      .map(prepareRoute);
    const iframeRoutes = IframeRouteManager.getInstance().getAll();
    const previousIframeRoutes = [...iframeRoutes];
    const removeRouteFns: (() => void)[] = [];

    try {
      const routeConfigs = routes.map((route) => this.transformer.transform(route));
      for (const routeConfig of routeConfigs) {
        removeRouteFns.push(
          this.router.addRoute(ROOT_LAYOUT_ROUTE_NAME, routeConfig as RouteRecordRaw)
        );
      }
      IframeRouteManager.getInstance().save();
    } catch (error) {
      removeRouteFns.reverse().forEach((remove) => remove());
      for (const route of routes) {
        const name = routeNameKey(route);
        if (this.router.hasRoute(name)) this.router.removeRoute(name);
      }
      iframeRoutes.splice(0, iframeRoutes.length, ...previousIframeRoutes);
      throw error;
    }
    const addedIframeRoutes = iframeRoutes.filter((route) => !previousIframeRoutes.includes(route));
    if (addedIframeRoutes.length) {
      removeRouteFns.push(() => {
        const currentIframeRoutes = IframeRouteManager.getInstance().getAll();
        for (const route of addedIframeRoutes) {
          const index = currentIframeRoutes.indexOf(route);
          if (index !== -1) currentIframeRoutes.splice(index, 1);
        }
      });
    }

    this.removeRouteFns = removeRouteFns;
    this.registered = true;
  }

  unregister(): void {
    this.removeRouteFns.forEach((fn) => fn());
    this.removeRouteFns = [];
    this.registered = false;
    IframeRouteManager.getInstance().save();
  }

  isRegistered(): boolean {
    return this.registered;
  }
}
