<template>
  <div class="fa-ai-process-status" aria-live="polite">
    <template v-if="stage !== 'idle' && stageLabel">
      <Icon :icon="stageIcon" class="fa-ai-process-status__icon" />
      <span class="fa-ai-process-status__label">{{ stageLabel }}</span>
      <span v-if="elapsedSeconds !== undefined" class="fa-ai-process-status__elapsed">
        {{ elapsedSeconds }} 秒
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import type { ChatProcessStage } from "../chat/types";

defineOptions({ name: "FaAiProcessStatus" });

const props = defineProps<{ stage: ChatProcessStage; elapsedSeconds?: number }>();

const stageConfig: Record<ChatProcessStage, { label: string; icon: string }> = {
  idle: { label: "", icon: "" },
  preparing: { label: "请求已发送，等待处理", icon: "ri:time-line" },
  routing: { label: "正在判断是否需要日志工具", icon: "ri:route-line" },
  querying_logs: { label: "正在只读查询运行日志", icon: "ri:search-eye-line" },
  analyzing: { label: "正在分析日志证据", icon: "svg-spinners:3-dots-fade" },
  retrieving: { label: "正在检索", icon: "ri:search-eye-line" },
  reranking: { label: "正在重排", icon: "ri:sort-desc" },
  generating: { label: "正在生成", icon: "svg-spinners:3-dots-fade" },
  complete: { label: "生成完成", icon: "ri:check-line" },
  error: { label: "生成失败", icon: "ri:error-warning-line" },
};

const stageLabel = computed(() => stageConfig[props.stage]?.label ?? "");
const stageIcon = computed(() => stageConfig[props.stage]?.icon ?? "");
</script>

<style scoped lang="scss">
.fa-ai-process-status {
  display: flex;
  gap: 6px;
  align-items: center;
  min-height: 24px;
  font-size: 13px;
  color: var(--el-text-color-secondary);

  &__icon {
    font-size: 16px;
  }

  &__label {
    line-height: 1.5;
  }

  &__elapsed {
    margin-left: auto;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
}
</style>
