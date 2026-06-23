<template>
  <ElCard shadow="hover" class="home-card h-full">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <p class="m-0 truncate text-sm text-g-500">{{ title }}</p>
        <div class="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <FaCountTo
            class="text-3xl font-semibold text-g-900"
            :target="value"
            :duration="1600"
            separator=","
          />
          <span class="text-sm text-g-500">{{ unit }}</span>
        </div>
      </div>
      <div class="icon-box" :style="{ color, backgroundColor: `${color}1a` }">
        <FaSvgIcon :icon="icon" />
      </div>
    </div>

    <div class="mt-5 flex items-center justify-between gap-3">
      <span class="text-sm text-g-500">{{ description }}</span>
      <span class="trend" :class="trend >= 0 ? 'trend--up' : 'trend--down'">
        <FaSvgIcon :icon="trend >= 0 ? 'ri:arrow-up-line' : 'ri:arrow-down-line'" />
        {{ Math.abs(trend).toFixed(1) }}%
      </span>
    </div>

    <div class="mt-4 flex h-10 items-end gap-1">
      <span
        v-for="(item, index) in normalizedBars"
        :key="index"
        class="bar"
        :style="{ height: `${item}%`, backgroundColor: color }"
      ></span>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
import { computed } from "vue";

defineOptions({ name: "VisitStatCard" });

type Props = {
  title: string;
  value: number;
  unit: string;
  trend: number;
  icon: string;
  color: string;
  description: string;
  chartData: number[];
};

const props = defineProps<Props>();

const normalizedBars = computed(() => {
  const max = Math.max(...props.chartData, 1);
  return props.chartData.map((item) => Math.max(18, Math.round((item / max) * 100)));
});
</script>

<style scoped lang="scss">
.home-card {
  :deep(.el-card__body) {
    height: 100%;
  }
}

.icon-box {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 44px;
  border-radius: 8px;
  font-size: 22px;
}

.trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 13px;
  font-weight: 600;

  &--up {
    color: var(--el-color-success);
  }

  &--down {
    color: var(--el-color-danger);
  }
}

.bar {
  width: 100%;
  min-width: 0;
  border-radius: 4px 4px 0 0;
  opacity: 0.78;
}
</style>
