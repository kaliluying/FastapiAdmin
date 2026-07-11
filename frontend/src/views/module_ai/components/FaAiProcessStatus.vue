<template>
  <div class="fa-ai-process-status" aria-live="polite">
    <template v-if="stage !== 'idle' && stageLabel">
      <Icon :icon="stageIcon" class="fa-ai-process-status__icon" />
      <span class="fa-ai-process-status__label">{{ stageLabel }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";

defineOptions({ name: "FaAiProcessStatus" });

type AiStage = "idle" | "retrieving" | "reranking" | "generating" | "complete" | "error";

const props = defineProps<{ stage: AiStage }>();

const stageConfig: Record<AiStage, { label: string; icon: string }> = {
  idle:       { label: "",       icon: "" },
  retrieving: { label: "正在检索", icon: "ri:search-eye-line" },
  reranking:  { label: "正在重排", icon: "ri:sort-desc" },
  generating: { label: "正在生成", icon: "svg-spinners:3-dots-fade" },
  complete:   { label: "生成完成", icon: "ri:check-line" },
  error:      { label: "生成失败", icon: "ri:error-warning-line" },
};

const stageLabel = computed(() => stageConfig[props.stage]?.label ?? "");
const stageIcon  = computed(() => stageConfig[props.stage]?.icon ?? "");
</script>

<style scoped lang="scss">
.fa-ai-process-status {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 24px;
  font-size: 13px;
  color: var(--el-text-color-secondary);

  &__icon { font-size: 16px; }
  &__label { line-height: 1; }
}
</style>
