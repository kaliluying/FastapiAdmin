<template>
  <div
    class="login-center-backdrop"
    :class="{ 'login-center-backdrop--viewport-fixed': viewportFixed }"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
defineOptions({ name: "LoginCenterBackdrop" });

interface Props {
  /** 铺满视口并置于底层（与固定顶栏配合） */
  viewportFixed?: boolean;
}

withDefaults(defineProps<Props>(), { viewportFixed: false });
</script>

<style scoped lang="scss">
.login-center-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.login-center-backdrop--viewport-fixed {
  position: fixed;
  inset: 0;
  z-index: 0;
}

.login-center-backdrop::before {
  position: absolute;
  inset: 0;
  content: "";
  background-image: radial-gradient(var(--fa-color-border) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: linear-gradient(transparent, #000 40%, transparent);
}
</style>
