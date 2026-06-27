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
    // Language setting.
    const language = ref(LanguageEnum.ZH);
    // Login state.
    const isLogin = ref(false);
    // 閿佸睆鐘舵€?
    const isLock = ref(false);
    // 閿佸睆瀵嗙爜
    const lockPassword = ref("");
    // 鐢ㄦ埛淇℃伅
    const info = ref<Partial<UserInfo>>({});
    // 鎼滅储鍘嗗彶璁板綍
    const searchHistory = ref<AppRouteRecord[]>([]);
    // 璁块棶浠ょ墝
    const accessToken = ref("");
    // 鍒锋柊浠ょ墝
    const refreshToken = ref("");
    // 璺敱鍒楄〃
    const routeList = ref<MenuTable[]>([]);
    // 鏉冮檺鍒楄〃
    const prems = ref<string[]>([]);
    // 鏄惁宸茶幏鍙栬矾鐢?
    const hasGetRoute = ref(false);
    // 璁颁綇鎴戠姸鎬?
    const rememberMe = ref(Auth.getRememberMe());
    // 绉熸埛鍒楄〃
    // 褰撳墠閫変腑绉熸埛
    /** info 鎵╁睍绫诲瀷锛氬吋瀹?API 杩斿洖 `user_id`锛堥潪鏍囧噯 UserInfo 瀛楁锛?*/
    type UserInfoLike = Partial<UserInfo> & Record<string, any>;

    // 璁＄畻灞炴€э細鍩虹鐢ㄦ埛淇℃伅
    const basicInfo = computed(() => info.value as UserInfoLike);
    // 璁＄畻灞炴€э細鑾峰彇璁剧疆鐘舵€?
    const getSettingState = computed(() => useSettingsStore().$state);
    // 璁＄畻灞炴€э細鑾峰彇宸ヤ綔鍙扮姸鎬?
    const getWorktabState = computed(() => useWorktabStore().$state);
    // 璁＄畻灞炴€э細鑾峰彇鍩虹淇℃伅
    const getBasicInfo = computed(() => info.value as UserInfoLike);
    // 璁＄畻灞炴€э細鑾峰彇璺敱鍒楄〃
    const getRouteList = computed(() => routeList.value);
    // 璁＄畻灞炴€э細鑾峰彇鏉冮檺鍒楄〃
    const getPerms = computed(() => prems.value);
    // 璁＄畻灞炴€э細鏄惁宸茶幏鍙栬矾鐢?
    const getHasGetRoute = computed(() => hasGetRoute.value);

    /**
     * 璁剧疆鐢ㄦ埛淇℃伅
     * @param newInfo 鏂扮殑鐢ㄦ埛淇℃伅
     */
    const setUserInfo = (newInfo: UserInfo | UserInfo) => {
      info.value = newInfo;
      // 璁剧疆鐢ㄦ埛淇℃伅鍚庤嚜鍔ㄦ洿鏂版潈闄?
      setPermissions([]);
    };

    /**
     * 璁剧疆鐧诲綍鐘舵€?
     * @param status 鐧诲綍鐘舵€?
     */
    const setLoginStatus = (status: boolean) => {
      isLogin.value = status;
    };

    /**
     * 璁剧疆璇█
     * @param lang 璇█鏋氫妇鍊?
     */
    const setLanguage = (lang: LanguageEnum) => {
      setPageTitle(router.currentRoute.value);
      language.value = lang;
    };

    /**
     * 璁剧疆鎼滅储鍘嗗彶
     * @param list 鎼滅储鍘嗗彶鍒楄〃
     */
    const setSearchHistory = (list: AppRouteRecord[]) => {
      searchHistory.value = list;
    };

    /**
     * 璁剧疆閿佸睆鐘舵€?
     * @param status 閿佸睆鐘舵€?
     */
    const setLockStatus = (status: boolean) => {
      isLock.value = status;
    };

    /**
     * 璁剧疆閿佸睆瀵嗙爜
     * @param password 閿佸睆瀵嗙爜
     */
    const setLockPassword = (password: string) => {
      lockPassword.value = password;
    };

    /**
     * 璁剧疆浠ょ墝
     * @param newAccessToken 璁块棶浠ょ墝
     * @param newRefreshToken 鍒锋柊浠ょ墝锛堝彲閫夛級
     */
    const setToken = (newAccessToken: string, newRefreshToken?: string) => {
      accessToken.value = newAccessToken;
      if (newRefreshToken) {
        refreshToken.value = newRefreshToken;
      }
    };

    /**
     * 妫€鏌ュ苟娓呯悊宸ヤ綔鍙版爣绛鹃〉
     * 濡傛灉涓嶆槸鍚屼竴鐢ㄦ埛鐧诲綍锛屾竻绌哄伐浣滃彴鏍囩椤?
     * 搴斿湪鐧诲綍鎴愬姛鍚庤皟鐢?
     */
    const checkAndClearWorktabs = () => {
      const lastUserId = localStorage.getItem(StorageConfig.LAST_USER_ID_KEY);
      const ui = info.value as UserInfoLike;
      const currentUserId = ui.id || ui.user_id;

      // 鏃犳硶鑾峰彇褰撳墠鐢ㄦ埛 ID锛岃烦杩囨鏌?
      if (!currentUserId) return;

      // 棣栨鐧诲綍鎴栫紦瀛樺凡娓呴櫎锛屼繚鐣欑幇鏈夋爣绛鹃〉
      if (!lastUserId) {
        return;
      }

      // 涓嶅悓鐢ㄦ埛鐧诲綍锛氭竻绌哄伐浣滃彴鏍囩锛堝惈 current锛岄伩鍏嶄笌璺敱鑴辫妭锛涘苟涓庢寔涔呭寲涓€鑷达級
      if (String(currentUserId) !== String(lastUserId)) {
        useWorktabStore().clearAll();
      }

      // 娓呴櫎涓存椂瀛樺偍
      localStorage.removeItem(StorageConfig.LAST_USER_ID_KEY);
    };

                /**
     * 鑾峰彇鐢ㄦ埛淇℃伅
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
     * 璁剧疆澶村儚
     */
    function setAvatar(avatar: string) {
      info.value = { ...info.value, avatar };
    }

    /**
     * 璁剧疆璺敱
     */
    function setRoute(routers: MenuTable[]) {
      routeList.value = routers;
      hasGetRoute.value = true;
      setPermissions(routers);
    }

    /**
     * 璁剧疆鏉冮檺
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
     * 鐧诲綍
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

      // Clear stale route/menu state from the previous session before rebuilding routes.
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
     * 鐧诲嚭锛氭湁 token 鏃惰姹傚悗绔紱缁熶竴娓呯悊鐘舵€侊紱榛樿璺宠浆鐧诲綍椤靛苟甯?redirect
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
     * 閲嶇疆鎵€鏈夌姸鎬?
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
      /** 鐧诲嚭 / 璁よ瘉澶辨晥锛氫細璇濈粨鏉燂紝宸ヤ綔鏍忎笌 KeepAlive exclude 涓€骞舵竻绌猴紙pinia 鎸佷箙鍖栭殢涔嬪啓鍏ワ級 */
      useWorktabStore().clearAll();
    }

    /**
     * 娓呯┖鐢ㄦ埛淇℃伅
     */
    function clearUserInfo() {
      info.value = {};
      routeList.value = [];
      hasGetRoute.value = false;
    }

    /**
     * 鍒锋柊token
     */
    async function refreshTokenFn() {
      const currentRefreshToken = Auth.getRefreshToken();

      if (!currentRefreshToken) {
        throw new Error("没有有效的刷新令牌");
      }

      const response = await AuthAPI.refreshToken({ refresh_token: currentRefreshToken });
      const data = response.data.data;
      // 鏇存柊浠ょ墝锛屼繚鎸佸綋鍓嶈浣忔垜鐘舵€?
      Auth.setTokens(data.access_token, data.refresh_token, Auth.getRememberMe());
      setToken(data.access_token, data.refresh_token);
    }

    /**
     * 瀹屽叏閲嶇疆鎵€鏈夌姸鎬侊紙鍖呮嫭璺敱銆佹爣绛鹃〉銆佸瓧鍏哥瓑锛?
     */
    function fullResetAllState() {
      // 閲嶇疆鐢ㄦ埛鐘舵€?
      Auth.clearAuth();
      // 閲嶇疆鐢ㄦ埛淇℃伅
      clearUserInfo();
      useWorktabStore().clearAll();
      // 閲嶇疆瀛楀吀
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

