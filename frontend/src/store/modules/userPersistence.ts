/** 用户 Store 的持久化配置。动态路由属于当前会话数据，不应跨版本缓存。 */
export const USER_STORE_PERSIST_KEY = "user";

export const USER_STORE_PERSISTED_FIELDS = [
  "language",
  "isLogin",
  "info",
  "searchHistory",
  "prems",
  "rememberMe",
];

type UserPersistenceStorage = Pick<Storage, "getItem" | "setItem">;

/**
 * 清理旧版本写入的动态路由缓存与已移除的锁屏状态，保留登录信息。
 *
 * 旧版本把 routeList/hasGetRoute 持久化后，刷新页面会跳过当前菜单接口，
 * 导致已删除或其他项目的菜单继续出现在侧栏。解析失败时保持原值，避免误删认证状态。
 */
export function clearLegacyUserRouteCache(storage: UserPersistenceStorage): boolean {
  const raw = storage.getItem(USER_STORE_PERSIST_KEY);
  if (!raw) return false;

  let persisted: unknown;
  try {
    persisted = JSON.parse(raw);
  } catch {
    return false;
  }

  if (!persisted || typeof persisted !== "object" || Array.isArray(persisted)) {
    return false;
  }

  const state = persisted as Record<string, unknown>;
  let changed = false;
  for (const key of ["routeList", "hasGetRoute", "isLock", "lockPassword"]) {
    if (Object.prototype.hasOwnProperty.call(state, key)) {
      delete state[key];
      changed = true;
    }
  }

  if (!changed) return false;
  storage.setItem(USER_STORE_PERSIST_KEY, JSON.stringify(state));
  return true;
}
