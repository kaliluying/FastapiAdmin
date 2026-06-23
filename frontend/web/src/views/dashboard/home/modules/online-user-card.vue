<template>
  <ElCard shadow="hover" class="home-card h-full">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="m-0 text-sm text-g-500">在线用户</p>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-3xl font-semibold text-g-900">{{ onlineCount }}</span>
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

const onlineCount = 128;
const activeRate = 76;
const onlineStats: OnlineStat[] = [
  { label: "PC端", value: 86 },
  { label: "移动端", value: 34 },
  { label: "多端", value: 8 },
];
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

.stat-box {
  min-width: 0;
  padding: 10px 8px;
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
}
</style>
