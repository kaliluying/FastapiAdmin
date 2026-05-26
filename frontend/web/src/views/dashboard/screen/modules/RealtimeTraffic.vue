<template>
  <div class="panel p1">
    <div class="panel-hd"><span class="dot green" />实时流量</div>
    <div class="traffic-grid">
      <div v-for="item in data" :key="item.label" class="tr-card">
        <div class="tr-label">{{ item.label }}</div>
        <div class="tr-value" :style="{ color: item.color }">
          {{ item.value }}<span class="tr-unit">{{ item.unit }}</span>
        </div>
        <div class="tr-bar-wrap">
          <div class="tr-bar" :style="{ width: item.pct + '%', background: item.color }" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, onUnmounted } from "vue";

defineOptions({ name: "RealtimeTraffic" });

const data = reactive([
  { label: "PV", value: "8,350", unit: "", color: "#00d4ff", pct: 0, base: 8350 },
  { label: "UV", value: "3,216", unit: "", color: "#7c3aed", pct: 0, base: 3216 },
  { label: "IP", value: "2,048", unit: "", color: "#10b981", pct: 0, base: 2048 },
  { label: "跳出率", value: "32.5", unit: "%", color: "#f59e0b", pct: 0, base: 32.5 },
]);

let timer = 0;

function tick() {
  data[0].base += Math.round((Math.random() - 0.5) * 120);
  data[1].base += Math.round((Math.random() - 0.5) * 60);
  data[2].base += Math.round((Math.random() - 0.5) * 40);
  data[3].base = +(30 + Math.random() * 8).toFixed(1);
  data[0].value = data[0].base.toLocaleString();
  data[1].value = data[1].base.toLocaleString();
  data[2].value = data[2].base.toLocaleString();
  data[3].value = data[3].base.toFixed(1);
  const max = Math.max(data[0].base, data[1].base, data[2].base);
  data[0].pct = (data[0].base / max) * 100;
  data[1].pct = (data[1].base / max) * 100;
  data[2].pct = (data[2].base / max) * 100;
  data[3].pct = +data[3].value;
}

onMounted(() => {
  tick();
  timer = window.setInterval(tick, 3000);
});
onUnmounted(() => clearInterval(timer));
</script>

<style scoped>
.traffic-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 8px;
  flex: 1;
}
.tr-card {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.04) 0%, rgba(0, 20, 60, 0.3) 100%);
  border: 1px solid rgba(0, 180, 255, 0.06);
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.tr-label {
  font-size: 10px;
  opacity: 0.35;
  margin-bottom: 2px;
}
.tr-value {
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
  display: flex;
  align-items: baseline;
  gap: 2px;
}
.tr-unit {
  font-size: 10px;
  font-weight: 400;
  opacity: 0.4;
}
.tr-bar-wrap {
  height: 2px;
  background: rgba(26, 40, 80, 0.4);
  border-radius: 1px;
  overflow: hidden;
}
.tr-bar {
  height: 100%;
  border-radius: 1px;
  transition: width 0.8s;
}
</style>
