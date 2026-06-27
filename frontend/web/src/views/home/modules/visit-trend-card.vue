<template>
  <ElCard shadow="hover" class="home-card h-full">
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div class="text-base font-semibold text-g-900">知识库使用趋势</div>
          <div class="mt-1 text-xs text-g-500">近 7 日问答与检索调用走势</div>
        </div>
        <ElTag type="primary" effect="light">实时统计</ElTag>
      </div>
    </template>

    <FaECharts :options="chartOptions" height="320px" />
  </ElCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import FaECharts from "@/components/ECharts/index.vue";

defineOptions({ name: "VisitTrendCard" });

const dates = ["06-06", "06-07", "06-08", "06-09", "06-10", "06-11", "06-12"];
const chatData = [42, 58, 54, 73, 88, 82, 104];
const retrievalData = [88, 106, 124, 136, 148, 164, 182];

const chartOptions = computed(() => ({
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "line" },
  },
  legend: {
    top: 0,
    right: 0,
    data: ["AI 对话", "知识检索"],
  },
  grid: {
    top: 44,
    left: 12,
    right: 16,
    bottom: 8,
    containLabel: true,
  },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: dates,
    axisLine: { lineStyle: { color: "#dcdfe6" } },
    axisTick: { show: false },
  },
  yAxis: {
    type: "value",
    splitLine: { lineStyle: { type: "dashed", color: "#ebeef5" } },
  },
  series: [
    {
      name: "AI 对话",
      type: "line",
      smooth: true,
      symbolSize: 7,
      data: chatData,
      itemStyle: { color: "#409eff" },
      lineStyle: { width: 3, color: "#409eff" },
      areaStyle: { color: "rgba(64, 158, 255, 0.12)" },
    },
    {
      name: "知识检索",
      type: "line",
      smooth: true,
      symbolSize: 7,
      data: retrievalData,
      itemStyle: { color: "#67c23a" },
      lineStyle: { width: 3, color: "#67c23a" },
      areaStyle: { color: "rgba(103, 194, 58, 0.1)" },
    },
  ],
}));
</script>

<style scoped lang="scss">
.home-card {
  min-height: 420px;
}
</style>
