<template>
  <div class="home-workspace">
    <FaPageHeader title="运营总览" description="单组织后台运营快览，含知识库、对话与系统状态。" />

    <Banner class="mb-5" />

    <!-- 运营指标概览 — 示例数据（静态演示值，接入实时 API 后替换） -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
      <div v-for="m in demoMetrics" :key="m.label" class="demo-metric-card">
        <span class="demo-badge">示例数据</span>
        <div class="demo-metric-value">{{ m.value }}</div>
        <div class="demo-metric-label">{{ m.label }}</div>
      </div>
    </div>

    <ElRow :gutter="16">
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

    <ElRow :gutter="16">
      <ElCol :xs="24" :lg="16" class="mb-5">
        <VisitTrendCard />
      </ElCol>
      <ElCol :xs="24" :lg="8" class="mb-5">
        <RecentActivityCard />
      </ElCol>
    </ElRow>

    <!-- 待处理事项 -->
    <div class="pending-section mb-5">
      <div class="pending-section__title">待处理事项</div>
      <ul class="pending-list">
        <li v-for="item in pendingItems" :key="item.id" class="pending-item">
          <span class="pending-item__tag" :class="`pending-item__tag--${item.level}`">{{
            item.tag
          }}</span>
          <span class="pending-item__text">{{ item.title }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import FaPageHeader from "@/components/layouts/fa-page-header/index.vue";
import Banner from "./modules/banner.vue";
import OnlineUserCard from "./modules/online-user-card.vue";
import RecentActivityCard from "./modules/recent-activity-card.vue";
import VisitStatCard from "./modules/visit-stat-card.vue";
import VisitTrendCard from "./modules/visit-trend-card.vue";

defineOptions({ name: "Home", inheritAttrs: false });

// 示例数据 — 静态演示值，接入实时 API 后可替换
const demoMetrics = [
  { label: "平均响应", value: "180ms" },
  { label: "今日活跃用户", value: "24" },
  { label: "系统可用率", value: "99.8%" },
  { label: "告警数量", value: "0" },
];

type PendingItem = {
  id: number;
  tag: string;
  level: "info" | "warning";
  title: string;
};

const pendingItems: PendingItem[] = [
  { id: 1, tag: "知识库", level: "info", title: "3 篇文档待完成 Embedding 写入" },
  { id: 2, tag: "系统", level: "warning", title: "1 项参数配置待确认" },
  { id: 3, tag: "用户", level: "info", title: "新增账号待分配角色" },
];

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

.demo-metric-card {
  position: relative;
  padding: var(--fa-space-4) var(--fa-space-5);
  background:
    linear-gradient(180deg, var(--fa-surface-sheen-top), var(--fa-surface-sheen-bottom)),
    var(--default-box-color);
  border: 1px solid var(--fa-card-border);
  border-radius: 12px;
  box-shadow: var(--fa-elevation-1);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover {
    box-shadow: var(--fa-elevation-3);
    transform: translateY(-2px);
  }
}

.demo-badge {
  display: inline-block;
  padding: 1px 7px;
  margin-bottom: 10px;
  font-size: 10px;
  font-weight: 600;
  color: var(--el-color-warning-dark-2);
  background: var(--el-color-warning-light-9);
  border: 1px solid var(--el-color-warning-light-7);
  border-radius: 20px;
}

.demo-metric-value {
  margin-bottom: 4px;
  font-size: var(--fa-text-2xl);
  font-weight: var(--fa-weight-bold);
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--fa-gray-900);
}

.demo-metric-label {
  font-size: var(--fa-text-sm);
  color: var(--fa-gray-600);
}

.pending-section {
  padding: var(--fa-space-4) var(--fa-space-5);
  background:
    linear-gradient(180deg, var(--fa-surface-sheen-top), var(--fa-surface-sheen-bottom)),
    var(--default-box-color);
  border: 1px solid var(--fa-card-border);
  border-radius: 12px;
  box-shadow: var(--fa-elevation-1);

  &__title {
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.pending-list {
  display: grid;
  gap: 8px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.pending-item {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px 10px;
  font-size: 13px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
}

.pending-item__tag {
  flex-shrink: 0;
  padding: 1px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 20px;

  &--info {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  &--warning {
    color: var(--el-color-warning-dark-2);
    background: var(--el-color-warning-light-9);
  }
}

.pending-item__text {
  color: var(--el-text-color-primary);
}
</style>
