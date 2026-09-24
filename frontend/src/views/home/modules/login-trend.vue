<template>
  <ElCard shadow="never" class="login-trend-card">
    <template #header>
      <div class="section-heading">
        <div>
          <div class="eyebrow">
            <span class="eyebrow-mark" aria-hidden="true"></span>
            访问数据
          </div>
          <h2>近 7 日登录活动</h2>
          <p>近 7 日成功登录与新增账号，按服务器本地时间统计。</p>
        </div>
        <div class="section-actions">
          <ElTag type="info" effect="plain">
            {{ loading ? "读取中" : hasLoaded ? "每 60 秒更新" : "不可用" }}
          </ElTag>
          <ElTooltip content="刷新登录趋势" placement="top">
            <ElButton
              size="small"
              plain
              circle
              :loading="loading"
              aria-label="刷新登录趋势"
              @click="loadTrend"
            >
              <FaSvgIcon icon="ri:refresh-line" />
            </ElButton>
          </ElTooltip>
        </div>
      </div>
    </template>

    <div class="trend-content">
      <div v-if="loading && !hasLoaded" class="trend-state" role="status">
        <FaSvgIcon icon="ri:loader-4-line" class="trend-state__icon trend-state__icon--spin" />
        <span>正在读取登录日志…</span>
      </div>

      <div v-else-if="trendError" class="trend-state trend-state--error" role="alert">
        <FaSvgIcon icon="ri:error-warning-line" class="trend-state__icon" />
        <span>{{ trendError }}</span>
      </div>

      <template v-else>
        <div class="trend-summary" aria-label="登录趋势摘要">
          <div class="trend-summary__item">
            <span>成功登录</span>
            <strong>{{ totalLogins }}</strong>
            <small>近 7 日</small>
          </div>
          <div class="trend-summary__item">
            <span>独立用户峰值</span>
            <strong>{{ peakUniqueUsers }}</strong>
            <small>单日</small>
          </div>
          <div class="trend-summary__item">
            <span>新增账号</span>
            <strong>{{ totalNewUsers }}</strong>
            <small>近 7 日</small>
          </div>
        </div>

        <div v-if="hasActivity" class="trend-chart" aria-label="近七日登录折线图">
          <FaLineChart
            :data="chartSeries"
            :x-axis-data="chartLabels"
            :colors="chartColors"
            height="220px"
            :show-area-color="true"
            :show-legend="true"
            legend-position="top"
            :show-axis-line="false"
            :show-split-line="true"
            :smooth="true"
          />
        </div>
        <div v-else class="trend-state" role="status">
          <FaSvgIcon icon="ri:bar-chart-2-line" class="trend-state__icon" />
          <span>近 7 日暂无成功登录记录</span>
        </div>

        <p class="trend-footnote">成功登录来自登录记录，新增账号按创建时间统计。</p>
      </template>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { ApiStatus, getCssVar, HttpError } from "@utils";
import DashboardAPI, { type LoginTrendItem } from "@/api/module_common/dashboard";
import FaLineChart from "@/components/charts/fa-line-chart/index.vue";
import type { LineDataItem } from "@/types/component/chart";

defineOptions({ name: "LoginTrend" });

const REFRESH_INTERVAL = 60_000;
const trendItems = ref<LoginTrendItem[]>([]);
const loading = ref(false);
const hasLoaded = ref(false);
const trendError = ref("");

const totalLogins = computed(() =>
  trendItems.value.reduce((total, item) => total + item.logins, 0)
);
const peakUniqueUsers = computed(() =>
  trendItems.value.reduce((peak, item) => Math.max(peak, item.unique_users), 0)
);
const totalNewUsers = computed(() =>
  trendItems.value.reduce((total, item) => total + item.new_users, 0)
);
const hasActivity = computed(() => trendItems.value.some((item) => item.logins > 0));
const chartLabels = computed(() => trendItems.value.map((item) => item.day.slice(5)));
const chartSeries = computed<LineDataItem[]>(() => [
  {
    name: "成功登录",
    data: trendItems.value.map((item) => item.logins),
    showAreaColor: true,
  },
  {
    name: "独立用户",
    data: trendItems.value.map((item) => item.unique_users),
    lineWidth: 2,
  },
]);
const chartColors = computed(() => [
  getCssVar("--el-color-primary"),
  getCssVar("--el-color-success"),
]);

function getTrendErrorMessage(error: unknown): string {
  if (error instanceof HttpError && error.code === ApiStatus.forbidden) {
    return "当前账号没有查看登录趋势的权限";
  }
  if (error instanceof HttpError && error.code === ApiStatus.unauthorized) {
    return "登录会话已失效，请重新登录";
  }
  return "登录趋势暂不可用，请稍后重试";
}

function isLoginTrendItems(value: unknown): value is LoginTrendItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof (item as LoginTrendItem).day === "string" &&
        Number.isFinite((item as LoginTrendItem).logins) &&
        Number.isFinite((item as LoginTrendItem).unique_users) &&
        Number.isFinite((item as LoginTrendItem).new_users)
    )
  );
}

async function loadTrend(): Promise<void> {
  if (loading.value) return;

  loading.value = true;
  trendError.value = "";
  try {
    const response = await DashboardAPI.getLoginTrend();
    const items = response.data.data?.items;
    if (!isLoginTrendItems(items)) throw new Error("登录趋势响应格式无效");
    trendItems.value = items;
    hasLoaded.value = true;
  } catch (error: unknown) {
    trendItems.value = [];
    trendError.value = getTrendErrorMessage(error);
  } finally {
    loading.value = false;
  }
}

let refreshTimer: number | undefined;

onMounted(() => {
  void loadTrend();
  refreshTimer = window.setInterval(() => void loadTrend(), REFRESH_INTERVAL);
});

onUnmounted(() => {
  if (refreshTimer !== undefined) window.clearInterval(refreshTimer);
});
</script>

<style scoped lang="scss">
.login-trend-card {
  background: var(--fa-color-surface, var(--el-bg-color));
  border: 1px solid var(--fa-color-border, var(--el-border-color));
  border-radius: 10px;
}

.login-trend-card :deep(.el-card__header) {
  padding: 20px 24px;
  border-bottom-color: var(--fa-color-border, var(--el-border-color));
}

.login-trend-card :deep(.el-card__body) {
  padding: 22px 24px;
}

.section-heading {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  justify-content: space-between;
}

.eyebrow {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  margin-bottom: 7px;
  font-size: 11px;
  font-weight: 750;
  color: var(--el-color-primary);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.eyebrow-mark {
  width: 6px;
  height: 6px;
  background: currentcolor;
  border-radius: 50%;
  box-shadow: 0 0 0 4px var(--el-color-primary-light-9);
}

.section-heading h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 650;
  color: var(--el-text-color-primary);
}

.section-heading p {
  margin: 5px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}

.section-actions {
  display: inline-flex;
  flex: 0 0 auto;
  gap: 8px;
  align-items: center;
}

.trend-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--fa-color-border, var(--el-border-color));
}

.trend-summary__item {
  display: grid;
  gap: 6px;
  padding: 4px 20px;
  border-right: 1px solid var(--fa-color-border, var(--el-border-color));
}

.trend-summary__item:first-child {
  padding-left: 0;
}

.trend-summary__item:last-child {
  border-right: 0;
}

.trend-summary__item span,
.trend-summary__item small {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.trend-summary__item strong {
  font-size: 28px;
  font-weight: 680;
  font-variant-numeric: tabular-nums;
  line-height: 1.15;
  color: var(--el-text-color-primary);
}

.trend-summary__item small {
  font-size: 11px;
}

.trend-chart {
  height: 220px;
  margin-top: 20px;
}

.trend-chart :deep(.relative) {
  width: 100%;
}

.trend-state {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  color: var(--el-text-color-secondary);
}

.trend-state--error {
  color: var(--el-color-warning-dark-2);
  background: var(--el-color-warning-light-9);
  border-radius: 7px;
}

.trend-state__icon {
  font-size: 18px;
}

.trend-state__icon--spin {
  animation: trend-spin 1.1s linear infinite;
}

.trend-footnote {
  margin: 8px 0 0;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

@keyframes trend-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (width <= 640px) {
  .login-trend-card :deep(.el-card__body),
  .login-trend-card :deep(.el-card__header) {
    padding: 16px;
  }

  .section-heading {
    flex-direction: column;
    align-items: stretch;
  }

  .section-actions {
    justify-content: space-between;
  }

  .trend-summary {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .trend-summary__item {
    padding: 4px 10px;
  }

  .trend-summary__item strong {
    font-size: 23px;
  }

  .trend-summary__item span,
  .trend-summary__item small {
    font-size: 11px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .trend-state__icon--spin {
    animation: none;
  }
}
</style>
