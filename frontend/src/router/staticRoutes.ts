/**
 * 静态路由定义 + IframeRouteManager。
 *
 * 静态路由 = 首屏即注册的路由（Layout、登录页、404/500、iframe 占位等），
 * 不依赖菜单权限，用户未登录时即可访问。
 *
 * 动态路由由 `beforeEach.ts` → `RouteRegistry` 在登录后根据不同角色的菜单列表动态 `addRoute`。
 */
import type { AppRouteRecordRaw } from "@utils";
import type { AppRouteRecord } from "@/types/router";
import { defineComponent, h, onMounted, ref } from "vue";
import { RouterView, useRoute } from "vue-router";

/** 首页 meta（侧栏、静态子路由共用） */
export const HOME_MENU_META = {
  title: "menus.home",
  icon: "ri:home-4-line",
  keepAlive: true,
  fixedTab: true,
};

/** iframe 路由注册表（与动态路由、守卫共用） */
export class IframeRouteManager {
  private static instance: IframeRouteManager;
  private iframeRoutes: AppRouteRecord[] = [];

  private constructor() {}

  static getInstance(): IframeRouteManager {
    if (!IframeRouteManager.instance) {
      IframeRouteManager.instance = new IframeRouteManager();
    }
    return IframeRouteManager.instance;
  }

  add(route: AppRouteRecord): void {
    if (!this.iframeRoutes.find((r) => r.path === route.path)) {
      this.iframeRoutes.push(route);
    }
  }

  getAll(): AppRouteRecord[] {
    return this.iframeRoutes;
  }

  findByPath(path: string): AppRouteRecord | undefined {
    return this.iframeRoutes.find((route) => route.path === path);
  }

  clear(): void {
    this.iframeRoutes = [];
  }

  save(): void {
    if (this.iframeRoutes.length > 0) {
      sessionStorage.setItem("iframeRoutes", JSON.stringify(this.iframeRoutes));
    }
  }

  load(): void {
    try {
      const data = sessionStorage.getItem("iframeRoutes");
      if (data) {
        this.iframeRoutes = JSON.parse(data);
      }
    } catch (error) {
      console.error("[IframeRouteManager] 加载 iframe 路由失败:", error);
      this.iframeRoutes = [];
    }
  }
}

/** 根 Layout 的 route.name；动态路由 `addRoute` 父级须与此一致 */
export const ROOT_LAYOUT_ROUTE_NAME = "RootLayout" as const;

/** 静态首页子路由 name（面包屑等） */
export const HOME_ROUTE_NAME = "Home" as const;

/** 目录占位：仅嵌一层 RouterView（与 ComponentLoader 中占位同源） */
export const NestedRouterParent = defineComponent({
  name: "NestedRouterParent",
  setup() {
    return () => h(RouterView);
  },
});

/** 后端菜单 / 动态路由里 `component` 占位（与 ComponentLoader 约定一致） */
export const ROUTE_COMPONENT_LAYOUT = "/index/index";

/** 多级目录父级占位（`views/nested/router-view-parent`） */
export const ROUTE_COMPONENT_NESTED_PARENT = "/nested/router-view-parent";

/** 登录页备用 path（与静态 `/login` 并存，守卫与白名单用） */
export const ROUTE_PATH_LOGIN_ALT = "/auth/login";

/**
 * 主框架布局：新版 art 体系（`src/components/layouts/index.vue` + `src/components/layouts/fa-*` 组件）。
 * 旧版 Left/Top/Mix 壳子已移除，统一使用 `@/components/layouts/index.vue`。
 */
export const Layout = () => import("@/components/layouts/index.vue");

/** iframe 内跳页面：内联组件（无需 views/outside/Iframe.vue） */
const IframeView = defineComponent({
  name: "IframeView",
  setup() {
    const route = useRoute();
    const isLoading = ref(true);
    const iframeUrl = ref("");
    const iframeRef = ref<HTMLIFrameElement | null>(null);

    onMounted(() => {
      const iframeRoute = IframeRouteManager.getInstance().findByPath(route.path);
      if (iframeRoute?.meta) {
        iframeUrl.value = iframeRoute.meta.link || "";
      }
    });

    const handleIframeLoad = () => {
      isLoading.value = false;
    };

    return () =>
      h("div", { class: "box-border w-full h-full", "v-loading": isLoading.value }, [
        h("iframe", {
          ref: iframeRef,
          src: iframeUrl.value,
          frameborder: "0",
          class: "w-full h-full min-h-[calc(100vh-120px)] border-none",
          onLoad: handleIframeLoad,
        }),
      ]);
  },
});

export function mergeAppRouteRecords(
  primary: AppRouteRecord[],
  secondary: AppRouteRecord[]
): AppRouteRecord[] {
  const usedNames = new Set<string>();

  const collectNames = (routes: AppRouteRecord[]) => {
    for (const r of routes) {
      if (r.name) usedNames.add(String(r.name));
      if (r.children?.length) collectNames(r.children);
    }
  };
  collectNames(primary);

  const pickFresh = (routes: AppRouteRecord[]): AppRouteRecord[] => {
    const out: AppRouteRecord[] = [];
    for (const r of routes) {
      const n = r.name ? String(r.name) : "";
      if (n && usedNames.has(n)) continue;
      const next: AppRouteRecord = { ...r };
      if (r.children?.length) {
        next.children = pickFresh(r.children);
      }
      if (n) usedNames.add(n);
      out.push(next);
    }
    return out;
  };

  return [...primary, ...pickFresh(secondary)];
}

export const mergeShellHomeMenu: AppRouteRecord = {
  path: "/home",
  name: HOME_ROUTE_NAME,
  meta: { ...HOME_MENU_META, shellRoute: true },
};

function normalizeMenuPath(path?: string): string {
  if (!path || !path.trim()) return "";
  const p = path.trim();
  return p.startsWith("/") ? p : `/${p}`;
}

function collectPathsAndNames(items: AppRouteRecord[], paths: Set<string>, names: Set<string>) {
  for (const r of items) {
    const np = normalizeMenuPath(r.path as string);
    if (np) paths.add(np);
    if (r.name) names.add(String(r.name));
    if (r.children?.length) collectPathsAndNames(r.children, paths, names);
  }
}

export function mergeShellRoutesIntoMenu(menuList: AppRouteRecord[]): AppRouteRecord[] {
  const paths = new Set<string>();
  const names = new Set<string>();
  collectPathsAndNames(menuList, paths, names);

  const homePath = normalizeMenuPath(mergeShellHomeMenu.path as string);
  const homeName = String(mergeShellHomeMenu.name);
  if (paths.has(homePath) || names.has(homeName)) {
    return menuList;
  }

  return [mergeShellHomeMenu, ...menuList];
}

/**
 * 静态路由配置（不需要权限就能访问的路由）
 *
 * 属性说明：
 * isHideTab: true 表示不在标签页中显示
 *
 * 注意事项：
 * 1、path、name 不要和动态路由冲突，否则会导致路由冲突无法访问
 * 2、静态路由不管是否登录都可以访问
 */
export const staticRoutes: AppRouteRecordRaw[] = [
  {
    path: "/redirect",
    meta: { hidden: true },
    component: Layout,
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@views/redirect/index.vue"),
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    meta: { hidden: true, isHideTab: true, title: "menus.login.title" },
    component: () => import("@views/module_system/auth/login/index.vue"),
  },
  /** 无 Layout 全屏异常页；守卫与白名单跳转使用（勿再在 RootLayout 下重复挂载同组件） */
  {
    path: "/401",
    name: "401",
    meta: { hidden: true, title: "401" },
    component: () => import("@views/exception/401/index.vue"),
  },
  {
    path: "/403",
    name: "403",
    component: () => import("@views/exception/403/index.vue"),
    meta: { hidden: true, title: "403" },
  },
  {
    path: "/404",
    name: "404",
    meta: { hidden: true, title: "404" },
    component: () => import("@views/exception/404/index.vue"),
  },
  {
    path: "/500",
    name: "500",
    meta: { hidden: true, title: "500" },
    component: () => import("@views/exception/500/index.vue"),
  },
  {
    path: "/",
    name: ROOT_LAYOUT_ROUTE_NAME,
    redirect: "/home",
    component: Layout,
    children: [
      {
        path: "home",
        name: HOME_ROUTE_NAME,
        component: () => import("@views/home/index.vue"),
        meta: HOME_MENU_META,
      },
    ],
  },
  {
    path: "/outside",
    component: () => import("@/components/layouts/index.vue"),
    name: "Outside",
    meta: { title: "menus.outside.title" },
    children: [
      {
        path: "/outside/iframe/:path",
        name: "Iframe",
        component: IframeView,
        meta: { title: "iframe" },
      },
    ],
  },
  // 通配 404 必须置于静态路由最后（name 勿与上方 `/404` 重复，否则按名跳转不稳定）
  {
    path: "/:pathMatch(.*)*",
    name: "CatchAll404",
    component: () => import("@views/exception/404/index.vue"),
    meta: { hidden: true, title: "404" },
  },
];
