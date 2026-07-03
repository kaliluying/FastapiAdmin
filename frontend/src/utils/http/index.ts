/**
 * HTTP utilities: Axios instance, shared constants, error types, and interceptors.
 */

import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import qs from "qs";
import { ElMessage } from "element-plus";
import { ResultEnum } from "@/enums/api/result.enum";
import { Auth } from "@/utils/auth";
import { redirectToLogin } from "@/utils/auth";
import { $t } from "@/locales";
import AuthAPI from "@/api/module_system/auth";

// --- Configuration constants ---------------------------------------------------

/** Skip auth marker: set headers.Authorization to this value when a request should not carry a token. */
export const NO_AUTH_FLAG = "no-auth";

export interface ExtendedRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  showSuccessMessage?: boolean;
  showErrorMessage?: boolean;
}

// --- Semantic HTTP status codes and HttpError ----------------------------------

export enum ApiStatus {
  success = 200,
  error = 400,
  unauthorized = 401,
  forbidden = 403,
  notFound = 404,
  methodNotAllowed = 405,
  requestTimeout = 408,
  internalServerError = 500,
  notImplemented = 501,
  badGateway = 502,
  serviceUnavailable = 503,
  gatewayTimeout = 504,
  httpVersionNotSupported = 505,
}

export interface ErrorLogData {
  code: number;
  message: string;
  data?: unknown;
  timestamp: string;
  url?: string;
  method?: string;
  stack?: string;
}

export class HttpError extends Error {
  public readonly code: number;
  public readonly data?: unknown;
  public readonly timestamp: string;
  public readonly url?: string;
  public readonly method?: string;

  constructor(
    message: string,
    code: number,
    options?: {
      data?: unknown;
      url?: string;
      method?: string;
    }
  ) {
    super(message);
    this.name = "HttpError";
    this.code = code;
    this.data = options?.data;
    this.timestamp = new Date().toISOString();
    this.url = options?.url;
    this.method = options?.method;
  }

  public toLogData(): ErrorLogData {
    return {
      code: this.code,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp,
      url: this.url,
      method: this.method,
      stack: this.stack,
    };
  }
}

const getErrorMessage = (status: number): string => {
  const errorMap: Record<number, string> = {
    [ApiStatus.unauthorized]: "httpMsg.unauthorized",
    [ApiStatus.forbidden]: "httpMsg.forbidden",
    [ApiStatus.notFound]: "httpMsg.notFound",
    [ApiStatus.methodNotAllowed]: "httpMsg.methodNotAllowed",
    [ApiStatus.requestTimeout]: "httpMsg.requestTimeout",
    [ApiStatus.internalServerError]: "httpMsg.internalServerError",
    [ApiStatus.badGateway]: "httpMsg.badGateway",
    [ApiStatus.serviceUnavailable]: "httpMsg.serviceUnavailable",
    [ApiStatus.gatewayTimeout]: "httpMsg.gatewayTimeout",
  };

  return $t(errorMap[status] || "httpMsg.internalServerError");
};

export function handleError(error: AxiosError<ApiResponse>): never {
  if (error.code === "ERR_CANCELED") {
    console.warn("Request cancelled:", error.message);
    throw new HttpError($t("httpMsg.requestCancelled"), ApiStatus.error);
  }

  const statusCode = error.response?.status;
  const errorMessage = error.response?.data?.msg || error.message;
  const requestConfig = error.config;

  if (!error.response) {
    throw new HttpError($t("httpMsg.networkError"), ApiStatus.error, {
      url: requestConfig?.url,
      method: requestConfig?.method?.toUpperCase(),
    });
  }

  const message = statusCode
    ? getErrorMessage(statusCode)
    : errorMessage || $t("httpMsg.requestFailed");
  throw new HttpError(message, statusCode || ApiStatus.error, {
    data: error.response.data,
    url: requestConfig?.url,
    method: requestConfig?.method?.toUpperCase(),
  });
}

export function showError(error: HttpError, showMessage: boolean = true): void {
  if (showMessage) {
    ElMessage.error(error.message);
  }
  console.error("[HTTP Error]", error.toLogData());
}

export function showSuccess(message: string, showMessage: boolean = true): void {
  if (showMessage) {
    ElMessage.success(message);
  }
}

export const isHttpError = (error: unknown): error is HttpError => {
  return error instanceof HttpError;
};

// --- Token refresh de-duplication ---------------------------------------------

/**
 * Token refresh in-flight flag, preventing concurrent 401 responses from firing multiple refresh requests.
 * Pending requests are replayed after refresh succeeds.
 */
let isRefreshing = false;
let pendingRequests: Array<{
  config: InternalAxiosRequestConfig;
  resolve: (value: Promise<AxiosResponse>) => void;
  reject: (reason?: Error) => void;
}> = [];

function onRefreshed(newToken: string) {
  const list = pendingRequests;
  pendingRequests = [];
  list.forEach(({ config, resolve }) => {
    config.headers.Authorization = `Bearer ${newToken}`;
    resolve(request(config));
  });
}

function onRefreshFailed() {
  pendingRequests.forEach(({ reject }) => reject(new Error("Token refresh failed")));
  pendingRequests = [];
}

// --- Axios instance ------------------------------------------------------------

export const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
  paramsSerializer: (params) => qs.stringify(params, { indices: false }),
});

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = Auth.getAccessToken();
    const auth = config.headers.Authorization;

    if (auth === NO_AUTH_FLAG) {
      delete config.headers.Authorization;
      return config;
    }

    if (!auth && accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    const msg = error instanceof Error ? error.message : String(error);
    ElMessage.error(msg);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor.
 *
 * 1. Successful responses:
 *    - Blob responses pass through for file downloads.
 *    - Non-success business codes are rejected.
 *    - Non-GET, non-login/logout successful mutations show a success message.
 *
 * 2. Network errors without a response:
 *    - Provide user-friendly messages for connection refusal, timeout, and generic network errors.
 *
 * 3. Business/auth errors with a response:
 *    - Blob errors are parsed as JSON when possible.
 *    - 401 / TOKEN_EXPIRED triggers silent token refresh and request replay.
 *    - Other business errors are mapped by code.
 */
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    if (response.config.responseType === "blob") {
      return response;
    }

    const data = response.data;

    if (data.code !== ResultEnum.SUCCESS) {
      ElMessage.error(data.msg);
      return Promise.reject(response);
    }

    if (
      response.config.method?.toUpperCase() !== "GET" &&
      !response.config.url?.includes("login") &&
      !response.config.url?.includes("logout")
    ) {
      ElMessage.success(data.msg);
    }

    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    // Network errors without a response body.
    if (!error.response) {
      let errorMessage = "网络连接异常";

      if (error.message?.includes("ECONNREFUSED")) {
        errorMessage = "服务器连接失败，请检查后端服务是否正常运行";
      } else if (error.message?.includes("timeout")) {
        errorMessage = "请求超时，请稍后重试";
      } else if (error.message?.includes("Network Error")) {
        errorMessage = "网络连接错误，请检查网络设置";
      }

      console.error("网络请求失败:", error);
      ElMessage.error(errorMessage);
      return Promise.reject(new Error(errorMessage));
    }

    const data = error.response?.data;

    // Blob error responses, usually from file download APIs.
    if (error.response?.config.responseType === "blob" && error.response.data instanceof Blob) {
      try {
        const text = await new Response(error.response.data).text();
        const jsonData: ApiResponse = JSON.parse(text);

        if (jsonData.code === ResultEnum.ERROR) {
          ElMessage.error(jsonData.msg || "请求错误");
          return Promise.reject(new Error(jsonData.msg || "请求错误"));
        } else if (jsonData.code === ResultEnum.EXCEPTION) {
          ElMessage.error(jsonData.msg || "服务异常");
          return Promise.reject(new Error(jsonData.msg || "服务异常"));
        }
      } catch (e) {
        console.error("请求异常:", e);
        ElMessage.error("数据解析失败");
        return Promise.reject(new Error("数据解析失败"));
      }
    }

    // Auth errors: silently refresh tokens when possible.
    const status = error.response.status;

    const hasApiCode =
      data !== undefined &&
      data !== null &&
      typeof data === "object" &&
      "code" in data &&
      typeof (data as ApiResponse).code === "number";

    if ((status === 401 && !hasApiCode) || data?.code === ResultEnum.TOKEN_EXPIRED) {
      const config = error.config as InternalAxiosRequestConfig | undefined;

      // If the refresh endpoint itself fails, let the catch block below redirect once.
      // This avoids duplicate notifications.
      if (config?.url?.includes("auth/token/refresh")) {
        return Promise.reject(
          new HttpError(data?.msg || "刷新令牌已过期，请重新登录", ApiStatus.unauthorized)
        );
      }

      // Without request config, or when logout itself returns 401, redirect directly.
      if (!config || config.url?.includes("auth/logout")) {
        await redirectToLogin("登录状态异常，请重新登录");
        return Promise.reject(new HttpError("Unauthorized", ApiStatus.unauthorized));
      }

      // First 401 starts refresh; later concurrent 401 requests wait in the queue.
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          // Call refresh directly here to avoid dynamically importing user.store and creating cycles.
          const refreshResp = await AuthAPI.refreshToken({
            refresh_token: Auth.getRefreshToken(),
          });
          const tokenData = refreshResp.data.data;
          const newAccessToken = tokenData?.access_token || "";
          const newRefreshToken = tokenData?.refresh_token || "";
          Auth.setTokens(newAccessToken, newRefreshToken, Auth.getRememberMe());
          isRefreshing = false;
          const newToken = Auth.getAccessToken();
          // Replay all queued requests.
          onRefreshed(newToken);
          // Retry the current request with the new token.
          config.headers.Authorization = `Bearer ${newToken}`;
          return request(config);
        } catch {
          isRefreshing = false;
          // Refresh failed: reject queued requests and redirect to login.
          onRefreshFailed();
          const msg = data?.msg || "登录已失效，请重新登录";
          await redirectToLogin(msg);
          return Promise.reject(new HttpError(msg, ApiStatus.unauthorized));
        }
      } else {
        // Another refresh is already running; queue this request for replay.
        return new Promise((resolve, reject) => {
          pendingRequests.push({ config: config!, resolve, reject });
        });
      }
    }

    // Business errors mapped by code.
    if (data?.code === ResultEnum.ERROR) {
      ElMessage.error(data.msg || "请求错误");
      return Promise.reject(new HttpError(data.msg || "请求错误", ApiStatus.error));
    } else if (data?.code === ResultEnum.UNAUTHORIZED) {
      ElMessage.error(data.msg || "暂无权限");
      return Promise.reject(new HttpError(data.msg || "请求错误", ApiStatus.unauthorized));
    } else if (data?.code === ResultEnum.EXCEPTION) {
      ElMessage.error(data.msg || "服务异常");
      return Promise.reject(new HttpError(data.msg || "服务异常", ApiStatus.error));
    } else {
      ElMessage.error("请求处理失败，请稍后重试");
      return Promise.reject(new Error("请求处理失败"));
    }
  }
);

export type { AxiosInstance } from "axios";
