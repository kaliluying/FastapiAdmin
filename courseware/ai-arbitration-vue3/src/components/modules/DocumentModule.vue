<template>
  <section class="draft-workbench" aria-label="仲裁申请书生成">
    <div class="draft-hero">
      <div>
        <span class="eyebrow">申请书草稿</span>
        <h2>从案件事实到可复核文书</h2>
        <p>
          当前会话、案件信息、仲裁请求和证据清单会一起提交给后端，生成后可查看历史并导出 Word / PDF。
        </p>
      </div>
      <div class="hero-meta">
        <strong>{{ activeSession.caseName }}</strong>
        <span>会话 ID：{{ activeSessionId || "未创建" }}</span>
      </div>
    </div>

    <div class="draft-grid">
      <form class="draft-form-panel" @submit.prevent="generateDraft">
        <div class="evidence-fill-card">
          <div>
            <span class="eyebrow">证据回填</span>
            <h3>从当前证据提取案件信息</h3>
            <p>
              已分析证据会补充争议事实、仲裁请求参考和证据清单；姓名、公司、工资等结构化字段仍需人工复核。
            </p>
          </div>
          <button class="btn" type="button" :disabled="evidenceLoading || !activeSessionId" @click="applyEvidenceToForm">
            {{ evidenceLoading ? "读取证据中..." : "从当前证据填充" }}
          </button>
          <p v-if="evidenceFillMessage" class="fill-note">{{ evidenceFillMessage }}</p>
        </div>

        <div class="form-section-title">
          <span>01</span>
          <h3>案件信息采集</h3>
        </div>

        <div class="field-grid">
          <label>
            <span>案件标题</span>
            <input v-model.trim="form.case_title" type="text" placeholder="例如：张三欠薪争议" />
          </label>
          <label>
            <span>仲裁委</span>
            <input v-model.trim="form.arbitration_committee" type="text" placeholder="例如：深圳市劳动人事争议仲裁委员会" />
          </label>
          <label>
            <span>申请人</span>
            <input v-model.trim="form.applicant_name" type="text" placeholder="姓名" />
          </label>
          <label>
            <span>联系电话</span>
            <input v-model.trim="form.applicant_phone" type="text" placeholder="手机号" />
          </label>
          <label>
            <span>身份证号</span>
            <input v-model.trim="form.applicant_id_no" type="text" placeholder="缺失会标为待补充" />
          </label>
          <label>
            <span>住址</span>
            <input v-model.trim="form.applicant_address" type="text" placeholder="申请人住址" />
          </label>
        </div>

        <div class="form-section-title">
          <span>02</span>
          <h3>被申请人与劳动关系</h3>
        </div>

        <div class="field-grid">
          <label>
            <span>公司名称 *</span>
            <input v-model.trim="form.respondent_name" type="text" placeholder="被申请单位名称" required />
          </label>
          <label>
            <span>统一社会信用代码</span>
            <input v-model.trim="form.respondent_credit_code" type="text" />
          </label>
          <label>
            <span>公司住所地</span>
            <input v-model.trim="form.respondent_address" type="text" />
          </label>
          <label>
            <span>法定代表人</span>
            <input v-model.trim="form.respondent_legal_rep" type="text" />
          </label>
          <label>
            <span>入职日期</span>
            <input v-model="form.hire_date" type="date" />
          </label>
          <label>
            <span>离职日期</span>
            <input v-model="form.leave_date" type="date" />
          </label>
          <label>
            <span>岗位</span>
            <input v-model.trim="form.position_name" type="text" placeholder="例如：运营专员" />
          </label>
          <label>
            <span>月工资</span>
            <input v-model.number="form.monthly_salary" min="0" step="0.01" type="number" placeholder="0.00" />
          </label>
          <label>
            <span>合同类型</span>
            <select v-model="form.contract_type">
              <option value="">请选择</option>
              <option value="劳动合同">劳动合同</option>
              <option value="劳务合同">劳务合同</option>
              <option value="无合同">无合同</option>
            </select>
          </label>
          <label>
            <span>缴纳社保</span>
            <select v-model="socialInsuranceValue">
              <option value="">请选择</option>
              <option value="true">是</option>
              <option value="false">否</option>
            </select>
          </label>
        </div>

        <div class="form-section-title">
          <span>03</span>
          <h3>争议、请求和证据</h3>
        </div>

        <label class="field-block">
          <span>争议事实 *</span>
          <textarea
            v-model.trim="form.dispute_summary"
            rows="5"
            maxlength="2000"
            placeholder="说明欠薪、解除、加班、未签合同等核心事实"
            required
          ></textarea>
        </label>
        <label class="field-block">
          <span>仲裁请求（一行一项）</span>
          <textarea v-model="claimsText" rows="4" placeholder="请求支付拖欠工资 24000 元"></textarea>
        </label>
        <label class="field-block">
          <span>证据清单（一行一项）</span>
          <textarea v-model="evidenceText" rows="4" placeholder="劳动合同&#10;工资流水&#10;微信聊天记录"></textarea>
        </label>

        <div class="form-actions">
          <label class="ai-toggle">
            <input v-model="form.use_ai" type="checkbox" />
            <span>使用 AI 润色</span>
          </label>
          <button class="btn" type="button" @click="resetForm">重置</button>
          <button class="btn primary" type="submit" :disabled="loading || !activeSessionId">
            {{ loading ? "生成中..." : "生成申请书" }}
          </button>
        </div>

        <p v-if="errorMessage" class="error-note">{{ errorMessage }}</p>
      </form>

      <aside class="draft-preview-panel">
        <div class="preview-toolbar">
          <div>
            <span class="eyebrow">草稿预览</span>
            <h3>{{ draft?.title || "等待生成" }}</h3>
          </div>
          <div class="toolbar-actions">
            <button class="btn" type="button" :disabled="!draft" @click="copyDraft">复制</button>
            <button class="btn" type="button" :disabled="!draft?.draft_id" @click="downloadDraft('docx')">Word</button>
            <button class="btn" type="button" :disabled="!draft?.draft_id" @click="downloadDraft('pdf')">PDF</button>
          </div>
        </div>

        <div v-if="draft" class="draft-stats">
          <span>案件 #{{ draft.case_id || "-" }}</span>
          <span>草稿 #{{ draft.draft_id || "-" }}</span>
          <span>请求 {{ draft.source_summary.claims_count }} 项</span>
          <span>证据 {{ draft.source_summary.evidence_count }} 项</span>
        </div>

        <div v-if="!draft" class="empty-draft">
          <strong>还没有生成草稿</strong>
          <p>左侧填写必要事实后点击“生成申请书”，正文会显示在这里。</p>
        </div>
        <pre v-else class="draft-paper">{{ draft.content }}</pre>

        <div v-if="draft?.risk_tips.length" class="risk-box">
          <strong>风险提示</strong>
          <ul>
            <li v-for="tip in draft.risk_tips" :key="tip">{{ tip }}</li>
          </ul>
        </div>

        <div class="history-card">
          <div class="section-title">
            <h3>草稿历史</h3>
            <button class="link" type="button" :disabled="historyLoading" @click="loadHistory">
              {{ historyLoading ? "刷新中..." : "刷新" }}
            </button>
          </div>
          <p v-if="draftHistory.length === 0" class="small-note">暂无草稿历史</p>
          <button
            v-for="item in draftHistory"
            :key="item.id"
            class="history-draft"
            type="button"
            @click="loadDraft(item.id)"
          >
            <span>
              <strong>#{{ item.id }} {{ item.title }}</strong>
              <small>{{ item.created_time || "刚刚" }} · {{ item.used_ai ? "AI 润色" : "模板生成" }}</small>
            </span>
            <em>{{ item.review_status }}</em>
          </button>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import type { ChatSession } from "../../data/mock";
import { useAuth } from "../../composables/useAuth";
import {
  getEvidenceDetail,
  listEvidence,
  type EvidenceAnalysisResult,
  type EvidenceListItem,
} from "../../api/evidenceApi";
import { extractFieldsFromEvidence } from "../../utils/arbitrationEvidenceExtract";
import {
  exportArbitrationDraft,
  generateArbitrationDraft,
  getArbitrationDraft,
  listArbitrationDrafts,
  type ArbitrationDraftItem,
  type ArbitrationDraftRequest,
  type ArbitrationDraftResult,
} from "../../api/arbitrationApi";

const props = defineProps<{
  activeSession: ChatSession;
  activeSessionId: string;
}>();

const { currentUser, refreshUser } = useAuth();

const initialForm = (): ArbitrationDraftRequest => ({
  case_id: null,
  case_title: props.activeSession.caseName === "待补充案件信息" ? "" : props.activeSession.caseName,
  session_id: props.activeSessionId,
  arbitration_committee: "",
  applicant_name: currentUser.value?.name || "",
  applicant_gender: "",
  applicant_id_no: "",
  applicant_phone: currentUser.value?.mobile || "",
  applicant_address: "",
  respondent_name: currentUser.value?.company_name || "",
  respondent_credit_code: "",
  respondent_address: "",
  respondent_legal_rep: "",
  respondent_phone: "",
  hire_date: currentUser.value?.hire_date || "",
  leave_date: "",
  position_name: currentUser.value?.position_name || "",
  work_location: "",
  monthly_salary: currentUser.value?.monthly_salary ?? null,
  contract_type: currentUser.value?.contract_type || "",
  social_insurance: currentUser.value?.social_insurance ?? null,
  dispute_summary: "公司拖欠工资，并口头通知不用再来上班。",
  claims: [],
  evidence_items: [],
  use_ai: false,
});

const form = reactive<ArbitrationDraftRequest>(initialForm());
const claimsText = ref("");
const evidenceText = ref("");
const draft = ref<ArbitrationDraftResult | null>(null);
const draftHistory = ref<ArbitrationDraftItem[]>([]);
const loading = ref(false);
const historyLoading = ref(false);
const evidenceLoading = ref(false);
const errorMessage = ref("");
const evidenceFillMessage = ref("");
const evidenceAnalyses = ref<EvidenceAnalysisResult[]>([]);

const socialInsuranceValue = computed({
  get() {
    if (form.social_insurance === true) return "true";
    if (form.social_insurance === false) return "false";
    return "";
  },
  set(value: string) {
    form.social_insurance = value === "" ? null : value === "true";
  },
});

function toLines(text: string): string[] {
  return text
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildPayload(): ArbitrationDraftRequest {
  return {
    ...form,
    session_id: props.activeSessionId,
    claims: toLines(claimsText.value),
    evidence_items: toLines(evidenceText.value),
    monthly_salary: form.monthly_salary || null,
  };
}

function uniqueLines(lines: string[]): string[] {
  return [...new Set(lines.map((item) => item.trim()).filter(Boolean))];
}

function mergeTextareaLines(current: string, incoming: string[]): string {
  return uniqueLines([...toLines(current), ...incoming]).join("\n");
}

function fillEmptyField(key: keyof ArbitrationDraftRequest, value: string | number | null) {
  if (value === "" || value === null) return;
  if (form[key] === null || form[key] === undefined || form[key] === "") {
    (form[key] as string | number | null) = value;
  }
}

function fillFromCurrentUser() {
  const user = currentUser.value;
  if (!user) return;

  fillEmptyField("applicant_name", user.name || null);
  fillEmptyField("applicant_phone", user.mobile || null);
  fillEmptyField("respondent_name", user.company_name || null);
  fillEmptyField("hire_date", user.hire_date || null);
  fillEmptyField("position_name", user.position_name || null);
  fillEmptyField("monthly_salary", user.monthly_salary ?? null);
  fillEmptyField("contract_type", user.contract_type || null);
  if (form.social_insurance === null || form.social_insurance === undefined) {
    form.social_insurance = user.social_insurance ?? null;
  }
}

function inferStructuredFields(items: EvidenceAnalysisResult[]) {
  const fields = extractFieldsFromEvidence(items);
  fillEmptyField("respondent_name", fields.respondent_name || null);
  fillEmptyField("respondent_credit_code", fields.respondent_credit_code || null);
  fillEmptyField("respondent_address", fields.respondent_address || null);
  fillEmptyField("respondent_legal_rep", fields.respondent_legal_rep || null);
  fillEmptyField("position_name", fields.position_name || null);
  fillEmptyField("hire_date", fields.hire_date || null);
  fillEmptyField("leave_date", fields.leave_date || null);
  fillEmptyField("monthly_salary", fields.monthly_salary || null);
  fillEmptyField("contract_type", fields.contract_type || null);
}

async function loadEvidenceAnalyses(): Promise<EvidenceAnalysisResult[]> {
  if (!props.activeSessionId) return [];

  const files = await listEvidence(props.activeSessionId);
  const analyzed = files.filter((item: EvidenceListItem) => item.analysis_status === "analyzed");
  const details = await Promise.all(
    analyzed.map((item) =>
      getEvidenceDetail(item.evidence_id).catch(() => ({
        evidence_id: item.evidence_id,
        file_name: item.file_name,
        file_type: item.file_type,
        file_size: item.file_size,
        parse_status: item.parse_status,
        analysis_status: item.analysis_status,
        evidence_type: item.evidence_type,
        key_facts: null,
        proof_purpose: null,
        related_claims: null,
        evidence_strength: null,
        risks: null,
        missing_materials: null,
        summary: item.summary,
        created_at: item.created_at,
      })),
    ),
  );
  evidenceAnalyses.value = details;
  return details;
}

async function applyEvidenceToForm() {
  if (!props.activeSessionId) {
    evidenceFillMessage.value = "请先创建或选择一个咨询会话。";
    return;
  }

  evidenceLoading.value = true;
  evidenceFillMessage.value = "";
  errorMessage.value = "";
  try {
    const details = await loadEvidenceAnalyses();
    if (!details.length) {
      evidenceFillMessage.value = "当前会话还没有已分析完成的证据，请先上传并完成 AI 分析。";
      return;
    }

    inferStructuredFields(details);
    const factLines = uniqueLines(
      details.flatMap((item) => [
        ...(item.key_facts || []),
        item.summary || "",
      ]),
    );
    const claimLines = uniqueLines(details.flatMap((item) => item.related_claims || []));
    const evidenceLines = details.map((item) => {
      const proof = item.proof_purpose?.length ? `，证明目的：${item.proof_purpose.join("；")}` : "";
      return `${item.file_name}：${item.summary || item.evidence_type || "已上传证据"}${proof}`;
    });

    form.dispute_summary = mergeTextareaLines(form.dispute_summary, factLines);
    claimsText.value = mergeTextareaLines(claimsText.value, claimLines);
    evidenceText.value = mergeTextareaLines(evidenceText.value, evidenceLines);
    evidenceFillMessage.value = `已读取 ${details.length} 份已分析证据，并补充到案件信息中。`;
  } catch (error: unknown) {
    evidenceFillMessage.value = error instanceof Error ? error.message : "读取当前证据失败";
  } finally {
    evidenceLoading.value = false;
  }
}

async function generateDraft() {
  if (!props.activeSessionId) {
    errorMessage.value = "请先创建或选择一个咨询会话，再生成申请书。";
    return;
  }
  if (!form.respondent_name?.trim() || !form.dispute_summary.trim()) {
    errorMessage.value = "请至少填写被申请人名称和争议事实。";
    return;
  }

  loading.value = true;
  errorMessage.value = "";
  try {
    const result = await generateArbitrationDraft(buildPayload());
    draft.value = result;
    form.case_id = result.case_id || form.case_id || null;
    await loadHistory();
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : "生成申请书失败";
  } finally {
    loading.value = false;
  }
}

async function loadHistory() {
  historyLoading.value = true;
  try {
    draftHistory.value = await listArbitrationDrafts(form.case_id || null);
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : "草稿历史加载失败";
  } finally {
    historyLoading.value = false;
  }
}

async function loadDraft(draftId: number) {
  errorMessage.value = "";
  try {
    draft.value = await getArbitrationDraft(draftId);
    form.case_id = draft.value.case_id || form.case_id || null;
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : "草稿详情加载失败";
  }
}

async function copyDraft() {
  if (!draft.value) return;
  await navigator.clipboard.writeText(draft.value.content);
}

async function downloadDraft(fileType: "docx" | "pdf") {
  const draftId = draft.value?.draft_id;
  if (!draftId) return;

  errorMessage.value = "";
  try {
    const blob = await exportArbitrationDraft(draftId, fileType);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `仲裁申请书-${draftId}.${fileType}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : "导出失败";
  }
}

function resetForm() {
  Object.assign(form, initialForm());
  claimsText.value = "";
  evidenceText.value = "";
  draft.value = null;
  errorMessage.value = "";
  evidenceFillMessage.value = "";
}

watch(
  () => props.activeSessionId,
  (sessionId) => {
    form.session_id = sessionId;
    evidenceAnalyses.value = [];
    evidenceFillMessage.value = "";
    loadHistory();
  },
);

onMounted(() => {
  if (!currentUser.value) {
    refreshUser().then(fillFromCurrentUser).catch(() => undefined);
  } else {
    fillFromCurrentUser();
  }
  loadHistory();
  loadEvidenceAnalyses().catch(() => undefined);
});
</script>

<style scoped>
.draft-workbench {
  display: grid;
  gap: 16px;
}

.draft-hero {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: stretch;
  border: 1px solid var(--line);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(0, 127, 134, 0.08), transparent 38%),
    linear-gradient(180deg, #fff, #f8fcfd);
  padding: 18px;
}

.eyebrow {
  display: inline-flex;
  color: var(--teal);
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0;
  margin-bottom: 8px;
}

.draft-hero h2,
.preview-toolbar h3 {
  margin: 0;
  font-size: 22px;
  line-height: 1.25;
}

.draft-hero p {
  max-width: 620px;
  margin-top: 8px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.7;
}

.hero-meta {
  min-width: 220px;
  border-left: 1px solid var(--line);
  padding-left: 18px;
  display: grid;
  align-content: center;
  gap: 7px;
  color: var(--muted);
  font-size: 12px;
}

.hero-meta strong {
  color: var(--text);
  font-size: 15px;
}

.draft-grid {
  display: grid;
  grid-template-columns: minmax(360px, 0.9fr) minmax(420px, 1.1fr);
  gap: 14px;
  align-items: start;
}

.draft-form-panel,
.draft-preview-panel {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  padding: 16px;
}

.form-section-title {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 3px 0 13px;
}

.form-section-title span {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 7px;
  background: var(--teal-soft);
  color: var(--teal);
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 850;
}

.form-section-title h3 {
  margin: 0;
  font-size: 15px;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}

label {
  display: grid;
  gap: 6px;
  min-width: 0;
}

label span {
  color: var(--muted);
  font-size: 12px;
  font-weight: 750;
}

input,
select,
textarea {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: #fbfdff;
  color: var(--text);
  padding: 10px 11px;
  outline: 0;
}

input,
select {
  min-height: 40px;
}

textarea {
  resize: vertical;
  line-height: 1.65;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #8cc9cc;
  box-shadow: 0 0 0 3px rgba(0, 127, 134, 0.1);
}

.field-block {
  margin-bottom: 11px;
}

.form-actions,
.preview-toolbar,
.toolbar-actions,
.draft-stats {
  display: flex;
  align-items: center;
  gap: 9px;
}

.form-actions {
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: 14px;
}

.ai-toggle {
  display: inline-flex;
  grid-auto-flow: column;
  align-items: center;
  gap: 8px;
  margin-right: auto;
  color: var(--muted);
  font-size: 12px;
  font-weight: 800;
}

.ai-toggle input {
  width: 16px;
  min-height: 16px;
}

.error-note {
  margin-top: 12px;
  color: #b42318;
  background: #fff1f0;
  border: 1px solid #ffd2cc;
  border-radius: 7px;
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.55;
}

.draft-preview-panel {
  display: grid;
  gap: 13px;
}

.preview-toolbar {
  justify-content: space-between;
  align-items: flex-start;
}

.toolbar-actions {
  flex-wrap: wrap;
  justify-content: flex-end;
}

.draft-stats {
  flex-wrap: wrap;
}

.draft-stats span {
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--panel-soft);
  color: var(--muted);
  padding: 5px 9px;
  font-size: 12px;
  font-weight: 750;
}

.empty-draft {
  min-height: 260px;
  display: grid;
  place-items: center;
  align-content: center;
  text-align: center;
  border: 1px dashed var(--line-strong);
  border-radius: 8px;
  color: var(--muted);
  padding: 24px;
}

.empty-draft strong {
  color: var(--text);
  margin-bottom: 8px;
}

.draft-paper {
  min-height: 360px;
  max-height: 620px;
  overflow: auto;
  margin: 0;
  white-space: pre-wrap;
  border: 1px solid var(--line);
  border-radius: 8px;
  background:
    linear-gradient(90deg, rgba(0, 127, 134, 0.04), transparent 110px),
    #fff;
  padding: 24px;
  color: #1c2d40;
  font-family: "Songti SC", "STSong", "SimSun", serif;
  font-size: 15px;
  line-height: 2;
}

.risk-box {
  border: 1px solid #f1c979;
  border-radius: 8px;
  background: var(--orange-soft);
  padding: 12px 14px;
  color: #8d5600;
}

.risk-box strong {
  display: block;
  margin-bottom: 6px;
}

.risk-box ul {
  margin: 0;
  padding-left: 18px;
  line-height: 1.65;
  font-size: 13px;
}

.history-card {
  border-top: 1px solid var(--line);
  padding-top: 13px;
}

.history-draft {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: #fff;
  color: var(--text);
  text-align: left;
  padding: 10px;
  margin-top: 8px;
}

.history-draft strong,
.history-draft small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-draft small {
  margin-top: 4px;
  color: var(--muted);
  font-size: 12px;
}

.history-draft em {
  font-style: normal;
  color: var(--teal);
  background: var(--teal-soft);
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 850;
}

@media (max-width: 980px) {
  .draft-hero,
  .draft-grid {
    grid-template-columns: 1fr;
  }

  .draft-hero {
    display: grid;
  }

  .hero-meta {
    border-left: 0;
    border-top: 1px solid var(--line);
    padding: 13px 0 0;
  }
}

@media (max-width: 640px) {
  .field-grid,
  .history-draft {
    grid-template-columns: 1fr;
  }

  .preview-toolbar,
  .form-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .ai-toggle {
    margin-right: 0;
  }

  .toolbar-actions {
    justify-content: flex-start;
  }
}
</style>
