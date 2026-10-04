<template>
  <div class="fa-citation-list">
    <template v-if="citations && citations.length > 0">
      <div v-for="(citation, index) in citations" :key="citation.id" class="fa-citation-item">
        <div class="fa-citation-item__header">
          <span class="fa-citation-item__number fa-data fa-num">{{ index + 1 }}</span>
          <button type="button" class="fa-citation-item__title" @click="emit('select', citation)">
            {{ citation.title }}
          </button>
          <button
            type="button"
            class="fa-citation-item__expand"
            :aria-expanded="expandedIds.has(citation.id) ? 'true' : 'false'"
            :aria-label="`展开引用: ${citation.title}`"
            @click="toggleExpand(citation.id)"
          >
            <Icon
              :icon="expandedIds.has(citation.id) ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'"
            />
          </button>
        </div>
        <div
          v-if="citation.document_id != null || citation.chunk_index != null"
          class="fa-citation-item__meta fa-data fa-num"
        >
          <span v-if="citation.document_id != null">文档 {{ citation.document_id }}</span>
          <span v-if="citation.chunk_index != null">分块 {{ citation.chunk_index }}</span>
        </div>
        <div
          v-if="expandedIds.has(citation.id) && citation.snippet"
          class="fa-citation-item__snippet"
        >
          {{ citation.snippet }}
        </div>
      </div>
    </template>
    <div v-else class="fa-citation-list__empty">当前回答未提供可定位引用</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Icon } from "@iconify/vue";

defineOptions({ name: "FaCitationList" });

import type { ChatCitation } from "../chat/types";

defineProps<{ citations: ChatCitation[] }>();
const emit = defineEmits<{ select: [citation: ChatCitation] }>();

const expandedIds = ref(new Set<string>());

function toggleExpand(id: string) {
  const next = new Set(expandedIds.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  expandedIds.value = next;
}
</script>

<style scoped lang="scss">
.fa-citation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__empty {
    padding: 16px;
    font-size: var(--fa-text-body);
    color: var(--el-text-color-secondary);
    text-align: center;
  }
}

.fa-citation-item {
  padding-left: 8px;
  border-left: 2px solid var(--fa-color-accent-soft);

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 0 4px 8px;
    color: var(--fa-color-text-muted);
  }

  &__header {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 4px;
    background: var(--fa-color-surface, var(--el-bg-color));
  }

  &__number {
    flex-shrink: 0;
    min-width: 20px;
    color: var(--fa-color-text-muted);
  }

  &__title {
    flex: 1;
    min-width: 0;
    padding: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: var(--fa-text-body);
    line-height: var(--fa-leading-normal);
    color: var(--el-text-color-primary);
    text-align: left;
    overflow-wrap: anywhere;
    white-space: normal;
    cursor: pointer;
    background: none;
    border: none;

    &:hover {
      color: var(--fa-color-accent-text);
    }
  }

  &__expand {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    background: none;
    border: none;
    border-radius: var(--fa-radius-control);

    &:hover {
      background: var(--el-fill-color-light);
    }

    &:focus-visible {
      outline: 2px solid var(--fa-color-focus);
      outline-offset: 2px;
    }
  }

  &__snippet {
    padding: 4px;
    font-size: var(--fa-text-caption);
    line-height: 1.5;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-lighter);
    border-top: 1px solid var(--fa-color-border, var(--el-border-color));
  }
}

@media (width <= 768px) {
  .fa-citation-item__expand {
    width: 44px;
    height: 44px;
  }

  .fa-citation-item__title {
    min-height: 44px;
  }
}
</style>
