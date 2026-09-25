<template>
  <header class="home-header">
    <h1>工作台</h1>
    <div
      v-if="healthState === 'degraded' || healthState === 'unavailable'"
      class="health-alert"
      role="status"
    >
      <FaSvgIcon icon="ri:error-warning-line" aria-hidden="true" />
      <span>{{ healthDescription }}</span>
      <button type="button" :disabled="healthLoading" @click="$emit('refresh')">
        {{ healthLoading ? "检查中" : "重试" }}
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
defineOptions({ name: "HomeBanner" });

defineProps<{
  healthState: "loading" | "healthy" | "degraded" | "unavailable";
  healthDescription: string;
  healthLoading: boolean;
}>();

defineEmits<{ refresh: [] }>();
</script>

<style scoped lang="scss">
.home-header {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

h1 {
  margin: 0;
  font-size: 25px;
  font-weight: 650;
  line-height: 1.3;
  color: var(--fa-color-text);
}

.health-alert {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  min-height: 34px;
  padding: 5px 10px;
  font-size: 12px;
  color: var(--fa-color-warning);
  background: var(--el-color-warning-light-9);
  border: 1px solid var(--el-color-warning-light-7);
  border-radius: 7px;
}

.health-alert button {
  padding: 0;
  font: inherit;
  font-weight: 600;
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  background: none;
  border: 0;
}

.health-alert button:disabled {
  cursor: wait;
  opacity: 0.6;
}

.health-alert button:focus-visible {
  outline: 2px solid var(--fa-color-accent);
  outline-offset: 3px;
}
</style>
