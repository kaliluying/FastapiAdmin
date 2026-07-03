<template>
  <section aria-label="证据管理">
    <div class="flow-card">
      <article v-for="step in flowSteps" :key="step.code" class="flow-step">
        <span>{{ step.code }}</span>
        <h3>{{ step.title }}</h3>
        <p>{{ step.description }}</p>
      </article>
    </div>

    <div class="upload-list">
      <!-- Upload zone -->
      <article class="upload-card">
        <h3>上传证据材料</h3>
        <div
          class="dropzone large"
          :class="{ 'dropzone-active': dragOver }"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <div>
            <strong>{{ dragOver ? '释放文件以上传' : '点击或拖拽文件到此处上传' }}</strong>
            <span class="small-note">
              支持 docx、xlsx、pdf、txt、csv、png、jpg，单个文件不超过 20MB
            </span>
          </div>
        </div>
        <input
          ref="fileInputRef"
          type="file"
          multiple
          :accept="'.docx,.xlsx,.pdf,.txt,.csv,.png,.jpg,.jpeg'"
          class="hidden-input"
          @change="handleFileSelect"
        />
        <div class="upload-actions">
          <button class="btn primary" type="button" @click.stop="triggerFileInput">
            选择文件
          </button>
          <select v-model="selectedEvidenceType" class="type-select">
            <option value="">自动识别证据类型</option>
            <option v-for="et in evidenceTypes" :key="et.value" :value="et.value">
              {{ et.label }}
            </option>
          </select>
        </div>
        <p v-if="uploadError" class="error-note">{{ uploadError }}</p>
      </article>

      <!-- Evidence processing status and analysis results -->
      <article class="upload-card">
        <div class="section-title">
          <h3>处理状态与分析结果</h3>
          <button v-if="uploadItems.length > 0" class="link" type="button" @click="refreshList">
            刷新
          </button>
        </div>

        <p v-if="uploadItems.length === 0" class="small-note placeholder-text">
          暂无上传记录，请先上传证据文件
        </p>

        <div v-for="item in uploadItems" :key="item.id" class="progress-block">
          <div class="progress-header">
            <p class="file-name-text">{{ item.fileName }}</p>
            <span v-if="item.status === 'idle'" class="status-badge idle">待上传</span>
            <span v-else-if="item.status === 'uploading'" class="status-badge uploading">上传中</span>
            <span v-else-if="item.status === 'uploaded'" class="status-badge success">已上传</span>
            <span v-else-if="item.status === 'parsing' || item.parseStatus === 'parsing'" class="status-badge parsing">解析中</span>
            <span v-else-if="item.status === 'parsed' || item.parseStatus === 'parsed'" class="status-badge parsed">已解析</span>
            <span v-else-if="item.status === 'analyzing' || item.analysisStatus === 'analyzing'" class="status-badge analyzing">分析中</span>
            <span v-else-if="item.status === 'analyzed' || item.analysisStatus === 'analyzed'" class="status-badge analyzed">已分析</span>
            <span v-else-if="item.status === 'failed' || item.analysisStatus === 'failed'" class="status-badge failed">分析失败</span>
            <span v-else-if="item.status === 'unsupported' || item.parseStatus === 'unsupported'" class="status-badge unsupported">暂不支持解析</span>
            <span v-else class="status-badge idle">{{ item.status || item.parseStatus || '待上传' }}</span>
          </div>
          <div class="progress">
            <i :style="{ width: `${item.progress}%`, background: progressColor(item) }"></i>
          </div>
          <p class="small-note">{{ progressLabel(item) }}</p>

          <!-- AI analysis result (shows after analysis complete) -->
          <div v-if="item.result && item.analysisStatus === 'analyzed'" class="analysis-toggle-row">
            <button class="analysis-toggle" type="button" @click="toggleAnalysis(item)">
              <span>{{ item.analysisExpanded ? '收起分析结果' : '展开分析结果' }}</span>
            </button>
          </div>

          <div
            v-if="item.result && item.analysisStatus === 'analyzed' && item.analysisExpanded"
            class="analysis-result"
          >
            <div class="result-grid">
              <div class="result-row" v-if="item.result.evidence_type">
                <strong>证据类型</strong>
                <span>{{ item.result.evidence_type }}</span>
              </div>
              <div class="result-row" v-if="item.result.key_facts?.length">
                <strong>关键事实</strong>
                <div class="result-tags">
                  <span v-for="f in item.result.key_facts" :key="f" class="fact-tag">{{ f }}</span>
                </div>
              </div>
              <div class="result-row" v-if="item.result.proof_purpose?.length">
                <strong>证明目的</strong>
                <div class="result-tags">
                  <span v-for="p in item.result.proof_purpose" :key="p" class="purpose-tag">{{ p }}</span>
                </div>
              </div>
              <div class="result-row" v-if="item.result.related_claims?.length">
                <strong>关联诉求</strong>
                <div class="result-tags">
                  <span v-for="c in item.result.related_claims" :key="c" class="claim-tag">{{ c }}</span>
                </div>
              </div>
              <div class="result-row" v-if="item.result.evidence_strength">
                <strong>证据强度</strong>
                <span class="strength-badge" :class="strengthClass(item.result.evidence_strength)">
                  {{ item.result.evidence_strength }}
                </span>
              </div>
              <div class="result-row" v-if="item.result.risks?.length">
                <strong>风险提示</strong>
                <ul class="risk-list">
                  <li v-for="r in item.result.risks" :key="r">{{ r }}</li>
                </ul>
              </div>
              <div class="result-row" v-if="item.result.missing_materials?.length">
                <strong>建议补充材料</strong>
                <ul class="missing-list">
                  <li v-for="m in item.result.missing_materials" :key="m">{{ m }}</li>
                </ul>
              </div>
              <div class="result-row summary-row" v-if="item.result.summary">
                <strong>总结</strong>
                <p>{{ item.result.summary }}</p>
              </div>
            </div>
          </div>

          <!-- Unsupported parse message -->
          <div v-if="item.parseStatus === 'unsupported' && item.result?.summary" class="analysis-result unsupported-box">
            <p class="small-note">{{ item.result.summary }}</p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { flowSteps } from "../../data/mock";
import {
  listEvidence,
  getEvidenceDetail,
  uploadAnalyzeEvidence,
  type EvidenceAnalysisResult,
  type EvidenceListItem,
} from "../../api/evidenceApi";
import { runWithConcurrency } from "../../utils/concurrency";

// ── Evidence type options ──

const evidenceTypes = [
  { value: "劳动合同", label: "劳动合同" },
  { value: "工资记录", label: "工资记录" },
  { value: "考勤记录", label: "考勤记录" },
  { value: "聊天记录", label: "聊天记录" },
  { value: "解除通知", label: "解除通知" },
  { value: "公司主体信息", label: "公司主体信息" },
  { value: "其他材料", label: "其他材料" },
];

// ── Upload state ──

const props = defineProps<{
  activeSessionId: string;
}>();

interface UploadItem {
  id: string; // local tracking id (or evidence_id)
  fileName: string;
  progress: number;
  status: string; // idle | uploading | uploaded | parsed | analyzing | analyzed | failed
  parseStatus: string;
  analysisStatus: string;
  result: EvidenceAnalysisResult | null;
  error: string;
  detailLoaded: boolean;
  analysisExpanded: boolean;
}

const fileInputRef = ref<HTMLInputElement | null>(null);
const dragOver = ref(false);
const uploadError = ref("");
const selectedEvidenceType = ref("");
const uploadItems = ref<UploadItem[]>([]);
let disposed = false;
const MAX_CONCURRENT_UPLOADS = 3;

function resetUploadState() {
  uploadItems.value = [];
  uploadError.value = "";
  dragOver.value = false;
}

// ── Drag & drop ──

function handleDragOver() {
  dragOver.value = true;
}

function handleDragLeave() {
  dragOver.value = false;
}

function handleDrop(event: DragEvent) {
  dragOver.value = false;
  const files = event.dataTransfer?.files;
  if (files?.length) {
    void processFiles(Array.from(files));
  }
}

function triggerFileInput() {
  fileInputRef.value?.click();
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    void processFiles(Array.from(input.files));
    input.value = "";
  }
}

// ── File processing ──

async function uploadAndAnalyzeFile(file: File, item: UploadItem) {
  try {
    item.status = "uploading";
    item.progress = 30;

    const result = await uploadAnalyzeEvidence(
      file,
      props.activeSessionId,
      selectedEvidenceType.value || undefined,
    );

    applyAnalysisResult(item, result);
    await refreshList();
    await pollEvidenceResult(item);
  } catch (err: unknown) {
    item.status = "failed";
    item.error = err instanceof Error ? err.message : "上传或分析失败";
    item.progress = 100;
    uploadError.value = item.error;
  }
}

async function processFiles(files: File[]) {
  uploadError.value = "";
  const pendingUploads: Array<{ file: File; item: UploadItem }> = [];

  for (const file of files) {
    const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const item: UploadItem = {
      id: localId,
      fileName: file.name,
      progress: 0,
      status: "idle",
      parseStatus: "pending",
      analysisStatus: "pending",
      result: null,
      error: "",
      detailLoaded: false,
      analysisExpanded: true,
    };
    uploadItems.value.push(item);
    pendingUploads.push({ file, item });
  }

  await runWithConcurrency(
    pendingUploads,
    MAX_CONCURRENT_UPLOADS,
    async ({ file, item }) => {
      if (disposed) return;
      await uploadAndAnalyzeFile(file, item);
    },
  );
  }

// ── Progress helpers ──

function progressColor(item: UploadItem): string {
  switch (item.status) {
    case "analyzed":
      return "var(--teal)";
    case "parsed":
    case "uploaded":
      return "var(--green)";
    case "analyzing":
    case "parsing":
    case "uploading":
      return "var(--orange)";
    case "failed":
      return "#ef6f6c";
    default:
      return "var(--teal)";
  }
}

function progressLabel(item: UploadItem): string {
  if (item.status === "analyzed") return "已分析 · 结果已保存";
  if (item.status === "parsed" || item.parseStatus === "parsed") return "已解析 · 待分析";
  if (item.status === "analyzing" || item.analysisStatus === "analyzing") return "AI 分析中 · 请稍候";
  if (item.status === "parsing" || item.parseStatus === "parsing") return "解析中 · 提取文本内容";
  if (item.status === "uploading") return "上传中...";
  if (item.status === "unsupported" || item.parseStatus === "unsupported") return "已上传 · 暂不支持自动解析";
  if (item.status === "failed") return item.error || "处理失败";
  return "待处理";
}

function strengthClass(s: string): string {
  if (s === "强") return "strength-strong";
  if (s === "中") return "strength-medium";
  return "strength-weak";
}

function toggleAnalysis(item: UploadItem) {
  item.analysisExpanded = !item.analysisExpanded;
}

// ── Refresh from backend ──

function applyAnalysisResult(item: UploadItem, result: EvidenceAnalysisResult) {
  const keepExpandedState = item.result ? item.analysisExpanded : true;
  item.id = String(result.evidence_id);
  item.fileName = result.file_name || item.fileName;
  item.parseStatus = result.parse_status;
  item.analysisStatus = result.analysis_status;
  item.result = result;
  item.error = "";
  item.detailLoaded = true;
  item.analysisExpanded = keepExpandedState;

  if (result.parse_status === "parsed" && result.analysis_status === "analyzed") {
    item.status = "analyzed";
    item.progress = 100;
  } else if (result.analysis_status === "analyzing") {
    item.status = "analyzing";
    item.progress = 85;
  } else if (result.parse_status === "parsing") {
    item.status = "parsing";
    item.progress = 55;
  } else if (result.parse_status === "parsed") {
    item.status = "parsed";
    item.progress = 70;
  } else if (result.parse_status === "unsupported") {
    item.status = "unsupported";
    item.progress = 60;
  } else if (result.analysis_status === "failed") {
    item.status = "failed";
    item.progress = 80;
    item.error = "AI 分析失败";
  } else if (result.parse_status === "failed") {
    item.status = "failed";
    item.progress = 50;
    item.error = "文件解析失败";
  } else {
    item.status = "uploaded";
    item.progress = 40;
  }
}

function createItemFromList(file: EvidenceListItem): UploadItem {
  const item: UploadItem = {
    id: String(file.evidence_id),
    fileName: file.file_name,
    progress: 40,
    status: "uploaded",
    parseStatus: file.parse_status,
    analysisStatus: file.analysis_status,
    result: null,
    error: "",
    detailLoaded: false,
    analysisExpanded: true,
  };

  applyListItem(item, file);
  return item;
}

function applyListItem(item: UploadItem, file: EvidenceListItem) {
  item.parseStatus = file.parse_status;
  item.analysisStatus = file.analysis_status;

  item.result = {
    ...(item.result || {}),
    evidence_id: file.evidence_id,
    file_name: file.file_name,
    file_type: file.file_type,
    file_size: file.file_size,
    parse_status: file.parse_status,
    analysis_status: file.analysis_status,
    evidence_type: file.evidence_type,
    summary: file.summary,
    key_facts: item.result?.key_facts || null,
    proof_purpose: item.result?.proof_purpose || null,
    related_claims: item.result?.related_claims || null,
    evidence_strength: item.result?.evidence_strength || null,
    risks: item.result?.risks || null,
    missing_materials: item.result?.missing_materials || null,
    created_at: file.created_at,
  } as EvidenceAnalysisResult;

  if (file.analysis_status === "analyzed") {
    item.status = "analyzed";
    item.progress = 100;
  } else if (file.analysis_status === "analyzing") {
    item.status = "analyzing";
    item.progress = 85;
  } else if (file.parse_status === "parsed") {
    item.status = "parsed";
    item.progress = 70;
  } else if (file.parse_status === "unsupported") {
    item.status = "unsupported";
    item.progress = 60;
  } else if (file.parse_status === "parsing") {
    item.status = "parsing";
    item.progress = 55;
  } else if (file.parse_status === "failed" || file.analysis_status === "failed") {
    item.status = "failed";
    item.progress = 100;
  }
}

function needsAnalysisDetail(item: UploadItem): boolean {
  return item.analysisStatus === "analyzed" && !item.detailLoaded;
}

function isTerminal(item: UploadItem): boolean {
  return ["analyzed", "failed", "unsupported"].includes(item.status);
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function pollEvidenceResult(item: UploadItem) {
  for (let index = 0; index < 12 && !disposed && !isTerminal(item); index += 1) {
    await wait(1200);
    await refreshList();
    if (isTerminal(item)) break;
  }

  if (!disposed && item.status === "analyzed") {
    const detail = await getEvidenceDetail(Number(item.id));
    applyAnalysisResult(item, detail);
  }
}

async function refreshList() {
  const sessionId = props.activeSessionId;
  if (!sessionId) {
    resetUploadState();
    return;
  }

  try {
    const items = await listEvidence(sessionId);
    if (disposed || sessionId !== props.activeSessionId) return;

    for (const item of items) {
      let existing = uploadItems.value.find(
        (u) => u.id === String(item.evidence_id),
      );
      if (!existing) {
        existing = createItemFromList(item);
        uploadItems.value.push(existing);
        continue;
      }
      applyListItem(existing, item);
    }

    const itemsNeedingDetail = uploadItems.value.filter(needsAnalysisDetail);
    await Promise.all(
      itemsNeedingDetail.map(async (item) => {
        try {
          const detail = await getEvidenceDetail(Number(item.id));
          if (disposed || sessionId !== props.activeSessionId) return;
          applyAnalysisResult(item, detail);
        } catch {
          // Keep it retryable on the next manual or session refresh.
        }
      }),
    );
  } catch {
    // Backend may not be running, silently ignore
  }
}

onMounted(() => {
  refreshList();
});

onBeforeUnmount(() => {
  disposed = true;
});

watch(
  () => props.activeSessionId,
  () => {
    resetUploadState();
    refreshList();
  },
);
</script>

<style scoped>
.hidden-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.upload-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
}

.type-select {
  height: 36px;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: #fff;
  color: var(--text);
  font-size: 13px;
  padding: 0 10px;
}

.dropzone-active {
  border-color: var(--teal) !important;
  background: var(--teal-soft) !important;
}

.error-note {
  color: #ef6f6c;
  font-size: 12px;
  margin-top: 8px;
}

.placeholder-text {
  padding: 20px 0;
  text-align: center;
}

.progress-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.file-name-text {
  flex: 1;
  font-weight: 650;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-badge.idle { background: #e7eef5; color: var(--muted); }
.status-badge.uploading { background: #fff4df; color: var(--orange); }
.status-badge.success,
.status-badge.uploaded,
.status-badge.parsed { background: #e8f7f6; color: var(--green); }
.status-badge.parsing,
.status-badge.analyzing { background: #fff4df; color: var(--orange); }
.status-badge.analyzed { background: var(--teal-soft); color: var(--teal); }
.status-badge.failed { background: #fff0f0; color: #ef6f6c; }
.status-badge.unsupported { background: #f0f0f5; color: var(--soft); }

/* Analysis result */
.analysis-toggle-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.analysis-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 0;
  background: transparent;
  color: var(--teal);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}

.analysis-toggle:hover {
  color: #007a80;
}

.analysis-result {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: #fafdfd;
}

.unsupported-box {
  background: #fffdf5;
  border-color: #ffeeba;
}

.result-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.result-row {
  font-size: 12px;
}

.result-row strong {
  display: block;
  color: var(--text);
  margin-bottom: 4px;
  font-size: 12px;
}

.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.fact-tag {
  background: var(--teal-soft);
  color: var(--teal);
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.purpose-tag {
  background: #e8f0fe;
  color: #3b7dd8;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.claim-tag {
  background: #fff0e0;
  color: var(--orange);
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.strength-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 12px;
}

.strength-strong { background: #c8f7c5; color: #1e7e34; }
.strength-medium { background: #fff3cd; color: #b8860b; }
.strength-weak { background: #ffe0e0; color: #c0393b; }

.risk-list,
.missing-list {
  margin: 4px 0 0;
  padding-left: 16px;
  font-size: 12px;
  color: var(--muted);
}

.risk-list li { color: #c0393b; }
.missing-list li { color: #b8860b; }

.summary-row p {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.55;
}
</style>
