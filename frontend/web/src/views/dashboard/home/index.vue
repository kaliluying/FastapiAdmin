<template>
  <div class="home-dashboard">
    <Banner class="mb-5" />

    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="24" :lg="8" class="mb-5">
        <OnlineUserCard />
      </ElCol>
      <ElCol :xs="24" :sm="12" :lg="8" class="mb-5">
        <VisitStatCard v-bind="uvCard" />
      </ElCol>
      <ElCol :xs="24" :sm="12" :lg="8" class="mb-5">
        <VisitStatCard v-bind="pvCard" />
      </ElCol>
    </ElRow>

    <ElRow :gutter="20">
      <ElCol :xs="24" :lg="16" class="mb-5">
        <VisitTrendCard />
      </ElCol>
      <ElCol :xs="24" :lg="8" class="mb-5">
        <RecentActivityCard />
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
import Banner from "./modules/banner.vue";
import OnlineUserCard from "./modules/online-user-card.vue";
import RecentActivityCard from "./modules/recent-activity-card.vue";
import VisitStatCard from "./modules/visit-stat-card.vue";
import VisitTrendCard from "./modules/visit-trend-card.vue";

defineOptions({ name: "Home", inheritAttrs: false });

const uvCard = {
  title: "访客数（UV）",
  value: 9862,
  unit: "人",
  trend: 12.6,
  icon: "ri:user-smile-line",
  color: "var(--el-color-primary)",
  description: "今日独立访客",
  chartData: [48, 62, 58, 70, 84, 79, 96],
};

const pvCard = {
  title: "浏览量（PV）",
  value: 52846,
  unit: "次",
  trend: 8.2,
  icon: "ri:bar-chart-box-line",
  color: "var(--el-color-success)",
  description: "今日页面访问",
  chartData: [180, 220, 205, 260, 286, 310, 346],
};
</script>

<style scoped lang="scss">
.home-dashboard {
  min-width: 0;
}
</style>
