import { computed, onMounted, ref, type Ref } from "vue";
import type { UserInfo } from "../api/authApi";
import { getCurrentUserApi } from "../api/userApi";
import { getToken, setToken, removeToken } from "../api/request";

const currentUser: Ref<UserInfo | null> = ref(null);
const loading = ref(true);
const isLoggedIn = computed(() => !!getToken() && !!currentUser.value);

async function fetchCurrentUser(): Promise<void> {
  if (!getToken()) {
    loading.value = false;
    return;
  }
  try {
    const res = await getCurrentUserApi();
    currentUser.value = res.data;
  } catch {
    currentUser.value = null;
    removeToken();
  } finally {
    loading.value = false;
  }
}

async function refreshUser(): Promise<void> {
  if (!getToken()) return;
  try {
    const res = await getCurrentUserApi();
    currentUser.value = res.data;
  } catch {
    // 获取失败时不清除已有用户状态
  }
}

function setAuth(token: string, user: UserInfo): void {
  setToken(token);
  currentUser.value = user;
}

function clearAuth(): void {
  currentUser.value = null;
  removeToken();
}

/**
 * 认证状态管理 composable
 *
 * 全局单例，在 App.vue 的 setup 中初始化后，各组件通过调用 useAuth() 获取共享状态。
 */
export function useAuth() {
  return {
    currentUser,
    isLoggedIn,
    loading,
    fetchCurrentUser,
    refreshUser,
    setAuth,
    clearAuth,
  };
}

/**
 * 在应用根组件中调用一次以初始化认证状态
 */
export async function initAuth(): Promise<void> {
  await fetchCurrentUser();
}
