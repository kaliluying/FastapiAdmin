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
  gap: 10px;

  &__empty {
    padding: 16px;
    font-size: var(--fa-text-body);
    color: var(--fa-color-text-muted);
    text-align: center;
  }
}

.fa-citation-item {
  position: relative;
  overflow: hidden;
  background: var(--fa-color-surface);
  border: 1px solid var(--fa-color-border);
  border-radius: var(--fa-radius-control);
  box-shadow: var(--fa-soft-shadow);
  transition:
    transform var(--fa-motion-control),
    border-color var(--fa-motion-control),
    box-shadow var(--fa-motion-control);

  &:hover {
    border-color: color-mix(in srgb, var(--theme-color) 40%, var(--fa-color-border));
    box-shadow: var(--fa-panel-shadow);
    transform: translateY(-1px);
  }

  &__header {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px 10px;
    background: transparent;
  }

  &__number {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    font-size: 11px;
    font-weight: 600;
    color: var(--theme-color);
    background: color-mix(in srgb, var(--theme-color) 12%, transparent);
    border-radius: 6px;
  }

  &__title {
    flex: 1;
    min-width: 0;
    padding: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
    font-weight: 550;
    line-height: var(--fa-leading-normal);
    color: var(--el-text-color-primary);
    text-align: left;
    overflow-wrap: anywhere;
    white-space: normal;
    cursor: pointer;
    background: none;
    border: none;
    transition: color 0.15s ease;

    &:hover {
      color: var(--theme-color);
    }
  }

  &__expand {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    color: var(--fa-color-text-muted);
    cursor: pointer;
    background: none;
    border: none;
    border-radius: var(--fa-radius-control);
    transition:
      background-color 0.15s ease,
      color 0.15s ease;

    &:hover {
      color: var(--fa-color-text);
      background: var(--fa-hover-color);
    }

    &:focus-visible {
      outline: 2px solid var(--theme-color);
      outline-offset: 2px;
    }
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0 10px 8px 38px;
    font-size: 11px;
    color: var(--fa-color-text-muted);

    span {
      padding: 1px 6px;
      background: var(--fa-color-canvas);
      border: 1px solid var(--fa-color-border);
      border-radius: 4px;
    }
  }

  &__snippet {
    padding: 8px 12px;
    font-size: var(--fa-text-caption);
    line-height: 1.55;
    color: var(--fa-color-text-muted);
    overflow-wrap: anywhere;
    white-space: pre-wrap;
    background: var(--fa-color-surface-raised);
    border-top: 1px dashed var(--fa-color-border);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
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
