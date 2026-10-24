import { beforeEach, describe, expect, it, vi } from "vitest";
import AiAgentAPI, { AgentSubmissionRejected } from "./agent";

const request = vi.hoisted(() => Object.assign(vi.fn(), { defaults: { transformResponse: [] } }));
vi.mock("@/utils/http", () => ({ request }));
beforeEach(() => {
  request.mockReset();
});

describe("diagnostic agent API", () => {
  it("uses the agreed endpoints, incremental cursor and cancellation without success toasts", () => {
    const body = {
      request_id: "stable-request",
      goal: "排查超时",
      knowledge_base_ids: [1],
      use_runtime_logs: false,
    };
    const controller = new AbortController();
    AiAgentAPI.createRun(body);
    AiAgentAPI.listRuns();
    AiAgentAPI.getRun("run/1", 7, controller.signal);
    AiAgentAPI.cancelRun("run/1");
    expect(request.mock.calls.map(([config]) => config)).toEqual([
      expect.objectContaining({
        url: "/ai/agent/runs",
        method: "post",
        data: body,
        showSuccessMessage: false,
      }),
      expect.objectContaining({
        url: "/ai/agent/runs",
        method: "get",
        params: { limit: 20 },
      }),
      expect.objectContaining({
        url: "/ai/agent/runs/run%2F1",
        method: "get",
        params: { after_seq: 7 },
        signal: controller.signal,
      }),
      expect.objectContaining({
        url: "/ai/agent/runs/run%2F1/cancel",
        method: "post",
        showSuccessMessage: false,
      }),
    ]);
    expect(request.mock.calls.every(([config]) => config.showErrorMessage === false)).toBe(true);
  });

  it.each([403, 409, 422])(
    "recognizes definite HTTP %s rejections before status normalization",
    async (status) => {
      request.mockImplementation(async (config) => {
        config.transformResponse[0]("", {}, status);
        throw Object.assign(new Error("没有权限或任务数量已达上限"), { code: 400 });
      });
      await expect(
        AiAgentAPI.createRun({
          request_id: "request",
          goal: "排查问题",
          knowledge_base_ids: [1],
          use_runtime_logs: false,
        })
      ).rejects.toEqual(new AgentSubmissionRejected("没有权限或任务数量已达上限"));
    }
  );

  it.each([undefined, 408, 500])(
    "preserves uncertain submission errors for HTTP %s",
    async (status) => {
      const error = Object.assign(new Error("提交结果未知"), { code: 400 });
      request.mockImplementation(async (config) => {
        config.transformResponse[0]("", {}, status);
        throw error;
      });
      await expect(
        AiAgentAPI.createRun({
          request_id: "request",
          goal: "排查问题",
          knowledge_base_ids: [1],
          use_runtime_logs: false,
        })
      ).rejects.toBe(error);
    }
  );

  it("does not mistake a network failure after token-refresh replay for the earlier 401", async () => {
    const error = new Error("网络连接错误");
    request.mockImplementation(async (config) => {
      config.transformResponse[0]("", {}, 401);
      config.transformRequest.at(-1)("");
      throw error;
    });
    await expect(
      AiAgentAPI.createRun({
        request_id: "request",
        goal: "排查问题",
        knowledge_base_ids: [1],
        use_runtime_logs: false,
      })
    ).rejects.toBe(error);
  });
});
