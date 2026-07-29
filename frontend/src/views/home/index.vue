<template>
  <div class="home-workspace">
    <FaPageHeader
      title="系统总览"
      description="基于当前登录用户的菜单、权限、账号和基础依赖状态。"
    />

    <Banner class="mb-5" />

    <section class="metrics-grid" aria-label="当前系统状态">
      <article v-for="metric in metrics" :key="metric.label" class="metric-card">
        <div class="metric-card__head">
          <div>
            <span class="metric-card__label">{{ metric.label }}</span>
            <div class="metric-card__value">
              {{ metric.value }}<small>{{ metric.unit }}</small>
            </div>
          </div>
          <span class="metric-card__icon" :class="`metric-card__icon--${metric.tone}`">
            <FaSvgIcon :icon="metric.icon" />
          </span>
        </div>
        <p>{{ metric.description }}</p>
      </article>
    </section>

    <section class="dashboard-grid">
      <ElCard shadow="never" class="home-card">
        <template #header>
          <div class="section-heading">
            <div>
              <h2>可用模块</h2>
              <p>当前账号可访问的一级入口和页面数量。</p>
            </div>
            <ElTag type="success" effect="light">已加载</ElTag>
          </div>
        </template>

        <div v-if="rootMenus.length" class="module-list">
          <div
            v-for="menu in rootMenus"
            :key="menu.id ?? menu.route_name ?? menu.name"
            class="module-row"
          >
            <span class="module-row__icon">
              <FaSvgIcon :icon="menu.icon || 'ri:menu-line'" />
            </span>
            <div class="module-row__content">
              <strong>{{ menu.title || menu.name || "未命名模块" }}</strong>
              <span>{{ countMenuEntries(menu.children ?? []) + 1 }} 个可访问页面</span>
            </div>
            <span class="module-row__count">{{ countMenuEntries(menu.children ?? []) + 1 }}</span>
          </div>
        </div>
        <ElEmpty v-else description="暂无可用模块" />
      </ElCard>

      <ElCard shadow="never" class="home-card">
        <template #header>
          <div class="section-heading">
            <div>
              <h2>当前账号</h2>
              <p>登录态和授权信息来自当前会话。</p>
            </div>
            <ElTag :type="currentUser.status === 0 ? 'danger' : 'success'" effect="light">
              {{ currentUser.status === 0 ? "已停用" : "正常" }}
            </ElTag>
          </div>
        </template>

        <dl class="account-list">
          <div>
            <dt>账号</dt>
            <dd>{{ currentUser.username || "未加载" }}</dd>
          </div>
          <div>
            <dt>显示名称</dt>
            <dd>{{ currentUser.name || "未加载" }}</dd>
          </div>
          <div>
            <dt>授权角色</dt>
            <dd>{{ roleLabel }}</dd>
          </div>
          <div>
            <dt>最近登录</dt>
            <dd>{{ currentUser.last_login || "暂无记录" }}</dd>
          </div>
        </dl>
      </ElCard>
    </section>

    <section class="checklist-section" aria-labelledby="session-check-title">
      <div class="section-heading">
        <div>
          <h2 id="session-check-title">会话检查</h2>
          <p>快速确认当前后台是否完成认证、菜单、权限和基础依赖检查。</p>
        </div>
        <div class="section-actions">
          <span
            class="check-summary"
            :class="allChecksPassed ? 'check-summary--success' : 'check-summary--warning'"
          >
            {{ allChecksPassed ? "状态正常" : "需要检查" }}
          </span>
          <ElTooltip content="重新检查系统健康" placement="top">
            <ElButton
              class="health-refresh-button"
              size="small"
              plain
              circle
              :loading="healthLoading"
              aria-label="重新检查系统健康"
              @click="loadHealthStatus"
            >
              <FaSvgIcon icon="ri:refresh-line" />
            </ElButton>
          </ElTooltip>
        </div>
      </div>

      <ul class="check-list">
        <li v-for="item in checks" :key="item.label" class="check-item">
          <span
            class="check-item__icon"
            :class="item.passed ? 'check-item__icon--success' : 'check-item__icon--warning'"
          >
            <FaSvgIcon :icon="item.passed ? 'ri:check-line' : 'ri:error-warning-line'" />
          </span>
          <span class="check-item__content">
            <strong>{{ item.label }}</strong>
            <span>{{ item.detail }}</span>
          </span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { onMounted, onUnmounted, ref } from "vue";
import HealthAPI, { type HealthReadiness } from "@/api/module_common/health";
import type { MenuTable } from "@/api/module_platform/menu";
import { MenuTypeEnum } from "@/enums/system/menu.enum";
import { useUserStore } from "@stores";
import { HttpError } from "@utils";
import FaPageHeader from "@/components/layouts/fa-page-header/index.vue";
import Banner from "./modules/banner.vue";

defineOptions({ name: "Home", inheritAttrs: false });

type DashboardMetric = {
  label: string;
  value: number | string;
  unit: string;
  description: string;
  icon: string;
  tone: "primary" | "success" | "warning" | "info";
};

type CheckItem = {
  label: string;
  detail: string;
  passed: boolean;
};

type HealthState = "loading" | "healthy" | "degraded" | "unavailable";

type HealthPresentation = Pick<DashboardMetric, "value" | "icon" | "tone">;

const HEALTH_REFRESH_INTERVAL = 30_000;
const dependencyLabels: Record<keyof HealthReadiness["dependencies"], string> = {
  database: "数据库",
  redis: "Redis",
};
const healthPresentations: Record<HealthState, HealthPresentation> = {
  loading: { value: "检查中", icon: "ri:heart-pulse-line", tone: "info" },
  healthy: { value: "正常", icon: "ri:heart-pulse-line", tone: "success" },
  degraded: { value: "需处理", icon: "ri:error-warning-line", tone: "warning" },
  unavailable: { value: "不可用", icon: "ri:error-warning-line", tone: "warning" },
};

const userStore = useUserStore();
const healthState = ref<HealthState>("loading");
const healthData = ref<HealthReadiness | null>(null);
const healthError = ref("");
const healthLoading = ref(false);
const currentUser = computed(() => userStore.basicInfo);
const rootMenus = computed(() =>
  userStore.getRouteList.filter((menu) => menu.type !== MenuTypeEnum.BUTTON)
);
const permissionCount = computed(() => userStore.getPerms.length);
const roleCount = computed(() => currentUser.value.roles?.length ?? 0);
const menuCount = computed(() => countMenuEntries(userStore.getRouteList));
const roleLabel = computed(() => {
  if (currentUser.value.is_superuser) return "超级管理员";
  return currentUser.value.role_names?.filter(Boolean).join("、") || `${roleCount.value} 个角色`;
});
const healthDescription = computed(() => {
  if (healthState.value === "loading") return "正在检查数据库、Redis 和磁盘使用率";
  if (!healthData.value) return healthError.value || "系统健康检查暂不可用";

  const dependencySummary = Object.entries(healthData.value.dependencies)
    .map(([name, dependency]) => {
      const label = dependencyLabels[name as keyof HealthReadiness["dependencies"]] || name;
      if (!dependency.enabled) return `${label} 未启用`;
      if (dependency.status !== 1) return `${label} 异常`;
      return `${label} ${dependency.latency_ms === null ? "正常" : `${dependency.latency_ms}ms`}`;
    })
    .join(" · ");
  const diskSummary =
    healthData.value.disk_usage >= 0 ? `磁盘 ${healthData.value.disk_usage}%` : "磁盘数据不可用";
  return `${dependencySummary} · ${diskSummary}`;
});
const healthMetric = computed<DashboardMetric>(() => {
  return {
    label: "系统健康",
    unit: "",
    description: healthDescription.value,
    ...healthPresentations[healthState.value],
  };
});

const metrics = computed<DashboardMetric[]>(() => [
  {
    label: "可见菜单",
    value: menuCount.value,
    unit: "项",
    description: "当前账号可访问的页面入口",
    icon: "ri:layout-grid-line",
    tone: "primary",
  },
  {
    label: "权限点",
    value: permissionCount.value,
    unit: "项",
    description: "后端下发并用于 RBAC 校验",
    icon: "ri:shield-check-line",
    tone: "success",
  },
  {
    label: "授权角色",
    value: currentUser.value.is_superuser ? "超管" : roleCount.value,
    unit: currentUser.value.is_superuser ? "" : "个",
    description: "当前账号的角色授权状态",
    icon: "ri:user-settings-line",
    tone: "warning",
  },
  healthMetric.value,
]);

const checks = computed<CheckItem[]>(() => [
  {
    label: "认证会话",
    detail: userStore.isLogin ? "访问令牌有效，当前用户已登录" : "当前没有可用的登录会话",
    passed: userStore.isLogin,
  },
  {
    label: "用户资料",
    detail: currentUser.value.username ? "用户资料已从后端加载" : "用户资料尚未加载",
    passed: Boolean(currentUser.value.username),
  },
  {
    label: "动态菜单",
    detail: userStore.getHasGetRoute
      ? `${rootMenus.value.length} 个一级模块已注册`
      : "动态菜单尚未注册",
    passed: userStore.getHasGetRoute,
  },
  {
    label: "权限集",
    detail: currentUser.value.is_superuser
      ? "超级管理员权限已生效"
      : `${permissionCount.value} 个权限点已加载`,
    passed: Boolean(currentUser.value.is_superuser || permissionCount.value),
  },
  {
    label: "基础依赖",
    detail: healthDescription.value,
    passed: healthState.value === "healthy",
  },
]);

const allChecksPassed = computed(() => checks.value.every((item) => item.passed));

/**
 * Counts navigable menu and child entries while excluding button permissions.
 *
 * @param menus Menu tree returned by the backend.
 * @returns Number of catalog, menu, and external-link entries.
 */
function countMenuEntries(menus: MenuTable[]): number {
  return menus.reduce((total, menu) => {
    if (menu.type === MenuTypeEnum.BUTTON) return total + countMenuEntries(menu.children ?? []);
    return total + 1 + countMenuEntries(menu.children ?? []);
  }, 0);
}

/**
 * Validates a readiness payload before it is rendered on the dashboard.
 *
 * @param value Untrusted response payload from the health endpoint.
 * @returns Whether the payload has the required dependency metrics.
 */
function isHealthReadiness(value: unknown): value is HealthReadiness {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  if (
    (candidate.status !== 0 && candidate.status !== 1) ||
    typeof candidate.disk_usage !== "number"
  )
    return false;
  if (!candidate.dependencies || typeof candidate.dependencies !== "object") return false;

  return ["database", "redis"].every((name) => {
    const dependency = (candidate.dependencies as Record<string, unknown>)[name];
    if (!dependency || typeof dependency !== "object") return false;

    const dependencyData = dependency as Record<string, unknown>;
    if (typeof dependencyData.enabled !== "boolean") return false;
    const status = dependencyData.status;
    return status === 0 || status === 1;
  });
}

/**
 * Extracts a degraded readiness payload from a failed health probe.
 *
 * @param error Request error raised by the HTTP client.
 * @returns Readiness metrics when the server returned a structured 503 response.
 */
function extractReadinessPayload(error: unknown): HealthReadiness | null {
  if (!(error instanceof HttpError) || !error.data || typeof error.data !== "object") return null;

  const payload = (error.data as Record<string, unknown>).data;
  return isHealthReadiness(payload) ? payload : null;
}

/**
 * Refreshes dashboard health metrics without displaying global error notifications.
 *
 * @returns Promise resolved after the latest health result is recorded.
 */
async function loadHealthStatus(): Promise<void> {
  if (healthLoading.value) return;

  healthLoading.value = true;
  try {
    const response = await HealthAPI.getReadiness();
    const readiness = response.data.data;
    healthData.value = readiness;
    healthState.value = readiness.status === 1 ? "healthy" : "degraded";
    healthError.value = "";
  } catch (error: unknown) {
    const readiness = extractReadinessPayload(error);
    if (readiness) {
      healthData.value = readiness;
      healthState.value = "degraded";
      healthError.value = "";
      return;
    }

    healthData.value = null;
    healthState.value = "unavailable";
    healthError.value = error instanceof Error ? error.message : "健康检查请求失败";
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
  min-width: 0;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.metric-card,
.home-card,
.checklist-section {
  border: 1px solid var(--fa-color-border, var(--el-border-color));
  border-radius: 8px;
  background: var(--fa-color-surface, var(--el-bg-color));
}

.metric-card {
  min-height: 142px;
  padding: 18px;
}

.metric-card__head,
.section-heading {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  justify-content: space-between;
}

.section-actions {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.health-refresh-button {
  flex: 0 0 auto;
}

.metric-card__label {
  display: block;
  font-size: 13px;
  font-weight: 650;
  color: var(--el-text-color-secondary);
}

.metric-card__value {
  margin-top: 12px;
  font-size: 28px;
  font-weight: 760;
  line-height: 1;
  color: var(--el-text-color-primary);
}

.metric-card__value small {
  margin-left: 5px;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

.metric-card p,
.section-heading p {
  margin: 12px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}

.metric-card__icon,
.module-row__icon,
.check-item__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: 7px;
}

.metric-card__icon {
  width: 40px;
  height: 40px;
  font-size: 20px;
}

.metric-card__icon--primary {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.metric-card__icon--success {
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
}

.metric-card__icon--warning {
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
}

.metric-card__icon--info {
  color: var(--el-color-info);
  background: var(--el-color-info-light-9);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.65fr);
  gap: 20px;
  margin-bottom: 20px;
}

.home-card :deep(.el-card__header) {
  padding: 18px 20px;
  border-bottom-color: var(--fa-color-border, var(--el-border-color));
}

.home-card :deep(.el-card__body) {
  padding: 20px;
}

.section-heading h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.section-heading p {
  margin-top: 5px;
}

.module-list {
  display: grid;
  gap: 8px;
}

.module-row {
  display: flex;
  gap: 12px;
  align-items: center;
  min-height: 56px;
  padding: 10px 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 7px;
  background: var(--el-fill-color-lighter);
}

.module-row__icon {
  width: 34px;
  height: 34px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.module-row__content {
  display: grid;
  min-width: 0;
  gap: 3px;
}

.module-row__content strong {
  overflow: hidden;
  color: var(--el-text-color-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.module-row__content span,
.module-row__count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.module-row__count {
  margin-left: auto;
  font-weight: 700;
  color: var(--el-color-primary);
}

.account-list {
  display: grid;
  gap: 0;
  margin: 0;
}

.account-list > div {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 13px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.account-list > div:last-child {
  border-bottom: 0;
}

.account-list dt {
  flex: 0 0 auto;
  color: var(--el-text-color-secondary);
}

.account-list dd {
  margin: 0;
  overflow: hidden;
  font-weight: 600;
  color: var(--el-text-color-primary);
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.checklist-section {
  padding: 20px;
}

.check-summary {
  flex: 0 0 auto;
  padding: 4px 9px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 5px;
}

.check-summary--success {
  color: var(--el-color-success-dark-2);
  background: var(--el-color-success-light-9);
}

.check-summary--warning {
  color: var(--el-color-warning-dark-2);
  background: var(--el-color-warning-light-9);
}

.check-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
}

.check-item {
  display: flex;
  gap: 10px;
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 7px;
}

.check-item__icon {
  width: 26px;
  height: 26px;
}

.check-item__icon--success {
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
}

.check-item__icon--warning {
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
}

.check-item__content {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.check-item__content strong {
  color: var(--el-text-color-primary);
}

.check-item__content span {
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
}

@media (max-width: 1100px) {
  .metrics-grid,
  .check-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .metrics-grid,
  .check-list {
    grid-template-columns: 1fr;
  }

  .checklist-section,
  .home-card :deep(.el-card__body) {
    padding: 16px;
  }
}
</style>
