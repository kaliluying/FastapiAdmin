<template>
  <div class="fa-full-height">
    <ElSplitter class="main-chat" :lazy="true">
      <ElSplitterPanel
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
      <ElSplitterPanel :min="360" class="chat-split-panel center-panel">
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
            />
          </ElHeader>
          <ElMain class="chat-main">
            <FaChatMessages
              ref="chatMessagesRef"
              :messages="messages"
              :error="error"
              @prompt-click="handleSendMessage"
              @error-close="error = ''"
            />
          </ElMain>
          <ElFooter class="chat-footer">
            <FaChatInput
              :disabled="!isConnected"
              :sending="sending"
              :is-connected="isConnected"
              @send="handleSendMessage"
            />
          </ElFooter>
        </ElContainer>
      </ElSplitterPanel>
      <ElSplitterPanel
        v-model:size="evidencePanelSize"
        :min="200"
        :max="420"
        aria-label="回答依据"
        class="chat-split-panel evidence-panel"
      >
        <FaAiProcessStatus :stage="processStage" />
        <FaCitationList :citations="activeCitations" />
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
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Chat",
  inheritAttrs: false,
});

import { ref, computed, onMounted, onUnmounted } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { ElMessage, ElMessageBox } from "element-plus";
import AiChatAPI, { ChatSession } from "@/api/module_ai/chat";
import KnowledgeAPI, { type KnowledgeBase } from "@/api/module_ai/knowledge";
import AuthAPI from "@/api/module_system/auth";
import type { ChatMessage, UploadedFile } from "./types";
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
const isSidebarCollapsed = ref(false);
const sidebarPanelSize = ref<number | string>(220);
const evidencePanelSize = ref<number | string>(260);
const knowledgeBases = ref<KnowledgeBase[]>([]);
const selectedKnowledgeBaseIds = ref<number[]>([]);

// Refs
const chatMessagesRef = ref<{ scrollToBottom: () => void }>();
const sidebarRef = ref<{ loadSessions: () => void }>();

// 回答依据面板
const activeCitations = ref<{ id: string; title: string; snippet?: string }[]>([]);
const processStage = computed(
  (): "idle" | "retrieving" | "reranking" | "generating" | "complete" | "error" => {
    if (error.value) return "error";
    if (sending.value) return "generating";
    return "idle";
  }
);

// 移动端抽屉
const isMobileDrawerOpen = ref(false);
const isMobileViewport = useMediaQuery("(max-width: 768px)");

// WebSocket
let ws: WebSocket | null = null;
const WS_URL = import.meta.env.VITE_APP_WS_ENDPOINT;

// ============ WebSocket 操作 ============
const connectWebSocket = async () => {
  if (ws?.readyState === WebSocket.OPEN) return;

  connectionStatus.value = "connecting";
  error.value = "";

  try {
    const ticketResponse = await AuthAPI.createWsTicket();
    const ticket = ticketResponse.data.data?.ticket;
    if (!ticket) throw new Error("WebSocket 认证凭证缺失");
    const url = new URL("/api/v1/ai/chat/ws", WS_URL);
    url.searchParams.append("ticket", ticket);

    ws = new WebSocket(url.toString());

    ws.onopen = () => {
      isConnected.value = true;
      connectionStatus.value = "connected";
      ElMessage.success("连接成功");
    };

    ws.onmessage = (event) => handleWebSocketMessage(event.data);

    ws.onclose = () => {
      isConnected.value = false;
      connectionStatus.value = "disconnected";
      finishLoadingMessages();
    };

    ws.onerror = () => {
      isConnected.value = false;
      connectionStatus.value = "disconnected";
      ElMessage.error("连接失败，请检查服务器状态");
      finishLoadingMessages();
    };
  } catch {
    connectionStatus.value = "disconnected";
    error.value = "无法创建连接";
  }
};

const disconnectWebSocket = () => {
  if (ws) {
    ws.close(1000, "用户主动断开");
    ws = null;
  }
  isConnected.value = false;
  connectionStatus.value = "disconnected";
  finishLoadingMessages();
};

const toggleConnection = () => {
  if (isConnected.value) {
    disconnectWebSocket();
    ElMessage.info("已断开连接");
  } else {
    connectWebSocket();
  }
};

// ============ 消息处理 ============
const handleWebSocketMessage = (data: string) => {
  const lastMessage = messages.value[messages.value.length - 1];
  const content = data || "";

  if (lastMessage?.type === "assistant" && lastMessage.loading) {
    lastMessage.content += content;
  } else {
    addMessage("assistant", content);
  }

  chatMessagesRef.value?.scrollToBottom();
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

const finishLoadingMessages = () => {
  messages.value.forEach((msg) => {
    if (msg.type === "assistant" && msg.loading) {
      msg.loading = false;
    }
  });
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
};

// ============ 发送消息 ============
const handleSendMessage = async (message: string, files?: UploadedFile[]) => {
  if ((!message && !files) || !isConnected.value || sending.value) return;

  // 结束上一个加载中的消息
  finishLoadingMessages();

  // 创建新会话（如果没有）
  if (!currentSessionId.value) {
    const success = await createNewSession(message);
    if (!success) return;
  }

  // 添加用户消息
  addMessage("user", message, files);

  // 添加加载中的助手消息
  messages.value.push({
    id: generateId(),
    type: "assistant",
    content: "",
    timestamp: Date.now(),
    loading: true,
    thinkingCollapsed: true,
  });

  sending.value = true;
  chatMessagesRef.value?.scrollToBottom();

  try {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          message,
          session_id: currentSessionId.value,
          knowledge_base_ids: selectedKnowledgeBaseIds.value,
          files: files?.map((f) => ({ name: f.name, type: f.type, size: f.size })),
        })
      );
    } else {
      throw new Error("WebSocket 连接未建立");
    }
  } catch {
    messages.value.pop();
    error.value = "发送消息失败，请检查连接状态";
  } finally {
    sending.value = false;
  }
};

const createNewSession = async (firstMessage: string): Promise<boolean> => {
  try {
    const title = firstMessage.slice(0, 20) + (firstMessage.length > 20 ? "..." : "");
    const res = await AiChatAPI.createSession({ title });

    if (res.data?.code === 0 || res.data?.success) {
      currentSessionId.value = res.data.data?.id ?? null;
      sidebarRef.value?.loadSessions();
      return true;
    }
    throw new Error("创建会话失败");
  } catch {
    return false;
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

  try {
    const response = await AiChatAPI.getSessionDetail(sessionId);
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
        }
      });
    });

    ElMessage.success(`已切换到会话：${session.title}`);
  } catch {
    ElMessage.error("获取会话详情失败");
  }
};

const handleNewSession = () => {
  currentSessionId.value = null;
  messages.value = [];
  ElMessage.success("已开启新对话");
};

const handleDeleteSession = (sessionId: string) => {
  if (currentSessionId.value !== sessionId) return;

  currentSessionId.value = null;
  messages.value = [];
  finishLoadingMessages();
};

const handleClearChat = async () => {
  try {
    await ElMessageBox.confirm("确定要清空当前对话吗？此操作不可恢复。", "确认清空", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
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
</script>

<style lang="scss" scoped>
.main-chat {
  height: 100%;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 55% 0%,
      color-mix(in srgb, var(--theme-color) 10%, transparent),
      transparent 32%
    ),
    var(--default-box-color);
  border: 1px solid var(--fa-card-border);
  border-radius: 8px;
  box-shadow: var(--fa-panel-shadow);

  .chat-split-panel {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    background: transparent;
  }

  .sidebar-panel {
    transition: flex-basis 0.25s ease;

    :deep(.sidebar) {
      min-width: 0;
    }

    &.collapsed {
      :deep(.sidebar) {
        overflow: hidden;
      }
    }
  }

  .center-panel {
    display: flex;
    flex-direction: column;
    min-width: 0;
    background: transparent;
  }

  .chat-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }

  .chat-header {
    height: auto;
    padding: 0;
    background: color-mix(in srgb, var(--default-box-color) 78%, transparent);
    border-bottom: 1px solid var(--fa-card-border);
    backdrop-filter: blur(10px);
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
    background: color-mix(in srgb, var(--default-box-color) 88%, transparent);
    border-top: 1px solid var(--fa-card-border);
  }

  .evidence-panel {
    padding: 12px;
    overflow-y: auto;
    background: color-mix(in srgb, var(--default-box-color) 60%, transparent);
  }

  :deep(.el-splitter-bar__dragger) {
    border-radius: 3px;
    transition: background-color 0.2s ease;
  }

  :deep(.el-splitter-bar__dragger:hover:not(.is-disabled)),
  :deep(.el-splitter-bar__dragger-active) {
    background: color-mix(in srgb, var(--theme-color) 12%, transparent);
  }

  @media (width <= 1024px) {
    .evidence-panel {
      display: none;
    }
  }

  @media (width <= 768px) {
    .sidebar-panel {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sidebar-panel,
    :deep(.el-splitter-bar__dragger) {
      transition: none;
    }
  }
}
</style>
