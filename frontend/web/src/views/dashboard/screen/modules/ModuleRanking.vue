<template>
  <div class="panel p1 col-3 row-2">
    <div class="panel-hd"><span class="dot warn" />模块热度 TOP10</div>
    <div class="rank-list">
      <div v-for="(r, i) in ranks" :key="r.name" class="rank-row">
        <span class="rank-no" :class="'rk-' + (i + 1)">{{ i + 1 }}</span>
        <span class="rank-name">{{ r.name }}</span>
        <span class="rank-bar-wrap"
          ><span class="rank-bar" :style="{ width: r.pct + '%', background: rankColor(i) }"
        /></span>
        <span class="rank-val">{{ r.val }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineOptions({ name: "ModuleRanking" });

const ranks = ref([
  { name: "用户管理", val: 1542, pct: 100 },
  { name: "操作日志", val: 892, pct: 78 },
  { name: "菜单管理", val: 197, pct: 55 },
  { name: "AI 助手", val: 156, pct: 42 },
  { name: "代码生成", val: 38, pct: 35 },
  { name: "角色管理", val: 45, pct: 28 },
  { name: "字典管理", val: 56, pct: 22 },
  { name: "文件管理", val: 128, pct: 18 },
  { name: "部门管理", val: 12, pct: 12 },
  { name: "定时任务", val: 24, pct: 8 },
]);

const RANK_COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#00d4ff", "#7c3aed", "#10b981"];

function rankColor(i: number) {
  return RANK_COLORS[i % RANK_COLORS.length];
}
</script>

<style scoped>
.rank-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  overflow: auto;
}
.rank-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}
.rank-no {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  background: rgba(26, 32, 80, 0.6);
}
.rk-1 {
  background: #ef4444 !important;
  color: #fff;
}
.rk-2 {
  background: #f59e0b !important;
  color: #fff;
}
.rk-3 {
  background: #3b82f6 !important;
  color: #fff;
}
.rank-name {
  width: 60px;
  flex-shrink: 0;
}
.rank-bar-wrap {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgba(26, 32, 80, 0.6);
  overflow: hidden;
}
.rank-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s;
}
.rank-val {
  width: 30px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
</style>
