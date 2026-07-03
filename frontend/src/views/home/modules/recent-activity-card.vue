<template>
  <ElCard shadow="hover" class="home-card h-full">
    <template #header>
      <div>
        <div class="text-base font-semibold text-g-900">最近活动</div>
        <div class="mt-1 text-xs text-g-500">后台与知识库关键动态</div>
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
    description: "完成后台权限校验，加载单组织菜单。",
    type: "primary",
  },
  {
    time: "17:20",
    title: "知识库文档完成解析",
    description: "文档切片已写入 MySQL，并提交到 Chroma 集合。",
    type: "success",
  },
  {
    time: "16:05",
    title: "检索测试通过",
    description: "命中相关片段并返回引用上下文。",
    type: "warning",
  },
  {
    time: "15:32",
    title: "模型配置已确认",
    description: "OpenAI 兼容模型与 Embedding 参数已读取。",
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
