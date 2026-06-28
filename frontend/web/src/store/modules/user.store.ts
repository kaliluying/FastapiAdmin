/** User store. */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { LanguageEnum } from "@/enums/appEnum";
import { router } from "@/router";
import { useSettingsStore } from "./setting.store";
import { useWorktabStore } from "./worktab.store";
import { useMenuStore } from "./menu.store";
import { useConfigStore } from "./config.store";
import { AppRouteRecord } from "@/types/router";
import { Auth, setPageTitle, StorageConfig } from "@utils";
import AuthAPI from "@/api/module_system/auth";
import UserAPI from "@/api/module_system/user";
import type { MenuTable } from "@/api/module_platform/menu";
import { ResultEnum } from "@/enums/api/result.enum";
import { ElNotification } from "element-plus";
import { store, useDictStore } from "@stores";
import type { UserInfo } from "@/api/module_system/user";

/** Lazily import router guard helpers to avoid a store/guard circular dependency. */
let _routerUtilsPromise: Promise<typeof import("@/router/beforeEach")> | null = null;
const getRouterUtils = () => {
  if (!_routerUtilsPromise) _routerUtilsPromise = import("@/router/beforeEach");
  return _routerUtilsPromise;
};

/** Options for {@link useUserStore}'s `logout`. */
export interface LogoutOptions {
  /**
   * When false, only clears local auth state and leaves navigation to the caller.
   * @default true
   */
  navigate?: boolean;
}

/**
 * User state: auth tokens, profile, permissions, dynamic routes, and lock state.
 */
export const useUserStore = defineStore(
  "userStore",
  () => {
    // 语言设置。
    const language = ref(LanguageEnum.ZH);
    // 登录状态。
    const isLogin = ref(false);
    // 锁屏状态。
    const isLock = ref(false);
    // 锁屏密码。
    const lockPassword = ref("");
    // 用户信息。
    const info = ref<Partial<UserInfo>>({});
    // 搜索历史记录。
    const searchHistory = ref<AppRouteRecord[]>([]);
    // 访问令牌。
    const accessToken = ref("");
    // 刷新令牌。
    const refreshToken = ref("");
    // 路由列表。
    const routeList = ref<MenuTable[]>([]);
    // 权限列表。
    const prems = ref<string[]>([]);
    // 是否已获取动态路由。
    const hasGetRoute = ref(false);
    // 记住我状态。
    const rememberMe = ref(Auth.getRememberMe());
    /** 扩展用户信息类型：兼容 API 返回的 `user_id`，该字段不属于标准 UserInfo。 */
    type UserInfoLike = Partial<UserInfo> & Record<string, any>;

    // 基础用户信息。
    const basicInfo = computed(() => info.value as UserInfoLike);
    // 设置状态。
    const getSettingState = computed(() => useSettingsStore().$state);
    // 工作台状态。
    const getWorktabState = computed(() => useWorktabStore().$state);
    // 获取基础用户信息。
    const getBasicInfo = computed(() => info.value as UserInfoLike);
    // 获取路由列表。
    const getRouteList = computed(() => routeList.value);
    // 获取权限列表。
    const getPerms = computed(() => prems.value);
    // 获取动态路由加载状态。
    const getHasGetRoute = computed(() => hasGetRoute.value);

    /**
     * 设置用户信息。
     * @param newInfo 新的用户信息。
     */
    const setUserInfo = (newInfo: UserInfo | UserInfo) => {
      info.value = newInfo;
      // 用户信息变更后刷新权限。
      setPermissions([]);
    };

    /**
     * 设置登录状态。
     * @param status 登录状态。
     */
    const setLoginStatus = (status: boolean) => {
      isLogin.value = status;
    };

    /**
     * 设置语言。
     * @param lang 语言枚举值。
     */
    const setLanguage = (lang: LanguageEnum) => {
      setPageTitle(router.currentRoute.value);
      language.value = lang;
    };

    /**
     * 设置搜索历史。
     * @param list 搜索历史列表。
     */
    const setSearchHistory = (list: AppRouteRecord[]) => {
      searchHistory.value = list;
    };

    /**
     * 设置锁屏状态。
     * @param status 锁屏状态。
     */
    const setLockStatus = (status: boolean) => {
      isLock.value = status;
    };

    /**
     * 设置锁屏密码。
     * @param password 锁屏密码。
     */
    const setLockPassword = (password: string) => {
      lockPassword.value = password;
    };

    /**
     * 设置认证令牌。
     * @param newAccessToken 访问令牌。
     * @param newRefreshToken 可选的刷新令牌。
     */
    const setToken = (newAccessToken: string, newRefreshToken?: string) => {
      accessToken.value = newAccessToken;
      if (newRefreshToken) {
        refreshToken.value = newRefreshToken;
      }
    };

    /**
     * 检查并清理工作台标签页。
     * 当登录用户发生变化时清空旧用户的工作台标签页，登录成功后调用。
     */
    const checkAndClearWorktabs = () => {
      const lastUserId = localStorage.getItem(StorageConfig.LAST_USER_ID_KEY);
      const ui = info.value as UserInfoLike;
      const currentUserId = ui.id || ui.user_id;

      // 无法获取当前用户 ID 时跳过检查。
      if (!currentUserId) return;

      // 首次登录或缓存已清理时，保留当前标签页。
      if (!lastUserId) {
        return;
      }

      // 不同用户登录时，清空工作台标签页，包括当前标签页。
      if (String(currentUserId) !== String(lastUserId)) {
        useWorktabStore().clearAll();
      }

      // 清理临时存储。
      localStorage.removeItem(StorageConfig.LAST_USER_ID_KEY);
    };

    /**
     * 获取当前用户信息。
     */
    async function getUserInfo() {
      try {
        const response = await UserAPI.getCurrentUserInfo();
        const data = response.data.data;
        const menus: MenuTable[] = data?.menus || [];
        delete data?.menus;
        const previousIsSuperuser = info.value.is_superuser;
        info.value = {
          ...info.value,
          ...data,
          is_superuser: data?.is_superuser ?? previousIsSuperuser,
        } as Partial<UserInfo>;
        setRoute(menus);
      } catch (error) {
        console.error("获取用户信息失败:", error);
        throw error;
      }
    }

    /**
     * 设置头像。
     */
    function setAvatar(avatar: string) {
      info.value = { ...info.value, avatar };
    }

    /**
     * 设置路由。
     */
    function setRoute(routers: MenuTable[]) {
      routeList.value = routers;
      hasGetRoute.value = true;
      setPermissions(routers);
    }

    /**
     * 设置权限。
     */
    function setPermissions(menus: MenuTable[]) {
      prems.value = [];
      if (!info.value.roles) return;

      const roleMenus = info.value.roles
        .filter((role) => role.menus && role.menus.length > 0)
        .flatMap((role) => role.menus)
        .filter((menu): menu is MenuTable => menu !== undefined);

      const allMenus = [...menus, ...roleMenus];

      const permissionSet = new Set<string>();
      const collect = (items: MenuTable[]) => {
        items.forEach((item) => {
          if (item.permission) {
            permissionSet.add(item.permission);
          }
          if (item.children && item.children.length > 0) {
            collect(item.children.filter((child): child is MenuTable => child !== undefined));
          }
        });
      };

      collect(allMenus);
      prems.value = Array.from(permissionSet);
    }

    /**
     * 登录。
     */
    async function login(loginForm: any) {
      const response = await AuthAPI.login(loginForm);
      const data = response.data.data;
      if (response.data.code === ResultEnum.SUCCESS) {
        ElNotification({
          title: "登录成功",
          message: response.data.msg,
          type: "success",
        });
      }
      rememberMe.value = loginForm.remember;

      const accessToken = data?.access_token || "";
      const refreshToken = data?.refresh_token || "";
      if (!accessToken) {
        console.error("[Login Debug] 未获取到 access_token，可能是后端响应字段不匹配");
      }

      // 重建路由前清理上一会话残留的路由和菜单状态。
      useMenuStore().setMenuList([]);
      useMenuStore().setHomePath("");
      (await getRouterUtils()).resetRouteInitState();
      Auth.setTokens(accessToken, refreshToken, rememberMe.value);
      setToken(accessToken, refreshToken);
      if (data?.user_info) {
        info.value = { ...info.value, ...data.user_info } as Partial<UserInfo>;
      }

      await getUserInfo();
      await useConfigStore().getConfig(true);
      setLoginStatus(true);
    }

    /**
     * 登出：有 token 时请求后端，清理本地状态，并按需跳转到登录页。
     */
    async function logout(options?: LogoutOptions) {
      const shouldNavigate = options?.navigate !== false;

      const ui = info.value as UserInfoLike;
      const currentUserId = ui.id || ui.user_id;
      if (currentUserId) {
        localStorage.setItem(StorageConfig.LAST_USER_ID_KEY, String(currentUserId));
      }

      let apiError: unknown;
      const token = Auth.getAccessToken();
      if (token) {
        try {
          const response = await AuthAPI.logout({ token });
          if (response.data.code === ResultEnum.SUCCESS) {
            ElNotification({
              title: "退出成功",
              message: response.data.msg,
              type: "success",
            });
          }
        } catch (e) {
          apiError = e;
        }
      }

      resetAllState();
      sessionStorage.removeItem("iframeRoutes");
      useMenuStore().setHomePath("");
      (await getRouterUtils()).resetRouterState(500);

      if (shouldNavigate) {
        const currentRoute = router.currentRoute.value;
        const redirect = currentRoute.path !== "/login" ? currentRoute.fullPath : undefined;
        await router.push({
          name: "Login",
          query: redirect ? { redirect } : undefined,
        });
      }

      if (apiError) {
        throw apiError;
      }
    }

    /**
     * 重置所有认证相关状态。
     */
    function resetAllState() {
      Auth.clearAuth();
      info.value = {};
      routeList.value = [];
      hasGetRoute.value = false;
      isLogin.value = false;
      isLock.value = false;
      lockPassword.value = "";
      accessToken.value = "";
      refreshToken.value = "";
      prems.value = [];
      // 登出或认证失效时，同时清理会话标签页和 KeepAlive 状态。
      useWorktabStore().clearAll();
    }

    /**
     * 清空用户信息。
     */
    function clearUserInfo() {
      info.value = {};
      routeList.value = [];
      hasGetRoute.value = false;
    }

    /**
     * 刷新 token。
     */
    async function refreshTokenFn() {
      const currentRefreshToken = Auth.getRefreshToken();

      if (!currentRefreshToken) {
        throw new Error("没有有效的刷新令牌");
      }

      const response = await AuthAPI.refreshToken({ refresh_token: currentRefreshToken });
      const data = response.data.data;
      // 更新令牌，并保留当前“记住我”状态。
      Auth.setTokens(data.access_token, data.refresh_token, Auth.getRememberMe());
      setToken(data.access_token, data.refresh_token);
    }

    /**
     * 完全重置所有状态，包括路由、标签页和字典。
     */
    function fullResetAllState() {
      // 重置用户认证状态。
      Auth.clearAuth();
      // 重置用户信息。
      clearUserInfo();
      useWorktabStore().clearAll();
      // 重置字典。
      useDictStore(store).clearDictData();

      return Promise.resolve();
    }

    return {
      language,
      isLogin,
      isLock,
      lockPassword,
      info,
      searchHistory,
      accessToken,
      routeList,
      prems,
      hasGetRoute,
      rememberMe,
      getUserInfo,
      getSettingState,
      getWorktabState,
      basicInfo,
      getBasicInfo,
      getRouteList,
      getPerms,
      getHasGetRoute,
      setUserInfo,
      setLoginStatus,
      setLanguage,
      setSearchHistory,
      setLockStatus,
      setLockPassword,
      setToken,
      setAvatar,
      setRoute,
      setPermissions,
      login,
      logout,
      checkAndClearWorktabs,
      clearUserInfo,
      refreshTokenFn,
      resetAllState,
      fullResetAllState,
    };
  },
  {
    persist: {
      key: "user",
      storage: localStorage,
    },
  }
);

export function useUserStoreHook() {
  return useUserStore(store);
}
