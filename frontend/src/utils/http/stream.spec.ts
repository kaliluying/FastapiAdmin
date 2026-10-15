import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { request } from "./index";

const auth = vi.hoisted(() => ({
  getAccessToken: vi.fn(() => "old-access"),
  getRefreshToken: vi.fn(() => "refresh"),
  getRememberMe: vi.fn(() => false),
  setTokens: vi.fn(),
}));
const refreshToken = vi.hoisted(() => vi.fn());
vi.mock("@/utils/auth", () => ({ Auth: auth, redirectToLogin: vi.fn() }));
vi.mock("@/locales", () => ({ $t: (key: string) => key }));
vi.mock("element-plus", () => ({ ElMessage: { error: vi.fn(), success: vi.fn() } }));
vi.mock("@/api/module_system/auth", () => ({ default: { refreshToken } }));

beforeEach(() => {
  vi.clearAllMocks();
  auth.getAccessToken.mockReturnValue("old-access");
});

describe("HTTP streaming authentication", () => {
  it("passes the response stream through without consuming it", async () => {
    const body = new Response("data: hello\n\n").body;
    const response = await request({
      url: "/ai/chat/stream",
      responseType: "stream",
      adapter: async (config) => ({
        data: body,
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      }),
    });
    expect(response.data).toBe(body);
    expect(body?.locked).toBe(false);
  });

  it("parses a pre-stream 401 and retries once with the refreshed token and original body", async () => {
    const attempts: string[] = [];
    const data = { message: "保留请求", request_id: "same-request" };
    refreshToken.mockImplementationOnce(async () => {
      auth.getAccessToken.mockReturnValue("new-access");
      return { data: { data: { access_token: "new-access", refresh_token: "new-refresh" } } };
    });
    const response = await request({
      url: "/ai/chat/stream",
      method: "post",
      data,
      responseType: "stream",
      showSuccessMessage: false,
      adapter: async (config) => {
        attempts.push(String(config.headers.Authorization));
        expect(JSON.parse(config.data)).toEqual(data);
        const response: AxiosResponse = {
          config,
          status: 200,
          statusText: "OK",
          headers: new AxiosHeaders(),
          data: new Response("data: done\n\n").body,
        };
        if (attempts.length === 1) {
          response.status = 401;
          response.data = new Response(JSON.stringify({ detail: "expired" })).body;
          throw new AxiosError("expired", "ERR_BAD_REQUEST", config, undefined, response);
        }
        return response;
      },
    });
    expect(response.status).toBe(200);
    expect(attempts).toEqual(["Bearer old-access", "Bearer new-access"]);
    expect(refreshToken).toHaveBeenCalledOnce();
  });

  it("does not refresh or replay an aborted stream request", async () => {
    const controller = new AbortController();
    const adapter = vi.fn(async (config) => {
      controller.abort();
      throw new AxiosError("cancelled", "ERR_CANCELED", config);
    });
    await expect(
      request({
        url: "/ai/chat/stream",
        responseType: "stream",
        signal: controller.signal,
        adapter,
      })
    ).rejects.toThrow();
    expect(adapter).toHaveBeenCalledOnce();
    expect(refreshToken).not.toHaveBeenCalled();
  });
});
