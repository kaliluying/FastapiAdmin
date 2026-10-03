<template>
  <div class="document-page">
    <FaAiPageHeader title="文档" description="查看资料处理状态，上传新文档并在需要时重建索引。">
      <template #actions>
        <ElButton type="primary" :icon="Upload" @click="openUploadDialog">上传文档</ElButton>
      </template>
    </FaAiPageHeader>
    <ElCard shadow="never" class="document-card">
      <div class="toolbar">
        <ElForm :inline="true" :model="query">
          <ElFormItem label="知识库">
            <ElSelect v-model="query.knowledge_base_id" clearable filterable class="base-select">
              <ElOption
                v-for="item in bases"
                :key="item.id"
                :label="item.name"
                :value="item.id || 0"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="文件名">
            <ElInput
              v-model="query.file_name"
              clearable
              placeholder="文件名"
              @keyup.enter="loadData()"
            />
          </ElFormItem>
          <ElFormItem>
            <ElButton type="primary" :icon="Search" @click="loadData()">查询</ElButton>
            <ElButton :icon="Refresh" @click="resetQuery">重置</ElButton>
          </ElFormItem>
        </ElForm>
      </div>

      <FaAsyncState
        v-if="loadError || pollingPaused"
        :state="loadError ? 'error' : 'partial'"
        :title="loadError ? '文档状态刷新失败' : '自动刷新已暂停'"
        :description="
          loadError
            ? '已保留当前列表和筛选条件，请重试刷新。'
            : '处理可能耗时较长，请稍后刷新；仍在等待的文档可重新索引。'
        "
      >
        <template #action
          ><ElButton :loading="loading" @click="loadData()">刷新状态</ElButton></template
        >
      </FaAsyncState>
      <p v-else-if="hasProcessingDocuments" class="processing-hint" role="status">
        文档已接收，处理中将自动刷新；显示「可检索」后即可用于问答。
      </p>
      <FaAsyncState
        v-if="loading || (!rows.length && !loadError)"
        :state="loading ? 'loading' : 'empty'"
        :title="loading ? undefined : '没有匹配的文档'"
        description="调整知识库或文件名筛选；上传后可在这里查看处理进度。"
      />
      <p v-if="!loading && rows.length && isNarrowViewport" class="table-scroll-hint">
        左右滑动查看完整列表
      </p>
      <ElTable v-if="!loading && rows.length" :data="rows" row-key="id">
        <ElTableColumn prop="file_name" label="文件名" min-width="220" show-overflow-tooltip />
        <ElTableColumn prop="file_type" label="类型" width="90" />
        <ElTableColumn prop="file_size" label="大小" width="110">
          <template #default="{ row }">{{ formatSize(row.file_size) }}</template>
        </ElTableColumn>
        <ElTableColumn label="处理说明" min-width="240">
          <template #default="{ row }">
            <span v-if="row.error_message" role="status">{{ row.error_message }}</span>
            <span v-else>{{
              row.index_status === "success" ? "可用于检索和问答" : "处理完成后可检索"
            }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="120">
          <template #default="{ row }">
            <ElTooltip v-if="row.error_message" :content="row.error_message" placement="top">
              <ElTag :type="documentStatusMeta(row).type" size="small">{{
                documentStatusMeta(row).label
              }}</ElTag>
            </ElTooltip>
            <ElTag v-else :type="documentStatusMeta(row).type" size="small">{{
              documentStatusMeta(row).label
            }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="chunk_count" label="分块数" width="90" />
        <ElTableColumn prop="created_time" label="创建时间" width="180" show-overflow-tooltip />
        <ElTableColumn label="操作" width="160" :fixed="isNarrowViewport ? false : 'right'">
          <template #default="{ row }">
            <ElButton
              link
              type="primary"
              :loading="reindexingIds.has(row.id || 0)"
              :disabled="
                row.index_status === 'indexing' ||
                row.parse_status === 'parsing' ||
                (isProcessing(row) && !pollingPaused)
              "
              @click="reindex(row)"
              >重新索引</ElButton
            >
            <ElButton
              link
              type="danger"
              :disabled="
                row.index_status === 'indexing' ||
                row.parse_status === 'parsing' ||
                reindexingIds.has(row.id || 0)
              "
              @click="remove(row)"
              >删除</ElButton
            >
          </template>
        </ElTableColumn>
      </ElTable>

      <ElPagination
        v-model:current-page="query.page_no"
        v-model:page-size="query.page_size"
        class="pagination"
        :layout="isNarrowViewport ? 'total, prev, pager, next' : 'total, sizes, prev, pager, next'"
        :pager-count="isNarrowViewport ? 5 : 7"
        :total="total"
        @size-change="loadData()"
        @current-change="loadData()"
      />
    </ElCard>

    <ElDialog v-model="uploadDialogVisible" title="上传文档" width="min(92vw, 520px)">
      <ElForm label-width="90px" :label-position="isNarrowViewport ? 'top' : 'right'">
        <ElFormItem label="知识库" required>
          <ElSelect
            v-model="uploadForm.knowledge_base_id"
            class="upload-base-select"
            filterable
            placeholder="请选择知识库"
          >
            <ElOption
              v-for="item in bases"
              :key="item.id"
              :label="item.name"
              :value="item.id || 0"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="文档" required>
          <ElUpload
            drag
            :http-request="uploadFile"
            :show-file-list="false"
            :disabled="!uploadForm.knowledge_base_id || uploading"
            accept=".txt,.md,.pdf,.docx"
            :before-upload="beforeUpload"
          >
            <ElIcon class="el-icon--upload"><Upload /></ElIcon>
            <div class="el-upload__text">
              {{ uploading ? "正在接收文件…" : "点击或拖拽文件上传" }}
            </div>
            <template #tip>
              <div class="el-upload__tip">支持 .txt、.md、.pdf、.docx</div>
            </template>
          </ElUpload>
        </ElFormItem>
      </ElForm>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import { ElMessage, ElMessageBox, type UploadRequestOptions } from "element-plus";
import { Refresh, Search, Upload } from "@element-plus/icons-vue";
import { useRoute } from "vue-router";
import { useDocumentVisibility, useMediaQuery } from "@vueuse/core";
import KnowledgeAPI, {
  type KnowledgeBase,
  type KnowledgeDocument,
} from "@/api/module_ai/knowledge";
import FaAsyncState from "@/components/feedback/fa-async-state/index.vue";
import FaAiPageHeader from "@/views/module_ai/components/FaAiPageHeader.vue";

defineOptions({ name: "AiKnowledgeDocument" });

const route = useRoute();
const isNarrowViewport = useMediaQuery("(max-width: 800px)");
const loading = ref(false);
const loadError = ref(false);
const pollingPaused = ref(false);
const uploading = ref(false);
const reindexingIds = ref(new Set<number>());
const visibility = useDocumentVisibility();
let viewActive = false;
let pollTimer: ReturnType<typeof setTimeout> | undefined;
let pollRemaining = 60;
let pollFailures = 0;
let requestSequence = 0;
const rows = ref<KnowledgeDocument[]>([]);
const isProcessing = (row: KnowledgeDocument) =>
  row.index_status !== "success" && row.index_status !== "failed";
const hasProcessingDocuments = computed(() => rows.value.some(isProcessing));
const bases = ref<KnowledgeBase[]>([]);
const total = ref(0);
const uploadDialogVisible = ref(false);

const query = reactive({
  page_no: 1,
  page_size: 10,
  knowledge_base_id: undefined as number | undefined,
  file_name: "",
});

const uploadForm = reactive({
  knowledge_base_id: undefined as number | undefined,
});

const loadBases = async () => {
  const res = await KnowledgeAPI.optionselect();
  bases.value = (res.data?.data || []).filter((item) => item.id != null);
};

const stopPolling = () => {
  clearTimeout(pollTimer);
  pollTimer = undefined;
};

const schedulePolling = () => {
  stopPolling();
  if (!viewActive || visibility.value !== "visible" || !hasProcessingDocuments.value) return;
  if (pollRemaining <= 0 || pollFailures >= 3) {
    pollingPaused.value = true;
    return;
  }
  pollTimer = setTimeout(() => {
    pollRemaining -= 1;
    void loadData(true);
  }, 2000);
};

const loadData = async (background = false) => {
  if (!viewActive) return;
  stopPolling();
  if (!background) {
    pollRemaining = 60;
    pollFailures = 0;
    pollingPaused.value = false;
    loading.value = true;
  }
  const sequence = ++requestSequence;
  try {
    const res = await KnowledgeAPI.listDocument({ ...query });
    if (!viewActive || sequence !== requestSequence) return;
    const data = res.data?.data;
    rows.value = data?.items || [];
    total.value = data?.total || 0;
    loadError.value = false;
    pollFailures = 0;
    if (!hasProcessingDocuments.value) pollingPaused.value = false;
  } catch {
    if (viewActive && sequence === requestSequence) {
      loadError.value = true;
      pollFailures += 1;
    }
  } finally {
    if (sequence === requestSequence) {
      loading.value = false;
      schedulePolling();
    }
  }
};

const resetQuery = () => {
  query.page_no = 1;
  query.knowledge_base_id = undefined;
  query.file_name = "";
  loadData();
};

const openUploadDialog = () => {
  uploadForm.knowledge_base_id =
    query.knowledge_base_id || (bases.value.length === 1 ? bases.value[0]?.id : undefined);
  uploadDialogVisible.value = true;
};

const applyRouteQuery = () => {
  const knowledgeBaseId = Number(route.query.knowledge_base_id);
  if (Number.isFinite(knowledgeBaseId) && knowledgeBaseId > 0) {
    query.knowledge_base_id = knowledgeBaseId;
    uploadForm.knowledge_base_id = knowledgeBaseId;
  }
};

const ALLOWED_EXTS = [".txt", ".md", ".pdf", ".docx"];
const MAX_UPLOAD_MB = 50;

const beforeUpload = (file: File): boolean => {
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
  if (!ALLOWED_EXTS.includes(ext)) {
    ElMessage.error(`仅支持 ${ALLOWED_EXTS.join("、")} 格式`);
    return false;
  }
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    ElMessage.error(`文件大小不能超过 ${MAX_UPLOAD_MB}MB`);
    return false;
  }
  return true;
};

const uploadFile = async (options: UploadRequestOptions) => {
  if (uploading.value) return;
  if (!uploadForm.knowledge_base_id) {
    ElMessage.warning("请先选择知识库");
    return;
  }
  const form = new FormData();
  form.append("knowledge_base_id", String(uploadForm.knowledge_base_id));
  form.append("file", options.file);
  uploading.value = true;
  try {
    await KnowledgeAPI.uploadDocument(form);
    ElMessage.success("文档已接收，等待处理；处理完成后可检索");
    uploadDialogVisible.value = false;
    await loadData();
  } finally {
    uploading.value = false;
  }
};

const reindex = async (row: KnowledgeDocument) => {
  if (
    !row.id ||
    reindexingIds.value.has(row.id) ||
    row.index_status === "indexing" ||
    row.parse_status === "parsing"
  )
    return;
  reindexingIds.value.add(row.id);
  try {
    const res = await KnowledgeAPI.reindexDocument(row.id);
    const document = res.data?.data as KnowledgeDocument | undefined;
    if (document?.index_status === "success") {
      ElMessage.success("索引重建完成，文档已可检索");
    } else {
      ElMessage.warning("尚未确认索引完成，请刷新查看文档状态");
    }
  } catch {
    loadError.value = true;
  } finally {
    reindexingIds.value.delete(row.id);
    await loadData();
  }
};

const remove = async (row: KnowledgeDocument) => {
  if (!row.id) return;
  await ElMessageBox.confirm(`确认删除文档「${row.file_name}」？`, "删除确认", { type: "warning" });
  await KnowledgeAPI.deleteDocument([row.id]);
  ElMessage.success("删除成功");
  await loadData();
};

const formatSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

const documentStatusMeta = (row: KnowledgeDocument) => {
  if (row.parse_status === "failed") return { label: "解析失败", type: "danger" as const };
  if (row.index_status === "failed") return { label: "索引失败", type: "danger" as const };
  if (row.index_status === "success") return { label: "可检索", type: "success" as const };
  if (row.parse_status === "parsing") return { label: "正在解析", type: "warning" as const };
  if (row.index_status === "indexing") return { label: "正在索引", type: "warning" as const };
  if (row.parse_status === "success") return { label: "等待索引", type: "info" as const };
  return { label: "等待处理", type: "info" as const };
};

onMounted(async () => {
  viewActive = true;
  applyRouteQuery();
  try {
    await loadBases();
  } catch {
    ElMessage.warning("知识库选项加载失败，请稍后重新打开页面");
  }
  if (!viewActive) return;
  if (route.query.upload === "1") {
    openUploadDialog();
  }
  await loadData();
});

onActivated(() => {
  if (viewActive) return;
  viewActive = true;
  void loadData(true);
});

const deactivate = () => {
  viewActive = false;
  requestSequence += 1;
  loading.value = false;
  stopPolling();
};
onDeactivated(deactivate);
onBeforeUnmount(deactivate);
watch(visibility, (state) => {
  if (state !== "visible") stopPolling();
  else if (viewActive) void loadData(true);
});
</script>

<style scoped>
.document-card {
  border: 1px solid var(--fa-color-border);
  border-radius: var(--fa-radius-panel);
}

.document-card :deep(.el-card__body) {
  padding: 22px 24px;
}

.toolbar {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 8px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--fa-color-border);
}

.base-select {
  width: 220px;
}

.upload-base-select {
  width: 100%;
}

.pagination {
  justify-content: flex-end;
  margin-top: 18px;
}

.table-scroll-hint {
  margin: 0 0 8px;
  font-size: 12px;
  color: var(--fa-color-text-muted);
}

.processing-hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--fa-color-text-muted);
}

@media (width <= 800px) {
  .toolbar,
  .toolbar :deep(.el-form),
  .toolbar :deep(.el-form-item),
  .base-select {
    width: 100%;
  }

  .toolbar :deep(.el-form-item) {
    margin-right: 0;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-start;
  }

  .document-card :deep(.el-card__body) {
    padding: 16px;
  }
}
</style>
