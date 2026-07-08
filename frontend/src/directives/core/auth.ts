/**
 * v-auth 权限指令
 *
 * 基于权限标识控制 DOM 元素的显示和隐藏。
 * 权限检查优先级：is_superuser > userStore.prems
 * 如果用户没有对应权限，元素将从 DOM 中移除。
 *
 * ## 使用示例
 *
 * ```vue
 * <el-button v-auth="'module_system:user:create'">新增</el-button>
 * <el-button v-auth="'module_system:user:update'">编辑</el-button>
 * <el-button v-auth="'module_platform:order:create'">创建订单</el-button>
 * ```
 *
 * @module directives/auth
 */

import { useUserStore } from "@stores";
import { App, Directive, DirectiveBinding } from "vue";
import { hasPermissionCode } from "@/utils/auth/permission";

export type AuthDirective = Directive<HTMLElement, string>;

function hasPermission(auth: string): boolean {
  if (!auth) return true;

  const userStore = useUserStore();
  return hasPermissionCode(auth, {
    is_superuser: (userStore.basicInfo as Record<string, any>)?.is_superuser,
    permissions: userStore.prems,
  });
}

function checkAuthPermission(el: HTMLElement, binding: DirectiveBinding<string>): void {
  if (!hasPermission(binding.value)) {
    removeElement(el);
  }
}

function removeElement(el: HTMLElement): void {
  if (el.parentNode) {
    el.parentNode.removeChild(el);
  }
}

const authDirective: AuthDirective = {
  mounted: checkAuthPermission,
  updated: checkAuthPermission,
};

export function setupAuthDirective(app: App): void {
  app.directive("auth", authDirective);
}
