import { getJSON, putJSON, type ApiResponse } from "./request";
import type { UserInfo } from "./authApi";

const USER_PREFIX = "/api/v1/system/user";

export interface UpdateProfileParams {
  name?: string;
  mobile?: string;
  email?: string;
  gender?: string;
  avatar?: string;
  monthly_salary?: number | null;
  hire_date?: string | null;
  company_name?: string | null;
  position_name?: string | null;
  contract_type?: string | null;
  social_insurance?: boolean | null;
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUserApi(): Promise<ApiResponse<UserInfo>> {
  return getJSON<UserInfo>(`${USER_PREFIX}/current/info`);
}

/**
 * 更新当前用户信息（个人中心编辑）
 */
export async function updateCurrentUserApi(
  data: UpdateProfileParams,
): Promise<ApiResponse<UserInfo>> {
  // 过滤掉 undefined 字段，保留 null（表示清空）
  const cleanData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      cleanData[key] = value;
    }
  }
  return putJSON<UserInfo>(`${USER_PREFIX}/current/info/update`, cleanData);
}

/**
 * 修改密码
 */
export async function changePasswordApi(
  oldPassword: string,
  newPassword: string,
): Promise<ApiResponse<UserInfo>> {
  return putJSON<UserInfo>(`${USER_PREFIX}/password/change`, {
    old_password: oldPassword,
    new_password: newPassword,
  });
}
