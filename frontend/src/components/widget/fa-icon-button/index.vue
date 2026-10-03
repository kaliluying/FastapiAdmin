<!-- 按钮组件 -->
<template>
  <button
    type="button"
    class="fa-icon-button size-8.5 inline-flex items-center justify-center cursor-pointer text-g-600 dark:text-g-800 text-xl rounded transition duration-300 hover:bg-hover-color"
    :class="{ 'rounded-full': circle }"
    :aria-label="label"
  >
    <FaSvgIcon :icon="icon"></FaSvgIcon>
    <slot></slot>
  </button>
</template>

<script lang="ts" setup>
defineOptions({ name: "FaIconButton" });

interface Props {
  /** 图标名称 */
  icon: string;
  /** 圆角按钮 */
  circle?: boolean;
  label?: string;
}

withDefaults(defineProps<Props>(), {});
</script>

<style scoped lang="scss">
.fa-icon-button {
  padding: 0;
  background-color: transparent;
  border: 0;

  &:focus-visible {
    outline: 2px solid var(--el-color-primary);
    outline-offset: 3px;
  }
}

@media (pointer: coarse) {
  .fa-icon-button {
    min-width: 44px;
    min-height: 44px;
  }
}
</style>
