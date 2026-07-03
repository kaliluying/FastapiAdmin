import type { ChatMessage, ChatSession } from "../data/mock";
import { deleteJSON, getJSON, postJSON } from "./request";

interface BackendChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: number | null;
}

interface BackendChatSession {
  id?: string;
  session_id?: string;
  title?: string;
  message_count?: number;
  messages?: BackendChatMessage[];
  updated_time?: string | null;
  created_time?: string | null;
}

interface PageResult<T> {
  items: T[];
  total: number;
}

const CHAT_PREFIX = "/api/v1/ai/chat";

function formatMessageTime(timestamp?: number | null): string {
  if (!timestamp) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(timestamp * 1000));
}

function formatSessionTime(session: BackendChatSession): string {
  return session.updated_time || session.created_time || "刚刚";
}

function toChatSession(session: BackendChatSession): ChatSession {
  const id = session.id || session.session_id || "";
  const title = session.title || id || "新的仲裁咨询";
  const messages: ChatMessage[] = (session.messages || []).map((message, index) => ({
    id: message.id || `${id}-${index}`,
    role: message.role,
    content: message.content,
    time: formatMessageTime(message.created_at),
  }));

  return {
    id,
    title,
    caseName: title,
    applicant: "当前用户",
    time: formatSessionTime(session),
    messages,
  };
}

export async function listChatSessionsApi(): Promise<ChatSession[]> {
  const response = await getJSON<PageResult<BackendChatSession>>(
    `${CHAT_PREFIX}/list?page_no=1&page_size=50`,
  );
  return (response.data.items || []).map(toChatSession).filter((session) => session.id);
}

export async function createChatSessionApi(title: string): Promise<ChatSession> {
  const response = await postJSON<BackendChatSession>(`${CHAT_PREFIX}/create`, { title });
  return toChatSession(response.data);
}

export async function deleteChatSessionApi(sessionId: string): Promise<void> {
  await deleteJSON<null>(`${CHAT_PREFIX}/delete`, [sessionId]);
}
