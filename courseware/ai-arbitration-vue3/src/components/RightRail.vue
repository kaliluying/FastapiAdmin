<template>
  <aside class="right-rail">
    <section class="panel right-card dossier-summary">
      <span class="eyebrow">DOSSIER</span>
      <div class="section-title">
        <h3>案件摘要</h3>
        <button class="link" type="button" @click="$emit('switchModule', 'consult')">回到咨询</button>
      </div>
      <div class="summary-grid">
        <div>
          <span>会话状态</span>
          <strong>{{ activeSessionId ? "已创建" : "未创建" }}</strong>
        </div>
        <div>
          <span>证据数量</span>
          <strong>{{ realEvidenceList.length }} 份</strong>
        </div>
      </div>
      <p class="small-note">
        当前阶段只做界面组织：案件摘要用于帮助学生理解流程，不新增后端字段。
      </p>
    </section>

    <section class="panel right-card">
      <div class="section-title">
        <h3>检索依据</h3>
        <button class="link" type="button">查看全部</button>
      </div>

      <article v-for="(law, index) in laws" :key="law.title" class="law-row">
        <span class="number">{{ index + 1 }}</span>
        <div>
          <h4>{{ law.title }} <span class="tag">示例</span></h4>
          <p>{{ law.description }}</p>
        </div>
      </article>
    </section>

    <section class="panel right-card">
      <div class="section-title">
        <h3>证据材料</h3>
        <button class="link" type="button" @click="refreshEvidence">
          {{ evidenceListLoading ? '加载中...' : '刷新列表' }}
        </button>
      </div>

      <div
        class="dropzone"
        @click="$emit('switchModule', 'upload')"
      >
        <div>
          <strong>归档证据材料</strong>
          <span class="small-note">点击进入证据管理页面，支持 docx、xlsx、pdf、png、jpg 等格式。</span>
        </div>
      </div>

      <p v-if="!evidenceListLoading && realEvidenceList.length === 0 && !evidenceError" class="small-note" style="text-align:center;padding:12px 0">
        暂无上传记录
      </p>

      <p v-if="evidenceError" class="small-note" style="color:#ef6f6c;text-align:center;padding:8px 0">
        {{ evidenceError }}
      </p>

      <p v-if="evidenceListLoading" class="small-note" style="text-align:center;padding:12px 0">
        加载中...
      </p>

      <article v-for="file in realEvidenceList" :key="file.evidence_id" class="file-item">
        <span class="file-type" :class="{ img: isImage(file.file_type) }">
          {{ file.file_type.toUpperCase() }}
        </span>
        <div>
          <strong>{{ file.file_name }}</strong>
          <p>
            <span v-if="file.analysis_status === 'analyzed'" class="status-dot analyzed"></span>
            <span v-else-if="file.analysis_status === 'analyzing'" class="status-dot analyzing"></span>
            <span v-else-if="file.parse_status === 'parsed'" class="status-dot parsed"></span>
            <span v-else-if="file.parse_status === 'unsupported'" class="status-dot unsupported"></span>
            <span v-else-if="file.parse_status === 'pending'" class="status-dot pending"></span>
            <span v-else class="status-dot failed"></span>
            {{ formatFileStatus(file) }}
          </p>
        </div>
        <button class="icon-btn" type="button" aria-label="更多操作">更多</button>
      </article>
    </section>

    <section class="panel right-card">
      <div class="section-title">
        <h3>复核清单</h3>
        <button class="link" type="button" @click="$emit('switchModule', 'document')">下一步</button>
      </div>

      <article v-for="step in reviewSteps" :key="step.title" class="step-item">
        <strong>{{ step.title }}</strong>
        <p>{{ step.description }}</p>
      </article>

      <button class="btn primary full-width" type="button" @click="$emit('switchModule', 'document')">
        生成仲裁申请书
      </button>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { laws, type ModuleKey } from "../data/mock";
import { listEvidence, type EvidenceListItem } from "../api/evidenceApi";

defineEmits<{
  switchModule: [value: ModuleKey];
}>();

const props = defineProps<{
  activeSessionId: string;
}>();

const realEvidenceList = ref<EvidenceListItem[]>([]);
const evidenceListLoading = ref(false);
const evidenceError = ref("");

const reviewSteps = [
  {
    title: "事实是否完整",
    description: "确认入职、工资、解除方式和争议经过是否已经写清楚。",
  },
  {
    title: "证据是否能支撑请求",
    description: "工资流水、聊天记录、合同等材料需要和仲裁请求对应。",
  },
  {
    title: "文书是否人工复核",
    description: "AI 生成的是草稿，提交前仍需人工确认事实和金额。",
  },
];

function isImage(fileType: string): boolean {
  return ["png", "jpg", "jpeg"].includes(fileType.toLowerCase());
}

function formatFileStatus(file: EvidenceListItem): string {
  if (file.analysis_status === "analyzed") {
    return `${formatSize(file.file_size)} · 已分析`;
  }
  if (file.analysis_status === "analyzing") {
    return `${formatSize(file.file_size)} · 分析中`;
  }
  if (file.parse_status === "parsed") {
    return `${formatSize(file.file_size)} · 已解析`;
  }
  if (file.parse_status === "unsupported") {
    return `${formatSize(file.file_size)} · 暂不支持解析`;
  }
  if (file.parse_status === "pending") {
    return `${formatSize(file.file_size)} · 待处理`;
  }
  return `${formatSize(file.file_size)} · ${file.parse_status}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

async function refreshEvidence() {
  if (!props.activeSessionId) {
    realEvidenceList.value = [];
    evidenceError.value = "";
    evidenceListLoading.value = false;
    return;
  }

  evidenceListLoading.value = true;
  evidenceError.value = "";
  try {
    const items = await listEvidence(props.activeSessionId);
    realEvidenceList.value = items;
  } catch (err: unknown) {
    evidenceError.value = err instanceof Error ? err.message : "无法连接到后端服务";
  } finally {
    evidenceListLoading.value = false;
  }
}

onMounted(() => {
  refreshEvidence();
});

watch(
  () => props.activeSessionId,
  () => {
    refreshEvidence();
  },
);
</script>

<style scoped>
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
  vertical-align: middle;
}
.status-dot.analyzed { background: var(--teal); }
.status-dot.analyzing { background: var(--orange); }
.status-dot.parsed { background: var(--green); }
.status-dot.unsupported { background: var(--soft); }
.status-dot.pending { background: var(--muted); }
.status-dot.failed { background: #ef6f6c; }
</style>
