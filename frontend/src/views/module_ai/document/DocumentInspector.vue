<template>
  <ElDialog
    :model-value="!!document"
    :title="document?.file_name || '文档内容'"
    width="min(94vw, 860px)"
    @update:model-value="!$event && emit('close')"
  >
    <div class="inspector-actions">
      <ElButton :loading="downloading" @click="download">下载原文件</ElButton>
      <ElButton :type="editing ? undefined : 'primary'" @click="showChunks">完整分块</ElButton>
      <ElButton v-if="canMaintain" :disabled="busy" :loading="contentLoading" @click="edit"
        >纠错全文</ElButton
      >
      <ElUpload
        v-if="canMaintain"
        :http-request="replace"
        :show-file-list="false"
        :disabled="busy || saving"
        :before-upload="beforeUpload"
        accept=".txt,.md,.pdf,.docx"
      >
        <ElButton :disabled="busy" :loading="saving">替换文件</ElButton>
      </ElUpload>
    </div>
    <p v-if="document?.replacement_pending" role="status" class="document-hint">
      替换内容等待索引完成；当前原文件和分块仍保留。失败后可重新索引或替换文件。
    </p>
    <FaAsyncState
      v-if="error"
      state="error"
      title="文档内容读取失败"
      description="请重试读取；原文件可下载检查。"
    >
      <template #action
        ><ElButton @click="editing ? edit() : loadChunks()">重试</ElButton></template
      >
    </FaAsyncState>
    <template v-if="editing">
      <p class="document-hint">
        保存后将转换为
        TXT，保留文档编号并重新索引；索引成功后才替换原文件和分块。需要保留原始排版时，请下载修改后使用「替换文件」。
      </p>
      <ElInput
        v-model="content"
        type="textarea"
        :rows="16"
        :maxlength="2000000"
        aria-label="文档全文"
        :disabled="contentLoading || saving"
      />
      <div class="save-actions">
        <ElButton
          type="primary"
          :loading="saving"
          :disabled="busy || contentLoading || !!error || !content.trim()"
          @click="save"
          >保存纠错并重新索引</ElButton
        >
      </div>
    </template>
    <template v-else>
      <FaAsyncState
        v-if="loading || (!chunks.length && !error)"
        :state="loading ? 'loading' : 'empty'"
        title="尚无文档分块"
        description="处理完成后显示完整分块；解析失败时请下载原文件检查。"
      />
      <div v-else-if="!error" class="document-chunks">
        <section v-for="chunk in chunks" :key="chunk.id" class="document-chunk">
          <h3>分块 {{ chunk.chunk_index }} · {{ chunk.token_count }} 字符</h3>
          <pre>{{ chunk.content }}</pre>
        </section>
      </div>
      <ElPagination
        v-if="total"
        v-model:current-page="pageNo"
        :page-size="10"
        :total="total"
        layout="total, prev, next"
        @current-change="loadChunks"
      />
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ElMessage, ElMessageBox, type UploadRequestOptions } from "element-plus";
import { useAuth } from "@/hooks/core/useAuth";
import KnowledgeAPI, {
  type KnowledgeDocument,
  type KnowledgeChunk,
} from "@/api/module_ai/knowledge";
import FaAsyncState from "@/components/feedback/fa-async-state/index.vue";

const props = defineProps<{ document: KnowledgeDocument | null }>();
const emit = defineEmits<{ close: []; changed: [] }>();
const { hasAuth } = useAuth();
const canMaintain = computed(() => hasAuth("module_ai:document:create"));
const busy = computed(
  () => props.document?.index_status === "indexing" || props.document?.index_status === "pending"
);
const chunks = ref<KnowledgeChunk[]>([]);
const total = ref(0);
const pageNo = ref(1);
const loading = ref(false);
const contentLoading = ref(false);
const downloading = ref(false);
const saving = ref(false);
const editing = ref(false);
const error = ref(false);
const content = ref("");
let sequence = 0;

const reset = () => {
  sequence++;
  loading.value = false;
  contentLoading.value = false;
  chunks.value = [];
  total.value = 0;
  pageNo.value = 1;
  editing.value = false;
  error.value = false;
  content.value = "";
};
const loadChunks = async () => {
  const id = props.document?.id;
  if (!id) return;
  const request = ++sequence;
  loading.value = true;
  error.value = false;
  try {
    const response = await KnowledgeAPI.listChunks(id, { page_no: pageNo.value, page_size: 10 });
    if (request !== sequence) return;
    chunks.value = response.data.data.items;
    total.value = response.data.data.total;
  } catch {
    if (request === sequence) error.value = true;
  } finally {
    if (request === sequence) loading.value = false;
  }
};
const showChunks = () => {
  contentLoading.value = false;
  editing.value = false;
  void loadChunks();
};
const edit = async () => {
  const id = props.document?.id;
  if (!id) return;
  const request = ++sequence;
  editing.value = true;
  content.value = "";
  contentLoading.value = true;
  error.value = false;
  try {
    const response = await KnowledgeAPI.documentContent(id);
    if (request === sequence) content.value = response.data.data;
  } catch {
    if (request === sequence) error.value = true;
  } finally {
    if (request === sequence) contentLoading.value = false;
  }
};
const download = async () => {
  const document = props.document;
  if (!document?.id || downloading.value) return;
  downloading.value = true;
  try {
    const response = await KnowledgeAPI.downloadDocument(document.id);
    const url = URL.createObjectURL(response.data);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = document.file_name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } finally {
    downloading.value = false;
  }
};
const beforeUpload = (file: File) => {
  if (!/\.(txt|md|pdf|docx)$/i.test(file.name) || file.size > 50 * 1024 * 1024) {
    ElMessage.error("仅支持 50MB 以内的 TXT、MD、PDF、DOCX 文件");
    return false;
  }
  return true;
};
const replace = async (options: UploadRequestOptions) => {
  const id = props.document?.id;
  if (!id || busy.value || saving.value) return;
  try {
    await ElMessageBox.confirm(
      "新文件索引成功后替换原文件和分块；替换后不保留历史版本。继续替换？",
      "替换文档",
      { type: "warning" }
    );
  } catch {
    return;
  }
  saving.value = true;
  try {
    const form = new FormData();
    form.append("file", options.file);
    await KnowledgeAPI.replaceDocument(id, form);
    ElMessage.success("替换已接收，处理完成后生效");
    emit("changed");
    emit("close");
  } finally {
    saving.value = false;
  }
};
const save = async () => {
  const id = props.document?.id;
  if (!id || busy.value || saving.value || !content.value.trim()) return;
  try {
    await ElMessageBox.confirm(
      "纠错将把原文件转换为 TXT，索引成功后替换原文件；不保留历史版本。继续保存？",
      "保存纠错",
      { type: "warning" }
    );
  } catch {
    return;
  }
  saving.value = true;
  try {
    await KnowledgeAPI.updateDocumentContent(id, content.value);
    ElMessage.success("纠错已接收，索引完成后生效");
    emit("changed");
    emit("close");
  } finally {
    saving.value = false;
  }
};
watch(
  () => props.document?.id,
  (id) => {
    reset();
    if (id) void loadChunks();
  }
);
</script>

<style scoped>
.inspector-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.inspector-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}

.document-hint {
  line-height: 1.6;
  color: var(--fa-color-text-muted);
}

.document-chunks {
  max-height: 55vh;
  overflow-y: auto;
}

.document-chunk {
  padding: 12px 0 12px 16px;
  border-left: 2px solid var(--fa-color-border-strong);
}

.document-chunk h3 {
  margin: 0 0 8px;
  font-size: 13px;
}

.document-chunk pre {
  margin: 0;
  font: inherit;
  line-height: 1.7;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.save-actions {
  margin-top: 16px;
}
@media (width <= 800px) {
  .inspector-actions :deep(.el-button) {
    min-height: 44px;
  }
}
</style>
