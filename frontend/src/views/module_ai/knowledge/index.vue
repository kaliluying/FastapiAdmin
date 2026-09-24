<template>
  <div class="knowledge-page">
    <FaAiPageHeader title="知识库" description="整理资料、查看索引进度，并决定哪些知识可用于对话。">
      <template #actions>
        <ElButton type="primary" :icon="Plus" @click="openCreate">新建知识库</ElButton>
      </template>
    </FaAiPageHeader>
    <ElCard shadow="never" class="knowledge-card">
      <div class="toolbar">
        <ElForm :inline="true" :model="query" class="query-form">
          <ElFormItem label="名称">
            <ElInput
              v-model="query.name"
              clearable
              placeholder="知识库名称"
              @keyup.enter="loadData"
            />
          </ElFormItem>
          <ElFormItem label="状态">
            <ElSelect v-model="query.is_enabled" clearable placeholder="全部" class="status-select">
              <ElOption label="启用" :value="true" />
              <ElOption label="停用" :value="false" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem>
            <ElButton type="primary" :icon="Search" @click="loadData">查询</ElButton>
            <ElButton :icon="Refresh" @click="resetQuery">重置</ElButton>
          </ElFormItem>
        </ElForm>
      </div>

      <FaAsyncState
        v-if="loading || loadError || (!loading && rows.length === 0)"
        :state="loading ? 'loading' : loadError ? 'error' : 'empty'"
      />
      <template v-else>
        <p v-if="isNarrowViewport" class="table-scroll-hint">左右滑动查看完整列表</p>
        <ElTable :data="rows" row-key="id">
          <ElTableColumn prop="name" label="名称" min-width="180" show-overflow-tooltip />
          <ElTableColumn prop="description" label="描述" min-width="180" show-overflow-tooltip />
          <ElTableColumn prop="document_count" label="文档数" width="90" />
          <ElTableColumn label="索引状态" min-width="180">
            <template #default="{ row }">
              <div class="index-status">
                <ElTag type="success" effect="plain">成功 {{ row.indexed_document_count }}</ElTag>
                <ElTag type="warning" effect="plain"
                  >处理中 {{ row.indexing_document_count }}</ElTag
                >
                <ElTag type="danger" effect="plain">失败 {{ row.failed_document_count }}</ElTag>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="is_enabled" label="状态" width="90">
            <template #default="{ row }">
              <ElTag :type="row.is_enabled ? 'success' : 'info'">
                {{ row.is_enabled ? "启用" : "停用" }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="created_time" label="创建时间" width="165" show-overflow-tooltip />
          <ElTableColumn label="操作" width="270" :fixed="isNarrowViewport ? false : 'right'">
            <template #default="{ row }">
              <div class="action-buttons">
                <ElButton type="primary" link :icon="Upload" @click="goUploadDocuments(row)">
                  上传文档
                </ElButton>
                <ElButton type="primary" link :icon="Document" @click="goViewDocuments(row)">
                  查看文档
                </ElButton>
                <ElDropdown trigger="click" @command="(command) => handleRowAction(command, row)">
                  <ElButton type="primary" link :icon="MoreFilled">更多</ElButton>
                  <template #dropdown>
                    <ElDropdownMenu>
                      <ElDropdownItem command="retrieve" :icon="Search">检索测试</ElDropdownItem>
                      <ElDropdownItem command="edit" :icon="EditPen">编辑</ElDropdownItem>
                      <ElDropdownItem command="delete" :icon="Delete" divided>删除</ElDropdownItem>
                    </ElDropdownMenu>
                  </template>
                </ElDropdown>
              </div>
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
      </template>
    </ElCard>

    <ElDialog
      v-model="dialogVisible"
      :title="editingId ? '编辑知识库' : '新建知识库'"
      width="560px"
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="92px">
        <ElFormItem label="名称" prop="name">
          <ElInput v-model="form.name" maxlength="100" show-word-limit />
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput
            v-model="form.description"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
          />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSwitch v-model="form.is_enabled" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="saving" @click="submit">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import {
  Delete,
  Document,
  EditPen,
  MoreFilled,
  Plus,
  Refresh,
  Search,
  Upload,
} from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { useMediaQuery } from "@vueuse/core";
import KnowledgeAPI, {
  type KnowledgeBase,
  type KnowledgeBaseForm,
} from "@/api/module_ai/knowledge";
import FaAiPageHeader from "@/views/module_ai/components/FaAiPageHeader.vue";
import FaAsyncState from "@/components/feedback/fa-async-state/index.vue";

defineOptions({ name: "AiKnowledge" });

const router = useRouter();
const isNarrowViewport = useMediaQuery("(max-width: 800px)");
const loading = ref(false);
const loadError = ref(false);
const saving = ref(false);
const rows = ref<KnowledgeBase[]>([]);
const total = ref(0);
const dialogVisible = ref(false);
const editingId = ref<number | null>(null);
const formRef = ref<FormInstance>();

const query = reactive({
  page_no: 1,
  page_size: 10,
  name: "",
  is_enabled: undefined as boolean | undefined,
});

const form = reactive<KnowledgeBaseForm>({
  name: "",
  description: "",
  is_enabled: true,
});

const rules: FormRules = {
  name: [{ required: true, message: "请输入知识库名称", trigger: "blur" }],
};

const loadData = async () => {
  loading.value = true;
  loadError.value = false;
  try {
    const res = await KnowledgeAPI.listKnowledgeBase({ ...query });
    const data = res.data?.data;
    rows.value = data?.items || [];
    total.value = data?.total || 0;
  } catch {
    loadError.value = true;
  } finally {
    loading.value = false;
  }
};

const resetQuery = () => {
  query.page_no = 1;
  query.name = "";
  query.is_enabled = undefined;
  loadData();
};

const openCreate = () => {
  editingId.value = null;
  Object.assign(form, { name: "", description: "", is_enabled: true });
  dialogVisible.value = true;
};

const openUpdate = (row: KnowledgeBase) => {
  editingId.value = row.id || null;
  Object.assign(form, {
    name: row.name,
    description: row.description || "",
    is_enabled: row.is_enabled,
  });
  dialogVisible.value = true;
};

const submit = async () => {
  await formRef.value?.validate();
  saving.value = true;
  try {
    let created: KnowledgeBase | undefined;
    if (editingId.value) {
      await KnowledgeAPI.updateKnowledgeBase(editingId.value, form);
      ElMessage.success("保存成功");
    } else {
      const res = await KnowledgeAPI.createKnowledgeBase(form);
      created = res.data?.data;
    }
    dialogVisible.value = false;
    await loadData();
    if (created?.id) {
      try {
        await ElMessageBox.confirm("知识库已创建，是否现在去上传文档？", "去上传文档", {
          confirmButtonText: "去上传文档",
          cancelButtonText: "稍后再说",
          type: "success",
        });
        goUploadDocuments(created);
      } catch {
        ElMessage.success("知识库已创建");
      }
    }
  } finally {
    saving.value = false;
  }
};

const goUploadDocuments = (row: KnowledgeBase) => {
  if (!row.id) return;
  router.push({ path: "/module_ai/document", query: { knowledge_base_id: row.id, upload: "1" } });
};

const goViewDocuments = (row: KnowledgeBase) => {
  if (!row.id) return;
  router.push({ path: "/module_ai/document", query: { knowledge_base_id: row.id } });
};

const goRetrievalTest = (row: KnowledgeBase) => {
  if (!row.id) return;
  router.push({ path: "/module_ai/retrieval", query: { knowledge_base_id: row.id } });
};

const handleRowAction = (command: string, row: KnowledgeBase) => {
  if (command === "retrieve") goRetrievalTest(row);
  if (command === "edit") openUpdate(row);
  if (command === "delete") void remove(row);
};

const remove = async (row: KnowledgeBase) => {
  if (!row.id) return;
  await ElMessageBox.confirm(`确认删除知识库「${row.name}」？`, "删除确认", { type: "warning" });
  await KnowledgeAPI.deleteKnowledgeBase([row.id]);
  ElMessage.success("删除成功");
  await loadData();
};

onMounted(loadData);
</script>

<style scoped>
.knowledge-page {
  height: 100%;
}

.knowledge-card {
  border: 1px solid var(--fa-color-border);
  border-radius: 10px;
}

.knowledge-card :deep(.el-card__body) {
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

.query-form {
  flex: 1;
}

.status-select {
  width: 120px;
}

.index-status {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.action-buttons {
  display: flex;
  gap: 6px;
  align-items: center;
  white-space: nowrap;
}

.action-buttons :deep(.el-button) {
  margin-left: 0;
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

@media (width <= 800px) {
  .toolbar {
    flex-direction: column;
  }

  .knowledge-card :deep(.el-card__body) {
    padding: 16px;
  }
}
</style>
