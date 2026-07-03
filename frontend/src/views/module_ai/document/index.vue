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

      <ElTable v-loading="loading" :data="rows" row-key="id" border>
        <ElTableColumn prop="file_name" label="文件名" min-width="220" show-overflow-tooltip />
        <ElTableColumn prop="file_type" label="类型" width="90" />
        <ElTableColumn prop="file_size" label="大小" width="110">
          <template #default="{ row }">{{ formatSize(row.file_size) }}</template>
        </ElTableColumn>
        <ElTableColumn prop="parse_status" label="解析" width="100" />
        <ElTableColumn prop="index_status" label="索引" width="100" />
        <ElTableColumn prop="chunk_count" label="分块数" width="90" />
        <ElTableColumn prop="created_time" label="创建时间" width="180" show-overflow-tooltip />
        <ElTableColumn label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" @click="reindex(row)">重建</ElButton>
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
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox, type UploadRequestOptions } from "element-plus";
import { Refresh, Search, Upload } from "@element-plus/icons-vue";
import { useRoute } from "vue-router";
import KnowledgeAPI, { type KnowledgeBase, type KnowledgeDocument } from "@/api/module_ai/knowledge";

defineOptions({ name: "AiKnowledgeDocument" });

const route = useRoute();
const loading = ref(false);
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
