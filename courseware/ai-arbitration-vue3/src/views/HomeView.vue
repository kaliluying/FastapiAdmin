<template>
  <div class="app-shell">
    <TopBar v-model="activeModule" :connection-status="connectionStatus" />

    <main class="workspace">
      <HistoryPanel
        :sessions="sessions"
        :active-session-id="activeSessionId"
        @new-session="createSession"
        @select-session="selectSession"
        @delete-session="deleteSession"
      />
      <MainPanel
        :active-module="activeModule"
        :active-session="activeSession"
        :active-session-id="activeSessionId"
        :messages="messages"
        :connection-status="connectionStatus"
        :sending="sending"
        :error-message="errorMessage"
        @clear-chat="clearChat"
        @send-message="sendMessage"
        @switch-module="activeModule = $event"
      />
      <RightRail
        :active-session-id="activeSessionId"
        @switch-module="activeModule = $event"
      />
    </main>

    <StatusFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  buildChatSocketUrl,
  getStoredAccessToken,
  serializeChatPayload,
} from "../api/chatSocket";
import {
  createChatSessionApi,
  deleteChatSessionApi,
  listChatSessionsApi,
} from "../api/chatSessionApi";
import { removeToken } from "../api/request";
import { chatSessions, type ChatMessage, type ChatSession, type ModuleKey } from "../data/mock";
import HistoryPanel from "../components/HistoryPanel.vue";
import MainPanel from "../components/MainPanel.vue";
import RightRail from "../components/RightRail.vue";
import StatusFooter from "../components/StatusFooter.vue";
import TopBar from "../components/TopBar.vue";

const router = useRouter();
const activeModule = ref<ModuleKey>("consult");
const emptySession: ChatSession = {
  id: "",
  title: "新的仲裁咨询",
  caseName: "待补充案件信息",
  applicant: "未填写",
  time: "-",
  messages: [],
};
const sessions = ref<ChatSession[]>(
  chatSessions.map((session) => ({
    ...session,
    messages: session.messages.map((message) => ({ ...message })),
  })),
);
const storedSessionId = localStorage.getItem("active_session_id");
const activeSessionId = ref(
  sessions.value.some((session) => session.id === storedSessionId)
    ? storedSessionId || ""
    : sessions.value[0]?.id || "",
);
const connectionStatus = ref<"connecting" | "connected" | "disconnected">("disconnected");
const sending = ref(false);
const errorMessage = ref("");
const knowledgeBaseIds = ref<number[]>([]);
const sessionLoading = ref(false);

let socket: WebSocket | null = null;
let streamIdleTimer: number | undefined;
let connectingPromise: Promise<void> | null = null;
let creatingSessionPromise: Promise<ChatSession> | null = null;
let activeStreamTarget: { sessionId: string; messageId: string } | null = null;

const buildCurrentSocketUrl = () => {
  return buildChatSocketUrl({
    endpoint: import.meta.env.VITE_APP_WS_ENDPOINT || "ws://127.0.0.1:8004",
    token: getStoredAccessToken(),
  });
};

const nowLabel = () => {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
};

const generateId = () => {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

const activeSession = computed(() => {
  return sessions.value.find((session) => session.id === activeSessionId.value) || sessions.value[0] || emptySession;
});

const messages = computed(() => activeSession.value?.messages || []);

const findSession = (sessionId: string) => {
  return sessions.value.find((session) => session.id === sessionId);
};

const findMessage = (sessionId: string, messageId: string) => {
  return findSession(sessionId)?.messages.find((message) => message.id === messageId);
};

const getStreamAssistant = () => {
  if (!activeStreamTarget) return null;
  const message = findMessage(activeStreamTarget.sessionId, activeStreamTarget.messageId);
  return message?.role === "assistant" ? message : null;
};

const finishStreamingSoon = (target = activeStreamTarget) => {
  if (!target) return;

  window.clearTimeout(streamIdleTimer);
  streamIdleTimer = window.setTimeout(() => {
    const assistant = findMessage(target.sessionId, target.messageId);
    if (assistant?.loading) {
      assistant.loading = false;
    }
  }, 900);
};

const finishStreamingNow = (target?: { sessionId: string; messageId: string }) => {
  window.clearTimeout(streamIdleTimer);
  if (target) {
    const assistant = findMessage(target.sessionId, target.messageId);
    if (assistant?.role === "assistant") {
      assistant.loading = false;
    }
    if (
      activeStreamTarget?.sessionId === target.sessionId &&
      activeStreamTarget.messageId === target.messageId
    ) {
      activeStreamTarget = null;
    }
    return;
  }

  sessions.value.forEach((session) => {
    session.messages.forEach((message) => {
      if (message.role === "assistant") {
        message.loading = false;
      }
    });
  });
  activeStreamTarget = null;
};

const selectSession = (sessionId: string) => {
  activeSessionId.value = sessionId;
  errorMessage.value = "";
};

const upsertSession = (session: ChatSession) => {
  const index = sessions.value.findIndex((item) => item.id === session.id);
  if (index >= 0) {
    sessions.value[index] = session;
    return session;
  }

  sessions.value.unshift(session);
  activeSessionId.value = session.id;
  return session;
};

const createSession = async () => {
  if (creatingSessionPromise) return creatingSessionPromise;

  creatingSessionPromise = createChatSessionApi("新的仲裁咨询")
    .then((session) => {
      upsertSession(session);
      activeModule.value = "consult";
      errorMessage.value = "";
      return session;
    })
    .finally(() => {
      creatingSessionPromise = null;
    });

  return creatingSessionPromise;
};

watch(
  activeSessionId,
  (sessionId) => {
    if (sessionId) {
      localStorage.setItem("active_session_id", sessionId);
    }
  },
  { immediate: true },
);

const touchActiveSession = (title?: string) => {
  const session = activeSession.value;
  if (!session) return;

  session.time = "刚刚";
  if (title && session.title === "新的仲裁咨询") {
    session.title = title.length > 18 ? `${title.slice(0, 18)}...` : title;
    session.caseName = session.title;
  }
};

const connectSocket = () => {
  if (socket?.readyState === WebSocket.OPEN) return Promise.resolve();
  if (connectingPromise) return connectingPromise;

  connectionStatus.value = "connecting";
  errorMessage.value = "";

  connectingPromise = new Promise((resolve, reject) => {
    const token = getStoredAccessToken();
    if (!token) {
      connectionStatus.value = "disconnected";
      errorMessage.value = "登录已失效，请重新登录后再使用 AI 聊天。";
      connectingPromise = null;
      router.replace("/login");
      reject(new Error("未登录"));
      return;
    }

    socket = new WebSocket(buildCurrentSocketUrl());

    socket.onopen = () => {
      connectionStatus.value = "connected";
      errorMessage.value = "";
      connectingPromise = null;
      resolve();
    };

    socket.onmessage = (event) => {
      const chunk = String(event.data || "");
      if (!chunk) return;

      const assistant = getStreamAssistant();
      if (assistant) {
        assistant.content += chunk;
        assistant.loading = true;
      } else {
        return;
      }
      finishStreamingSoon();
    };

    socket.onerror = () => {
      connectionStatus.value = "disconnected";
      errorMessage.value = "WebSocket 连接失败，请确认后端服务已启动。";
      finishStreamingNow();
      connectingPromise = null;
      reject(new Error("WebSocket 连接失败"));
    };

    socket.onclose = (event) => {
      connectionStatus.value = "disconnected";
      finishStreamingNow();
      connectingPromise = null;
      if (event.code === 1008) {
        removeToken();
        errorMessage.value = "登录已失效，请重新登录后再使用 AI 聊天。";
        router.replace("/login");
      }
    };
  });

  return connectingPromise;
};

async function ensureActiveSession(): Promise<ChatSession> {
  const existing = findSession(activeSessionId.value);
  if (existing) return existing;
  return await createSession();
}

const sendMessage = async (content: string) => {
  const message = content.trim();
  if (!message || sending.value) return;

  if (activeModule.value !== "consult") {
    activeModule.value = "consult";
  }

  finishStreamingNow();
  errorMessage.value = "";
  sending.value = true;

  const userMessage: ChatMessage = {
    id: generateId(),
    role: "user",
    content: message,
    time: nowLabel(),
  };
  const assistantMessage: ChatMessage = {
    id: generateId(),
    role: "assistant",
    content: "",
    time: nowLabel(),
    loading: true,
  };

  let outgoingSessionId = activeSessionId.value;
  try {
    outgoingSessionId = (await ensureActiveSession()).id;
  } catch (error: unknown) {
    sending.value = false;
    errorMessage.value = error instanceof Error ? error.message : "创建会话失败";
    return;
  }
  findSession(outgoingSessionId)?.messages.push(userMessage, assistantMessage);
  activeStreamTarget = { sessionId: outgoingSessionId, messageId: assistantMessage.id };
  touchActiveSession(message);

  try {
    await connectSocket();
    const activeSocket = socket;
    if (!activeSocket || activeSocket.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket 连接未建立");
    }

    activeSocket.send(
      serializeChatPayload({
        message,
        sessionId: outgoingSessionId,
        knowledgeBaseIds: knowledgeBaseIds.value,
      }),
    );
  } catch {
    const assistant = findMessage(outgoingSessionId, assistantMessage.id);
    if (assistant) {
      assistant.loading = false;
      assistant.error = true;
      assistant.content = "发送失败，请检查 WebSocket 连接状态。";
    }
    errorMessage.value = "发送消息失败，请检查连接状态。";
  } finally {
    sending.value = false;
  }
};

const clearChat = () => {
  const currentSessionId = activeSessionId.value;
  if (activeStreamTarget?.sessionId === currentSessionId) {
    finishStreamingNow(activeStreamTarget);
  }
  if (activeSession.value) {
    activeSession.value.messages = [];
  }
};

const deleteSession = async (sessionId: string) => {
  if (!sessionId) return;

  const deletingActiveSession = activeSessionId.value === sessionId;
  if (activeStreamTarget?.sessionId === sessionId) {
    finishStreamingNow(activeStreamTarget);
  }

  try {
    await deleteChatSessionApi(sessionId);
    const nextSessions = sessions.value.filter((session) => session.id !== sessionId);
    sessions.value = nextSessions;

    if (deletingActiveSession) {
      activeSessionId.value = nextSessions[0]?.id || "";
      errorMessage.value = "";
      if (!activeSessionId.value) {
        localStorage.removeItem("active_session_id");
        await createSession();
      }
    }
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : "删除会话失败";
  }
};

async function loadSessions() {
  sessionLoading.value = true;
  try {
    sessions.value = await listChatSessionsApi();
    const stored = localStorage.getItem("active_session_id");
    activeSessionId.value =
      sessions.value.find((session) => session.id === stored)?.id ||
      sessions.value[0]?.id ||
      "";
    if (!activeSessionId.value) {
      await createSession();
    }
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : "加载会话失败";
  } finally {
    sessionLoading.value = false;
  }
}

onMounted(async () => {
  await loadSessions();
  await connectSocket();
});

onUnmounted(() => {
  window.clearTimeout(streamIdleTimer);
  socket?.close(1000, "leave page");
});
</script>
