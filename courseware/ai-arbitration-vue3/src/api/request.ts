const API_BASE = import.meta.env.VITE_APP_API_BASE || "http://127.0.0.1:8004";

export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  msg: string;
}

const SUCCESS_CODES = new Set([0, 200]);

export function getToken(): string {
  return localStorage.getItem("access_token") || "";
}

export function setToken(token: string): void {
  localStorage.setItem("access_token", token);
}

export function removeToken(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("ACCESS_TOKEN");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const token = getToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  console.log("[request]", options.method, url, { headers, body: options.body });

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (e: unknown) {
    console.error("[request] fetch 失败:", e);
    throw new Error("网络请求失败，请确认后端服务已启动");
  }

  console.log("[request] 响应状态:", res.status, res.statusText);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail =
      (body as Record<string, unknown>)?.detail ||
      (body as Record<string, unknown>)?.msg ||
      res.statusText;
    console.error("[request] 业务错误:", body);
    throw new Error(String(detail));
  }

  const json: ApiResponse<T> = await res.json();
  console.log("[request] 响应数据 code=", json.code, "msg=", json.msg);

  if (!SUCCESS_CODES.has(json.code)) {
    throw new Error(json.msg || "请求失败");
  }

  return json;
}

/**
 * POST JSON 请求
 */
export async function postJSON<T>(path: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * POST Form 请求（用于登录等 OAuth2 表单接口）
 */
export async function postForm<T>(path: string, data: Record<string, string>): Promise<ApiResponse<T>> {
  const body = new URLSearchParams(data).toString();
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
}

/**
 * GET 请求
 */
export async function getJSON<T>(path: string): Promise<ApiResponse<T>> {
  return request<T>(path, { method: "GET" });
}

/**
 * PUT JSON 请求
 */
export async function putJSON<T>(path: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
  return request<T>(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE JSON 请求
 */
export async function deleteJSON<T>(path: string, data?: unknown): Promise<ApiResponse<T>> {
  return request<T>(path, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
}
