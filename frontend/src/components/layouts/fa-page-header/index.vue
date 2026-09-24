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
  gap: 16px;
  align-items: flex-end;
  justify-content: space-between;
  padding: 8px 0 20px;
  margin-bottom: 22px;
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
    font-size: clamp(21px, 1.8vw, 26px);
    font-weight: 680;
    line-height: 1.3;
    color: var(--fa-color-text, var(--el-text-color-primary));
    letter-spacing: -0.025em;
  }

  &__description {
    margin: 7px 0 0;
    font-size: 13px;
    line-height: 1.55;
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

@media (width <= 640px) {
  .fa-page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .fa-page-header__actions {
    margin-left: 0;
  }
}
</style>
