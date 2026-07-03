export interface ChatSocketUrlOptions {
  endpoint?: string;
  path?: string;
  token?: string | null;
}

export interface ChatPayload {
  message: string;
  sessionId?: string | null;
  knowledgeBaseIds?: number[];
}

export const CHAT_SOCKET_PATH = "/api/v1/ai/chat/ws";

export const buildChatSocketUrl = ({
  endpoint = "ws://127.0.0.1:8004",
  path = CHAT_SOCKET_PATH,
  token,
}: ChatSocketUrlOptions = {}) => {
  const url = new URL(path, endpoint.endsWith("/") ? endpoint : `${endpoint}/`);

  if (token) {
    url.searchParams.set("token", token);
  }

  return url.toString();
};

export const serializeChatPayload = ({ message, sessionId, knowledgeBaseIds = [] }: ChatPayload) => {
  return JSON.stringify({
    message,
    session_id: sessionId || null,
    knowledge_base_ids: knowledgeBaseIds,
  });
};

export const getStoredAccessToken = () => {
  return localStorage.getItem("access_token") || localStorage.getItem("ACCESS_TOKEN") || "";
};
