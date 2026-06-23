<template>
  <ElCard shadow="hover" class="home-card h-full">
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div class="text-base font-semibold text-g-900">访问趋势</div>
          <div class="mt-1 text-xs text-g-500">近 7 日 UV / PV 访问走势</div>
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
const uvData = [320, 420, 386, 520, 610, 586, 720];
const pvData = [1260, 1480, 1390, 1760, 1980, 1860, 2250];

const chartOptions = computed(() => ({
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "line" },
  },
  legend: {
    top: 0,
    right: 0,
    data: ["UV", "PV"],
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
      name: "UV",
      type: "line",
      smooth: true,
      symbolSize: 7,
      data: uvData,
      itemStyle: { color: "#409eff" },
      lineStyle: { width: 3, color: "#409eff" },
      areaStyle: { color: "rgba(64, 158, 255, 0.12)" },
    },
    {
      name: "PV",
      type: "line",
      smooth: true,
      symbolSize: 7,
      data: pvData,
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
