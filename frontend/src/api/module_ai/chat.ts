import { request } from "@utils";

const API_PATH = "/ai/chat";

/** 会话分页列表查询（列表接口） */
export interface ChatSessionListQuery extends PageQuery {
  title?: string;
  created_at?: string[];
  updated_at?: string[];
}

export const AiChatAPI = {
  getRuntimeLogStatus() {
    return request<ApiResponse<{ can_query: boolean; enabled: boolean }>>({
      url: `${API_PATH}/runtime-logs/status`,
      method: "get",
      showSuccessMessage: false,
    });
  },
  parseAttachment(body: FormData) {
    return request<
      ApiResponse<{ name: string; size: number; type: string; content: string; truncated: boolean }>
    >({
      url: `${API_PATH}/attachment`,
      method: "post",
      data: body,
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
      showSuccessMessage: false,
    });
  },
  getSessionList(query: ChatSessionListQuery) {
    return request<ApiResponse<PageResult<ChatSession>>>({
      url: `${API_PATH}/list`,
      method: "get",
      params: query,
    });
  },

  createSession(body: { title: string }) {
    return request<ApiResponse<ChatSession>>({
      url: `${API_PATH}/create`,
      method: "post",
      data: body,
    });
  },

  updateSession(id: string, body: { title: string }) {
    return request<ApiResponse<ChatSession>>({
      url: `${API_PATH}/update/${id}`,
      method: "put",
      data: body,
    });
  },

  deleteSession(body: string[]) {
    return request<ApiResponse>({
      url: `${API_PATH}/delete`,
      method: "delete",
      data: body,
    });
  },

  chat(body: {
    message: string;
    session_id?: string | null;
    knowledge_base_ids?: number[];
    log_context_id?: string | null;
  }) {
    return request<ApiResponse<AiChatResponse>>({
      url: `${API_PATH}/ai-chat`,
      method: "post",
      data: body,
    });
  },

  getSessionDetail(sessionId: string) {
    return request<ApiResponse<ChatSessionDetail>>({
      url: `${API_PATH}/detail/${sessionId}`,
      method: "get",
    });
  },

  getUsage() {
    return request<ApiResponse<AiUsageSummary>>({ url: `${API_PATH}/usage`, method: "get" });
  },

  getAdminUsage(userId?: number, day?: string) {
    return request<ApiResponse<AiUsageSummary>>({
      url: `${API_PATH}/usage/admin`,
      method: "get",
      params: { user_id: userId, day },
    });
  },

  updateUsageQuota(userId: number, dailyLimit: number | null) {
    return request<ApiResponse<AiUsageSummary>>({
      url: `${API_PATH}/usage/quota/${userId}`,
      method: "put",
      data: { daily_limit: dailyLimit },
    });
  },

  checkModelCapabilities(body: AiModelConfigUpdate) {
    return request<ApiResponse<AiModelCapabilityCheck>>({
      url: `${API_PATH}/model-config/check`,
      method: "post",
      data: body,
      timeout: 70_000,
    });
  },

  getModelConfig() {
    return request<ApiResponse<AiModelConfig>>({
      url: `${API_PATH}/model-config`,
      method: "get",
    });
  },

  updateModelConfig(body: AiModelConfigUpdate) {
    return request<ApiResponse<AiModelConfig>>({
      url: `${API_PATH}/model-config`,
      method: "put",
      data: body,
    });
  },

  listProviderModels(body: AiModelListRequest) {
    return request<ApiResponse<string[]>>({
      url: `${API_PATH}/model-config/models`,
      method: "post",
      data: body,
      showSuccessMessage: false,
    });
  },
};

export default AiChatAPI;

export interface ChatSessionMessage {
  id: string;
  role: string;
  content: string;
  created_at: number | null;
}

export interface ChatSession {
  session_id: string;
  agent_id: string | null;
  team_id: string | null;
  team_name: string | null;
  workflow_id: string | null;
  user_id: string | null;
  session_data: Record<string, any> | null;
  agent_data: Record<string, any> | null;
  team_data: Record<string, any> | null;
  workflow_data: Record<string, any> | null;
  metadata: Record<string, any> | null;
  runs: Array<Record<string, any>> | null;
  summary: Record<string, any> | null;
  created_at: number | null;
  updated_at: number | null;

  id: string;
  title: string | null;
  created_time: string | null;
  updated_time: string | null;
  message_count: number;
  messages: ChatSessionMessage[];
}

export interface SessionGroup {
  id: string;
  title: string;
  sessions: ChatSession[];
}

export interface UserInfo {
  id: number;
  name: string;
  username: string;
  avatar: string;
  email: string;
}

export interface AiChatResponse {
  response: string;
  session_id: string;
  function_calls: Array<{
    name: string;
    arguments: Record<string, any>;
  }> | null;
  action: Record<string, any> | null;
  log_context_id?: string | null;
}

export interface ChatSessionDetail {
  session_id: string;
  agent_id: string | null;
  team_id: string | null;
  team_name: string | null;
  workflow_id: string | null;
  user_id: string | null;
  session_data: Record<string, any> | null;
  agent_data: Record<string, any> | null;
  team_data: Record<string, any> | null;
  workflow_data: Record<string, any> | null;
  metadata: Record<string, any> | null;
  runs: Array<Record<string, any>> | null;
  summary: Record<string, any> | null;
  created_at: number | null;
  updated_at: number | null;

  id: string;
  title: string | null;
  created_time: string | null;
  updated_time: string | null;
  message_count: number;
  messages: ChatSessionMessage[];
}

export interface AiModelConfig {
  chat_protocol: ChatProtocol;
  openai_base_url: string;
  openai_model: string;
  openai_embedding_model: string;
  embedding_provider: string;
  local_embedding_model: string;
  openai_api_key_configured: boolean;
  chroma_persist_dir: string;
  chroma_collection_name: string;
}

export type ChatProtocol = "openai" | "openai_responses" | "anthropic";

export interface AiModelListRequest {
  chat_protocol: ChatProtocol;
  openai_base_url: string;
  openai_api_key?: string;
}

export interface AiModelConfigUpdate {
  chat_protocol: ChatProtocol;
  openai_base_url: string;
  openai_model: string;
  openai_api_key?: string;
}

export interface AiUsageSummary {
  user_id: number;
  day: string;
  timezone: string;
  calls: number;
  daily_limit: number | null;
  remaining: number | null;
  users?: { id: number; username: string }[];
  items: {
    model: string;
    protocol: string;
    purpose: string;
    status: string;
    calls: number;
    input_tokens: number | null;
    output_tokens: number | null;
    total_tokens: number | null;
    known_usage_calls: number;
    latency_ms: number | null;
  }[];
}

export interface AiModelCapabilityCheck {
  protocol: string;
  model: string;
  results: {
    capability: "complete" | "stream" | "tools";
    status: "passed" | "failed";
    message: string;
    latency_ms: number;
  }[];
}
