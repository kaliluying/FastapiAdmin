import { request } from "@utils";

const API_PATH = "/system/auth";

/** 方案提供方 */
export type OAuthProvider = "wechat" | "qq" | "github" | "gitee";

const AuthAPI = {
  /**
   * 登录
   * @param body 登录参数
   * @returns 登录响应
   */
  login(body: LoginFormData) {
    return request<ApiResponse<LoginResult>>({
      url: `${API_PATH}/login`,
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: "no-auth",
      },
      data: body,
    });
  },

  refreshToken(body: RefreshToekenBody) {
    return request<ApiResponse<JWTOut>>({
      url: `${API_PATH}/token/refresh`,
      method: "post",
      headers: {
        Authorization: "no-auth",
      },
      data: body,
    });
  },

  logout(body: LogoutBody) {
    return request<ApiResponse>({
      url: `${API_PATH}/logout`,
      method: "post",
      data: body,
    });
  },
};

export default AuthAPI;

// ─── Auth 类型定义 ───

/** 登录表单 */
export interface LoginFormData {
  username: string;
  password: string;
  remember?: boolean;
  login_type?: string;
}

/** JWT 响应 (JWTOutSchema) */
export interface JWTOut {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

/** 登录成功返回 */
export interface LoginResult extends JWTOut {
  user_info?: LoginUserInfo;
}

export interface LoginUserInfo {
  id?: number;
  username?: string;
  name?: string;
  avatar?: string;
  is_superuser?: boolean;
}

/** 刷新 Token 请求体 */
export interface RefreshToekenBody {
  refresh_token: string;
}

/** 退出登录请求体 */
export interface LogoutBody {
  token: string;
}

