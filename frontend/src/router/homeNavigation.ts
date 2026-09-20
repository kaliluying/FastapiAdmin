import type { Router } from "vue-router";

import { HOME_ROUTE_NAME } from "./staticRoutes";

/** 导航到静态首页，避免使用可能来自旧版本的持久化路径。 */
export function navigateToHome(router: Router) {
  return router.push({ name: HOME_ROUTE_NAME });
}
