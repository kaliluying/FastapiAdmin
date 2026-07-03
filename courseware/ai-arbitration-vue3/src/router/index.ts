import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/LoginView.vue"),
    meta: { guest: true },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../views/RegisterView.vue"),
    meta: { guest: true },
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("../views/ProfileView.vue"),
    meta: { auth: true },
  },
  {
    path: "/",
    name: "Home",
    component: () => import("../views/HomeView.vue"),
    meta: { auth: true },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from) => {
  const token = localStorage.getItem("access_token");
  console.log("[router] beforeEach:", from.path, "→", to.path, "token:", !!token, "meta:", to.meta);

  // 需要登录的页面，没 token 就跳登录
  if (to.meta.auth && !token) {
    console.log("[router] 无 token，重定向到 /login");
    return { path: "/login", replace: true };
  }

  // 已登录用户访问游客页面（登录/注册），跳主页
  if (to.meta.guest && token) {
    console.log("[router] 已登录，重定向到 /");
    return { path: "/", replace: true };
  }

  console.log("[router] 放行");
});

export default router;
