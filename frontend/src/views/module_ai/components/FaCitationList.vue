<template>
  <div class="fa-citation-list">
    <template v-if="citations && citations.length > 0">
      <div v-for="(citation, index) in citations" :key="citation.id" class="fa-citation-item">
        <div class="fa-citation-item__header">
          <span class="fa-citation-item__number">{{ index + 1 }}</span>
          <span class="fa-citation-item__title" @click="emit('select', citation)">{{ citation.title }}</span>
          <button
            type="button"
            class="fa-citation-item__expand"
            :aria-expanded="String(expandedIds.has(citation.id))"
            :aria-label="`展开引用: ${citation.title}`"
            @click="toggleExpand(citation.id)"
          >
            <Icon :icon="expandedIds.has(citation.id) ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'" />
          </button>
        </div>
        <div v-if="expandedIds.has(citation.id) && citation.snippet" class="fa-citation-item__snippet">
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

interface AiCitation { id: string; title: string; snippet?: string; source?: string; score?: number; }

const props = defineProps<{ citations: AiCitation[] }>();
const emit = defineEmits<{ select: [citation: AiCitation] }>();

const expandedIds = ref(new Set<string>());

function toggleExpand(id: string) {
  const next = new Set(expandedIds.value);
  next.has(id) ? next.delete(id) : next.add(id);
  expandedIds.value = next;
}
</script>

<style scoped lang="scss">
.fa-citation-list {
  display: flex; flex-direction: column; gap: 8px;
  &__empty { padding: 16px; text-align: center; color: var(--el-text-color-secondary); font-size: 13px; }
}
.fa-citation-item {
  border: 1px solid var(--fa-color-border, var(--el-border-color));
  border-radius: var(--fa-radius-panel, 6px); overflow: hidden;
  &__header { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--fa-color-surface, var(--el-bg-color)); }
  &__number { flex-shrink: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--el-color-primary-light-9); color: var(--el-color-primary); font-size: 11px; font-weight: 600; }
  &__title { flex: 1; min-width: 0; font-size: 13px; color: var(--el-text-color-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; &:hover { color: var(--el-color-primary); } }
  &__expand { flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border: none; background: none; cursor: pointer; color: var(--el-text-color-secondary); border-radius: 4px; &:hover { background: var(--el-fill-color-light); } &:focus-visible { outline: 2px solid var(--el-color-primary); outline-offset: 2px; } }
  &__snippet { padding: 8px 12px; font-size: 12px; color: var(--el-text-color-secondary); line-height: 1.5; border-top: 1px solid var(--fa-color-border, var(--el-border-color)); background: var(--el-fill-color-lighter); }
}
</style>
