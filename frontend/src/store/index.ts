import type { App } from "vue";
import { useUserStore } from "./modules/user.store";
import { useWorktabStore } from "./modules/worktab.store";

import { store } from "./pinia";

export function initStore(app: App<Element>) {
  app.use(store);
}

export * from "./modules/app.store";
export * from "./modules/menu.store";
export * from "./modules/setting.store";
export * from "./modules/table.store";
export * from "./modules/user.store";
export * from "./modules/worktab.store";

export { store };

export interface RefreshCacheOptions {
  refreshUser?: boolean;
  refreshRoutes?: boolean;
  clearTags?: boolean;
}

export async function refreshAppCaches(opts: RefreshCacheOptions = {}) {
  const { refreshUser = true, refreshRoutes = true, clearTags = false } = opts;

  const userStore = useUserStore(store);

  const tasks: Promise<any>[] = [];

  if (refreshUser) {
    tasks.push(userStore.getUserInfo());
  }
  await Promise.allSettled(tasks);

  if (refreshRoutes) {
    const { refreshMenuAndRoutes } = await import("@/router/beforeEach");
    await refreshMenuAndRoutes();
  }

  if (clearTags) {
    useWorktabStore(store).clearAll();
  }
}
