<template>
  <section class="app-main" :style="{ height: appMainHeight }">
    <router-view>
      <template #default="{ Component, route }">
        <transition enter-active-class="animate__animated animate__fadeIn" mode="out-in">
          <keep-alive :include="cachedViews">
            <component :is="Component" :key="route.path" />
          </keep-alive>
        </transition>
      </template>
    </router-view>

    <!-- 返回顶部按钮 -->
    <el-backtop target=".app-main">
      <div class="i-svg:backtop w-6 h-6" />
    </el-backtop>
  </section>
</template>

<script setup lang="ts">
import { useSettingsStore, useTagsViewStore } from "@/store";
import variables from "@/styles/variables.module.scss";

// 缓存页面集合
const cachedViews = computed(() => useTagsViewStore().cachedViews);
const appMainHeight = computed(() => {
  if (useSettingsStore().showTagsView) {
    return `calc(100vh - ${variables["navbar-height"]} - ${variables["tags-view-height"]})`;
  } else {
    return `calc(100vh - ${variables["navbar-height"]})`;
  }
});
</script>

<style lang="scss" scoped>
.app-main {
  position: relative;
  overflow-y: auto;
  background-color: var(--el-bg-color-page);

  /* 布局切换动画优化 */
  &.animate__animated {
    animation-duration: 0.4s;
    animation-fill-mode: forwards;
  }

  &.animate__fadeOut {
    animation-timing-function: ease-in;
  }

  &.animate__fadeIn {
    animation-timing-function: ease-out;
  }
}
</style>
