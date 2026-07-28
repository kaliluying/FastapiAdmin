<template>
  <section class="home-command-hero" aria-label="当前账号和系统状态">
    <div class="hero-copy">
      <div class="hero-kicker">
        <span class="signal-dot"></span>
        系统运营台
      </div>
      <h1>{{ bannerTitle }}</h1>
      <p>{{ bannerSubtitle }}</p>

      <div class="operator-card">
        <ElAvatar v-if="currentUser.avatar" :size="48" :src="currentUser.avatar" class="operator-avatar" />
        <div v-else class="operator-avatar operator-avatar--fallback">
          <ElIcon :size="24"><UserFilled /></ElIcon>
        </div>
        <div class="operator-meta">
          <strong>{{ currentUser.name }}</strong>
          <span>{{ currentUser.description }}</span>
        </div>
        <div class="operator-login">最近登录：{{ currentUser.last_login || "暂无记录" }}</div>
      </div>
    </div>

    <div class="hero-status-panel" aria-label="当前系统状态">
      <div class="status-panel-head">
        <span class="panel-dot"></span>
        当前状态
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
import { MenuTypeEnum } from "@/enums/system/menu.enum";
import { useUserStore } from "@stores";
import { greetings } from "@utils";

defineOptions({ name: "HomeBanner" });

type HomeUser = {
  avatar: string;
  name: string;
  username: string;
  description: string;
  last_login: string;
};

const fallbackUser: HomeUser = {
  avatar: "",
  name: "当前用户",
  username: "-",
  description: "系统后台用户",
  last_login: "",
};

const userStore = useUserStore();
const timefix = greetings();

const currentUser = computed<HomeUser>(() => {
  const userInfo = userStore.basicInfo;

  return {
    avatar: userInfo.avatar || fallbackUser.avatar,
    name: userInfo.name || fallbackUser.name,
    username: userInfo.username || fallbackUser.username,
    description: userInfo.description || fallbackUser.description,
    last_login: userInfo.last_login || fallbackUser.last_login,
  };
});

const bannerTitle = computed(() => `${currentUser.value.name}（${currentUser.value.username}）${timefix}`);
const bannerSubtitle = "查看当前账号可用范围、授权状态和后台运行边界。";
const rootMenuCount = computed(() => userStore.getRouteList.filter((menu) => menu.type !== MenuTypeEnum.BUTTON).length);
const permissionCount = computed(() => userStore.getPerms.length);

const statusCards = computed(() => [
  {
    label: "认证会话",
    value: userStore.isLogin ? "已登录" : "未登录",
    icon: "ri:shield-user-line",
    tone: userStore.isLogin ? "cyan" : "amber",
  },
  {
    label: "可用模块",
    value: `${rootMenuCount.value} 个`,
    icon: "ri:layout-grid-line",
    tone: "blue",
  },
  {
    label: "权限点",
    value: `${permissionCount.value} 项`,
    icon: "ri:key-2-line",
    tone: "green",
  },
]);

</script>

<style scoped lang="scss">
.home-command-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 360px);
  gap: 24px;
  min-height: 204px;
  padding: 28px 32px;
  color: var(--el-text-color-primary);
  background: var(--fa-color-surface, var(--el-bg-color));
  border: 1px solid var(--fa-color-border, var(--el-border-color));
  border-radius: 8px;
}

.hero-copy,
.hero-status-panel {
  min-width: 0;
}

.hero-kicker {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
  font-size: 12px;
  font-weight: 700;
  color: var(--el-color-primary);
}

.signal-dot,
.panel-dot {
  width: 8px;
  height: 8px;
  background: var(--el-color-success);
  border-radius: 50%;
}

h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 760;
  line-height: 1.25;
  color: var(--el-text-color-primary);
}

p {
  max-width: 680px;
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--el-text-color-secondary);
}

.operator-card {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 24px;
}

.operator-avatar {
  flex: 0 0 48px;
  background: transparent;
}

.operator-avatar--fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 8px;
}

.operator-meta {
  display: grid;
  min-width: 0;
}

.operator-meta strong {
  color: var(--el-text-color-primary);
}

.operator-meta span,
.operator-login {
  margin-top: 4px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.operator-login {
  margin-left: auto;
  white-space: nowrap;
}

.hero-status-panel {
  align-self: center;
  padding: 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
}

.status-panel-head {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
  font-size: 12px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.hero-status-grid {
  display: grid;
  gap: 8px;
}

.status-chip {
  display: flex;
  gap: 10px;
  align-items: center;
  min-height: 46px;
  padding: 8px 10px;
  background: var(--fa-color-surface, var(--el-bg-color));
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 7px;
}

.status-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 6px;
}

.status-icon--cyan,
.status-icon--green {
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
}

.status-icon--blue {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.status-icon--amber {
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
}

.status-chip div {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.status-chip strong {
  color: var(--el-text-color-primary);
}

.status-chip span:last-child {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

@media (max-width: 900px) {
  .home-command-hero {
    grid-template-columns: 1fr;
    padding: 24px;
  }

  .operator-login {
    margin-left: 0;
  }
}

@media (max-width: 560px) {
  .home-command-hero {
    padding: 20px;
  }

  h1 {
    font-size: 24px;
  }

  .operator-card {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .operator-login {
    flex-basis: 100%;
    margin-left: 60px;
  }
}
</style>
