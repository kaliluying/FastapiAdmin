<template>
  <div
    ref="chatWorkspaceRef"
    class="fa-full-height chat-workspace"
    :style="isCompactViewport ? { height: compactChatHeight } : undefined"
  >
    <ElSplitter class="main-chat" :lazy="true">
      <ElSplitterPanel
        v-if="!isMobileViewport"
        v-model:size="sidebarPanelSize"
        :min="64"
        :max="400"
        aria-label="会话列表"
        class="chat-split-panel sidebar-panel"
        :class="{ collapsed: isSidebarCollapsed }"
      >
        <FaSidebar
          ref="sidebarRef"
          :current-session-id="currentSessionId"
          :is-collapsed="isSidebarCollapsed"
          @select-session="handleSelectSession"
          @new-session="handleNewSession"
          @delete-session="handleDeleteSession"
        />
      </ElSplitterPanel>
      <ElSplitterPanel :min="isMobileViewport ? 0 : 360" class="chat-split-panel center-panel">
        <ElContainer aria-label="对话内容" class="chat-container">
          <ElHeader class="chat-header">
            <FaChatNavbar
              :connection-status="connectionStatus"
              :is-connected="isConnected"
              :message-count="messages.length"
              :is-sidebar-collapsed="isSidebarCollapsed"
              :knowledge-bases="knowledgeBases"
              v-model:knowledge-base-ids="selectedKnowledgeBaseIds"
              @clear-chat="handleClearChat"
              @toggle-connection="toggleConnection"
              @toggle-sidebar="toggleSidebar"
              @show-evidence="isEvidenceDrawerOpen = true"
            />
          </ElHeader>
          <ElMain class="chat-main">
            <FaChatMessages
              ref="chatMessagesRef"
              :messages="messages"
              :error="error"
              @prompt-click="handleSendMessage"
              @error-close="error = ''"
              @retry="retryMessage"
              @show-citations="showCitations"
            />
          </ElMain>
          <ElFooter class="chat-footer">
            <FaChatInput
              ref="chatInputRef"
              :disabled="!isConnected || switchingSession"
              :sending="sending"
              :is-connected="isConnected"
              @send="handleSendMessage"
              @stop="stopGeneration"
            />
          </ElFooter>
        </ElContainer>
      </ElSplitterPanel>
      <ElSplitterPanel
        v-if="!isCompactViewport"
        v-model:size="evidencePanelSize"
        :min="200"
        :max="420"
        aria-label="回答依据"
        class="chat-split-panel evidence-panel"
      >
        <FaAiProcessStatus :stage="processStage" />
        <FaCitationList :citations="activeCitations" @select="selectedCitation = $event" />
      </ElSplitterPanel>
    </ElSplitter>
    <!-- 移动端会话抽屉（≤768px 时使用） -->
    <ElDrawer v-model="isMobileDrawerOpen" title="会话列表" direction="ltr" size="260px">
      <FaSidebar
        :current-session-id="currentSessionId"
        :is-collapsed="false"
        @select-session="handleSelectSession"
        @new-session="handleNewSession"
        @delete-session="handleDeleteSession"
      />
    </ElDrawer>
    <ElDrawer v-model="isEvidenceDrawerOpen" title="回答依据" size="min(90vw, 380px)">
      <FaAiProcessStatus :stage="processStage" />
      <FaCitationList :citations="activeCitations" @select="selectedCitation = $event" />
    </ElDrawer>
    <ElDialog
      :model-value="!!selectedCitation"
      title="引用片段"
      width="min(90vw, 640px)"
      @close="selectedCitation = null"
    >
      <h3>{{ selectedCitation?.title }}</h3>
      <p class="citation-preview">{{ selectedCitation?.snippet || "暂无片段" }}</p>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Chat",
  inheritAttrs: false,
});

import { ref, computed, onMounted, onUnmounted, onActivated, onDeactivated } from "vue";
import { useElementBounding, useMediaQuery, useWindowSize } from "@vueuse/core";
import { ElMessage, ElMessageBox } from "element-plus";
import AiChatAPI, { ChatSession } from "@/api/module_ai/chat";
import KnowledgeAPI, { type KnowledgeBase } from "@/api/module_ai/knowledge";
import AuthAPI from "@/api/module_system/auth";
import type { ChatMessage, ChatCitation, UploadedFile } from "./types";
import FaSidebar from "./components/FaSidebar.vue";
import FaChatNavbar from "./components/FaChatNavbar.vue";
import FaChatMessages from "./components/FaChatMessages.vue";
import FaChatInput from "./components/FaChatInput.vue";
import FaAiProcessStatus from "@/views/module_ai/components/FaAiProcessStatus.vue";
import FaCitationList from "@/views/module_ai/components/FaCitationList.vue";

// 状态
const messages = ref<ChatMessage[]>([]);
const sending = ref(false);
const isConnected = ref(false);
const connectionStatus = ref<"connected" | "connecting" | "disconnected">("disconnected");
const error = ref("");
const currentSessionId = ref<string | null>(null);
const switchingSession = ref(false);
const isSidebarCollapsed = ref(false);
const sidebarPanelSize = ref<number | string>(220);
const evidencePanelSize = ref<number | string>(260);
const knowledgeBases = ref<KnowledgeBase[]>([]);
const selectedKnowledgeBaseIds = ref<number[]>([]);

// Refs
const chatMessagesRef = ref<{ scrollToBottom: () => void }>();
const sidebarRef = ref<{ loadSessions: () => void }>();
const chatInputRef = ref<{ clearDraft: () => void }>();

// 回答依据面板
const evidenceMessageId = ref<string | null>(null);
const activeCitations = computed(
  () => messages.value.find((message) => message.id === evidenceMessageId.value)?.citations || []
);
const selectedCitation = ref<ChatCitation | null>(null);
const isEvidenceDrawerOpen = ref(false);
const processStage = ref<"idle" | "retrieving" | "generating" | "complete" | "error">("idle");
const isCompactViewport = useMediaQuery("(max-width: 1024px)");
const chatWorkspaceRef = ref<HTMLElement>();
const { top: chatTop } = useElementBounding(chatWorkspaceRef);
const { height: viewportHeight } = useWindowSize();
const compactChatHeight = computed(
  () => `${Math.max(280, viewportHeight.value - Math.max(0, chatTop.value) - 12)}px`
);
let activeRequest: { id: string; messageId: string } | null = null;
let sendGeneration = 0;
let selectionGeneration = 0;

// 移动端抽屉
const isMobileDrawerOpen = ref(false);
const isMobileViewport = useMediaQuery("(max-width: 768px)");

// WebSocket
let ws: WebSocket | null = null;
const WS_URL = import.meta.env.VITE_APP_WS_ENDPOINT;
let connectionGeneration = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
let reconnectAttempts = 0;
let allowReconnect = true;

const scheduleReconnect = () => {
  if (!allowReconnect || reconnectTimer || reconnectAttempts >= 3) return;
  reconnectTimer = setTimeout(
    () => {
      reconnectTimer = undefined;
      void connectWebSocket();
    },
    1000 * 2 ** reconnectAttempts++
  );
};

// ============ WebSocket 操作 ============
const connectWebSocket = async () => {
  // CONNECTING / OPEN / CLOSING 期间一律拒绝重入，避免握手期间覆盖旧连接引用。
  if (connectionStatus.value === "connecting" || (ws && ws.readyState !== WebSocket.CLOSED)) return;

  const generation = ++connectionGeneration;

  connectionStatus.value = "connecting";
  error.value = "";

  try {
    const ticketResponse = await AuthAPI.createWsTicket();
    const ticket = ticketResponse.data.data?.ticket;
    if (!ticket) throw new Error("WebSocket 认证凭证缺失");
    const url = new URL("/api/v1/ai/chat/ws", WS_URL);
    url.searchParams.append("ticket", ticket);

    if (generation !== connectionGeneration) return;

    const socket = new WebSocket(url.toString());
    ws = socket;

    socket.onopen = () => {
      if (ws !== socket) return;
      isConnected.value = true;
      connectionStatus.value = "connected";
      reconnectAttempts = 0;
      error.value = "";
    };

    socket.onmessage = (event) => {
      if (ws === socket) handleWebSocketMessage(event.data);
    };

    socket.onclose = () => {
      if (ws !== socket) return;
      ws = null;
      isConnected.value = false;
      connectionStatus.value = "disconnected";
      failCurrentRequest("连接中断，回答未确认保存，请重试这条问题");
      scheduleReconnect();
    };

    socket.onerror = () => {
      if (ws !== socket) return;
      isConnected.value = false;
      connectionStatus.value = "disconnected";
      error.value = "连接失败，请检查服务器状态或重新连接";
      failCurrentRequest(error.value);
    };
  } catch {
    if (generation !== connectionGeneration) return;
    connectionStatus.value = "disconnected";
    error.value = "无法创建连接";
    scheduleReconnect();
  }
};

const disconnectWebSocket = () => {
  allowReconnect = false;
  clearTimeout(reconnectTimer);
  reconnectTimer = undefined;
  stopGeneration();
  connectionGeneration += 1;
  if (ws) {
    const socket = ws;
    ws = null;
    // 先摘除回调，避免关闭竞态再次修改状态或弹出提示。
    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;
    socket.close(1000, "用户主动断开");
  }
  isConnected.value = false;
  connectionStatus.value = "disconnected";
};

const toggleConnection = () => {
  if (isConnected.value) {
    disconnectWebSocket();
    ElMessage.info("已断开连接");
  } else {
    allowReconnect = true;
    reconnectAttempts = 0;
    connectWebSocket();
  }
};

// ============ 消息处理 ============
const handleWebSocketMessage = (data: string) => {
  let event;
  try {
    event = JSON.parse(data);
  } catch {
    return;
  }
  if (!activeRequest || event.request_id !== activeRequest.id) return;
  const message = messages.value.find((item) => item.id === activeRequest?.messageId);
  if (!message) return;
  if (event.type === "stage" && ["retrieving", "generating"].includes(event.stage))
    processStage.value = event.stage;
  if (event.type === "citations")
    message.citations = Array.isArray(event.citations) ? event.citations : [];
  if (event.type === "chunk" && typeof event.content === "string") message.content += event.content;
  if (event.type === "error") failCurrentRequest(event.message || "生成失败，请重试");
  if (event.type === "done" || event.type === "cancelled") {
    message.loading = false;
    message.stopped = event.type === "cancelled";
    sending.value = false;
    activeRequest = null;
    processStage.value = event.type === "done" ? "complete" : "idle";
    if (event.type === "done") sidebarRef.value?.loadSessions();
  }
  chatMessagesRef.value?.scrollToBottom();
};

const failCurrentRequest = (reason: string) => {
  sendGeneration += 1;
  const message = messages.value.find((item) => item.id === activeRequest?.messageId);
  if (message) {
    message.loading = false;
    message.error = reason;
  }
  activeRequest = null;
  sending.value = false;
  processStage.value = "error";
  error.value = reason;
};

const stopGeneration = () => {
  sendGeneration += 1;
  if (activeRequest) {
    if (ws?.readyState === WebSocket.OPEN)
      ws.send(JSON.stringify({ type: "cancel", request_id: activeRequest.id }));
    const message = messages.value.find((item) => item.id === activeRequest?.messageId);
    if (message) {
      message.loading = false;
      message.stopped = true;
    }
  }
  activeRequest = null;
  sending.value = false;
  processStage.value = "idle";
};

const showCitations = (messageId: string) => {
  evidenceMessageId.value = messageId;
  if (isCompactViewport.value) isEvidenceDrawerOpen.value = true;
};

const retryMessage = (messageId: string) => {
  const request = messages.value.find((item) => item.id === messageId)?.request;
  if (request)
    void handleSendMessage(request.message, request.files, request.knowledgeBaseIds, false);
};

const addMessage = (type: "user" | "assistant", content: string, files?: UploadedFile[]) => {
  messages.value.push({
    id: generateId(),
    type,
    content,
    timestamp: Date.now(),
    thinkingCollapsed: type === "assistant",
    files,
  });
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
};

// ============ 发送消息 ============
const handleSendMessage = async (
  message: string,
  files?: UploadedFile[],
  baseIds = selectedKnowledgeBaseIds.value,
  clearInput = true
) => {
  if (
    (!message.trim() && !files?.length) ||
    !isConnected.value ||
    switchingSession.value ||
    sending.value ||
    files?.some((file) => file.status !== "ready")
  )
    return;
  sending.value = true;
  error.value = "";
  const generation = ++sendGeneration;
  const knowledgeBaseIds = [...baseIds];
  const question = message.trim() || "请根据附件内容回答。";
  try {
    if (!currentSessionId.value) {
      const response = await AiChatAPI.createSession({ title: question.slice(0, 20) });
      if (generation !== sendGeneration) return;
      if (!isSuccessResponse(response.data) || !response.data.data?.id)
        throw new Error("创建会话失败");
      currentSessionId.value = response.data.data.id;
      sidebarRef.value?.loadSessions();
    }
    if (generation !== sendGeneration) return;
    if (ws?.readyState !== WebSocket.OPEN) throw new Error("连接已断开");
    const requestId = generateId();
    const assistantId = generateId();
    addMessage("user", question, files);
    messages.value.push({
      id: assistantId,
      type: "assistant",
      content: "",
      timestamp: Date.now(),
      loading: true,
      thinkingCollapsed: true,
      citations: [],
      request: { message: question, files, knowledgeBaseIds },
    });
    activeRequest = { id: requestId, messageId: assistantId };
    evidenceMessageId.value = assistantId;
    processStage.value = "retrieving";
    ws.send(
      JSON.stringify({
        request_id: requestId,
        message: question,
        session_id: currentSessionId.value,
        knowledge_base_ids: knowledgeBaseIds,
        files: files?.map((file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
          content: file.content,
        })),
      })
    );
    if (clearInput) chatInputRef.value?.clearDraft();
    chatMessagesRef.value?.scrollToBottom();
  } catch {
    if (generation === sendGeneration) failCurrentRequest("发送失败，草稿已保留，请检查连接后重试");
  }
};

const isSuccessResponse = (responseData?: ApiResponse<unknown>) =>
  responseData?.success === true || responseData?.code === 0 || responseData?.code === 200;

// ============ 会话操作 ============
const handleSelectSession = async (session: ChatSession) => {
  const sessionId = session.id || session.session_id;
  if (!sessionId) {
    ElMessage.error("会话 ID 缺失，无法切换");
    return;
  }
  stopGeneration();
  const generation = ++selectionGeneration;
  switchingSession.value = true;
  try {
    const response = await AiChatAPI.getSessionDetail(sessionId);
    if (generation !== selectionGeneration) return;
    const responseData = response.data;
    if (!isSuccessResponse(responseData)) {
      ElMessage.error(responseData?.msg || "获取会话详情失败");
      return;
    }

    currentSessionId.value = sessionId;
    messages.value = [];

    const sessionData = responseData.data || {};
    const runs = sessionData.runs || [];

    runs.forEach((run: any) => {
      const runMessages = run.messages || [];
      runMessages.forEach((msg: any) => {
        if (msg.role === "user" || msg.role === "assistant") {
          addMessage(msg.role, msg.content);
          const restored = messages.value[messages.value.length - 1];
          if (restored) {
            restored.citations = msg.citations || [];
            if (msg.role === "assistant") evidenceMessageId.value = restored.id;
          }
        }
      });
    });

    ElMessage.success(`已切换到会话：${session.title}`);
  } catch {
    if (generation === selectionGeneration) ElMessage.error("获取会话详情失败");
  } finally {
    if (generation === selectionGeneration) switchingSession.value = false;
  }
};

const handleNewSession = () => {
  stopGeneration();
  selectionGeneration += 1;
  switchingSession.value = false;
  error.value = "";
  selectedCitation.value = null;
  currentSessionId.value = null;
  messages.value = [];
  ElMessage.success("已开启新对话");
};

const handleDeleteSession = (sessionId: string) => {
  if (currentSessionId.value !== sessionId) return;

  handleNewSession();
};

const handleClearChat = async () => {
  try {
    await ElMessageBox.confirm("清空当前显示？已保存的会话历史不会删除。", "确认清空", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    stopGeneration();
    selectionGeneration += 1;
    switchingSession.value = false;
    messages.value = [];
    ElMessage.success("对话已清空");
  } catch {
    ElMessage.info("已取消清空对话");
  }
};

const toggleSidebar = () => {
  if (isMobileViewport.value) {
    isMobileDrawerOpen.value = true;
    return;
  }

  isSidebarCollapsed.value = !isSidebarCollapsed.value;
  sidebarPanelSize.value = isSidebarCollapsed.value ? 64 : 220;
};

// ============ 生命周期 ============
const loadKnowledgeBases = async () => {
  try {
    const res = await KnowledgeAPI.optionselect();
    knowledgeBases.value = (res.data?.data || []).filter((item) => item.id != null);
  } catch {
    knowledgeBases.value = [];
  }
};

onMounted(() => {
  loadKnowledgeBases();
  connectWebSocket();
});
onUnmounted(disconnectWebSocket);
// KeepAlive 缓存切换：离开视图即断开，回到视图按需重连。
onActivated(() => {
  allowReconnect = true;
  if (!isConnected.value) connectWebSocket();
});
onDeactivated(disconnectWebSocket);
</script>

<style lang="scss" scoped>
.chat-workspace {
  flex: 1;
  min-height: 0;
}

.citation-preview {
  line-height: 1.7;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.main-chat {
  height: 100%;
  overflow: hidden;
  background: var(--fa-color-surface);
  border: 1px solid var(--fa-card-border);
  border-radius: 10px;
  box-shadow: none;

  :deep(.chat-split-panel) {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    background: transparent;
  }

  :deep(.sidebar-panel) {
    transition: flex-basis 0.25s ease;

    .sidebar {
      min-width: 0;
    }

    &.collapsed {
      .sidebar {
        overflow: hidden;
      }
    }
  }

  :deep(.center-panel) {
    display: flex;
    flex-direction: column;
    min-width: 0;
    background: transparent;
  }

  .chat-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .chat-header {
    height: auto;
    padding: 0;
    background: var(--fa-color-surface);
    border-bottom: 1px solid var(--fa-card-border);
  }

  .chat-main {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .chat-footer {
    height: auto;
    min-height: 80px;
    padding: 0;
    background: var(--fa-color-surface);
    border-top: 1px solid var(--fa-card-border);
  }

  :deep(.evidence-panel) {
    padding: 12px;
    overflow-y: auto;
    background: var(--fa-color-canvas);
  }

  :deep(.el-splitter-bar__dragger) {
    border-radius: 3px;
    transition: background-color 0.2s ease;
  }

  :deep(.el-splitter-bar__dragger:hover:not(.is-disabled)),
  :deep(.el-splitter-bar__dragger-active) {
    background: color-mix(in srgb, var(--theme-color) 12%, transparent);
  }

  @media (prefers-reduced-motion: reduce) {
    :deep(.sidebar-panel),
    :deep(.el-splitter-bar__dragger) {
      transition: none;
    }
  }
}
</style>
