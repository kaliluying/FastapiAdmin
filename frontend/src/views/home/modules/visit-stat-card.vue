<template>
  <ElCard shadow="never" class="home-card metric-card h-full">
    <div class="metric-accent" :style="{ backgroundColor: color }"></div>
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <p class="metric-label">{{ title }}</p>
        <div class="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <FaCountTo class="metric-value" :target="value" :duration="1600" separator="," />
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
  position: relative;
  overflow: hidden;
  border-color: var(--fa-card-border);
  box-shadow: var(--fa-elevation-1);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    border-color: color-mix(in srgb, var(--theme-color) 18%, var(--fa-card-border));
    box-shadow: var(--fa-elevation-3);
    transform: translateY(-3px);
  }

  :deep(.el-card__body) {
    height: 100%;
    padding: 18px;
  }
}

.metric-card {
  background:
    linear-gradient(180deg, var(--fa-surface-sheen-top), var(--fa-surface-sheen-bottom)),
    var(--default-box-color);
}

.metric-accent {
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 3px;
  opacity: 0.9;
}

.metric-label {
  max-width: 100%;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  font-weight: 650;
  color: var(--fa-gray-600);
  white-space: nowrap;
}

.metric-value {
  font-size: var(--fa-text-3xl);
  font-weight: var(--fa-weight-bold);
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--fa-gray-900);
}

.icon-box {
  display: flex;
  flex: 0 0 44px;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  font-size: 22px;
  border-radius: 8px;
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 58%);
}

.trend {
  display: inline-flex;
  gap: 2px;
  align-items: center;
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
  opacity: 0.7;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.home-card:hover .bar {
  opacity: 0.92;
  transform: translateY(-1px);
}
</style>
