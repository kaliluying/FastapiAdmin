<template>
  <div class="panel p1">
    <div class="panel-hd">
      <span class="dot warn" />热门排行
      <span class="rank-badge">实时</span>
    </div>
    <div class="rank-list">
      <div v-for="(item, i) in list" :key="item.name" class="rank-row">
        <span class="rank-idx" :class="'top' + (i + 1)">{{ i + 1 }}</span>
        <span class="rank-name">{{ item.name }}</span>
        <span class="rank-bar-wrap">
          <span
            class="rank-bar"
            :style="{ width: item.ratio * 100 + '%', background: item.color }"
          />
        </span>
        <span class="rank-val">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, onUnmounted } from "vue";

defineOptions({ name: "HotRanking" });

const colors = [
  "#00d4ff",
  "#7c3aed",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

const list = reactive([
  { name: "iPhone 15 Pro", value: "892单", ratio: 0, color: colors[0] },
  { name: "MacBook Air M3", value: "651单", ratio: 0, color: colors[1] },
  { name: "AirPods Pro 2", value: "534单", ratio: 0, color: colors[2] },
  { name: "iPad Mini 7", value: "412单", ratio: 0, color: colors[3] },
  { name: "Apple Watch S9", value: "298单", ratio: 0, color: colors[4] },
  { name: "Samsung S24 Ultra", value: "187单", ratio: 0, color: colors[5] },
  { name: "华为 Mate 60 Pro", value: "165单", ratio: 0, color: colors[6] },
  { name: "Sony WH-1000XM5", value: "142单", ratio: 0, color: colors[7] },
]);

let timer = 0;

function tick() {
  const vals = list.map(() => Math.round(100 + Math.random() * 800));
  const max = Math.max(...vals);
  list.forEach((item, i) => {
    item.value = vals[i] + "单";
    item.ratio = vals[i] / max;
  });
  list.sort((a, b) => parseInt(b.value) - parseInt(a.value));
}

onMounted(() => {
  tick();
  timer = window.setInterval(tick, 5000);
});
onUnmounted(() => clearInterval(timer));
</script>

<style scoped>
.rank-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  overflow: auto;
}
.rank-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}
.rank-idx {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  background: rgba(26, 40, 80, 0.6);
  flex-shrink: 0;
}
.rank-idx.top1 {
  background: rgba(0, 212, 255, 0.2);
  color: #00d4ff;
}
.rank-idx.top2 {
  background: rgba(124, 58, 237, 0.2);
  color: #7c3aed;
}
.rank-idx.top3 {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}
.rank-name {
  width: 100px;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rank-bar-wrap {
  flex: 1;
  height: 5px;
  background: rgba(26, 40, 80, 0.4);
  border-radius: 3px;
  overflow: hidden;
}
.rank-bar {
  display: block;
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s;
}
.rank-val {
  flex-shrink: 0;
  opacity: 0.7;
  font-variant-numeric: tabular-nums;
  font-size: 11px;
}
.rank-badge {
  margin-left: auto;
  font-size: 10px;
  opacity: 0.5;
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  padding: 2px 8px;
  border-radius: 10px;
  animation: blink 2s infinite;
}
@keyframes blink {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
</style>
