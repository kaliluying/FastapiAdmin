<template>
  <div class="home-workspace">
    <Banner
      :health-state="healthState"
      :health-description="healthDescription"
      :health-loading="healthLoading"
      :user-name="userStore.basicInfo.name || userStore.basicInfo.username || ''"
      @refresh="loadHealthStatus"
    />
    <section v-if="featuredLinks.length" class="knowledge-launch" aria-labelledby="launch-title">
      <div class="knowledge-launch__intro">
        <span class="knowledge-launch__eyebrow">知识与 AI</span>
        <h2 id="launch-title">从知识出发，<br />让工作更进一步。</h2>
        <p>整理资料，探索知识与答案。</p>
        <RouterLink v-if="chatLink" :to="chatLink.path" class="knowledge-launch__action">
          开始 AI 对话
          <FaSvgIcon icon="ri:arrow-right-line" aria-hidden="true" />
        </RouterLink>
      </div>
      <nav
        v-if="knowledgeLinks.length"
        class="knowledge-launch__resources"
        aria-label="知识工作入口"
      >
        <RouterLink v-for="link in knowledgeLinks" :key="link.path" :to="link.path">
          <FaSvgIcon :icon="link.icon" class="knowledge-launch__icon" aria-hidden="true" />
          <span>
            <strong>{{ $t(link.title) }}</strong>
            <small>{{ link.path === "/ai/knowledge" ? "整理团队资料" : "上传与索引进度" }}</small>
          </span>
          <FaSvgIcon
            icon="ri:arrow-right-up-line"
            class="knowledge-launch__arrow"
            aria-hidden="true"
          />
        </RouterLink>
      </nav>
    </section>
    <div
      class="home-content"
      :class="{ 'home-content--single': !canViewLoginTrend || !managementLinks.length }"
    >
      <LoginTrend v-if="canViewLoginTrend" />

      <section
        v-if="managementLinks.length"
        class="quick-links"
        aria-labelledby="quick-links-title"
      >
        <div class="quick-links__header">
          <h2 id="quick-links-title">常用入口</h2>
          <span>管理与配置</span>
        </div>
        <nav aria-label="快捷入口">
          <RouterLink v-for="link in managementLinks" :key="link.path" :to="link.path">
            <span class="quick-links__icon" aria-hidden="true">
              <FaSvgIcon :icon="link.icon" />
            </span>
            <span>{{ $t(link.title) }}</span>
            <FaSvgIcon icon="ri:arrow-right-s-line" class="quick-links__arrow" aria-hidden="true" />
          </RouterLink>
        </nav>
      </section>

      <p v-if="!canViewLoginTrend && !quickLinks.length" class="home-empty">
        暂无可用入口，请联系管理员分配访问权限。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import HealthAPI, { type HealthReadiness } from "@/api/module_common/health";
import type { AppRouteRecord } from "@/types/router";
import { useMenuStore, useUserStore } from "@stores";
import { hasPermissionCode } from "@/utils/auth/permission";
import { HttpError } from "@utils";
import Banner from "./modules/banner.vue";
import LoginTrend from "./modules/login-trend.vue";

defineOptions({ name: "Home", inheritAttrs: false });

type HealthState = "loading" | "healthy" | "degraded" | "unavailable";

const HEALTH_REFRESH_INTERVAL = 30_000;
const menuStore = useMenuStore();
const userStore = useUserStore();
const canViewLoginTrend = computed(() =>
  hasPermissionCode("module_system:login_log:query", {
    is_superuser: userStore.basicInfo.is_superuser,
    permissions: userStore.getPerms,
  })
);
const quickLinks = computed(() => {
  const links: { path: string; title: string; icon: string }[] = [];
  const visit = (routes: AppRouteRecord[]) => {
    for (const route of routes) {
      if (route.meta?.hidden || route.meta?.isHide) continue;
      if (route.children?.length) {
        visit(route.children);
        continue;
      }
      if (
        route.path &&
        route.path !== "/home" &&
        route.path.startsWith("/") &&
        !route.path.startsWith("//") &&
        !route.path.includes(":") &&
        route.component &&
        route.meta?.title &&
        !route.meta?.link &&
        !route.meta?.isIframe
      ) {
        links.push({
          path: route.path,
          title: route.meta.title,
          icon: route.meta.icon || "ri:apps-line",
        });
      }
    }
  };
  visit(menuStore.menuList);
  return links;
});
const featuredLinks = computed(() =>
  quickLinks.value.filter((link) =>
    ["/ai/chat", "/ai/knowledge", "/ai/document"].includes(link.path)
  )
);
const chatLink = computed(() => featuredLinks.value.find((link) => link.path === "/ai/chat"));
const knowledgeLinks = computed(() =>
  featuredLinks.value.filter((link) => link.path !== "/ai/chat")
);
const managementLinks = computed(() =>
  quickLinks.value.filter((link) => !featuredLinks.value.includes(link))
);
const healthState = ref<HealthState>("loading");
const healthData = ref<HealthReadiness | null>(null);
const healthLoading = ref(false);
const healthDescription = computed(() => {
  if (healthState.value === "unavailable") return "暂时无法检查系统状态，请稍后重试";
  if (!healthData.value) return "";

  const failedDependencies = Object.entries(healthData.value.dependencies)
    .filter(([, dependency]) => dependency.enabled && dependency.status !== 1)
    .map(([name]) => (name === "database" ? "数据库" : name === "redis" ? "Redis" : name));
  if (failedDependencies.length) return `${failedDependencies.join("、")}连接异常`;
  return "基础服务需要检查";
});

function isHealthReadiness(value: unknown): value is HealthReadiness {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  if (
    (candidate.status !== 0 && candidate.status !== 1) ||
    typeof candidate.disk_usage !== "number" ||
    !candidate.dependencies ||
    typeof candidate.dependencies !== "object"
  )
    return false;

  return ["database", "redis"].every((name) => {
    const dependency = (candidate.dependencies as Record<string, unknown>)[name];
    return (
      dependency &&
      typeof dependency === "object" &&
      typeof (dependency as Record<string, unknown>).enabled === "boolean" &&
      ((dependency as Record<string, unknown>).status === 0 ||
        (dependency as Record<string, unknown>).status === 1)
    );
  });
}

function extractReadinessPayload(error: unknown): HealthReadiness | null {
  if (!(error instanceof HttpError) || !error.data || typeof error.data !== "object") return null;
  const payload = (error.data as Record<string, unknown>).data;
  return isHealthReadiness(payload) ? payload : null;
}

async function loadHealthStatus(): Promise<void> {
  if (healthLoading.value) return;

  healthLoading.value = true;
  try {
    const response = await HealthAPI.getReadiness();
    const readiness = response.data.data;
    healthData.value = readiness;
    healthState.value = readiness.status === 1 ? "healthy" : "degraded";
  } catch (error: unknown) {
    const readiness = extractReadinessPayload(error);
    healthData.value = readiness;
    healthState.value = readiness ? "degraded" : "unavailable";
  } finally {
    healthLoading.value = false;
  }
}

let healthRefreshTimer: number | undefined;

onMounted(() => {
  void loadHealthStatus();
  healthRefreshTimer = window.setInterval(() => void loadHealthStatus(), HEALTH_REFRESH_INTERVAL);
});

onUnmounted(() => {
  if (healthRefreshTimer !== undefined) window.clearInterval(healthRefreshTimer);
});
</script>

<style scoped lang="scss">
.home-workspace {
  width: 100%;
  min-width: 0;
  max-width: 1440px;
  margin: 0 auto;
}

.home-content {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(320px, 1fr);
  gap: 24px;
  align-items: stretch;
}

.home-content--single {
  grid-template-columns: minmax(0, 1fr);
}

.quick-links {
  min-width: 0;
  padding: 24px;
  background: var(--fa-color-surface);
  border: 1px solid var(--fa-color-border);
  border-radius: var(--fa-radius-panel);
  box-shadow: var(--fa-soft-shadow);
}

.quick-links__header {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 24px;
}

.quick-links h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 650;
  color: var(--fa-color-text);
}

.quick-links__header > span {
  font-size: 12px;
  color: var(--fa-color-text-muted);
}

.quick-links nav {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.quick-links a {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
  min-height: 72px;
  padding: 12px;
  font-size: 14px;
  color: var(--fa-color-text);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--fa-radius-control);
  transition:
    color 160ms ease,
    border-color 160ms ease,
    background-color 160ms ease;
}

.quick-links a:hover {
  color: var(--theme-color);
  background: var(--fa-color-surface-raised);
  border-color: var(--fa-color-border);
}

.quick-links a:focus-visible {
  outline: 2px solid var(--theme-color);
  outline-offset: 2px;
}

.quick-links__icon {
  display: grid;
  flex: 0 0 36px;
  place-items: center;
  width: 36px;
  height: 36px;
  font-size: 18px;
  color: var(--fa-color-text-muted);
  background: var(--fa-color-surface-raised);
  border-radius: 9px;
}

.quick-links__arrow {
  margin-left: auto;
  font-size: 18px;
  color: var(--fa-color-text-muted);
}

.home-empty {
  padding: 20px 22px;
  margin: 0;
  font-size: 13px;
  color: var(--fa-color-text-muted);
  background: var(--fa-color-surface);
  border: 1px solid var(--fa-color-border);
  border-radius: var(--fa-radius-panel);
}

.knowledge-launch {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 0.85fr);
  gap: 32px;
  align-items: center;
  padding: 28px 36px;
  margin-bottom: 28px;
  color: #f4f7fb;
  background: #172438;
  border: 1px solid #304057;
  border-radius: 20px;
}

.knowledge-launch__eyebrow {
  font-size: 12px;
  color: #c1cede;
}

.knowledge-launch h2 {
  margin: 14px 0 12px;
  font-size: clamp(28px, 2.5vw, 34px);
  font-weight: 600;
  line-height: 1.35;
  letter-spacing: -0.035em;
}

.knowledge-launch__intro > p {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  color: #c1cede;
}

.knowledge-launch__action {
  display: inline-flex;
  gap: 24px;
  align-items: center;
  min-height: 44px;
  padding: 10px 18px;
  margin-top: 24px;
  font-size: 14px;
  font-weight: 600;
  color: #172438;
  background: #f4f7fb;
  border-radius: 10px;
  transition: background-color 180ms ease;
}

.knowledge-launch__action:hover {
  background: #dce7f5;
}

.knowledge-launch__resources {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.knowledge-launch__resources a {
  display: flex;
  gap: 16px;
  align-items: center;
  min-width: 0;
  min-height: 96px;
  padding: 20px;
  color: inherit;
  background: rgb(255 255 255 / 5%);
  border: 1px solid rgb(255 255 255 / 15%);
  border-radius: 14px;
  transition:
    border-color 180ms ease,
    background-color 180ms ease;
}

.knowledge-launch__resources a:hover {
  background: rgb(255 255 255 / 10%);
  border-color: rgb(255 255 255 / 35%);
}

.knowledge-launch__resources a > span {
  display: grid;
  gap: 7px;
  min-width: 0;
}

.knowledge-launch__resources strong {
  font-size: 16px;
  font-weight: 550;
}

.knowledge-launch__resources small {
  font-size: 12px;
  line-height: 1.6;
  color: #c1cede;
}

.knowledge-launch__icon {
  flex: 0 0 24px;
  font-size: 24px;
  color: #c1cede;
}

.knowledge-launch__arrow {
  flex: 0 0 20px;
  margin-left: auto;
  font-size: 20px;
  transition: transform 180ms ease;
}

.knowledge-launch__resources a:hover .knowledge-launch__arrow {
  transform: translate(2px, -2px);
}

.knowledge-launch a:focus-visible {
  outline: 2px solid #f4f7fb;
  outline-offset: 4px;
}

@media (width <= 1200px) {
  .home-content {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (width <= 760px) {
  .knowledge-launch {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
    padding: 24px;
  }

  .knowledge-launch__resources a {
    min-height: 80px;
    padding: 16px;
  }
}

@media (width <= 900px) {
  .quick-links {
    order: -1;
  }
}

@media (width <= 520px) {
  .knowledge-launch {
    padding: 22px;
    margin-bottom: 20px;
    border-radius: 16px;
  }

  .knowledge-launch__action {
    margin-top: 18px;
  }

  .quick-links {
    padding: 18px;
  }

  .quick-links a {
    min-height: 60px;
    padding: 8px 4px;
    font-size: 13px;
  }

  .quick-links__icon {
    flex-basis: 30px;
    width: 30px;
    height: 30px;
    font-size: 16px;
  }

  .quick-links__arrow {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-workspace a,
  .knowledge-launch__arrow {
    transition: none;
  }

  .knowledge-launch__resources a:hover .knowledge-launch__arrow {
    transform: none;
  }
}
</style>
