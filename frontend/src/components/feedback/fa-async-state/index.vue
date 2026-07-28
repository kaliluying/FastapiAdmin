<template>
  <div class="fa-async-state" :class="stateClasses" :role="isAlert ? 'alert' : undefined">
    <!-- loading -->
    <template v-if="state === 'loading'">
      <ElSkeleton :rows="3" animated />
    </template>

    <!-- empty -->
    <template v-else-if="state === 'empty'">
      <div class="fa-empty">
        <svg
          class="fa-empty__art"
          viewBox="0 0 120 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect
            x="18"
            y="30"
            width="84"
            height="54"
            rx="8"
            stroke="var(--fa-gray-400)"
            stroke-width="2"
          />
          <path d="M18 44h84" stroke="var(--fa-gray-400)" stroke-width="2" />
          <circle cx="60" cy="62" r="10" stroke="var(--fa-gray-400)" stroke-width="2" />
          <path
            d="M60 57v10M55 62h10"
            stroke="var(--fa-gray-400)"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <div class="fa-empty__title">{{ title || "暂无数据" }}</div>
        <p v-if="description" class="fa-empty__desc">{{ description }}</p>
        <div v-if="$slots.action" class="fa-async-state__action">
          <slot name="action" />
        </div>
      </div>
    </template>

    <!-- error / forbidden / partial -->
    <template v-else-if="isAlert">
      <div class="fa-async-state__alert-body">
        <span class="fa-async-state__alert-title">{{ title || defaultTitles[state] }}</span>
        <p v-if="description" class="fa-async-state__alert-desc">{{ description }}</p>
      </div>
      <div v-if="$slots.action" class="fa-async-state__action">
        <slot name="action" />
      </div>
    </template>

    <!-- default content -->
    <template v-else>
      <slot />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

defineOptions({ name: "FaAsyncState" });

type AsyncStateType = "loading" | "empty" | "error" | "forbidden" | "partial";

interface Props {
  state: AsyncStateType;
  title?: string;
  description?: string;
}

const props = defineProps<Props>();

const isAlert = computed(
  () => props.state === "error" || props.state === "forbidden" || props.state === "partial"
);

const stateClasses = computed(() => {
  const classes: string[] = [`fa-async-state--${props.state}`];
  if (isAlert.value) classes.push("fa-async-state--alert");
  return classes;
});

const defaultTitles: Record<string, string> = {
  error: "加载失败",
  forbidden: "无权限访问",
  partial: "部分数据加载失败",
};
</script>

<style scoped lang="scss">
.fa-async-state {
  width: 100%;

  &--empty {
    // 内边距与居中对齐由内部 .fa-empty 统一提供
    padding: 0;
  }

  &--alert {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 16px;
    text-align: center;
  }

  &--alert {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    text-align: left;
    background: var(--el-color-danger-light-9, #fef0f0);
    border: 1px solid var(--el-color-danger-light-5, #fab6b6);
    border-radius: var(--fa-radius-panel, 6px);
  }

  &--forbidden {
    background: var(--el-color-warning-light-9, #fdf6ec);
    border-color: var(--el-color-warning-light-5, #f3d19e);
  }

  &--partial {
    background: var(--el-color-warning-light-9, #fdf6ec);
    border-color: var(--el-color-warning-light-5, #f3d19e);
  }

  &__alert-body {
    flex: 1;
    min-width: 0;
  }

  &__alert-title {
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  &__alert-desc {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__action {
    flex-shrink: 0;
    margin-top: 12px;
    margin-left: 16px;
  }

  .fa-empty &__action {
    margin-left: 0;
  }
}
</style>
