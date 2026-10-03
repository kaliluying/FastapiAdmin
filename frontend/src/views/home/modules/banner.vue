<template>
  <header class="home-header">
    <div>
      <h1>工作台</h1>
      <p>
        欢迎回来<span v-if="userName">，{{ userName }}</span
        >。从这里开始今天的工作。
      </p>
    </div>
    <div class="home-health" :class="`home-health--${healthState}`" role="status">
      <button
        type="button"
        :disabled="healthLoading"
        :aria-label="`刷新基础服务状态：${healthLoading ? healthLabels.loading : healthLabels[healthState]}`"
        @click="$emit('refresh')"
      >
        <span class="home-health__dot" aria-hidden="true" />
        {{ healthLoading ? "正在检查基础服务" : healthLabels[healthState] }}
        <FaSvgIcon icon="ri:refresh-line" aria-hidden="true" />
      </button>
      <p v-if="healthState === 'degraded' || healthState === 'unavailable'">
        {{ healthDescription }}
      </p>
    </div>
  </header>
</template>

<script setup lang="ts">
defineOptions({ name: "HomeBanner" });

defineProps<{
  healthState: "loading" | "healthy" | "degraded" | "unavailable";
  healthDescription: string;
  healthLoading: boolean;
  userName: string;
}>();

defineEmits<{ refresh: [] }>();

const healthLabels = {
  loading: "正在检查基础服务",
  healthy: "基础服务正常",
  degraded: "基础服务异常 · 重试",
  unavailable: "状态暂不可用 · 重试",
};
</script>

<style scoped lang="scss">
.home-header {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  align-items: center;
  justify-content: space-between;
  margin: 4px 0 28px;
}

h1 {
  margin: 0;
  font-size: 30px;
  font-weight: 650;
  line-height: 1.4;
  color: var(--fa-color-text);
  letter-spacing: -0.03em;
}

.home-header > div > p {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--fa-color-text-muted);
}

.home-health {
  max-width: 100%;
  font-size: 12px;
  color: var(--fa-color-text-muted);
}

.home-health button {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  min-height: 44px;
  padding: 10px 14px;
  font: inherit;
  color: inherit;
  cursor: pointer;
  background: var(--fa-color-surface);
  border: 1px solid var(--fa-color-border);
  border-radius: 24px;
  transition: border-color 180ms ease;
}

.home-health button:hover {
  border-color: var(--fa-color-text-muted);
}

.home-health button:disabled {
  cursor: wait;
}

.home-health button:focus-visible {
  outline: 2px solid var(--theme-color);
  outline-offset: 3px;
}

.home-health__dot {
  width: 7px;
  height: 7px;
  background: var(--fa-color-text-muted);
  border-radius: 50%;
}

.home-health--healthy .home-health__dot {
  background: var(--fa-color-success);
}

.home-health--degraded .home-health__dot,
.home-health--unavailable .home-health__dot {
  background: var(--fa-color-warning);
}

.home-health > p {
  max-width: 320px;
}

@media (width <= 520px) {
  .home-header {
    margin-bottom: 20px;
  }

  h1 {
    font-size: 26px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-health button {
    transition: none;
  }
}
</style>
