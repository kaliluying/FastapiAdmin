<template>
  <div class="document-page">
    <ElCard shadow="never">
      <div class="toolbar">
        <ElForm :inline="true" :model="query">
          <ElFormItem label="知识库">
            <ElSelect v-model="query.knowledge_base_id" clearable filterable class="base-select">
              <ElOption v-for="item in bases" :key="item.id" :label="item.name" :value="item.id || 0" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="文件名">
            <ElInput v-model="query.file_name" clearable placeholder="文件名" @keyup.enter="loadData" />
          </ElFormItem>
          <ElFormItem>
            <ElButton type="primary" :icon="Search" @click="loadData">查询</ElButton>
            <ElButton :icon="Refresh" @click="resetQuery">重置</ElButton>
          </ElFormItem>
        </ElForm>
        <ElButton type="primary" :icon="Upload" @click="openUploadDialog">上传文档</ElButton>
      </div>

      <FaAsyncState v-if="loading || !rows.length" :state="docListState" />
      <ElTable v-else :data="rows" row-key="id" border>
        <ElTableColumn prop="file_name" label="文件名" min-width="220" show-overflow-tooltip />
        <ElTableColumn prop="file_type" label="类型" width="90" />
        <ElTableColumn prop="file_size" label="大小" width="110">
          <template #default="{ row }">{{ formatSize(row.file_size) }}</template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="120">
          <template #default="{ row }">
            <ElTooltip v-if="row.error_message" :content="row.error_message" placement="top">
              <ElTag :type="documentStatusMeta(row).type" size="small">{{ documentStatusMeta(row).label }}</ElTag>
            </ElTooltip>
            <ElTag v-else :type="documentStatusMeta(row).type" size="small">{{ documentStatusMeta(row).label }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="chunk_count" label="分块数" width="90" />
        <ElTableColumn prop="created_time" label="创建时间" width="180" show-overflow-tooltip />
        <ElTableColumn label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" @click="reindex(row)">重新索引</ElButton>
            <ElButton link type="danger" @click="remove(row)">删除</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <ElPagination
        v-model:current-page="query.page_no"
        v-model:page-size="query.page_size"
        class="pagination"
        layout="total, sizes, prev, pager, next"
        :total="total"
        @size-change="loadData"
        @current-change="loadData"
      />
    </ElCard>

    <ElDialog v-model="uploadDialogVisible" title="上传文档" width="520px">
      <ElForm label-width="90px">
        <ElFormItem label="知识库" required>
          <ElSelect
            v-model="uploadForm.knowledge_base_id"
            class="upload-base-select"
            filterable
            placeholder="请选择知识库"
          >
            <ElOption v-for="item in bases" :key="item.id" :label="item.name" :value="item.id || 0" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="文档" required>
          <ElUpload
            drag
            :http-request="uploadFile"
            :show-file-list="false"
            :disabled="!uploadForm.knowledge_base_id"
            accept=".txt,.md,.pdf,.docx"
            :before-upload="beforeUpload"
          >
            <ElIcon class="el-icon--upload"><Upload /></ElIcon>
            <div class="el-upload__text">点击或拖拽文件上传</div>
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
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox, type UploadRequestOptions } from "element-plus";
import { Refresh, Search, Upload } from "@element-plus/icons-vue";
import { useRoute } from "vue-router";
import KnowledgeAPI, { type KnowledgeBase, type KnowledgeDocument } from "@/api/module_ai/knowledge";
import FaAsyncState from "@/components/feedback/fa-async-state/index.vue";

defineOptions({ name: "AiKnowledgeDocument" });

const route = useRoute();
const loading = ref(false);
const docListState = computed<"loading" | "empty">(() => (loading.value ? "loading" : "empty"));
const rows = ref<KnowledgeDocument[]>([]);
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

const loadData = async () => {
  loading.value = true;
  try {
    const res = await KnowledgeAPI.listDocument({ ...query });
    const data = res.data?.data;
    rows.value = data?.items || [];
    total.value = data?.total || 0;
  } finally {
    loading.value = false;
  }
};

const resetQuery = () => {
  query.page_no = 1;
  query.knowledge_base_id = undefined;
  query.file_name = "";
  loadData();
};

const openUploadDialog = () => {
  uploadForm.knowledge_base_id = query.knowledge_base_id || (bases.value.length === 1 ? bases.value[0]?.id : undefined);
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
  if (!uploadForm.knowledge_base_id) {
    ElMessage.warning("请先选择知识库");
    return;
  }
  const form = new FormData();
  form.append("knowledge_base_id", String(uploadForm.knowledge_base_id));
  form.append("file", options.file);
  await KnowledgeAPI.uploadDocument(form);
  ElMessage.success("上传成功");
  uploadDialogVisible.value = false;
  if (!query.knowledge_base_id) {
    query.knowledge_base_id = uploadForm.knowledge_base_id;
  }
  await loadData();
};

const reindex = async (row: KnowledgeDocument) => {
  if (!row.id) return;
  await KnowledgeAPI.reindexDocument(row.id);
  ElMessage.success("已提交重建");
  await loadData();
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
  if (row.parse_status === "failed")   return { label: "解析失败",  type: "danger"  as const };
  if (row.index_status === "failed")   return { label: "索引失败",  type: "danger"  as const };
  if (row.index_status === "success")  return { label: "可检索",    type: "success" as const };
  if (row.index_status === "indexing") return { label: "正在索引",  type: "warning" as const };
  if (row.parse_status === "success")  return { label: "等待索引",  type: "info"    as const };
  return { label: "等待处理", type: "info" as const };
};

onMounted(async () => {
  await loadBases();
  applyRouteQuery();
  if (route.query.upload === "1") {
    openUploadDialog();
  }
  await loadData();
});
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.base-select {
  width: 220px;
}

.upload-base-select {
  width: 100%;
}

.pagination {
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
