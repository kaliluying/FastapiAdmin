<template>
  <ElCard shadow="hover" class="home-card h-full">
    <template #header>
      <div>
        <div class="text-base font-semibold text-g-900">最近活动</div>
        <div class="mt-1 text-xs text-g-500">系统关键操作动态</div>
      </div>
    </template>

    <ElTimeline class="activity-timeline">
      <ElTimelineItem
        v-for="item in activities"
        :key="item.time"
        :timestamp="item.time"
        :type="item.type"
        placement="top"
      >
        <div class="text-sm font-medium text-g-900">{{ item.title }}</div>
        <div class="mt-1 text-xs leading-5 text-g-500">{{ item.description }}</div>
      </ElTimelineItem>
    </ElTimeline>
  </ElCard>
</template>

<script setup lang="ts">
defineOptions({ name: "RecentActivityCard" });

type TimelineType = "primary" | "success" | "warning" | "danger" | "info" | "";

type Activity = {
  time: string;
  title: string;
  description: string;
  type: TimelineType;
};

const activities: Activity[] = [
  {
    time: "18:47",
    title: "超级管理员登录系统",
    description: "来自软件专业部，完成后台权限校验。",
    type: "primary",
  },
  {
    time: "17:20",
    title: "刷新在线用户统计",
    description: "同步 PC 端、移动端和多端会话数量。",
    type: "success",
  },
  {
    time: "16:05",
    title: "访问趋势报表生成",
    description: "完成近 7 日 UV / PV 趋势数据聚合。",
    type: "warning",
  },
  {
    time: "15:32",
    title: "系统配置已更新",
    description: "企业级中后台基础配置保存成功。",
    type: "info",
  },
];
</script>

<style scoped lang="scss">
.activity-timeline {
  padding-left: 4px;

  :deep(.el-timeline-item:last-child) {
    padding-bottom: 0;
  }
}

.home-card {
  min-height: 420px;
}
</style>
