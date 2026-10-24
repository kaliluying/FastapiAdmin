<template>
  <ElDrawer
    :model-value="visible"
    append-to-body
    title="只读诊断 Agent"
    size="min(100vw, 860px)"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="diagnostic-agent">
      <p class="agent-notice">
        根据目标查询所选知识库与运行日志，展示执行过程和诊断依据。仅做只读诊断，不修改业务数据。
        关闭面板或离开页面后任务继续，可从最近任务重新查看；停止任务请点击“取消任务”。
      </p>

      <section aria-label="最近诊断任务" class="agent-history">
        <label for="agent-history">最近任务（最多 20 条）</label>
        <div class="agent-row">
          <ElSelect
            id="agent-history"
            :model-value="selectedRunId || undefined"
            :disabled="mutating"
            :loading="loadingRuns"
            fit-input-width
            placeholder="选择任务查看或继续跟踪"
            no-data-text="暂无诊断任务，请在下方填写目标"
            aria-label="最近诊断任务"
            @update:model-value="selectRun"
          >
            <ElOption
              v-for="item in runs"
              :key="item.run_id"
              :value="item.run_id"
              :label="`${statusLabels[item.status]} · ${formatTime(item.created_at)} · ${item.goal}`"
            />
          </ElSelect>
          <ElButton :loading="loadingRuns" :disabled="mutating" @click="loadRuns">
            刷新列表
          </ElButton>
        </div>
        <p v-if="listError" role="alert" class="agent-error">{{ listError }}</p>
        <p v-else-if="!loadingRuns && !runs.length" class="agent-muted">
          暂无诊断任务。选择数据来源并描述目标，即可开始。
        </p>
      </section>

      <ElForm
        label-position="top"
        :disabled="mutating || !!pendingSubmission"
        @submit.prevent="submit"
      >
        <ElFormItem label="诊断目标">
          <ElInput
            v-model="goal"
            type="textarea"
            :rows="3"
            :maxlength="4000"
            show-word-limit
            resize="vertical"
            aria-label="诊断目标"
            placeholder="例如：结合操作手册，分析最近接口超时的可能原因，并给出排查建议。"
          />
        </ElFormItem>
        <ElFormItem label="知识库（最多 10 个）">
          <ElSelect
            v-model="knowledgeBaseIds"
            multiple
            filterable
            clearable
            collapse-tags
            collapse-tags-tooltip
            fit-input-width
            :multiple-limit="10"
            :loading="loadingSources"
            aria-label="诊断使用的知识库"
            placeholder="选择可查询的知识库"
            no-data-text="暂无可用知识库"
          >
            <ElOption
              v-for="item in knowledgeBases"
              :key="item.id"
              :value="item.id!"
              :label="item.name"
            />
          </ElSelect>
        </ElFormItem>
        <ElCheckbox
          v-model="useRuntimeLogs"
          :disabled="!canUseRuntimeLogs || loadingSources"
          aria-describedby="agent-log-availability"
        >
          查询运行日志
        </ElCheckbox>
        <p id="agent-log-availability" class="agent-muted">{{ logAvailabilityText }}</p>
        <p v-if="sourceError" role="alert" class="agent-error">{{ sourceError }}</p>
        <ElButton
          v-if="sourceError"
          :loading="loadingSources"
          :disabled="mutating || !!pendingSubmission"
          @click="loadSources"
        >
          重试加载数据来源
        </ElButton>
        <div class="agent-actions">
          <ElButton
            type="primary"
            native-type="submit"
            :loading="submitting"
            :disabled="!canSubmit"
          >
            开始诊断
          </ElButton>
          <span v-if="!hasTools" class="agent-muted">请至少选择一个知识库或启用运行日志。</span>
          <span v-else-if="isActive" class="agent-muted">当前任务结束后可再次提交。</span>
        </div>
      </ElForm>

      <div v-if="submitError" role="alert" class="agent-error">
        <p>{{ submitError }}</p>
        <ElButton v-if="pendingSubmission" :loading="submitting" @click="submit">
          重试提交（避免重复创建）
        </ElButton>
      </div>

      <section v-if="selectedRunId" aria-label="诊断任务详情" class="agent-detail">
        <div class="agent-row agent-detail-heading">
          <h3>诊断过程</h3>
          <span v-if="run" role="status" aria-live="polite">
            {{ statusLabels[run.status] }}
          </span>
          <ElButton :loading="refreshing" :disabled="mutating" @click="refreshRun">
            {{ detailError ? "重试更新" : "刷新状态" }}
          </ElButton>
          <ElButton v-if="isActive" :loading="cancelling" :disabled="submitting" @click="cancel">
            取消任务
          </ElButton>
        </div>
        <div v-if="detailError" role="alert" class="agent-error">{{ detailError }}</div>
        <div v-if="cancelError" role="alert" class="agent-error">{{ cancelError }}</div>
        <p v-if="!run && refreshing" role="status" class="agent-muted">正在加载任务详情…</p>
        <template v-if="run">
          <p class="agent-goal">{{ run.goal }}</p>
          <p class="agent-muted">
            更新于 {{ formatTime(run.updated_at) }} · 模型调用 {{ run.model_calls }} 次 · 工具调用
            {{ run.tool_calls }} 次 · 执行尝试 {{ run.attempts }} 次
          </p>
          <p class="agent-muted">
            数据来源：{{ run.knowledge_base_ids.length }} 个知识库{{
              run.use_runtime_logs ? "、运行日志" : ""
            }}
          </p>
          <ol v-if="run.events.length" class="agent-events" aria-label="诊断执行记录" tabindex="0">
            <li v-for="event in run.events" :key="event.seq">
              <div class="agent-event-heading">
                <strong>{{ eventLabels[event.type] || "任务进展" }}</strong>
                <time :datetime="event.created_at">{{ formatTime(event.created_at) }}</time>
              </div>
              <p>{{ event.message }}</p>
              <p v-if="toolNames[String(event.data.name)]" class="agent-muted">
                工具：{{ toolNames[String(event.data.name)] }}
              </p>
              <p v-if="typeof event.data.query === 'string'" class="agent-muted">
                查询：{{ event.data.query }}
              </p>
              <p v-if="typeof event.data.returned_count === 'number'" class="agent-muted">
                返回 {{ event.data.returned_count }} 条证据
              </p>
            </li>
          </ol>
          <p v-else class="agent-muted">暂无执行记录{{ isActive ? "，等待任务进展…" : "。" }}</p>
          <p v-if="run.status === 'failed'" role="alert" class="agent-error">
            {{ run.error || "诊断未完成，请检查数据来源后重新发起任务。" }}
          </p>
          <p v-if="run.status === 'cancelled'" role="status" class="agent-muted">
            任务已取消；已进入调用的只读请求可能继续至返回，但不会发布新的结果。
          </p>
          <section v-if="run.result !== null" aria-label="诊断结果" class="agent-result">
            <h3>诊断结果</h3>
            <FaMarkdownRenderer :content="run.result" />
          </section>
          <p
            v-else-if="run.status === 'succeeded' && !refreshing && !detailError"
            class="agent-muted"
          >
            任务已完成，未返回诊断正文。
          </p>
          <section v-if="run.status === 'succeeded' || run.citations.length" aria-label="诊断引用">
            <h3>诊断依据</h3>
            <FaCitationList :citations="run.citations" @select="selectedCitation = $event" />
          </section>
        </template>
      </section>
    </div>
    <ElDialog
      :model-value="visible && !!selectedCitation"
      append-to-body
      title="引用片段"
      width="min(92vw, 640px)"
      @update:model-value="selectedCitation = null"
    >
      <h3>{{ selectedCitation?.title }}</h3>
      <p class="agent-citation">{{ selectedCitation?.snippet || "暂无片段" }}</p>
    </ElDialog>
  </ElDrawer>
</template>

<script setup lang="ts">
import { computed, onActivated, onDeactivated, onUnmounted, ref, watch } from "vue";
import AiAgentAPI, {
  AgentSubmissionRejected,
  type AgentRun,
  type AgentRunCreate,
} from "@/api/module_ai/agent";
import AiChatAPI from "@/api/module_ai/chat";
import KnowledgeAPI, { type KnowledgeBase } from "@/api/module_ai/knowledge";
import FaCitationList from "@/views/module_ai/components/FaCitationList.vue";
import FaMarkdownRenderer from "@/components/others/fa-markdown-renderer/index.vue";
import type { ChatCitation } from "../types";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();
const pageActive = ref(true);
const visible = computed(() => props.modelValue && pageActive.value);
const goal = ref("");
const knowledgeBaseIds = ref<number[]>([]);
const useRuntimeLogs = ref(false);
const knowledgeBases = ref<KnowledgeBase[]>([]);
const canUseRuntimeLogs = ref(false);
const logAvailabilityText = ref("正在检查运行日志是否可用…");
const loadingSources = ref(false);
const sourceError = ref("");
const runs = ref<AgentRun[]>([]);
const loadingRuns = ref(false);
const listError = ref("");
const selectedRunId = ref("");
const run = ref<AgentRun | null>(null);
const selectedCitation = ref<ChatCitation | null>(null);
const refreshing = ref(false);
const detailError = ref("");
const submitting = ref(false);
const pendingSubmission = ref<AgentRunCreate | null>(null);
const submitError = ref("");
const cancelling = ref(false);
const cancelError = ref("");
const mutating = computed(() => submitting.value || cancelling.value);
const isActive = computed(() => run.value && ["pending", "running"].includes(run.value.status));
const eventCursor = computed(() => run.value?.events.at(-1)?.seq || 0);
const needsPolling = computed(
  () => isActive.value || (run.value && run.value.last_seq > eventCursor.value)
);
const hasTools = computed(
  () => knowledgeBaseIds.value.length > 0 || (useRuntimeLogs.value && canUseRuntimeLogs.value)
);
const canSubmit = computed(
  () =>
    visible.value &&
    !mutating.value &&
    !loadingSources.value &&
    !refreshing.value &&
    !pendingSubmission.value &&
    !isActive.value &&
    !!goal.value.trim() &&
    goal.value.trim().length <= 4000 &&
    knowledgeBaseIds.value.length <= 10 &&
    hasTools.value
);

const statusLabels: Record<AgentRun["status"], string> = {
  pending: "等待执行",
  running: "诊断中",
  succeeded: "已完成",
  failed: "诊断失败",
  cancelled: "已取消",
};
const eventLabels: Record<string, string> = {
  started: "开始诊断",
  model_call: "模型分析",
  tool_started: "开始查询",
  tool_completed: "查询完成",
  recovering: "恢复执行",
  succeeded: "诊断完成",
  failed: "诊断失败",
  cancelled: "任务取消",
};
const toolNames: Record<string, string> = {
  query_runtime_logs: "运行日志",
  search_knowledge: "知识库检索",
};
const formatTime = (value: string) => value.replace("T", " ").split(".")[0];

let viewGeneration = 0;
let sourceGeneration = 0;
let detailGeneration = 0;
let pollTimer: ReturnType<typeof setTimeout> | undefined;
let detailController: AbortController | undefined;
let listController: AbortController | undefined;
let disposed = false;

function stopPolling() {
  detailGeneration++;
  clearTimeout(pollTimer);
  detailController?.abort();
  refreshing.value = false;
}

function summary(incoming: AgentRun): AgentRun {
  return { ...incoming, result: null, citations: [], events: [] };
}

function clearEvidence() {
  if (run.value) run.value = summary(run.value);
  selectedCitation.value = null;
}

function mergeRun(incoming: AgentRun) {
  const previous = run.value?.run_id === incoming.run_id ? run.value : null;
  const events = [
    ...new Map(
      [...(previous?.events || []), ...incoming.events].map((event) => [event.seq, event])
    ).values(),
  ].sort((a, b) => a.seq - b.seq);
  run.value = {
    ...incoming,
    events,
    last_seq: Math.max(previous?.last_seq || 0, incoming.last_seq),
  };
  runs.value = [
    summary(run.value),
    ...runs.value.filter((item) => item.run_id !== incoming.run_id),
  ].slice(0, 20);
}

async function loadSources() {
  const generation = viewGeneration;
  const sourceRequest = ++sourceGeneration;
  loadingSources.value = true;
  sourceError.value = "";
  const [knowledge, logs] = await Promise.allSettled([
    KnowledgeAPI.optionselect(),
    AiChatAPI.getRuntimeLogStatus(),
  ]);
  if (
    disposed ||
    !visible.value ||
    generation !== viewGeneration ||
    sourceRequest !== sourceGeneration
  )
    return;
  loadingSources.value = false;
  if (knowledge.status === "fulfilled") {
    knowledgeBases.value = knowledge.value.data.data.filter((item) => item.id != null);
    knowledgeBaseIds.value = knowledgeBaseIds.value.filter((id) =>
      knowledgeBases.value.some((item) => item.id === id)
    );
  } else {
    knowledgeBases.value = [];
    knowledgeBaseIds.value = [];
    sourceError.value = "知识库加载失败，可重试；运行日志可用时仍可单独使用。";
  }
  canUseRuntimeLogs.value =
    logs.status === "fulfilled" && logs.value.data.data.can_query && logs.value.data.data.enabled;
  if (!canUseRuntimeLogs.value) useRuntimeLogs.value = false;
  logAvailabilityText.value =
    logs.status === "rejected"
      ? "运行日志状态加载失败，请重试；仍可使用知识库诊断。"
      : canUseRuntimeLogs.value
        ? "运行日志可用，仅查询当前授权范围内的日志。"
        : "运行日志不可用，仅超级管理员且日志服务已启用时可使用；仍可选择知识库诊断。";
  if (logs.status === "rejected") {
    sourceError.value = [sourceError.value, "运行日志状态加载失败，可重试。"]
      .filter(Boolean)
      .join(" ");
  }
}

async function loadRuns() {
  const generation = viewGeneration;
  listController?.abort();
  const controller = new AbortController();
  listController = controller;
  loadingRuns.value = true;
  listError.value = "";
  try {
    const response = await AiAgentAPI.listRuns(20, controller.signal);
    if (disposed || !visible.value || generation !== viewGeneration || controller.signal.aborted)
      return;
    runs.value = response.data.data.map(summary);
  } catch {
    if (disposed || generation !== viewGeneration || controller.signal.aborted) return;
    listError.value = "最近任务加载失败，请刷新列表重试。";
  } finally {
    if (!disposed && generation === viewGeneration && !controller.signal.aborted)
      loadingRuns.value = false;
  }
}

async function selectRun(id: string) {
  if (mutating.value) return;
  stopPolling();
  selectedRunId.value = id;
  run.value = null;
  selectedCitation.value = null;
  cancelError.value = "";
  await refreshRun();
}

async function refreshRun() {
  if (!visible.value || !selectedRunId.value || refreshing.value || mutating.value) return;
  clearTimeout(pollTimer);
  const generation = detailGeneration;
  const id = selectedRunId.value;
  const controller = new AbortController();
  detailController = controller;
  refreshing.value = true;
  detailError.value = "";
  try {
    const response = await AiAgentAPI.getRun(id, eventCursor.value, controller.signal);
    if (disposed || !visible.value || generation !== detailGeneration) return;
    mergeRun(response.data.data);
  } catch {
    if (disposed || !visible.value || generation !== detailGeneration) return;
    clearEvidence();
    detailError.value = "暂时无法更新任务，任务状态尚未确认。请重试更新以继续跟踪。";
  } finally {
    if (!disposed && visible.value && generation === detailGeneration) {
      refreshing.value = false;
      if (needsPolling.value && !detailError.value) pollTimer = setTimeout(refreshRun, 1500);
    }
  }
}

async function submit() {
  if (!visible.value || mutating.value || (!pendingSubmission.value && !canSubmit.value)) return;
  const generation = viewGeneration;
  if (!pendingSubmission.value) {
    pendingSubmission.value = {
      request_id:
        crypto.randomUUID?.() ||
        Array.from(crypto.getRandomValues(new Uint32Array(4)), (value) =>
          value.toString(16).padStart(8, "0")
        ).join(""),
      goal: goal.value.trim(),
      knowledge_base_ids: [...knowledgeBaseIds.value],
      use_runtime_logs: useRuntimeLogs.value && canUseRuntimeLogs.value,
    };
  }
  submitting.value = true;
  submitError.value = "";
  stopPolling();
  try {
    const response = await AiAgentAPI.createRun(pendingSubmission.value);
    if (disposed) return;
    selectedRunId.value = response.data.data.run_id;
    run.value = null;
    selectedCitation.value = null;
    mergeRun(
      visible.value && generation === viewGeneration
        ? response.data.data
        : summary(response.data.data)
    );
    pendingSubmission.value = null;
    detailError.value = "";
    cancelError.value = "";
  } catch (error) {
    if (!disposed) {
      if (error instanceof AgentSubmissionRejected) {
        pendingSubmission.value = null;
        submitError.value = `提交被拒绝：${error.message} 请调整后重新提交。`;
      } else {
        submitError.value = "提交结果未确认。请重试提交以确认原任务，重试不会重复创建。";
      }
    }
  } finally {
    if (!disposed) {
      submitting.value = false;
      if (visible.value && needsPolling.value) await refreshRun();
    }
  }
}

async function cancel() {
  if (!run.value || !isActive.value || mutating.value || !visible.value) return;
  const generation = viewGeneration;
  const id = run.value.run_id;
  cancelling.value = true;
  cancelError.value = "";
  stopPolling();
  try {
    const response = await AiAgentAPI.cancelRun(id);
    if (!disposed && selectedRunId.value === id)
      mergeRun(
        visible.value && generation === viewGeneration
          ? response.data.data
          : summary(response.data.data)
      );
  } catch {
    if (!disposed && selectedRunId.value === id) {
      cancelError.value = "取消请求未确认，请刷新状态；若仍在运行可再次取消。";
    }
  } finally {
    if (!disposed) {
      cancelling.value = false;
      if (visible.value && selectedRunId.value === id) await refreshRun();
    }
  }
}

watch(
  visible,
  (open) => {
    viewGeneration++;
    stopPolling();
    listController?.abort();
    selectedCitation.value = null;
    if (open) {
      void loadSources();
      void loadRuns();
      void refreshRun();
    } else clearEvidence();
  },
  { immediate: true }
);
onDeactivated(() => {
  pageActive.value = false;
  emit("update:modelValue", false);
});
onActivated(() => {
  pageActive.value = true;
});
onUnmounted(() => {
  disposed = true;
  viewGeneration++;
  stopPolling();
  listController?.abort();
});
</script>

<style scoped lang="scss">
.diagnostic-agent {
  display: grid;
  gap: 20px;
  min-width: 0;
  color: var(--fa-color-text);
  overflow-wrap: anywhere;

  h3,
  p {
    margin: 0;
  }

  h3 {
    font-size: 15px;
  }
}

.agent-notice,
.agent-detail {
  padding: 16px;
  background: var(--fa-color-surface);
  border: 1px solid var(--fa-color-border);
  border-radius: var(--fa-radius-control);
}

.agent-notice,
.agent-muted,
.agent-error {
  font-size: 13px;
  line-height: 1.7;
}

.agent-muted {
  color: var(--fa-color-text-muted);
}

.agent-error {
  color: var(--el-color-danger);
}

.agent-history,
.agent-detail,
.agent-result {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.agent-row,
.agent-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
}

.agent-row :deep(.el-select) {
  flex: 1;
  min-width: 0;
}

.agent-actions {
  flex-wrap: wrap;
  margin-top: 16px;
}

.agent-detail-heading {
  flex-wrap: wrap;

  h3 {
    margin-right: auto;
  }

  :deep(.el-button) {
    margin: 0;
  }
}

.agent-goal,
.agent-citation {
  line-height: 1.7;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.agent-events {
  display: grid;
  gap: 12px;
  max-height: 320px;
  padding-left: 24px;
  margin: 0;
  overflow-y: auto;

  li {
    padding-left: 4px;
  }
}

.agent-event-heading {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: space-between;
  font-size: 13px;

  time {
    color: var(--fa-color-text-muted);
  }
}

.agent-result {
  overflow-x: auto;
}

.agent-citation {
  max-height: 60vh;
  overflow-y: auto;
}

@media (width <= 640px) {
  .agent-notice,
  .agent-detail {
    padding: 12px;
  }

  .agent-row {
    flex-wrap: wrap;
  }

  .agent-history .agent-row :deep(.el-select) {
    flex-basis: 100%;
  }

  .diagnostic-agent :deep(.el-button),
  .diagnostic-agent :deep(.el-checkbox) {
    min-height: 44px;
  }
}
</style>
