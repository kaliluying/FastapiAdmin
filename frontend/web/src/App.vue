<template>
  <ElConfigProvider
    :size="size"
    :locale="locale"
    :z-index="3000"
    :card="{
      shadow: 'never',
    }"
  >
    <div class="wh-full">
      <RouterView></RouterView>

      <!-- AI 助手 -->
      <AiAssistant v-if="enableAiAssistant" />
    </div>
  </ElConfigProvider>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, onMounted, onUnmounted } from "vue";
import { useAppStore, useUserStore } from "./store";
import { useSettingsStore } from "./store/modules/setting.store";
import { ComponentSize } from "./enums/settings/layout.enum";
import AiAssistant from "./components/others/fa-ai-assistant/index.vue";
import { toggleTransition } from "./utils/ui";
import { initializeTheme } from "./hooks/core/useTheme";
import { useAppBootstrap } from "@/hooks/core/useAppBootstrap";
import en from "element-plus/es/locale/lang/en";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { router } from "@/router";

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const userStore = useUserStore();

const size = computed(() => appStore.size as ComponentSize);

// 根据语言设置返回对应的语言包
const locale = computed(() => {
  return appStore.language === "en" ? en : zhCn;
});

// 只有在启用 AI 助手且用户已登录时才显示
const enableAiAssistant = computed(() => {
  const isEnabled = settingsStore.userEnableAi;
  const isLoggedIn = userStore.basicInfo && Object.keys(userStore.basicInfo).length > 0;
  return isEnabled && isLoggedIn;
});

// 水印文字默认使用当前主题色（半透明），随主题色设置变化

/**
 * 应用根组件生命周期：
 *
 * onBeforeMount
 *   1. toggleTransition(true)  —— 临时禁用页面过渡，避免主题切换时的闪烁
 *   2. initializeTheme()       —— 加载主题配色(CSS 变量)、暗色模式 class、auto 监听
 *
 * onMounted
 *   1. bootstrap()                                —— 存储检查 → 过渡恢复 → 版本升级 → 站点配置
 *   2. 监听 "app:storage-invalidated" 事件        —— 存储异常时由 storage 模块派发
 */
onBeforeMount(() => {
  toggleTransition(true);
  initializeTheme();
});

// 存储失效时跳转登录页（由 storage 模块 detect 到异常后派发）
const handleStorageInvalidated = () => {
  router.push({ name: "Login" });
};

const { bootstrap } = useAppBootstrap();

onMounted(() => {
  bootstrap();

  // 存储检测到异常并已清除数据 → 由路由守卫完成登出清理
  window.addEventListener("app:storage-invalidated", handleStorageInvalidated);
});

onUnmounted(() => {
  window.removeEventListener("app:storage-invalidated", handleStorageInvalidated);
});
</script>
