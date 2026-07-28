<template>
  <ElCard shadow="never" class="home-card online-card h-full">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="metric-label">
          在线用户
          <span class="online-signal"><i></i>Live</span>
        </p>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="metric-value">{{ onlineCount }}</span>
          <span class="text-sm text-g-500">人在线</span>
        </div>
      </div>
      <div class="icon-box bg-primary/10 text-primary">
        <FaSvgIcon icon="ri:user-shared-line" />
      </div>
    </div>

    <ElProgress class="mt-5" :percentage="activeRate" :show-text="false" :stroke-width="8" />

    <div class="mt-4 grid grid-cols-3 gap-3 text-center">
      <div v-for="item in onlineStats" :key="item.label" class="stat-box">
        <div class="text-lg font-semibold text-g-900">{{ item.value }}</div>
        <div class="mt-1 text-xs text-g-500">{{ item.label }}</div>
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
defineOptions({ name: "OnlineUserCard" });

type OnlineStat = {
  label: string;
  value: number;
};

const onlineCount = 18;
const activeRate = 64;
const onlineStats: OnlineStat[] = [
  { label: "PC端", value: 13 },
  { label: "移动端", value: 4 },
  { label: "多端", value: 1 },
];
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

.online-card {
  background:
    linear-gradient(180deg, var(--fa-surface-sheen-top), var(--fa-surface-sheen-bottom)),
    var(--default-box-color);
}

.online-signal {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  margin-left: 8px;
  font-size: 11px;
  font-weight: 700;
  color: #0f9f8f;
  text-transform: uppercase;
}

.online-signal i {
  width: 7px;
  height: 7px;
  background: #2dd4bf;
  border-radius: 999px;
  box-shadow: 0 0 0 5px rgb(45 212 191 / 14%);
}

.metric-label {
  margin: 0;
  font-size: 13px;
  font-weight: 650;
  color: var(--fa-gray-600);
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

.stat-box {
  min-width: 0;
  padding: 10px 8px;
  background: var(--fa-gray-200);
  border: 1px solid var(--fa-card-border);
  border-radius: 8px;
}
</style>
