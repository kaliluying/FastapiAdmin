<template>
  <div class="chat-navbar">
    <div class="navbar-left">
      <button type="button" class="collapse-btn" aria-label="切换会话列表" @click="toggleSidebar">
        <FaSvgIcon
          v-if="!props.isSidebarCollapsed"
          :icon="resolveIconForFaSvgIcon('layout_leftbar_close_line')"
          class="size-6"
        />
        <FaSvgIcon
          v-else
          :icon="resolveIconForFaSvgIcon('layout_leftbar_open_line')"
          class="size-6"
        />
      </button>
      <h1 class="workspace-title">AI 对话</h1>
    </div>
    <div class="navbar-right">
      <ElSelect
        :model-value="knowledgeBaseIds"
        multiple
        collapse-tags
        collapse-tags-tooltip
        clearable
        filterable
        class="knowledge-select"
        aria-label="用于回答的知识库"
        placeholder="选择知识库（可选）"
        no-data-text="暂无可用知识库。你仍可直接提问或添加附件。"
        @update:model-value="handleKnowledgeChange"
      >
        <ElOption
          v-for="item in knowledgeBases"
          :key="item.id"
          :label="item.name"
          :value="item.id || 0"
        />
      </ElSelect>
      <ElButton v-if="hasMessages" text :icon="Delete" @click="handleClearChat">清空对话</ElButton>
      <ElButton text @click="emit('show-evidence')">回答依据</ElButton>
      <ElButton text @click="emit('show-usage')">今日用量</ElButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { resolveIconForFaSvgIcon } from "@utils";
import { computed } from "vue";
import { Delete } from "@element-plus/icons-vue";
import type { KnowledgeBase } from "@/api/module_ai/knowledge";

interface Props {
  messageCount: number;
  isSidebarCollapsed?: boolean;
  knowledgeBases?: KnowledgeBase[];
  knowledgeBaseIds?: number[];
}

interface Emits {
  (e: "clear-chat"): void;
  (e: "toggle-sidebar"): void;
  (e: "show-evidence"): void;
  (e: "show-usage"): void;
  (e: "update:knowledgeBaseIds", value: number[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  isSidebarCollapsed: false,
  knowledgeBases: () => [],
  knowledgeBaseIds: () => [],
});
const emit = defineEmits<Emits>();

const hasMessages = computed(() => props.messageCount > 0);

const handleClearChat = () => {
  emit("clear-chat");
};

const toggleSidebar = () => {
  emit("toggle-sidebar");
};

const handleKnowledgeChange = (value: number[]) => {
  emit("update:knowledgeBaseIds", value);
};
</script>

<style lang="scss" scoped>
.chat-navbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  color: var(--fa-color-text);
  background: var(--fa-color-surface);
}

.navbar-left,
.navbar-right {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
}

.navbar-right {
  flex: 1 1 320px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.navbar-left {
  flex-shrink: 0;
}

.workspace-title {
  flex-shrink: 0;
  margin: 0;
  font-size: 16px;
  font-weight: 650;
  white-space: nowrap;
}

.collapse-btn {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  color: inherit;
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--fa-color-border);
  border-radius: var(--fa-radius-control);
}

.collapse-btn:hover {
  background: var(--fa-hover-color);
}

.collapse-btn:focus-visible {
  outline: 2px solid var(--theme-color);
  outline-offset: 2px;
}

.knowledge-select {
  width: 220px;
}

.navbar-right :deep(.el-button) {
  margin: 0;
  color: var(--fa-color-text);
}

.navbar-right :deep(.el-button:hover) {
  background: var(--fa-hover-color);
}

@media (width <= 1024px) {
  .chat-navbar {
    gap: 8px;
    padding: 10px 12px;
  }

  .navbar-right {
    gap: 4px;
  }
}

@media (width <= 768px) {
  .collapse-btn,
  .navbar-right :deep(.el-button) {
    min-height: 44px;
  }
}

@media (width <= 640px) {
  .navbar-right {
    width: 100%;
  }

  .knowledge-select {
    flex: 0 0 100%;
    width: 100%;
    min-width: 0;
  }

  .navbar-right :deep(.el-button) {
    padding: 8px;
    font-size: 12px;
  }
}
</style>
