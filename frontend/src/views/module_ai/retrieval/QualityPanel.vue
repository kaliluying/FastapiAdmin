<template>
  <ElCard shadow="never" class="quality-panel">
    <ElTabs v-model="tab">
      <ElTabPane label="批量检索评测" name="evaluation">
        <p>
          用固定问题和预期文档检查检索效果。不会调用对话模型；向量检索可能使用当前配置的 Embedding
          服务。
        </p>
        <ElForm :label-position="isNarrow ? 'top' : 'right'" label-width="90px">
          <ElFormItem label="评测名称"
            ><ElInput v-model="name" maxlength="100" placeholder="例如：产品手册回归"
          /></ElFormItem>
          <ElFormItem label="知识库"
            ><ElSelect v-model="baseIds" multiple aria-label="评测知识库"
              ><ElOption
                v-for="base in bases"
                :key="base.id"
                :label="base.name"
                :value="base.id!" /></ElSelect
          ></ElFormItem>
          <ElFormItem label="片段数量"
            ><ElInputNumber v-model="topK" :min="1" :max="20"
          /></ElFormItem>
          <ElFormItem label="问题集">
            <ElInput
              v-model="datasetText"
              type="textarea"
              :rows="8"
              aria-label="评测问题集 JSON"
              placeholder='[{"query":"问题", "expected_document_ids":[文档编号]}]'
            />
          </ElFormItem>
          <p class="quality-hint">
            JSON 数组，每项填写 query 和 expected_document_ids，最多 20
            个问题。文档编号可在文档管理中查看。问题集和结果会保存到本人评测历史。
          </p>
          <ElButton type="primary" :loading="running" @click="evaluate">运行评测</ElButton>
        </ElForm>
        <p v-if="runError" role="alert">{{ runError }}</p>
        <section v-if="result" aria-label="评测结果" class="quality-result">
          <h3>{{ result.name }}</h3>
          <ElDescriptions :column="isNarrow ? 1 : 3" border>
            <ElDescriptionsItem label="命中率">{{
              percent(result.report.hit_rate)
            }}</ElDescriptionsItem>
            <ElDescriptionsItem label="文档召回率">{{
              percent(result.report.recall)
            }}</ElDescriptionsItem>
            <ElDescriptionsItem label="首个正确片段排名倒数">{{
              result.report.mrr.toFixed(3)
            }}</ElDescriptionsItem>
          </ElDescriptions>
          <p v-if="previous" class="quality-hint">
            与同问题集、同知识库和片段数量的上次结果相比：命中率
            {{ delta(result.report.hit_rate, previous.report.hit_rate) }}，召回率
            {{ delta(result.report.recall, previous.report.recall) }}，排名倒数
            {{ (result.report.mrr - previous.report.mrr).toFixed(3) }}。
          </p>
          <ElTable :data="result.report.cases">
            <ElTableColumn prop="query" label="问题" min-width="180" />
            <ElTableColumn label="预期文档" min-width="100"
              ><template #default="{ row }">{{
                row.expected_document_ids.join(", ")
              }}</template></ElTableColumn
            >
            <ElTableColumn label="实际文档（片段顺序）" min-width="160"
              ><template #default="{ row }">{{
                row.retrieved_document_ids.join(", ") || "未召回"
              }}</template></ElTableColumn
            >
            <ElTableColumn label="召回率" width="100"
              ><template #default="{ row }">{{ percent(row.recall) }}</template></ElTableColumn
            >
          </ElTable>
        </section>
        <div class="quality-toolbar">
          <h3>本人评测历史</h3>
          <ElButton :loading="historyLoading" @click="loadHistory">刷新历史</ElButton>
        </div>
        <FaAsyncState v-if="historyError" state="error" title="评测历史加载失败"
          ><template #action><ElButton @click="loadHistory">重试</ElButton></template></FaAsyncState
        >
        <ElTable v-else :data="history" empty-text="暂无评测，填写问题集开始检查">
          <ElTableColumn prop="name" label="名称" min-width="150" />
          <ElTableColumn prop="retrieval_mode" label="检索方式" width="110" />
          <ElTableColumn prop="created_time" label="时间" min-width="165" />
          <ElTableColumn label="操作" width="150"
            ><template #default="{ row }"
              ><ElButton link @click="result = row">查看结果</ElButton
              ><ElButton link @click="reuse(row)">复用问题集</ElButton></template
            ></ElTableColumn
          >
        </ElTable>
        <ElPagination
          v-model:current-page="historyPage"
          :page-size="20"
          :total="historyTotal"
          layout="total, prev, pager, next"
          :pager-count="5"
          @current-change="loadHistory"
        />
      </ElTabPane>
      <ElTabPane v-if="isAdmin" label="回答反馈处理" name="feedback">
        <div class="quality-toolbar">
          <ElSelect
            v-model="feedbackStatus"
            aria-label="反馈状态"
            @change="
              feedbackPage = 1;
              loadFeedback();
            "
            ><ElOption label="待处理" value="pending" /><ElOption
              label="已处理"
              value="resolved" /></ElSelect
          ><ElButton :loading="feedbackLoading" @click="loadFeedback">刷新反馈</ElButton>
        </div>
        <FaAsyncState v-if="feedbackError" state="error" title="回答反馈加载失败"
          ><template #action
            ><ElButton @click="loadFeedback">重试</ElButton></template
          ></FaAsyncState
        >
        <ElTable v-else :data="feedback" empty-text="暂无此状态的反馈">
          <ElTableColumn prop="question" label="问题" min-width="180" show-overflow-tooltip />
          <ElTableColumn label="评价" width="100"
            ><template #default="{ row }">{{
              row.rating === "helpful" ? "有帮助" : "存在问题"
            }}</template></ElTableColumn
          >
          <ElTableColumn prop="comment" label="反馈内容" min-width="200" show-overflow-tooltip />
          <ElTableColumn label="操作" width="90"
            ><template #default="{ row }"
              ><ElButton
                link
                @click="
                  selectedFeedback = row;
                  resolution = row.resolution;
                "
                >查看处理</ElButton
              ></template
            ></ElTableColumn
          >
        </ElTable>
        <ElPagination
          v-model:current-page="feedbackPage"
          :page-size="20"
          :total="feedbackTotal"
          layout="total, prev, pager, next"
          :pager-count="5"
          @current-change="loadFeedback"
        />
      </ElTabPane>
    </ElTabs>
    <ElDialog
      :model-value="!!selectedFeedback"
      title="处理回答反馈"
      width="min(92vw, 680px)"
      append-to-body
      :close-on-click-modal="false"
      @update:model-value="selectedFeedback = undefined"
    >
      <template v-if="selectedFeedback">
        <h4>原问题</h4>
        <p class="quality-text">{{ selectedFeedback.question }}</p>
        <h4>原回答</h4>
        <p class="quality-text">{{ selectedFeedback.answer }}</p>
        <h4>用户反馈</h4>
        <p>{{ selectedFeedback.rating === "helpful" ? "有帮助" : "存在问题" }}</p>
        <p class="quality-text">{{ selectedFeedback.comment || "未填写补充说明。" }}</p>
        <label for="feedback-resolution">处理说明</label
        ><ElInput
          id="feedback-resolution"
          v-model="resolution"
          type="textarea"
          :rows="3"
          maxlength="2000"
        />
        <p class="quality-hint">
          保存处理说明不会自动修改知识库或记忆。请先核对资料，再到文档管理修正内容。
        </p>
        <p v-if="reviewError" role="alert">{{ reviewError }}</p>
      </template>
      <template #footer
        ><ElButton :disabled="reviewing" @click="selectedFeedback = undefined">关闭</ElButton
        ><ElButton type="primary" :loading="reviewing" @click="review"
          >标记已处理</ElButton
        ></template
      >
    </ElDialog>
  </ElCard>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { useUserStore } from "@stores";
import type { KnowledgeBase } from "@/api/module_ai/knowledge";
import QualityAPI, {
  type AnswerFeedback,
  type Evaluation,
  type EvaluationCase,
} from "@/api/module_ai/quality";
import FaAsyncState from "@/components/feedback/fa-async-state/index.vue";

defineProps<{ bases: KnowledgeBase[] }>();
const isNarrow = useMediaQuery("(max-width: 640px)");
const userStore = useUserStore();
const isAdmin = computed(() => userStore.basicInfo?.is_superuser === true);
const tab = ref("evaluation");
const name = ref("");
const baseIds = ref<number[]>([]);
const topK = ref(5);
const datasetText = ref("");
const running = ref(false);
const runError = ref("");
const result = ref<Evaluation>();
const history = ref<Evaluation[]>([]);
const historyPage = ref(1);
const historyTotal = ref(0);
const historyLoading = ref(false);
const historyError = ref(false);
let historySequence = 0;
const previous = computed(() =>
  history.value.find(
    (item) => item.id < (result.value?.id || 0) && item.dataset_hash === result.value?.dataset_hash
  )
);
const feedback = ref<AnswerFeedback[]>([]);
const feedbackPage = ref(1);
const feedbackTotal = ref(0);
const feedbackStatus = ref("pending");
const feedbackLoading = ref(false);
const feedbackError = ref(false);
let feedbackSequence = 0;
const selectedFeedback = ref<AnswerFeedback>();
const resolution = ref("");
const reviewing = ref(false);
const reviewError = ref("");

const percent = (value: number) => `${(value * 100).toFixed(1)}%`;
const delta = (value: number, before: number) =>
  `${value >= before ? "+" : ""}${((value - before) * 100).toFixed(1)} 个百分点`;

async function evaluate() {
  if (running.value) return;
  runError.value = "";
  let cases: EvaluationCase[];
  try {
    cases = JSON.parse(datasetText.value);
    if (
      !Array.isArray(cases) ||
      !cases.length ||
      cases.length > 20 ||
      cases.some(
        (item) =>
          !item ||
          typeof item.query !== "string" ||
          !item.query.trim() ||
          !Array.isArray(item.expected_document_ids) ||
          !item.expected_document_ids.length ||
          item.expected_document_ids.some((id) => !Number.isInteger(id) || id <= 0)
      )
    )
      throw new Error();
  } catch {
    runError.value =
      "问题集格式不正确，请填写包含 query 和正整数文档编号数组 expected_document_ids 的 JSON 数组（1–20 项）。";
    return;
  }
  if (!name.value.trim() || !baseIds.value.length) {
    runError.value = "请填写评测名称并选择知识库。";
    return;
  }
  running.value = true;
  try {
    const response = await QualityAPI.evaluate({
      name: name.value.trim(),
      knowledge_base_ids: baseIds.value,
      top_k: topK.value,
      cases,
    });
    result.value = response.data.data;
    historyPage.value = 1;
    await loadHistory();
  } catch {
    runError.value = "评测失败，问题集已保留；请检查文档权限和检索服务后重试。";
  } finally {
    running.value = false;
  }
}

function reuse(row: Evaluation) {
  name.value = row.name;
  baseIds.value = [...row.knowledge_base_ids];
  topK.value = row.top_k;
  datasetText.value = JSON.stringify(row.dataset, null, 2);
}

async function loadHistory() {
  const sequence = ++historySequence;
  historyLoading.value = true;
  historyError.value = false;
  const page = historyPage.value;
  try {
    const response = await QualityAPI.evaluations({ page_no: page });
    if (sequence === historySequence && page === historyPage.value) {
      history.value = response.data.data.items;
      historyTotal.value = response.data.data.total;
    }
  } catch {
    if (sequence === historySequence) historyError.value = true;
  } finally {
    if (sequence === historySequence) historyLoading.value = false;
  }
}

async function loadFeedback() {
  if (!isAdmin.value) return;
  const sequence = ++feedbackSequence;
  feedbackLoading.value = true;
  feedbackError.value = false;
  const selection = `${feedbackPage.value}:${feedbackStatus.value}`;
  try {
    const response = await QualityAPI.feedbackList({
      all_users: true,
      status: feedbackStatus.value,
      page_no: feedbackPage.value,
    });
    if (
      sequence === feedbackSequence &&
      selection === `${feedbackPage.value}:${feedbackStatus.value}`
    ) {
      feedback.value = response.data.data.items;
      feedbackTotal.value = response.data.data.total;
    }
  } catch {
    if (sequence === feedbackSequence) feedbackError.value = true;
  } finally {
    if (sequence === feedbackSequence) feedbackLoading.value = false;
  }
}

async function review() {
  if (!selectedFeedback.value || reviewing.value) return;
  reviewError.value = "";
  if (!resolution.value.trim()) {
    reviewError.value = "请填写处理说明。";
    return;
  }
  reviewing.value = true;
  try {
    await QualityAPI.review(selectedFeedback.value.id, {
      status: "resolved",
      resolution: resolution.value.trim(),
      expected_revision: selectedFeedback.value.revision,
    });
    selectedFeedback.value = undefined;
    await loadFeedback();
  } catch (error: any) {
    reviewError.value =
      error?.response?.status === 409
        ? "反馈已更新，处理说明已保留；请关闭并刷新列表，核对后再处理。"
        : "保存失败，处理说明已保留，请重试。";
  } finally {
    reviewing.value = false;
  }
}
watch(tab, (value) => {
  if (value === "feedback") loadFeedback();
});
onMounted(loadHistory);
</script>

<style scoped>
.quality-panel {
  min-width: 0;
}

.quality-panel :deep(.el-select) {
  width: 100%;
}

.quality-hint {
  font-size: 12px;
  line-height: 1.7;
  color: var(--fa-color-text-muted);
}

.quality-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin: 24px 0 12px;
}

.quality-toolbar :deep(.el-select) {
  max-width: 180px;
}

.quality-result {
  margin-top: 24px;
}

.quality-text {
  max-height: 240px;
  overflow: auto;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.quality-panel :deep(.el-pagination) {
  flex-wrap: wrap;
  max-width: 100%;
  margin-top: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
}
</style>
