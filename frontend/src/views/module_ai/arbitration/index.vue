<template>
  <div class="arbitration-page">
    <section class="workbench">
      <div class="form-panel">
        <div class="panel-header">
          <div>
            <h2>仲裁申请书</h2>
            <p>填写案件事实、请求和证据，生成可人工复核的申请书草稿。</p>
          </div>
          <ElSwitch
            v-model="form.use_ai"
            active-text="AI 润色"
            inactive-text="模板生成"
            inline-prompt
            style="--el-switch-on-color: var(--el-color-primary)"
          />
        </div>

        <ElForm ref="formRef" :model="form" :rules="rules" label-width="108px" class="draft-form">
          <ElDivider content-position="left">案件档案</ElDivider>
          <div class="form-grid">
            <ElFormItem label="选择案件">
              <ElSelect
                v-model="selectedCaseId"
                clearable
                filterable
                class="full-width"
                placeholder="新建案件或选择历史案件"
                @change="handleCaseChange"
              >
                <ElOption v-for="item in cases" :key="item.id" :label="item.case_title" :value="item.id" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="案件标题">
              <ElInput v-model="form.case_title" clearable placeholder="例如：张三欠薪争议" />
            </ElFormItem>
          </div>

          <ElDivider content-position="left">申请人</ElDivider>
          <div class="form-grid">
            <ElFormItem label="姓名" prop="applicant_name">
              <ElInput v-model="form.applicant_name" clearable placeholder="可从个人中心自动补充" />
            </ElFormItem>
            <ElFormItem label="联系电话" prop="applicant_phone">
              <ElInput v-model="form.applicant_phone" clearable />
            </ElFormItem>
            <ElFormItem label="身份证号">
              <ElInput v-model="form.applicant_id_no" clearable placeholder="缺失会标为【待补充】" />
            </ElFormItem>
            <ElFormItem label="住址">
              <ElInput v-model="form.applicant_address" clearable />
            </ElFormItem>
          </div>

          <ElDivider content-position="left">被申请人</ElDivider>
          <div class="form-grid">
            <ElFormItem label="公司名称" prop="respondent_name">
              <ElInput v-model="form.respondent_name" clearable placeholder="被申请单位名称" />
            </ElFormItem>
            <ElFormItem label="信用代码">
              <ElInput v-model="form.respondent_credit_code" clearable />
            </ElFormItem>
            <ElFormItem label="住所地">
              <ElInput v-model="form.respondent_address" clearable />
            </ElFormItem>
            <ElFormItem label="法定代表人">
              <ElInput v-model="form.respondent_legal_rep" clearable />
            </ElFormItem>
          </div>

          <ElDivider content-position="left">劳动关系</ElDivider>
          <div class="form-grid">
            <ElFormItem label="入职日期">
              <ElDatePicker v-model="form.hire_date" value-format="YYYY-MM-DD" type="date" class="full-width" />
            </ElFormItem>
            <ElFormItem label="离职日期">
              <ElDatePicker v-model="form.leave_date" value-format="YYYY-MM-DD" type="date" class="full-width" />
            </ElFormItem>
            <ElFormItem label="岗位">
              <ElInput v-model="form.position_name" clearable />
            </ElFormItem>
            <ElFormItem label="月工资">
              <ElInputNumber v-model="form.monthly_salary" :min="0" :precision="2" class="full-width" />
            </ElFormItem>
            <ElFormItem label="合同类型">
              <ElSelect v-model="form.contract_type" clearable class="full-width">
                <ElOption label="劳动合同" value="劳动合同" />
                <ElOption label="劳务合同" value="劳务合同" />
                <ElOption label="无合同" value="无合同" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="缴纳社保">
              <ElSelect v-model="form.social_insurance" clearable class="full-width">
                <ElOption label="是" :value="true" />
                <ElOption label="否" :value="false" />
              </ElSelect>
            </ElFormItem>
          </div>

          <ElDivider content-position="left">争议与材料</ElDivider>
          <ElFormItem label="会话 ID">
            <ElInput v-model="form.session_id" clearable placeholder="可选，用于带入该会话已分析证据" />
          </ElFormItem>
          <ElFormItem label="争议事实" prop="dispute_summary">
            <ElInput
              v-model="form.dispute_summary"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 8 }"
              maxlength="2000"
              show-word-limit
            />
          </ElFormItem>
          <ElFormItem label="仲裁请求">
            <ElInput
              v-model="claimsText"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 6 }"
              placeholder="一行一个请求，例如：请求支付拖欠工资 24000 元"
            />
          </ElFormItem>
          <ElFormItem label="证据清单">
            <ElInput
              v-model="evidenceText"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 6 }"
              placeholder="一行一项证据，例如：劳动合同"
            />
          </ElFormItem>
          <ElFormItem label="仲裁委">
            <ElInput v-model="form.arbitration_committee" clearable placeholder="例如：深圳市劳动人事争议仲裁委员会" />
          </ElFormItem>

          <div class="actions">
            <ElButton :icon="Refresh" @click="resetForm">重置</ElButton>
            <ElButton type="primary" :icon="DocumentChecked" :loading="loading" @click="generateDraft">
              生成草稿
            </ElButton>
          </div>
        </ElForm>
      </div>

      <div class="preview-panel">
        <div class="preview-header">
          <div>
            <h2>{{ draft?.title || "草稿预览" }}</h2>
            <p v-if="draft">
              案件 #{{ draft.case_id || "-" }} · 草稿 #{{ draft.draft_id || "-" }} · 请求
              {{ draft.source_summary.claims_count }} 项 · 证据 {{ draft.source_summary.evidence_count }} 项
            </p>
            <p v-else>生成后将在这里预览申请书正文。</p>
          </div>
          <div class="preview-actions">
            <ElButton :icon="CopyDocument" :disabled="!draft" @click="copyDraft">复制</ElButton>
            <ElButton :icon="Download" :disabled="!draft?.draft_id" @click="downloadDraft('docx')">Word</ElButton>
            <ElButton :icon="Download" :disabled="!draft?.draft_id" @click="downloadDraft('pdf')">PDF</ElButton>
          </div>
        </div>

        <ElEmpty v-if="!draft" description="暂无申请书草稿" />
        <template v-else>
          <pre class="draft-content">{{ draft.content }}</pre>
          <div class="risk-list">
            <ElAlert
              v-for="tip in draft.risk_tips"
              :key="tip"
              :title="tip"
              type="warning"
              :closable="false"
              show-icon
            />
          </div>
        </template>

        <ElDivider content-position="left">草稿历史</ElDivider>
        <ElTable :data="draftHistory" border size="small" empty-text="暂无草稿历史">
          <ElTableColumn prop="id" label="ID" width="72" />
          <ElTableColumn prop="title" label="标题" min-width="180" show-overflow-tooltip />
          <ElTableColumn prop="review_status" label="复核状态" width="100" />
          <ElTableColumn prop="created_time" label="生成时间" min-width="160" show-overflow-tooltip />
          <ElTableColumn label="操作" width="210" fixed="right">
            <template #default="{ row }">
              <ElButton link type="primary" @click="loadDraft(row.id)">查看</ElButton>
              <ElButton link type="primary" @click="downloadById(row.id, 'docx')">Word</ElButton>
              <ElButton link type="primary" @click="downloadById(row.id, 'pdf')">PDF</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { CopyDocument, DocumentChecked, Download, Refresh } from "@element-plus/icons-vue";
import ArbitrationAPI, {
  type ArbitrationCaseItem,
  type ArbitrationDraftItem,
  type ArbitrationDraftRequest,
  type ArbitrationDraftResult,
} from "@/api/module_ai/arbitration";

defineOptions({ name: "AiArbitrationDraft" });

const formRef = ref<FormInstance>();
const loading = ref(false);
const draft = ref<ArbitrationDraftResult | null>(null);
const cases = ref<ArbitrationCaseItem[]>([]);
const draftHistory = ref<ArbitrationDraftItem[]>([]);
const selectedCaseId = ref<number | null>(null);
const claimsText = ref("请求支付拖欠工资 24000 元\n请求支付违法解除赔偿金");
const evidenceText = ref("劳动合同\n工资流水\n微信聊天记录");

const initialForm = (): ArbitrationDraftRequest => ({
  case_id: null,
  case_title: "",
  session_id: "",
  arbitration_committee: "",
  applicant_name: "",
  applicant_gender: "",
  applicant_id_no: "",
  applicant_phone: "",
  applicant_address: "",
  respondent_name: "",
  respondent_credit_code: "",
  respondent_address: "",
  respondent_legal_rep: "",
  respondent_phone: "",
  hire_date: "",
  leave_date: "",
  position_name: "",
  work_location: "",
  monthly_salary: null,
  contract_type: "",
  social_insurance: null,
  dispute_summary: "公司拖欠 3 个月工资，并口头通知不用再来上班。",
  claims: [],
  evidence_items: [],
  use_ai: false,
});

const form = reactive<ArbitrationDraftRequest>(initialForm());

const rules: FormRules = {
  dispute_summary: [{ required: true, message: "请输入争议事实", trigger: "blur" }],
  respondent_name: [{ required: true, message: "请输入被申请人名称", trigger: "blur" }],
};

const toLines = (text: string) =>
  text
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const generateDraft = async () => {
  await formRef.value?.validate();
  loading.value = true;
  try {
    const res = await ArbitrationAPI.generateDraft({
      ...form,
      case_id: selectedCaseId.value,
      claims: toLines(claimsText.value),
      evidence_items: toLines(evidenceText.value),
    });
    draft.value = res.data?.data || null;
    if (draft.value?.case_id) {
      selectedCaseId.value = draft.value.case_id;
      form.case_id = draft.value.case_id;
    }
    await Promise.all([loadCases(), loadDraftHistory(selectedCaseId.value)]);
    ElMessage.success("申请书草稿已生成");
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  Object.assign(form, initialForm());
  selectedCaseId.value = null;
  claimsText.value = "请求支付拖欠工资 24000 元\n请求支付违法解除赔偿金";
  evidenceText.value = "劳动合同\n工资流水\n微信聊天记录";
  draft.value = null;
  draftHistory.value = [];
};

const copyDraft = async () => {
  if (!draft.value) return;
  await navigator.clipboard.writeText(draft.value.content);
  ElMessage.success("已复制草稿正文");
};

const loadCases = async () => {
  const res = await ArbitrationAPI.listCases();
  cases.value = res.data?.data?.items || [];
};

const loadDraftHistory = async (caseId?: number | null) => {
  const res = await ArbitrationAPI.listDrafts(caseId || undefined);
  draftHistory.value = res.data?.data?.items || [];
};

const handleCaseChange = async (caseId: number | string | boolean | undefined) => {
  const id = typeof caseId === "number" ? caseId : null;
  selectedCaseId.value = id;
  form.case_id = id;
  const selected = cases.value.find((item) => item.id === id);
  if (selected) {
    form.case_title = selected.case_title;
    form.respondent_name = selected.respondent_name || "";
    form.applicant_name = selected.applicant_name || "";
    form.dispute_summary = selected.dispute_summary;
    form.session_id = selected.session_id || "";
  }
  await loadDraftHistory(id);
};

const loadDraft = async (draftId: number) => {
  const res = await ArbitrationAPI.getDraft(draftId);
  draft.value = res.data?.data || null;
};

const saveBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const downloadById = async (draftId: number, fileType: "docx" | "pdf") => {
  const res = await ArbitrationAPI.exportDraft(draftId, fileType);
  saveBlob(res.data, `仲裁申请书-${draftId}.${fileType}`);
};

const downloadDraft = async (fileType: "docx" | "pdf") => {
  if (!draft.value?.draft_id) return;
  await downloadById(draft.value.draft_id, fileType);
};

onMounted(async () => {
  await loadCases();
});
</script>

<style scoped>
.arbitration-page {
  height: 100%;
}

.workbench {
  display: grid;
  grid-template-columns: minmax(520px, 0.95fr) minmax(460px, 1.05fr);
  gap: 14px;
  align-items: start;
}

.form-panel,
.preview-panel {
  min-height: calc(100vh - 150px);
  padding: 18px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
}

.panel-header,
.preview-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}

.panel-header h2,
.preview-header h2 {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 650;
}

.panel-header p,
.preview-header p {
  margin: 0;
  color: var(--el-text-color-secondary);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 12px;
}

.full-width {
  width: 100%;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.preview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.draft-content {
  min-height: 520px;
  padding: 18px;
  margin: 0;
  overflow: auto;
  font-family: "Songti SC", "STSong", serif;
  font-size: 15px;
  line-height: 1.85;
  color: var(--el-text-color-primary);
  white-space: pre-wrap;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}

.risk-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

@media (max-width: 1180px) {
  .workbench {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .panel-header,
  .preview-header {
    flex-direction: column;
  }
}
</style>
