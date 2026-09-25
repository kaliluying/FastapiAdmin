<template>
  <main class="fa-exception-screen">
    <section class="fa-exception-panel" :aria-labelledby="'exception-title-' + data.title">
      <FaThemeSvg :src="data.imgUrl" size="100%" class="fa-exception-panel__art" />
      <div class="fa-exception-panel__copy">
        <span class="fa-exception-panel__eyebrow">FastapiAdmin / {{ data.title }}</span>
        <h1 :id="'exception-title-' + data.title">{{ data.desc }}</h1>
        <p>你可以返回工作台继续操作。</p>
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

const router = useRouter();
const userStore = useUserStore();

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

withDefaults(
  defineProps<{
    data: ExceptionData;
  }>(),
  {}
);

const { homePath } = useCommon();

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
  box-shadow: var(--fa-panel-shadow);
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
  font-size: 11px;
  font-weight: 600;
  color: var(--fa-color-accent);
  letter-spacing: 0.1em;
}

.fa-exception-panel h1 {
  margin: 12px 0 0;
  font-size: clamp(21px, 2.3vw, 28px);
  font-weight: 650;
  line-height: 1.35;
  color: var(--fa-color-text);
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
    width: min(100%, 280px);
    margin: 0 auto;
  }
}
</style>
