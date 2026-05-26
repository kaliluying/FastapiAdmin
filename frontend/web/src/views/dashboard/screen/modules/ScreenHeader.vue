<template>
  <header class="screen-header">
    <div class="header-left">
      <span class="dot" :class="{ pulse: online }" />
      <span class="text-xs">SYSTEM ONLINE</span>
    </div>
    <h1 class="screen-title">
      <span class="deco-line" />
      FastapiAdmin · 智能运营数据监控平台
      <span class="deco-line" />
    </h1>
    <div class="header-right">
      <button class="fullscreen-btn" :title="isFs ? '退出全屏' : '进入全屏'" @click="handleToggle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="fs-icon">
          <path
            v-if="isFs"
            d="M4 14h2v2h2v2H4v-4zm12 0h2v2h2v2h-4v-4zM4 4h4v2H6v2H4V4zm14 0h4v4h-2V6h-2V4z"
          />
          <path
            v-else
            d="M4 4h4v2H6v2H4V4zm14 0h4v4h-2V6h-2V4zM4 20h4v-2H6v-2H4v4zm14 0h4v-4h-2v2h-2v2z"
          />
        </svg>
      </button>
      <span class="header-time font-mono text-sm">{{ currentTime }}</span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted } from "vue";

defineOptions({ name: "ScreenHeader" });

const toggleFullscreen = inject<() => void>("toggleFullscreen", () => {});
const isFs = inject("isFullscreen", ref(false));

const online = ref(true);
const currentTime = ref("");

let timer = 0;
onMounted(() => {
  const tick = () => {
    currentTime.value = new Date().toLocaleString("zh-CN", { hour12: false });
  };
  tick();
  timer = window.setInterval(tick, 1000);
});
onUnmounted(() => clearInterval(timer));

function handleToggle() {
  toggleFullscreen();
}
</script>

<style scoped>
.screen-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 32px 14px;
  border-bottom: 1px solid rgba(26, 40, 80, 0.6);
  margin-bottom: 12px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 140px;
  font-size: 12px;
  opacity: 0.7;
}
.header-right {
  width: 200px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}
.header-time {
  opacity: 0.7;
  font-variant-numeric: tabular-nums;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
  background: #00d4ff;
}
.pulse {
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    box-shadow: 0 0 8px #00d4ff;
  }
  50% {
    opacity: 0.3;
  }
}
.screen-title {
  flex: 1;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 4px;
  text-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
}
.deco-line {
  display: inline-block;
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00d4ff, transparent);
  vertical-align: middle;
  margin: 0 12px;
}
.fullscreen-btn {
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  color: var(--accent, #00d4ff);
  display: flex;
  align-items: center;
  transition: background 0.2s;
}
.fullscreen-btn:hover {
  background: rgba(0, 212, 255, 0.2);
}
.fs-icon {
  width: 16px;
  height: 16px;
}
</style>
