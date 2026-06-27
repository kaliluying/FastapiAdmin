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
  border-color: rgb(23 32 51 / 8%);
  box-shadow: 0 10px 26px rgb(23 32 51 / 6%);

  :deep(.el-card__body) {
    height: 100%;
    padding: 18px;
  }
}

.online-card {
  background:
    linear-gradient(180deg, rgb(255 255 255), rgb(250 252 255)),
    var(--el-bg-color);
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
  color: #667085;
}

.metric-value {
  font-size: 32px;
  font-weight: 760;
  line-height: 1;
  color: #172033;
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
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 58%);
}

.stat-box {
  min-width: 0;
  padding: 10px 8px;
  border-radius: 8px;
  background: #f7f9fc;
  border: 1px solid rgb(23 32 51 / 5%);
}
</style>
