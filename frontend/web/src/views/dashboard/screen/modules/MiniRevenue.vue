<template>
  <div class="mini-chart-panel">
    <div class="mc-hd">当日交易额</div>
    <div class="mc-value" style="color: #00d4ff">¥{{ val }}<span class="mc-unit">万</span></div>
    <div ref="chartRef" class="mc-chart" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";

defineOptions({ name: "MiniRevenue" });

const chartRef = ref<HTMLDivElement>();
let chart: echarts.ECharts | null = null;
let timer = 0;
const val = ref(128.6);

function initChart(dom: HTMLDivElement) {
  chart = echarts.init(dom);
  chart.setOption({
    series: [
      {
        type: "gauge",
        startAngle: 210,
        endAngle: -30,
        center: ["50%", "58%"],
        radius: "78%",
        min: 0,
        max: 200,
        axisLine: {
          lineStyle: {
            width: 6,
            color: [
              [0.5, "#00d4ff"],
              [0.8, "#7c3aed"],
              [1, "#ef4444"],
            ],
          },
        },
        pointer: { length: "55%", width: 3, itemStyle: { color: "#00d4ff" } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 14,
          fontWeight: 700,
          color: "#00d4ff",
          offsetCenter: [0, "42%"],
          formatter: "",
        },
        data: [{ value: 128.6 }],
      },
    ],
  });
}

function tick() {
  if (!chart || chart.isDisposed()) return;
  const n = +(105 + Math.random() * 50).toFixed(1);
  val.value = n;
  chart.setOption({ series: [{ data: [{ value: n }] }] });
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
  border-top: 1px solid rgba(0, 212, 255, 0.4);
  border-left: 1px solid rgba(0, 212, 255, 0.4);
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
