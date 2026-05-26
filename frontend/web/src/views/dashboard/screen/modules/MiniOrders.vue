<template>
  <div class="mini-chart-panel">
    <div class="mc-hd">已完成订单</div>
    <div class="mc-value" style="color: #7c3aed">{{ val }}</div>
    <div ref="chartRef" class="mc-chart" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";

defineOptions({ name: "MiniOrders" });

const chartRef = ref<HTMLDivElement>();
let chart: echarts.ECharts | null = null;
let timer = 0;
const val = ref(3856);

function initChart(dom: HTMLDivElement) {
  chart = echarts.init(dom);
  chart.setOption({
    tooltip: { show: false },
    series: [
      {
        type: "pie",
        radius: ["55%", "78%"],
        center: ["50%", "58%"],
        label: { show: false },
        itemStyle: { borderColor: "#060b24", borderWidth: 1 },
        data: [
          { value: 3856, name: "已完成", itemStyle: { color: "#7c3aed" } },
          { value: 843, name: "处理中", itemStyle: { color: "#a78bfa" } },
          { value: 213, name: "待付款", itemStyle: { color: "#1a2050" } },
        ],
      },
    ],
  });
}

function tick() {
  if (!chart || chart.isDisposed()) return;
  const n = Math.round(3000 + Math.random() * 2000);
  val.value = n;
  chart.setOption({
    series: [
      {
        data: [
          { value: n },
          { value: Math.round(500 + Math.random() * 600) },
          { value: Math.round(100 + Math.random() * 200) },
        ],
      },
    ],
  });
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
  border-top: 1px solid rgba(124, 58, 237, 0.4);
  border-left: 1px solid rgba(124, 58, 237, 0.4);
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
.mc-chart {
  flex: 1;
  min-height: 0;
}
</style>
