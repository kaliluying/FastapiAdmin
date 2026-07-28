<template>
  <header class="fa-page-header">
    <div class="fa-page-header__main">
      <div class="fa-page-header__title-row">
        <h1 class="fa-page-header__title">{{ title }}</h1>
        <slot name="status" />
      </div>
      <p v-if="description" class="fa-page-header__description">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="fa-page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
defineOptions({ name: "FaPageHeader" });

interface Props {
  title: string;
  description?: string;
  status?: string;
}

defineProps<Props>();
</script>

<style scoped lang="scss">
.fa-page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 0 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--fa-color-border, var(--el-border-color));

  &__main {
    flex: 1;
    min-width: 0;
  }

  &__title-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  &__title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--fa-color-text, var(--el-text-color-primary));
  }

  &__description {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--fa-color-text-muted, var(--el-text-color-secondary));
  }

  &__actions {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
    margin-left: 16px;
  }
}
</style>
