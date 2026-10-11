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
      <h2 id="launch-title" class="workspace-section-title">知识工作</h2>
      <nav class="knowledge-launch__resources" aria-label="知识工作入口">
        <RouterLink v-if="chatLink" :to="chatLink.path" class="knowledge-launch__action">
          <span class="knowledge-launch__icon" aria-hidden="true">
            <FaSvgIcon :icon="chatLink.icon" />
          </span>
          <strong>{{ $t(chatLink.title) }}</strong>
          <p>围绕团队资料提问，获取带有来源的回答。</p>
          <span class="knowledge-launch__link">
            开始 AI 对话 <FaSvgIcon icon="ri:arrow-right-line" aria-hidden="true" />
          </span>
        </RouterLink>
        <RouterLink v-for="link in knowledgeLinks" :key="link.path" :to="link.path">
          <span class="knowledge-launch__icon" aria-hidden="true">
            <FaSvgIcon :icon="link.icon" />
          </span>
          <strong>{{ $t(link.title) }}</strong>
          <p>
            {{
              link.path === "/ai/knowledge"
                ? "组织团队知识，管理资料与访问范围。"
                : "上传文档，跟踪解析与索引处理进度。"
            }}
          </p>
          <span class="knowledge-launch__link">
            {{ link.path === "/ai/knowledge" ? "管理知识库" : "管理文档" }}
            <FaSvgIcon icon="ri:arrow-right-line" aria-hidden="true" />
          </span>
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
          <h2 id="quick-links-title">管理与配置</h2>
          <span>快捷入口</span>
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
  max-width: 1840px;
  margin: 0 auto;
}

.home-content {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(300px, 1fr);
  gap: 20px;
  align-items: start;
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
  margin-bottom: 16px;
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
  grid-template-columns: minmax(0, 1fr);
  gap: 4px;
}

.quick-links a {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
  min-height: 48px;
  padding: 8px 10px;
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
  margin-bottom: 28px;
}

.workspace-section-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--fa-color-text-muted);
  letter-spacing: 0.06em;
}

.knowledge-launch__resources {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  gap: 20px;
  min-width: 0;
}

.knowledge-launch__resources a {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  min-height: 206px;
  padding: 24px;
  color: var(--fa-color-text);
  background: var(--fa-color-surface);
  border: 1px solid var(--fa-color-border);
  border-radius: var(--fa-radius-panel);
  box-shadow: var(--fa-soft-shadow);
  transition:
    border-color 160ms ease,
    background-color 160ms ease;
}

.knowledge-launch__resources a.knowledge-launch__action {
  background: color-mix(in srgb, var(--theme-color) 7%, var(--fa-color-surface));
  border-color: color-mix(in srgb, var(--theme-color) 22%, var(--fa-color-border));
}

.knowledge-launch__resources a:hover {
  background: color-mix(in srgb, var(--theme-color) 5%, var(--fa-color-surface));
  border-color: color-mix(in srgb, var(--theme-color) 50%, var(--fa-color-border));
}

.knowledge-launch__resources strong {
  margin-top: 16px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.5;
}

.knowledge-launch__resources p {
  margin: 6px 0 20px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--fa-color-text-muted);
}

.knowledge-launch__link {
  display: inline-flex;
  gap: 12px;
  align-items: center;
  margin-top: auto;
  font-size: 13px;
  font-weight: 600;
  color: color-mix(in srgb, var(--theme-color) 75%, var(--fa-color-text));
}

.knowledge-launch__icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  font-size: 22px;
  color: var(--theme-color);
  background: color-mix(in srgb, var(--theme-color) 9%, var(--fa-color-surface));
  border-radius: 10px;
}

.knowledge-launch a:focus-visible {
  outline: 2px solid var(--theme-color);
  outline-offset: 4px;
}

:global(html.dark) .knowledge-launch__link,
:global(html.dark) .knowledge-launch__icon {
  color: color-mix(in srgb, var(--theme-color) 65%, var(--fa-color-text));
}

@media (width <= 1100px) {
  .home-content {
    grid-template-columns: minmax(0, 1fr);
  }

  .quick-links {
    order: -1;
  }

  .quick-links nav {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width <= 520px) {
  .knowledge-launch {
    margin-bottom: 20px;
  }

  .knowledge-launch__resources {
    gap: 12px;
  }

  .knowledge-launch__resources a {
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr);
    gap: 4px 14px;
    min-height: 0;
    padding: 18px;
  }

  .knowledge-launch__icon {
    grid-row: 1 / 4;
  }

  .knowledge-launch__resources strong {
    margin-top: 0;
    font-size: 16px;
  }

  .knowledge-launch__resources p {
    margin: 0 0 8px;
    font-size: 13px;
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
  .home-workspace a {
    transition: none;
  }
}
</style>
