import { request } from "@/utils/http";
import type { ChatCitation } from "@/views/module_ai/chat/types";

const API_PATH = "/ai/agent";

export interface AgentEvent {
  seq: number;
  type: string;
  message: string;
  data: Record<string, unknown>;
  created_at: string;
}

export interface AgentRun {
  run_id: string;
  goal: string;
  status: "pending" | "running" | "succeeded" | "failed" | "cancelled";
  created_at: string;
  updated_at: string;
  result: string | null;
  error: string | null;
  knowledge_base_ids: number[];
  use_runtime_logs: boolean;
  model_calls: number;
  tool_calls: number;
  attempts: number;
  last_seq: number;
  citations: ChatCitation[];
  events: AgentEvent[];
}

export interface AgentRunCreate {
  request_id: string;
  goal: string;
  knowledge_base_ids: number[];
  use_runtime_logs: boolean;
}

export class AgentSubmissionRejected extends Error {}

const AiAgentAPI = {
  async createRun(body: AgentRunCreate) {
    let httpStatus: number | undefined;
    const transforms = request.defaults.transformResponse;
    const requestTransforms = request.defaults.transformRequest;
    try {
      return await request<ApiResponse<AgentRun>>({
        url: `${API_PATH}/runs`,
        method: "post",
        data: body,
        showSuccessMessage: false,
        showErrorMessage: false,
        transformRequest: [
          ...(Array.isArray(requestTransforms)
            ? requestTransforms
            : requestTransforms
              ? [requestTransforms]
              : []),
          (data) => {
            // 认证续期后可能重放请求，不能沿用上一次响应的状态。
            httpStatus = undefined;
            return data;
          },
        ],
        // 共享拦截器会改写错误码，先记录真实 HTTP 状态以区分拒绝与提交结果未知。
        transformResponse: [
          (data, _headers, status) => {
            httpStatus = status;
            return data;
          },
          ...(Array.isArray(transforms) ? transforms : transforms ? [transforms] : []),
        ],
      });
    } catch (error) {
      if (httpStatus && httpStatus >= 400 && httpStatus < 500 && httpStatus !== 408) {
        throw new AgentSubmissionRejected(
          error instanceof Error ? error.message : "提交被拒绝，请检查输入和数据权限后重试。"
        );
      }
      throw error;
    }
  },
  listRuns(limit = 20, signal?: AbortSignal) {
    return request<ApiResponse<AgentRun[]>>({
      url: `${API_PATH}/runs`,
      method: "get",
      params: { limit },
      signal,
      showErrorMessage: false,
    });
  },
  getRun(runId: string, afterSeq = 0, signal?: AbortSignal) {
    return request<ApiResponse<AgentRun>>({
      url: `${API_PATH}/runs/${encodeURIComponent(runId)}`,
      method: "get",
      params: { after_seq: afterSeq },
      signal,
      showErrorMessage: false,
    });
  },
  cancelRun(runId: string) {
    return request<ApiResponse<AgentRun>>({
      url: `${API_PATH}/runs/${encodeURIComponent(runId)}/cancel`,
      method: "post",
      showSuccessMessage: false,
      showErrorMessage: false,
    });
  },
};

export default AiAgentAPI;
