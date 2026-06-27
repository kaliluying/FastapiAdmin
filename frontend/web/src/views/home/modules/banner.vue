<template>
  <section class="home-command-hero">
    <div class="hero-copy">
      <div class="hero-kicker">
        <span class="signal-dot"></span>
        Knowledge Ops Console
      </div>
      <h1>{{ bannerTitle }}</h1>
      <p>{{ bannerSubtitle }}</p>

      <div class="operator-card">
        <ElAvatar
          v-if="currentUser.avatar"
          :size="54"
          :src="currentUser.avatar"
          class="operator-avatar"
        />
        <div v-else class="operator-avatar operator-avatar--fallback">
          <ElIcon :size="28"><UserFilled /></ElIcon>
        </div>
        <div class="operator-meta">
          <strong>{{ currentUser.name }}</strong>
          <span>{{ currentUser.dept_name }} / {{ currentUser.description }}</span>
        </div>
        <div class="operator-login">上次登录：{{ currentUser.last_login }}</div>
      </div>
    </div>

    <div class="hero-status-panel" aria-label="系统运行状态">
      <div class="status-panel-head">
        <span class="panel-dot"></span>
        运行状态
      </div>
      <div class="hero-status-grid">
        <article v-for="item in statusCards" :key="item.label" class="status-chip">
          <span class="status-icon" :class="`status-icon--${item.tone}`">
            <FaSvgIcon :icon="item.icon" />
          </span>
          <div>
            <strong>{{ item.value }}</strong>
            <span>{{ item.label }}</span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { UserFilled } from "@element-plus/icons-vue";
import { useUserStore } from "@stores";
import { greetings } from "@utils";

defineOptions({ name: "HomeBanner" });

type HomeUser = {
  avatar: string;
  name: string;
  username: string;
  dept_name: string;
  description: string;
  last_login: string;
};

const fallbackUser: HomeUser = {
  avatar: "",
  name: "超级管理员",
  username: "super",
  dept_name: "集团总公司",
  description: "系统超级管理员",
  last_login: "-",
};

const userStore = useUserStore();
const timefix = greetings();

const currentUser = computed<HomeUser>(() => {
  const userInfo = userStore.basicInfo;

  return {
    avatar: userInfo.avatar || fallbackUser.avatar,
    name: userInfo.name || fallbackUser.name,
    username: userInfo.username || fallbackUser.username,
    dept_name: userInfo.dept_name || fallbackUser.dept_name,
    description: userInfo.description || fallbackUser.description,
    last_login: userInfo.last_login || fallbackUser.last_login,
  };
});

const bannerTitle = computed(
  () => `${currentUser.value.name}（${currentUser.value.username}）${timefix}`
);

const bannerSubtitle = "单组织后台已接入 AI 对话、知识库检索与系统管理，先看状态，再处理任务。";

const statusCards = [
  { label: "知识库连接", value: "正常", icon: "ri:database-2-line", tone: "cyan" },
  { label: "检索服务", value: "在线", icon: "ri:radar-line", tone: "blue" },
  { label: "待处理动态", value: "4 条", icon: "ri:flashlight-line", tone: "amber" },
];
</script>

<style scoped lang="scss">
.home-command-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 360px);
  gap: 24px;
  min-height: 214px;
  padding: 28px 32px;
  overflow: hidden;
  color: #172033;
  background:
    linear-gradient(135deg, rgb(255 255 255 / 94%), rgb(245 249 255 / 90%)),
    radial-gradient(circle at 18% 12%, rgb(93 135 255 / 18%), transparent 32%),
    radial-gradient(circle at 92% 12%, rgb(45 212 191 / 18%), transparent 30%);
  border: 1px solid rgb(93 135 255 / 18%);
  border-radius: 8px;
  box-shadow: 0 12px 32px rgb(23 32 51 / 8%);
}

.home-command-hero::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: "";
  background-image:
    linear-gradient(rgb(93 135 255 / 7%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(93 135 255 / 7%) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: linear-gradient(90deg, rgb(0 0 0 / 75%), transparent 78%);
}

.hero-copy,
.hero-status-panel {
  position: relative;
  z-index: 1;
}

.hero-kicker {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 14px;
  font-size: 12px;
  font-weight: 700;
  color: #4070d8;
  text-transform: uppercase;
}

.signal-dot {
  width: 8px;
  height: 8px;
  background: #2dd4bf;
  border-radius: 999px;
  box-shadow: 0 0 0 5px rgb(45 212 191 / 14%);
}

h1 {
  max-width: 760px;
  margin: 0;
  font-size: 30px;
  font-weight: 760;
  line-height: 1.22;
  color: #172033;
}

p {
  max-width: 680px;
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 1.7;
  color: #667085;
}

.operator-card {
  display: flex;
  gap: 14px;
  align-items: center;
  max-width: 720px;
  margin-top: 28px;
}

.operator-avatar {
  flex: 0 0 54px;
  background: transparent;
}

.operator-avatar--fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #5d87ff;
  background: rgb(93 135 255 / 10%);
  border: 1px solid rgb(93 135 255 / 18%);
  border-radius: 8px;
}

.operator-meta {
  display: grid;
  min-width: 0;
}

.operator-meta strong {
  font-size: 16px;
  color: #172033;
}

.operator-meta span,
.operator-login {
  margin-top: 4px;
  font-size: 13px;
  color: #667085;
}

.operator-login {
  margin-left: auto;
  white-space: nowrap;
}

.hero-status-panel {
  align-self: center;
  padding: 12px;
  background: rgb(255 255 255 / 44%);
  border: 1px solid rgb(23 32 51 / 7%);
  border-radius: 8px;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 70%);
  backdrop-filter: blur(10px);
}

.status-panel-head {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 740;
  color: #4070d8;
}

.panel-dot {
  width: 7px;
  height: 7px;
  background: #2dd4bf;
  border-radius: 999px;
  box-shadow: 0 0 0 5px rgb(45 212 191 / 12%);
}

.hero-status-grid {
  display: grid;
  gap: 7px;
}

.status-chip {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 9px;
  align-items: center;
  min-height: 50px;
  padding: 8px 10px;
  background: rgb(255 255 255 / 62%);
  border: 1px solid rgb(23 32 51 / 6%);
  border-radius: 8px;
}

.status-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 15px;
  border-radius: 8px;
}

.status-icon--cyan {
  color: #0f9f8f;
  background: rgb(45 212 191 / 13%);
}

.status-icon--blue {
  color: #4070d8;
  background: rgb(93 135 255 / 13%);
}

.status-icon--amber {
  color: #b7791f;
  background: rgb(245 158 11 / 14%);
}

.status-chip strong,
.status-chip span {
  display: block;
}

.status-chip strong {
  font-size: 15px;
  line-height: 1.15;
  color: #172033;
}

.status-chip span {
  margin-top: 2px;
  font-size: 11px;
  line-height: 1.2;
  color: #667085;
}

@media (width <= 1024px) {
  .home-command-hero {
    grid-template-columns: 1fr;
  }

  .hero-status-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (width <= 640px) {
  .home-command-hero {
    padding: 22px 18px;
  }

  h1 {
    font-size: 24px;
  }

  .operator-card {
    align-items: flex-start;
  }

  .operator-login {
    display: none;
  }

  .hero-status-grid {
    grid-template-columns: 1fr;
  }
}
</style>
