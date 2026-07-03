import { postForm, postJSON, removeToken, setToken, type ApiResponse } from "./request";

export interface UserInfo {
  id: number;
  username: string;
  name: string;
  mobile: string | null;
  email: string | null;
  gender: string | null;
  avatar: string | null;
  status: number;
  description: string | null;
  monthly_salary: number | null;
  hire_date: string | null;
  company_name: string | null;
  position_name: string | null;
  contract_type: string | null;
  social_insurance: boolean | null;
  dept_name: string | null;
  roles: Array<{ id: number; name: string; code: string }>;
  [key: string]: unknown;
}

export interface LoginResult {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  tenants: Array<{ id: number; name: string }>;
  user_info: UserInfo;
}

export interface RegisterParams {
  username: string;
  password: string;
  name?: string;
  mobile?: string;
}

const AUTH_PREFIX = "/api/v1/system/auth";
const USER_PREFIX = "/api/v1/system/user";

/**
 * 登录 —— OAuth2 表单格式
 */
export async function loginApi(
  username: string,
  password: string,
): Promise<ApiResponse<LoginResult>> {
  const res = await postForm<LoginResult>(`${AUTH_PREFIX}/login`, {
    username,
    password,
    grant_type: "password",
  });
  if (res.data) {
    setToken(res.data.access_token);
    localStorage.setItem("refresh_token", res.data.refresh_token);
  }
  return res;
}

/**
 * 注册
 */
export async function registerApi(
  params: RegisterParams,
): Promise<ApiResponse<UserInfo>> {
  return postJSON<UserInfo>(`${USER_PREFIX}/register`, {
    username: params.username,
    password: params.password,
    name: params.name || params.username,
    mobile: params.mobile || undefined,
  });
}

/**
 * 退出登录
 */
export async function logoutApi(): Promise<void> {
  const refreshToken = localStorage.getItem("refresh_token") || "";
  try {
    await postJSON(`${AUTH_PREFIX}/logout`, {
      refresh_token: refreshToken,
    });
  } finally {
    removeToken();
  }
}
