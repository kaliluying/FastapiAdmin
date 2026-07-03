<template>
  <div class="home-workspace">
    <Banner class="mb-5" />

    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="24" :lg="8" class="mb-5">
        <OnlineUserCard />
      </ElCol>
      <ElCol :xs="24" :sm="12" :lg="8" class="mb-5">
        <VisitStatCard v-bind="documentCard" />
      </ElCol>
      <ElCol :xs="24" :sm="12" :lg="8" class="mb-5">
        <VisitStatCard v-bind="retrievalCard" />
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

const documentCard = {
  title: "知识库文档",
  value: 128,
  unit: "份",
  trend: 9.4,
  icon: "ri:file-text-line",
  color: "var(--el-color-primary)",
  description: "已纳入检索的内部资料",
  chartData: [42, 58, 66, 72, 86, 104, 128],
};

const retrievalCard = {
  title: "检索请求",
  value: 986,
  unit: "次",
  trend: 6.8,
  icon: "ri:search-eye-line",
  color: "var(--el-color-success)",
  description: "近 7 日知识检索调用",
  chartData: [88, 106, 124, 136, 148, 164, 182],
};
</script>

<style scoped lang="scss">
.home-workspace {
  min-width: 0;
}
</style>
