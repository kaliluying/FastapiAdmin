<template>
  <div class="home-workspace">
    <Banner
      :health-state="healthState"
      :health-description="healthDescription"
      :health-loading="healthLoading"
      @refresh="loadHealthStatus"
    />
    <div
      class="home-content"
      :class="{ 'home-content--single': !canViewLoginTrend || !quickLinks.length }"
    >
      <LoginTrend v-if="canViewLoginTrend" />

      <section v-if="quickLinks.length" class="quick-links" aria-labelledby="quick-links-title">
        <div class="quick-links__header">
          <h2 id="quick-links-title">快捷入口</h2>
          <span>选择页面继续工作</span>
        </div>
        <nav aria-label="快捷入口">
          <RouterLink v-for="link in quickLinks" :key="link.path" :to="link.path">
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
      if (links.length >= 8) return;
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
  max-width: 1760px;
  margin: 0 auto;
}

.home-content {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(380px, 0.9fr);
  gap: 20px;
  align-items: stretch;
}

.home-content--single {
  grid-template-columns: minmax(0, 1fr);
}

.quick-links {
  min-width: 0;
  padding: 22px;
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
  margin-bottom: 18px;
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
  gap: 10px;
}

.quick-links a {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
  min-height: 78px;
  padding: 12px;
  font-size: 14px;
  color: var(--fa-color-text);
  background: var(--fa-color-surface-raised);
  border: 1px solid var(--fa-color-border);
  border-radius: var(--fa-radius-control);
  transition:
    color 160ms ease,
    border-color 160ms ease,
    background-color 160ms ease;
}

.quick-links a:hover {
  color: var(--theme-color);
  background: var(--fa-color-surface);
  border-color: var(--theme-color);
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
  color: var(--theme-color);
  background: var(--fa-color-sidebar-active);
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

@media (width <= 1100px) {
  .home-content {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (width <= 520px) {
  .quick-links {
    padding: 18px;
  }

  .quick-links nav {
    grid-template-columns: minmax(0, 1fr);
  }

  .quick-links a {
    min-height: 60px;
  }
}
</style>
