<template>
  <div class="sidebar" :class="{ collapsed: props.isCollapsed }">
    <div class="sidebar-header">
      <div class="logo-section">
        <ElIcon class="logo-icon" :size="28"><ChatDotRound /></ElIcon>
        <span v-if="!props.isCollapsed" class="project-name">会话列表</span>
      </div>
    </div>

    <ElScrollbar class="sidebar-content" view-class="p-4">
      <template v-if="!props.isCollapsed">
        <div class="new-session-section">
          <ElButton type="primary" class="new-session-btn" @click="handleNewSession">
            <ElIcon class="btn-icon"><Plus /></ElIcon>
            <span>开启新对话</span>
          </ElButton>
        </div>

        <div class="history-section">
          <div class="search-section">
            <ElInput
              v-model="searchQuery"
              placeholder="搜索会话历史"
              aria-label="搜索会话历史"
              :prefix-icon="Search"
              clearable
              @input="handleSearch"
            />
          </div>
          <div class="history-groups">
            <div v-for="group in groupedSessions" :key="group.title" class="history-group">
              <button
                type="button"
                class="group-title"
                :aria-expanded="!collapsedGroups.has(group.title)"
                @click="toggleGroup(group.title)"
              >
                <span>{{ group.title }}</span>
                <ElIcon
                  class="collapse-icon"
                  :class="{ collapsed: collapsedGroups.has(group.title) }"
                >
                  <ArrowDown />
                </ElIcon>
              </button>
              <div v-show="!collapsedGroups.has(group.title)" class="session-list">
                <div
                  v-for="session in group.sessions"
                  :key="session.id"
                  class="session-item"
                  :class="{ active: props.currentSessionId === session.id }"
                >
                  <button
                    type="button"
                    class="session-select"
                    :aria-current="props.currentSessionId === session.id ? 'true' : undefined"
                    @click="handleSelectSession(session)"
                  >
                    <ElIcon class="session-icon"><ChatLineRound /></ElIcon>
                    <span class="session-title">
                      {{ session.title || session.session_data?.session_name || "未命名会话" }}
                    </span>
                  </button>
                  <ElDropdown
                    trigger="click"
                    @command="(cmd) => handleSessionCommand(cmd, session)"
                  >
                    <button
                      type="button"
                      class="session-more"
                      :aria-label="`会话操作：${session.title || '未命名会话'}`"
                      @click.stop
                    >
                      <ElIcon class="more-icon"><MoreFilled /></ElIcon>
                    </button>
                    <template #dropdown>
                      <ElDropdownMenu>
                        <ElDropdownItem command="rename">重命名</ElDropdownItem>
                        <ElDropdownItem command="delete" divided>删除</ElDropdownItem>
                      </ElDropdownMenu>
                    </template>
                  </ElDropdown>
                </div>
              </div>
            </div>
            <FaAsyncState
              v-if="loadError"
              state="error"
              title="会话列表加载失败"
              description="当前对话不受影响，请重试加载历史。"
            >
              <template #action
                ><ElButton :loading="loading" @click="loadSessions">重试</ElButton></template
              >
            </FaAsyncState>
            <div v-else-if="!loading && filteredSessions.length === 0" class="empty-state">
              <ElEmpty
                :description="searchQuery ? '没有匹配的会话' : '暂无会话，开始一次提问吧'"
                :image-size="48"
              />
            </div>
          </div>
        </div>
      </template>
    </ElScrollbar>

    <div class="sidebar-footer">
      <div v-if="!props.isCollapsed" class="user-info">
        <ElAvatar :size="32" :src="userInfo.avatar">
          <ElIcon><User /></ElIcon>
        </ElAvatar>
        <div class="user-details">
          <div class="user-name">{{ userInfo.name }}</div>
          <div class="user-status">当前账号</div>
        </div>
      </div>
      <div v-else class="collapsed-user">
        <ElAvatar :size="32" :src="userInfo.avatar">
          <ElIcon><User /></ElIcon>
        </ElAvatar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { ElMessage, ElMessageBox, ElScrollbar } from "element-plus";
import {
  ChatDotRound,
  ChatLineRound,
  User,
  MoreFilled,
  Plus,
  Search,
  ArrowDown,
} from "@element-plus/icons-vue";
import FaAsyncState from "@/components/feedback/fa-async-state/index.vue";
import { useUserStoreHook } from "@stores";
import { ChatSession, SessionGroup, UserInfo } from "@/api/module_ai/chat";
import AiChatAPI from "@/api/module_ai/chat";

interface Props {
  currentSessionId?: string | null;
  isCollapsed?: boolean;
}

interface Emits {
  (e: "select-session", session: ChatSession): void;
  (e: "new-session"): void;
  (e: "delete-session", sessionId: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  isCollapsed: false,
});
const emit = defineEmits<Emits>();

const userStore = useUserStoreHook();

const sessions = ref<ChatSession[]>([]);
const loading = ref(false);
const loadError = ref(false);
let listGeneration = 0;
let unmounted = false;
const searchQuery = ref("");
const collapsedGroups = ref<Set<string>>(new Set());

const userInfo = computed<UserInfo>(() => ({
  id: userStore.basicInfo.id || 0,
  name: userStore.basicInfo.name || "用户",
  username: userStore.basicInfo.username || "",
  avatar: userStore.basicInfo.avatar || "",
  email: userStore.basicInfo.email || "",
}));

const filteredSessions = computed<ChatSession[]>(() => {
  if (!searchQuery.value.trim()) {
    return sessions.value;
  }
  const query = searchQuery.value.toLowerCase();
  return sessions.value.filter((session: ChatSession) =>
    (session.title || "").toLowerCase().includes(query)
  );
});

const groupedSessions = computed<SessionGroup[]>(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
  const weekAgo = todayStart - 7 * 24 * 60 * 60 * 1000;

  const todaySessions: ChatSession[] = [];
  const yesterdaySessions: ChatSession[] = [];
  const weekSessions: ChatSession[] = [];
  const earlierSessions: ChatSession[] = [];

  filteredSessions.value.forEach((session) => {
    if (!session.updated_at) return;
    // Unix 时间戳（秒）转换为毫秒
    const updatedTime = session.updated_at * 1000;

    if (updatedTime >= todayStart) {
      todaySessions.push(session);
    } else if (updatedTime >= yesterdayStart) {
      yesterdaySessions.push(session);
    } else if (updatedTime >= weekAgo) {
      weekSessions.push(session);
    } else {
      earlierSessions.push(session);
    }
  });

  const groups: SessionGroup[] = [];

  if (todaySessions.length > 0) {
    groups.push({ id: "today", title: "今天", sessions: todaySessions });
  }

  if (yesterdaySessions.length > 0) {
    groups.push({ id: "yesterday", title: "昨天", sessions: yesterdaySessions });
  }

  if (weekSessions.length > 0) {
    groups.push({ id: "week", title: "本周", sessions: weekSessions });
  }

  if (earlierSessions.length > 0) {
    groups.push({ id: "earlier", title: "更早", sessions: earlierSessions });
  }

  return groups;
});

const handleSearch = () => {};

const toggleGroup = (groupTitle: string) => {
  const newCollapsed = new Set(collapsedGroups.value);
  if (newCollapsed.has(groupTitle)) {
    newCollapsed.delete(groupTitle);
  } else {
    newCollapsed.add(groupTitle);
  }
  collapsedGroups.value = newCollapsed;
};

const handleSelectSession = (session: ChatSession) => {
  emit("select-session", session);
};

const handleNewSession = () => {
  emit("new-session");
};

const handleSessionCommand = async (command: string, session: ChatSession) => {
  if (command === "rename") {
    try {
      const { value } = await ElMessageBox.prompt("请输入新的会话名称", "重命名", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /.+/,
        inputErrorMessage: "会话名称不能为空",
      });
      if (unmounted) return;
      await AiChatAPI.updateSession(session.id, { title: value });
      if (unmounted) return;
      listGeneration += 1;
      loading.value = false;
      const currentSession = sessions.value.find((item) => item.id === session.id);
      if (currentSession) currentSession.title = value;
    } catch (error) {
      if (unmounted) return;
      if (error !== "cancel") {
        ElMessage.error("重命名失败");
      } else {
        ElMessage.info("已取消重命名");
      }
    }
  } else if (command === "delete") {
    try {
      await ElMessageBox.confirm("确定要删除此会话吗？", "确认删除", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      });
      if (unmounted) return;
      await AiChatAPI.deleteSession([session.id]);
      if (unmounted) return;
      listGeneration += 1;
      loading.value = false;
      const index = sessions.value.findIndex((s: ChatSession) => s.id === session.id);
      if (index > -1) {
        sessions.value.splice(index, 1);
      }
      emit("delete-session", session.id);
      ElMessage.success("咨询对话已删除");
    } catch (error) {
      if (unmounted) return;
      if (error !== "cancel") {
        ElMessage.error("删除失败");
      } else {
        ElMessage.info("已取消删除");
      }
    }
  }
};

const loadSessions = async () => {
  if (unmounted) return;
  const generation = ++listGeneration;
  loading.value = true;
  loadError.value = false;
  try {
    const res = await AiChatAPI.getSessionList({ page_no: 1, page_size: 100 });
    if (generation !== listGeneration) return;
    const responseData = res.data;
    const data = responseData?.data;

    if (data?.items && Array.isArray(data.items)) {
      sessions.value = data.items
        .filter((item: any) => item.session_id !== undefined)
        .map((item: any) => ({
          id: item.session_id,
          title: item.session_data?.session_name || item.session_id?.slice(0, 8) || "新会话",
          created_at: item.created_at,
          updated_at: item.updated_at,
          message_count: item.runs?.length || 0,
          session_id: item.session_id,
          session_type: item.session_type,
          agent_id: item.agent_id,
          user_id: item.user_id,
          team_id: item.team_id,
          team_name: item.team_name,
          workflow_id: item.workflow_id,
          summary: item.summary,
          metadata: item.metadata,
          runs: item.runs,
          session_data: item.session_data,
          agent_data: item.agent_data,
          team_data: item.team_data,
          workflow_data: item.workflow_data,
          created_time: item.created_at ? new Date(item.created_at * 1000).toISOString() : null,
          updated_time: item.updated_at ? new Date(item.updated_at * 1000).toISOString() : null,
          messages: item.runs?.flatMap((run: any) => run.messages || []) || [],
        }));
    }
  } catch (error) {
    if (generation !== listGeneration) return;
    loadError.value = true;
    console.error("加载会话列表失败:", error);
  } finally {
    if (generation === listGeneration) loading.value = false;
  }
};

onMounted(() => {
  loadSessions();
});

onUnmounted(() => {
  unmounted = true;
  listGeneration += 1;
  loading.value = false;
});

defineExpose({
  loadSessions,
});
</script>

<style lang="scss" scoped>
.session-select,
.session-more {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
  min-height: 36px;
  padding: 0;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: var(--fa-radius-control);
}

.session-select {
  flex: 1;
  padding: 0 4px;
  border-radius: 8px;
  transition: background-color 0.18s ease;
}

.session-more {
  justify-content: center;
  width: 32px;
  border-radius: 8px;
}

.session-select:focus-visible,
.session-more:focus-visible,
.group-title:focus-visible {
  outline: 2px solid var(--theme-color);
  outline-offset: 2px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--fa-glass-bg-inset);
  border-right: 1px solid var(--fa-glass-border);
  -webkit-backdrop-filter: var(--fa-glass-blur);
  backdrop-filter: var(--fa-glass-blur);
  transition: width 0.3s ease;

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 10px;

    .logo-section {
      display: flex;
      gap: 10px;
      align-items: center;

      .logo-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        color: var(--theme-color);
        background: color-mix(in srgb, var(--theme-color) 14%, transparent);
        border: 1px solid color-mix(in srgb, var(--theme-color) 24%, transparent);
        border-radius: 11px;
        box-shadow: 0 4px 12px -2px color-mix(in srgb, var(--theme-color) 20%, transparent);
      }

      .project-name {
        font-size: 15px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        letter-spacing: -0.01em;
      }
    }
  }

  .sidebar-content {
    flex: 1;
    min-height: 0;

    .new-session-section {
      margin-bottom: 14px;

      .new-session-btn {
        display: flex;
        gap: 6px;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 38px;
        font-size: 13.5px;
        font-weight: 500;
        letter-spacing: 0.01em;
        background: linear-gradient(
          135deg,
          var(--theme-color) 0%,
          color-mix(in srgb, var(--theme-color) 85%, #000) 100%
        );
        border: 0;
        border-radius: 12px;
        box-shadow: 0 4px 14px color-mix(in srgb, var(--theme-color) 28%, transparent);
        transition:
          transform 0.18s ease,
          box-shadow 0.18s ease;

        .btn-icon {
          font-size: 16px;
        }

        &:hover {
          box-shadow: 0 6px 18px color-mix(in srgb, var(--theme-color) 38%, transparent);
          transform: translateY(-1px);
        }

        &:active {
          transform: scale(0.98);
        }
      }
    }

    .history-section {
      .search-section {
        margin-bottom: 14px;

        :deep(.el-input__wrapper) {
          background: var(--fa-glass-bg) !important;
          border: 1px solid var(--fa-glass-border) !important;
          border-radius: 11px;
          box-shadow: var(--fa-shadow-bento);
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;

          &:hover {
            border-color: color-mix(
              in srgb,
              var(--theme-color) 40%,
              var(--fa-glass-border)
            ) !important;
          }

          &.is-focus {
            border-color: var(--theme-color) !important;
            box-shadow: var(--fa-focus-ring), var(--fa-shadow-bento-hover) !important;
          }
        }

        :deep(.el-input__inner) {
          font-size: 13px;
        }
      }

      .history-groups {
        .history-group {
          margin-bottom: 18px;

          &:last-child {
            margin-bottom: 0;
          }

          .group-title {
            display: flex;
            gap: 8px;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            min-height: 28px;
            padding: 0 6px;
            margin-bottom: 6px;
            font: inherit;
            font-size: 11px;
            font-weight: 600;
            color: var(--fa-color-text-muted);
            text-align: left;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            cursor: pointer;
            user-select: none;
            background: transparent;
            border: 0;
            transition: color 0.18s ease;

            &::before {
              width: 4px;
              height: 10px;
              content: "";
              background: color-mix(in srgb, var(--theme-color) 70%, transparent);
              border-radius: 9999px;
            }

            &:hover {
              color: var(--el-text-color-primary);
            }

            .collapse-icon {
              font-size: 12px;
              transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

              &.collapsed {
                transform: rotate(-90deg);
              }
            }
          }

          .session-list {
            .session-item {
              position: relative;
              display: flex;
              gap: 6px;
              align-items: center;
              padding: 6px 8px;
              margin-bottom: 4px;
              cursor: pointer;
              background: transparent;
              border: 1px solid transparent;
              border-radius: 12px;
              transition:
                background-color 0.18s ease,
                border-color 0.18s ease,
                box-shadow 0.18s ease,
                transform 0.18s ease;

              &:hover {
                background: var(--fa-glass-bg);
                border-color: var(--fa-glass-border);
                box-shadow: var(--fa-shadow-bento);
                transform: translateY(-1px);
              }

              &.active {
                color: var(--theme-color);
                background: color-mix(in srgb, var(--theme-color) 12%, var(--fa-glass-bg-elevated));
                border-color: color-mix(in srgb, var(--theme-color) 32%, var(--fa-glass-border));
                box-shadow: 0 4px 14px -2px color-mix(in srgb, var(--theme-color) 20%, transparent);
              }

              .session-icon {
                flex-shrink: 0;
                font-size: 16px;
                color: var(--el-text-color-secondary);
                transition: color 0.18s ease;
              }

              &.active .session-icon {
                color: var(--theme-color);
              }

              .session-title {
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                font-size: 13.5px;
                font-weight: 400;
                white-space: nowrap;
                transition: font-weight 0.18s ease;
              }

              &.active .session-title {
                font-weight: 500;
                color: var(--el-text-color-primary);
              }

              .more-icon {
                flex-shrink: 0;
                padding: 4px;
                font-size: 14px;
                color: var(--fa-color-text-muted);
                border-radius: 6px;
                transition:
                  color 0.18s ease,
                  background-color 0.18s ease;

                &:hover {
                  color: var(--theme-color);
                  background: color-mix(in srgb, var(--theme-color) 12%, transparent);
                }
              }
            }
          }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }

  .sidebar-footer {
    padding: 12px 14px;
    border-top: 1px solid var(--fa-glass-border);

    .user-info {
      display: flex;
      gap: 10px;
      align-items: center;

      .user-details {
        flex: 1;
        overflow: hidden;

        .user-name {
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 13.5px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          white-space: nowrap;
        }

        .user-status {
          font-size: 11.5px;
          color: var(--fa-color-text-muted);
        }
      }
    }

    .collapsed-user {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .sidebar,
  .sidebar .new-session-btn,
  .sidebar .collapse-icon,
  .sidebar .session-item {
    transform: none !important;
    transition: none !important;
  }
}
</style>
