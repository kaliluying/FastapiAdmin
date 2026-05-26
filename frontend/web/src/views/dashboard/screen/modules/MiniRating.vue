<template>
  <div class="mini-chart-panel">
    <div class="mc-hd">用户综合评分</div>
    <div class="mc-value" style="color: #f43f5e">{{ val }}<span class="mc-unit">分</span></div>
    <div ref="chartRef" class="mc-chart" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";

defineOptions({ name: "MiniRating" });

const chartRef = ref<HTMLDivElement>();
let chart: echarts.ECharts | null = null;
let timer = 0;
const val = ref(92);

const indicators = [
  { name: "商品质量", max: 100 },
  { name: "服务态度", max: 100 },
  { name: "物流速度", max: 100 },
  { name: "性价比", max: 100 },
  { name: "包装完好", max: 100 },
];

function initChart(dom: HTMLDivElement) {
  chart = echarts.init(dom);
  chart.setOption({
    radar: {
      center: ["50%", "56%"],
      radius: "60%",
      indicator: indicators,
      axisName: { color: "#94a3b8", fontSize: 7 },
      splitArea: { areaStyle: { color: ["rgba(244,63,94,0.02)", "rgba(244,63,94,0.02)"] } },
      splitLine: { lineStyle: { color: "#1a2050" } },
      axisLine: { lineStyle: { color: "#1a2050" } },
    },
    series: [
      {
        type: "radar",
        symbol: "none",
        lineStyle: { color: "#f43f5e", width: 1.5 },
        areaStyle: { color: "rgba(244,63,94,0.1)" },
        data: [{ value: [96, 91, 88, 85, 94] }],
      },
    ],
  });
}

function tick() {
  if (!chart || chart.isDisposed()) return;
  const v = indicators.map(() => Math.round(80 + Math.random() * 20));
  const avg = Math.round(v.reduce((a, b) => a + b, 0) / v.length);
  val.value = avg;
  chart.setOption({ series: [{ data: [{ value: v }] }] });
}

onMounted(() => {
  requestAnimationFrame(() => {
    if (chartRef.value) {
      initChart(chartRef.value);
      timer = window.setInterval(tick, 5000);
    }
  });
});
onUnmounted(() => {
  clearInterval(timer);
  chart?.dispose();
});
</script>

<style scoped>
.mini-chart-panel {
  background: linear-gradient(180deg, rgba(0, 30, 80, 0.55) 0%, rgba(6, 11, 36, 0.7) 100%);
  border: 1px solid var(--border, rgba(0, 180, 255, 0.12));
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}
.mini-chart-panel::after {
  content: "";
  position: absolute;
  top: 4px;
  left: 4px;
  width: 6px;
  height: 6px;
  border-top: 1px solid rgba(244, 63, 94, 0.4);
  border-left: 1px solid rgba(244, 63, 94, 0.4);
}
.mc-hd {
  font-size: 10px;
  opacity: 0.35;
  margin-bottom: 2px;
}
.mc-value {
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0;
}
.mc-unit {
  font-size: 9px;
  font-weight: 400;
  opacity: 0.4;
  margin-left: 2px;
}
.mc-chart {
  flex: 1;
  min-height: 0;
}
</style>
