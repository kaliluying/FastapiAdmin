import { createRouter, createWebHashHistory } from "vue-router";
import { staticRoutes } from "./staticRoutes";

export const router = createRouter({
  history: createWebHashHistory(),
  routes: staticRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});
