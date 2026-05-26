<template>
  <div class="mini-chart-panel">
    <div class="mc-hd">库存周转天数</div>
    <div class="mc-value" style="color: #14b8a6">{{ val }}<span class="mc-unit">天</span></div>
    <div class="progress-wrap">
      <div class="progress-track">
        <div
          class="progress-fill"
          :style="{ width: pct + '%', background: 'linear-gradient(90deg, #14b8a6, #06b6d4)' }"
        />
      </div>
      <div class="progress-markers">
        <span>0</span><span>5</span><span>10</span><span>15</span><span>20</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

defineOptions({ name: "MiniInventory" });

const val = ref(8.5);
const pct = ref(42.5);
let timer = 0;

function tick() {
  const n = +(6 + Math.random() * 6).toFixed(1);
  val.value = n;
  pct.value = (n / 20) * 100;
}

onMounted(() => {
  tick();
  timer = window.setInterval(tick, 4000);
});
onUnmounted(() => clearInterval(timer));
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
  border-top: 1px solid rgba(20, 184, 166, 0.4);
  border-left: 1px solid rgba(20, 184, 166, 0.4);
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
  margin-bottom: 8px;
}
.mc-unit {
  font-size: 9px;
  font-weight: 400;
  opacity: 0.4;
  margin-left: 2px;
}
.progress-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.progress-track {
  height: 6px;
  background: rgba(26, 40, 80, 0.4);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}
.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s;
  position: relative;
}
.progress-fill::after {
  content: "";
  position: absolute;
  right: 0;
  top: -2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #14b8a6;
  box-shadow: 0 0 8px #14b8a6;
}
.progress-markers {
  display: flex;
  justify-content: space-between;
  font-size: 8px;
  opacity: 0.25;
  margin-top: 3px;
}
</style>
