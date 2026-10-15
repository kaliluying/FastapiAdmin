// 聊天消息类型
export interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  runId?: string;
  sessionId?: string;
  feedbackRating?: "helpful" | "incorrect";
  feedbackComment?: string;
  timestamp: number;
  loading?: boolean;
  thinkingCollapsed?: boolean;
  files?: UploadedFile[];
  citations?: ChatCitation[];
  error?: string;
  errorCode?: string;
  retryUntil?: number;
  retryOf?: string;
  retriedMessageId?: string;
  warning?: string;
  stopped?: boolean;
  logResults?: RuntimeLogResult[];
  request?: {
    message: string;
    files?: UploadedFile[];
    knowledgeBaseIds: number[];
    logContextId?: string | null;
  };
}

export interface RuntimeLogQuery {
  minutes: number;
  levels: ("DEBUG" | "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "CRITICAL")[];
  keyword: string;
  correlation_id: string;
}

export interface RuntimeLogResult {
  start_time: string;
  end_time: string;
  returned_count: number;
  matched_count: number;
  truncated: boolean;
  notice: string;
  scanned_files?: string[];
  query?: RuntimeLogQuery;
  query_index?: number;
}

export interface ChatCitation {
  id: string;
  title: string;
  snippet?: string;
  knowledge_base_id?: number;
  document_id?: number;
  chunk_index?: number;
}

// 上传文件类型
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  file?: File;
  content?: string;
  status?: "uploading" | "ready" | "error";
  error?: string;
  truncated?: boolean;
}

// 会话消息类型（来自后端）
export interface SessionMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_time?: string;
}

// 会话详情类型
export interface SessionDetail {
  id: string;
  title: string;
  created_time?: string;
  updated_time?: string;
  message_count: number;
  messages: SessionMessage[];
}

// 工作区面板类型
export type ChatWorkspacePanel = "sessions" | "conversation" | "evidence";

export type ChatProcessStage =
  | "idle"
  | "preparing"
  | "routing"
  | "querying_logs"
  | "analyzing"
  | "retrieving"
  | "reranking"
  | "generating"
  | "complete"
  | "error";
