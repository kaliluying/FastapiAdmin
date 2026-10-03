import type { Directive, DirectiveBinding } from "vue";

import { useUserStore } from "@stores";
import { hasPermissionCode } from "@/utils/auth/permission";

/**
 * 按钮权限
 */
export const hasPerm: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const requiredPerms = binding.value;

    // 校验传入的权限值是否合法
    if (!requiredPerms || (typeof requiredPerms !== "string" && !Array.isArray(requiredPerms))) {
      throw new Error(
        "需要提供权限标识！例如：v-has-perm=\"'sys:user:add'\" 或 v-has-perm=\"['sys:user:add', 'sys:user:edit']\""
      );
    }

    const userStore = useUserStore();

    // 检查权限
    const hasAuth = Array.isArray(requiredPerms)
      ? requiredPerms.some((perm) =>
          hasPermissionCode(perm, {
            is_superuser: userStore.basicInfo?.is_superuser,
            permissions: userStore.prems,
          })
        )
      : hasPermissionCode(requiredPerms, {
          is_superuser: userStore.basicInfo?.is_superuser,
          permissions: userStore.prems,
        });

    // 如果没有权限，移除该元素
    if (!hasAuth && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  },
};
