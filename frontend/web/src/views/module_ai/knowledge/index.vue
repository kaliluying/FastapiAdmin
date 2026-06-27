<template>
  <div class="knowledge-page">
    <ElCard shadow="never">
      <div class="toolbar">
        <ElForm :inline="true" :model="query" class="query-form">
          <ElFormItem label="名称">
            <ElInput v-model="query.name" clearable placeholder="知识库名称" @keyup.enter="loadData" />
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
        <ElButton type="primary" :icon="Plus" @click="openCreate">新建</ElButton>
      </div>

      <ElTable v-loading="loading" :data="rows" row-key="id" border>
        <ElTableColumn prop="name" label="名称" min-width="180" show-overflow-tooltip />
        <ElTableColumn prop="description" label="描述" min-width="220" show-overflow-tooltip />
        <ElTableColumn prop="document_count" label="文档数" width="90" />
        <ElTableColumn prop="is_enabled" label="状态" width="90">
          <template #default="{ row }">
            <ElTag :type="row.is_enabled ? 'success' : 'info'">
              {{ row.is_enabled ? "启用" : "停用" }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="created_time" label="创建时间" width="180" show-overflow-tooltip />
        <ElTableColumn label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" @click="openUpdate(row)">编辑</ElButton>
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

    <ElDialog v-model="dialogVisible" :title="editingId ? '编辑知识库' : '新建知识库'" width="560px">
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="92px">
        <ElFormItem label="名称" prop="name">
          <ElInput v-model="form.name" maxlength="100" show-word-limit />
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput v-model="form.description" type="textarea" :rows="4" maxlength="500" show-word-limit />
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
import { Plus, Refresh, Search } from "@element-plus/icons-vue";
import KnowledgeAPI, { type KnowledgeBase, type KnowledgeBaseForm } from "@/api/module_ai/knowledge";

defineOptions({ name: "AiKnowledge" });

const loading = ref(false);
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
  owner_dept_id: null,
});

const rules: FormRules = {
  name: [{ required: true, message: "请输入知识库名称", trigger: "blur" }],
};

const loadData = async () => {
  loading.value = true;
  try {
    const res = await KnowledgeAPI.listKnowledgeBase({ ...query });
    const data = res.data?.data;
    rows.value = data?.items || [];
    total.value = data?.total || 0;
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
  Object.assign(form, { name: "", description: "", is_enabled: true, owner_dept_id: null });
  dialogVisible.value = true;
};

const openUpdate = (row: KnowledgeBase) => {
  editingId.value = row.id || null;
  Object.assign(form, {
    name: row.name,
    description: row.description || "",
    is_enabled: row.is_enabled,
    owner_dept_id: row.owner_dept_id || null,
  });
  dialogVisible.value = true;
};

const submit = async () => {
  await formRef.value?.validate();
  saving.value = true;
  try {
    if (editingId.value) {
      await KnowledgeAPI.updateKnowledgeBase(editingId.value, form);
    } else {
      await KnowledgeAPI.createKnowledgeBase(form);
    }
    ElMessage.success("保存成功");
    dialogVisible.value = false;
    await loadData();
  } finally {
    saving.value = false;
  }
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

.toolbar {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.query-form {
  flex: 1;
}

.status-select {
  width: 120px;
}

.pagination {
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
