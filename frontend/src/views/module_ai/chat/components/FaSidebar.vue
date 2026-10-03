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
import { ref, computed, onMounted } from "vue";
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
      await AiChatAPI.updateSession(session.id, { title: value });
      session.title = value;
    } catch (error) {
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
      await AiChatAPI.deleteSession([session.id]);
      const index = sessions.value.findIndex((s: ChatSession) => s.id === session.id);
      if (index > -1) {
        sessions.value.splice(index, 1);
      }
      emit("delete-session", session.id);
      ElMessage.success("咨询对话已删除");
    } catch (error) {
      if (error !== "cancel") {
        ElMessage.error("删除失败");
      } else {
        ElMessage.info("已取消删除");
      }
    }
  }
};

const loadSessions = async () => {
  loading.value = true;
  loadError.value = false;
  try {
    const res = await AiChatAPI.getSessionList({ page_no: 1, page_size: 100 });
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
    loadError.value = true;
    console.error("加载会话列表失败:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadSessions();
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
}

.session-more {
  justify-content: center;
  width: 32px;
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
  background: var(--fa-color-canvas);
  border-right: 1px solid var(--el-border-color-light);
  transition: width 0.3s ease;

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;

    .logo-section {
      display: flex;
      gap: 12px;
      align-items: center;

      .logo-icon {
        color: var(--el-color-primary);
      }

      .project-name {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }
  }

  .sidebar-content {
    flex: 1;
    min-height: 0;

    .new-session-section {
      margin-bottom: 16px;

      .new-session-btn {
        display: flex;
        gap: 8px;
        align-items: center;
        justify-content: center;
        width: 100%;
        border-radius: 7px;
        transition: all 0.2s ease;

        .btn-icon {
          font-size: 16px;
        }

        &:hover {
          box-shadow: none;
        }
      }
    }

    .history-section {
      .search-section {
        margin-bottom: 16px;

        :deep(.el-input__wrapper) {
          border-radius: 7px;
          box-shadow: 0 0 0 1px var(--el-border-color) inset;
          transition: all 0.2s ease;

          &:hover {
            box-shadow: 0 0 0 1px var(--el-color-primary) inset;
          }

          &.is-focus {
            box-shadow: 0 0 0 1px var(--el-color-primary) inset;
          }
        }

        :deep(.el-input__inner) {
          font-size: 13px;
        }
      }

      .history-groups {
        .history-group {
          margin-bottom: 24px;

          &:last-child {
            margin-bottom: 0;
          }

          .group-title {
            display: flex;
            gap: 6px;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            min-height: 36px;
            padding: 0 4px;
            margin-bottom: 10px;
            font: inherit;
            font-size: 12px;
            font-weight: 500;
            color: var(--el-text-color-secondary);
            text-align: left;
            cursor: pointer;
            user-select: none;
            background: transparent;
            border: 0;
            transition: color 0.2s;

            &::before {
              width: 3px;
              height: 12px;
              content: "";
              background: var(--el-color-primary);
              border-radius: 2px;
            }

            &:hover {
              color: var(--el-text-color-primary);
            }

            .collapse-icon {
              font-size: 14px;
              transition: transform 0.2s ease;

              &.collapsed {
                transform: rotate(-90deg);
              }
            }
          }

          .session-list {
            .session-item {
              position: relative;
              display: flex;
              gap: 10px;
              align-items: center;
              padding: 4px;
              margin-bottom: 6px;
              cursor: pointer;
              border: 1px solid transparent;
              border-radius: 7px;
              transition: all 0.2s ease;

              &:hover {
                background: var(--el-fill-color-light);
                border-color: var(--el-border-color-light);
              }

              &.active {
                color: var(--el-color-primary);
                background: var(--el-color-primary-light-9);
                border-color: var(--el-border-color-light);
                box-shadow: none;
              }

              .session-icon {
                flex-shrink: 0;
                font-size: 18px;
                color: var(--el-text-color-secondary);
                transition: color 0.2s;
              }

              &.active .session-icon {
                color: var(--el-color-primary);
              }

              .session-title {
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                font-size: 14px;
                font-weight: 400;
                white-space: nowrap;
                transition: font-weight 0.2s;
              }

              &.active .session-title {
                font-weight: 500;
              }

              .more-icon {
                flex-shrink: 0;
                padding: 4px;
                font-size: 16px;
                border-radius: 4px;
                opacity: 1;
                transition: all 0.2s;

                &:hover {
                  color: var(--el-color-primary);
                  background: var(--el-fill-color);
                }
              }

              &:hover .more-icon {
                opacity: 1;
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
    padding: 12px;
    border-top: 1px solid var(--el-border-color-light);

    .user-info {
      display: flex;
      gap: 12px;
      align-items: center;

      .user-details {
        flex: 1;
        overflow: hidden;

        .user-name {
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 14px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          white-space: nowrap;
        }

        .user-status {
          font-size: 12px;
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
</style>
