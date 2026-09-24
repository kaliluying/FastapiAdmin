<template>
  <section class="home-command-hero" aria-labelledby="workspace-title">
    <div class="hero-main">
      <div class="hero-kicker"><span class="hero-kicker__line"></span> FASTAPIADMIN / 工作台</div>
      <h1 id="workspace-title">{{ greeting }}，{{ currentUser.name }}</h1>
      <p>从这里查看系统运行状态与当前账号可用的工作范围。</p>

      <div class="operator-line">
        <ElAvatar v-if="currentUser.avatar" :size="34" :src="currentUser.avatar" />
        <span v-else class="operator-avatar" aria-hidden="true">
          <FaSvgIcon icon="ri:user-line" />
        </span>
        <span class="operator-line__name">{{ currentUser.username }}</span>
        <span class="operator-line__divider" aria-hidden="true"></span>
        <span>最近登录 {{ currentUser.last_login || "暂无记录" }}</span>
      </div>
    </div>

    <div class="hero-health" :class="'hero-health--' + healthState">
      <div class="hero-health__top">
        <span class="hero-health__label">基础服务</span>
        <button
          type="button"
          class="hero-health__refresh"
          :disabled="healthLoading"
          aria-label="重新检查系统健康"
          @click="$emit('refresh')"
        >
          <FaSvgIcon icon="ri:refresh-line" />
        </button>
      </div>
      <div class="hero-health__state">
        <span class="hero-health__signal" aria-hidden="true"></span>
        <strong>{{ healthLabel }}</strong>
      </div>
      <p>{{ healthDescription }}</p>
      <span class="hero-health__footnote">数据库 · Redis · 磁盘</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useUserStore } from "@stores";

defineOptions({ name: "HomeBanner" });

type HealthState = "loading" | "healthy" | "degraded" | "unavailable";

const props = defineProps<{
  healthState: HealthState;
  healthDescription: string;
  healthLoading: boolean;
}>();

defineEmits<{ refresh: [] }>();

const userStore = useUserStore();
const currentUser = computed(() => {
  const info = userStore.basicInfo;
  return {
    avatar: info.avatar || "",
    name: info.name || info.username || "管理员",
    username: info.username || "当前账号",
    last_login: info.last_login || "",
  };
});
const hour = new Date().getHours();
const greeting = hour < 12 ? "早上好" : hour < 18 ? "下午好" : "晚上好";
const healthLabel = computed(() => {
  const labels: Record<HealthState, string> = {
    loading: "检查中",
    healthy: "运行正常",
    degraded: "需要检查",
    unavailable: "暂不可用",
  };
  return labels[props.healthState];
});
</script>

<style scoped lang="scss">
.home-command-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 320px);
  min-height: 260px;
  overflow: hidden;
  color: #f3f8f7;
  background: #183a3c;
  border: 1px solid #24494a;
  border-radius: 14px;
}

.hero-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 34px 40px 30px;
  background:
    linear-gradient(110deg, transparent 55%, rgb(133 184 166 / 8%) 100%),
    repeating-linear-gradient(135deg, transparent 0 56px, rgb(255 255 255 / 3%) 57px 58px);
}

.hero-kicker {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 28px;
  font-size: 11px;
  font-weight: 700;
  color: #a9d5cc;
  letter-spacing: 0.14em;
}

.hero-kicker__line {
  width: 22px;
  height: 1px;
  background: currentcolor;
}

h1 {
  margin: 0;
  font-size: clamp(26px, 2.5vw, 36px);
  font-weight: 680;
  line-height: 1.25;
  color: #fff;
  letter-spacing: -0.035em;
}

.hero-main > p {
  margin: 12px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: #c4d8d4;
}

.operator-line {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding-top: 28px;
  margin-top: auto;
  font-size: 12px;
  color: #c4d8d4;
}

.operator-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  font-size: 17px;
  color: #d9f5ed;
  background: rgb(255 255 255 / 12%);
  border-radius: 50%;
}

.operator-line__name {
  font-weight: 650;
  color: #fff;
}

.operator-line__divider {
  width: 1px;
  height: 14px;
  margin: 0 3px;
  background: rgb(255 255 255 / 26%);
}

.hero-health {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 30px 30px 24px;
  background: rgb(4 22 24 / 18%);
  border-left: 1px solid rgb(255 255 255 / 12%);
}

.hero-health__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-health__label,
.hero-health__footnote {
  font-size: 11px;
  font-weight: 600;
  color: #a9c3be;
  letter-spacing: 0.06em;
}

.hero-health__refresh {
  display: inline-grid;
  place-items: center;
  width: 30px;
  height: 30px;
  color: #c4d8d4;
  cursor: pointer;
  background: transparent;
  border: 1px solid rgb(255 255 255 / 22%);
  border-radius: 7px;
}

.hero-health__refresh:hover:not(:disabled) {
  color: #fff;
  background: rgb(255 255 255 / 12%);
}

.hero-health__refresh:focus-visible {
  outline: 2px solid #a9d5cc;
  outline-offset: 3px;
}

.hero-health__refresh:disabled {
  cursor: wait;
  opacity: 0.5;
}

.hero-health__state {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 26px;
}

.hero-health__state strong {
  font-size: 25px;
  font-weight: 650;
  line-height: 1.2;
  color: #fff;
}

.hero-health__signal {
  width: 11px;
  height: 11px;
  background: #93e2b7;
  border-radius: 50%;
  box-shadow: 0 0 0 5px rgb(147 226 183 / 14%);
}

.hero-health--loading .hero-health__signal {
  background: #b4c8c8;
  box-shadow: 0 0 0 5px rgb(180 200 200 / 14%);
}

.hero-health--degraded .hero-health__signal,
.hero-health--unavailable .hero-health__signal {
  background: #f0bd76;
  box-shadow: 0 0 0 5px rgb(240 189 118 / 14%);
}

.hero-health p {
  margin: 14px 0 24px;
  font-size: 12px;
  line-height: 1.7;
  color: #d2e2df;
  overflow-wrap: anywhere;
}

.hero-health__footnote {
  margin-top: auto;
}

@media (width <= 900px) {
  .home-command-hero {
    grid-template-columns: 1fr;
  }

  .hero-health {
    border-top: 1px solid rgb(255 255 255 / 12%);
    border-left: 0;
  }
}

@media (width <= 560px) {
  .hero-main,
  .hero-health {
    padding: 24px;
  }

  .hero-kicker {
    margin-bottom: 20px;
  }

  .operator-line__divider {
    display: none;
  }

  .operator-line {
    gap: 8px;
  }
}
</style>
