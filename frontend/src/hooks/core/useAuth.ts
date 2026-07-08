/**
 * useAuth - 权限验证管理
 *
 * 提供统一的权限验证功能。
 * 用于控制页面按钮、操作等功能的显示和访问权限。
 *
 * ## 主要功能
 *
 * 1. 权限检查 - 检查用户是否拥有指定的权限标识
 * 2. 超管放行 - `is_superuser=true` 时跳过权限码校验
 * 3. 后端权限源 - 从当前用户信息下发的 permissions 列表校验
 *
 * ## 使用示例
 *
 * ```typescript
 * const { hasAuth } = useAuth()
 *
 * // 检查是否有新增权限
 * if (hasAuth('add')) {
 *   // 显示新增按钮
 * }
 *
 * // 在模板中使用
 * <el-button v-if="hasAuth('edit')">编辑</el-button>
 * <el-button v-if="hasAuth('delete')">删除</el-button>
 * ```
 *
 * @module useAuth
 * @author FastapiAdmin Team
 */

import { useUserStore } from "@stores";
import { hasPermissionCode } from "@/utils/auth/permission";

export const useAuth = () => {
  const userStore = useUserStore();

  /**
   * 检查是否拥有某权限标识（与 v-hasPerm / 表格内 ArtButtonMore 全码一致）
   * @param auth 权限标识（多为后端菜单 permission 全码，如 module_system:role:update）
   */
  const hasAuth = (auth: string): boolean => {
    return hasPermissionCode(auth, {
      is_superuser: userStore.basicInfo?.is_superuser,
      permissions: userStore.prems,
    });
  };

  return {
    hasAuth,
  };
};
