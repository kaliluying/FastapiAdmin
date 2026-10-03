<template>
  <main class="fa-exception-screen">
    <section
      class="fa-exception-panel"
      :aria-labelledby="'exception-title-' + data.title"
      :aria-describedby="'exception-help-' + data.title"
    >
      <FaThemeSvg
        :src="data.imgUrl"
        size="100%"
        class="fa-exception-panel__art"
        aria-hidden="true"
      />
      <div class="fa-exception-panel__copy">
        <span class="fa-exception-panel__eyebrow">错误代码 {{ data.title }}</span>
        <h1 ref="headingRef" :id="'exception-title-' + data.title" tabindex="-1">
          {{ data.desc }}
        </h1>
        <p :id="'exception-help-' + data.title">{{ recoveryHint }}</p>
        <ElButton type="primary" size="large" @click="backHome" v-ripple>
          {{ data.btnText }}
        </ElButton>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useCommon } from "@/hooks/core/useCommon";
import { useUserStore } from "@stores";
import { computed, onMounted, ref } from "vue";

const router = useRouter();
const userStore = useUserStore();
const headingRef = ref<HTMLHeadingElement>();

interface ExceptionData {
  /** 标题 */
  title: string;
  /** 描述 */
  desc: string;
  /** 按钮文本 */
  btnText: string;
  /** 图片地址 */
  imgUrl: string;
}

const props = withDefaults(
  defineProps<{
    data: ExceptionData;
  }>(),
  {}
);

const { homePath } = useCommon();
const recoveryHint = computed(() => {
  const hints: Record<string, string> = {
    "401": "请确认登录状态。尚未登录时，返回后可重新登录。",
    "403": "当前账号没有访问权限，请返回工作台或联系管理员确认授权。",
    "404": "请检查页面地址，或从工作台重新打开所需功能。",
    "500": "请求未能完成，请稍后重新操作；如果持续出现，请联系管理员。",
  };
  return hints[props.data.title] || "你可以返回工作台继续操作。";
});

onMounted(() => headingRef.value?.focus({ preventScroll: true }));

const backHome = () => {
  const targetHomePath = homePath.value || "/";

  if (!userStore.isLogin) {
    router.push({
      name: "Login",
      query: { redirect: targetHomePath },
    });
    return;
  }

  router.push(targetHomePath);
};
</script>

<style scoped lang="scss">
.fa-exception-screen {
  display: grid;
  place-items: center;
  min-height: 100dvh;
  padding: 32px;
  background: var(--fa-color-canvas);
}

.fa-exception-panel {
  display: flex;
  gap: clamp(28px, 6vw, 88px);
  align-items: center;
  width: min(100%, 920px);
  padding: clamp(32px, 5vw, 72px);
  background: var(--fa-color-surface);
  border: 1px solid var(--fa-color-border);
  border-radius: var(--fa-radius-panel);
  box-shadow: var(--fa-soft-shadow);
}

.fa-exception-panel__art {
  flex: 0 1 360px;
  min-width: 0;
}

.fa-exception-panel__copy {
  flex: 1;
  min-width: 0;
}

.fa-exception-panel__eyebrow {
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--fa-color-text-muted);
}

.fa-exception-panel h1 {
  margin: 12px 0 0;
  font-size: clamp(21px, 2.3vw, 28px);
  font-weight: 650;
  line-height: 1.35;
  color: var(--fa-color-text);
  overflow-wrap: anywhere;
}

.fa-exception-panel :deep(button:focus-visible) {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 3px;
}

.fa-exception-panel p {
  margin: 10px 0 24px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--fa-color-text-muted);
}

@media (width <= 720px) {
  .fa-exception-screen {
    padding: 16px;
  }

  .fa-exception-panel {
    flex-direction: column;
    align-items: stretch;
    padding: 28px;
  }

  .fa-exception-panel__art {
    flex: 0 0 auto;
    width: min(100%, 240px);
    margin: 0 auto;
  }

  .fa-exception-panel :deep(.el-button) {
    width: 100%;
    min-height: 44px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .fa-exception-panel :deep(.el-button) {
    transition: none;
  }
}
</style>
