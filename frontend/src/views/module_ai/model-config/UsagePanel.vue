<template>
  <section v-loading="loading" class="usage-panel" aria-label="AI 用量">
    <div class="usage-toolbar">
      <h3>{{ canManage ? "用户 AI 用量与额度" : "今日 AI 用量" }}</h3>
      <ElButton :loading="loading" @click="loadUsage">刷新用量</ElButton>
    </div>
    <FaAsyncState v-if="loadError" state="error" title="用量加载失败" description="请稍后重试。">
      <template #action><ElButton @click="loadUsage">重试</ElButton></template>
    </FaAsyncState>
    <template v-else-if="usage">
      <ElForm v-if="canManage" :inline="!isNarrow" class="quota-form">
        <ElFormItem label="用户">
          <ElSelect
            v-model="selectedUser"
            :disabled="loading || saving"
            aria-label="选择用量用户"
            @change="loadUsage"
          >
            <ElOption
              v-for="user in users"
              :key="user.id"
              :label="user.username"
              :value="user.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="每日调用额度">
          <ElInputNumber
            v-model="dailyLimit"
            :disabled="loading || saving"
            :min="0"
            :max="1000000"
            :precision="0"
            placeholder="不限"
            aria-label="每日调用额度"
          />
        </ElFormItem>
        <ElFormItem
          ><ElButton :disabled="saving || loading" @click="saveQuota"
            >保存额度</ElButton
          ></ElFormItem
        >
      </ElForm>
      <ElDescriptions :column="isNarrow ? 1 : 3" border>
        <ElDescriptionsItem label="统计日期">{{ usage.day }} · 上海时间</ElDescriptionsItem>
        <ElDescriptionsItem label="调用次数">{{ usage.calls }} 次</ElDescriptionsItem>
        <ElDescriptionsItem label="剩余额度">{{
          usage.remaining === null ? "不限" : `${usage.remaining} 次`
        }}</ElDescriptionsItem>
      </ElDescriptions>
      <p class="usage-note">
        额度留空为不限，0
        为禁止调用。每次供应商请求（含诊断任务、日志工具循环、记忆提取和能力验证）计 1
        次，失败或取消也计入。
      </p>
      <FaTable :data="usage.items" :loading="loading" empty-text="当日暂无模型调用">
        <ElTableColumn label="模型 / 协议" min-width="200"
          ><template #default="{ row }"
            >{{ row.model }} · {{ row.protocol }}</template
          ></ElTableColumn
        >
        <ElTableColumn label="用途" min-width="110"
          ><template #default="{ row }">{{
            purposeLabels[row.purpose] || row.purpose
          }}</template></ElTableColumn
        >
        <ElTableColumn label="请求状态" min-width="90"
          ><template #default="{ row }">{{
            statusLabels[row.status] || row.status
          }}</template></ElTableColumn
        >
        <ElTableColumn prop="calls" label="调用次数" min-width="100" />
        <ElTableColumn label="Token（输入 / 输出 / 总）" min-width="210">
          <template #default="{ row }">
            {{ row.input_tokens ?? "未知" }} / {{ row.output_tokens ?? "未知" }} /
            {{ row.total_tokens ?? "未知" }}
            <span v-if="row.known_usage_calls < row.calls"
              >（{{ row.calls - row.known_usage_calls }} 次总量未知）</span
            >
          </template>
        </ElTableColumn>
        <ElTableColumn label="平均耗时" min-width="110"
          ><template #default="{ row }">{{
            row.latency_ms === null ? "未知" : `${Math.round(row.latency_ms)} ms`
          }}</template></ElTableColumn
        >
      </FaTable>
      <p class="usage-note">
        Token 仅采用供应商返回的数值，未知调用不按 0
        计算。处理中可能是未完成请求或结果写入中断，无法据此确认供应商未计费。
      </p>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { useUserStore } from "@stores";
import { ElMessage } from "element-plus";
import AiChatAPI, { type AiUsageSummary } from "@/api/module_ai/chat";
import FaAsyncState from "@/components/feedback/fa-async-state/index.vue";
import FaTable from "@/components/tables/fa-table/index.vue";

const props = withDefaults(defineProps<{ selfOnly?: boolean }>(), { selfOnly: true });
const userStore = useUserStore();
const canManage = computed(() => !props.selfOnly && userStore.basicInfo?.is_superuser === true);
const isNarrow = useMediaQuery("(max-width: 640px)");
const loading = ref(false);
const saving = ref(false);
const loadError = ref(false);
const usage = ref<AiUsageSummary>();
const users = ref<{ id: number; username: string }[]>([]);
const selectedUser = ref<number>();
const dailyLimit = ref<number>();
const purposeLabels: Record<string, string> = {
  chat: "普通回答",
  chat_stream: "流式回答",
  tools: "日志工具",
  agent: "诊断 Agent",
  memory: "记忆提取",
  capability_check: "能力验证",
};
const statusLabels: Record<string, string> = {
  pending: "处理中",
  succeeded: "成功",
  failed: "失败",
  cancelled: "取消",
};

async function loadUsage() {
  loading.value = true;
  loadError.value = false;
  const selection = selectedUser.value;
  try {
    const res = canManage.value
      ? await AiChatAPI.getAdminUsage(selection)
      : await AiChatAPI.getUsage();
    if (selection !== selectedUser.value) return;
    usage.value = res.data.data;
    selectedUser.value = usage.value.user_id;
    if (usage.value.users) users.value = usage.value.users;
    dailyLimit.value = usage.value.daily_limit ?? undefined;
  } catch {
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

async function saveQuota() {
  if (!selectedUser.value || !canManage.value) return;
  saving.value = true;
  const selected = selectedUser.value;
  try {
    const res = await AiChatAPI.updateUsageQuota(selected, dailyLimit.value ?? null);
    if (selected === selectedUser.value) usage.value = res.data.data;
    ElMessage.success("调用额度已更新");
  } finally {
    saving.value = false;
  }
}

onMounted(loadUsage);
</script>

<style scoped>
.usage-panel {
  min-width: 0;
}

.usage-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.usage-toolbar h3 {
  margin: 0;
  font-size: 16px;
}

.usage-note {
  font-size: 12px;
  line-height: 1.6;
  color: var(--fa-color-text-muted);
}

.quota-form :deep(.el-select) {
  min-width: 160px;
}
</style>
