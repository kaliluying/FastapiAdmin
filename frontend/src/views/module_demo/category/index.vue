<template>
  <div class="category-page">
    <div class="category-header">
      <div>
        <h1>分类管理</h1>
        <p>维护分类名称、显示顺序和启用状态。</p>
      </div>
      <ElButton v-auth="'module_demo:category:create'" type="primary" @click="openCreate"
        >新增分类</ElButton
      >
    </div>
    <ElCard shadow="never">
      <ElForm class="category-filters" :inline="true" :model="query" @submit.prevent="search">
        <ElFormItem label="分类名称">
          <ElInput
            v-model="query.name"
            placeholder="输入名称"
            clearable
            maxlength="64"
            @keyup.enter="search"
          />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect
            v-model="query.status"
            placeholder="全部"
            clearable
            @clear="query.status = undefined"
          >
            <ElOption label="启用" :value="0" />
            <ElOption label="停用" :value="1" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" :loading="loading" @click="search">查询</ElButton>
          <ElButton @click="resetQuery">重置</ElButton>
        </ElFormItem>
      </ElForm>
      <FaAsyncState
        v-if="loadError"
        state="error"
        title="分类列表加载失败"
        description="当前筛选和列表已保留，请重试。"
      >
        <template #action
          ><ElButton :loading="loading" @click="loadData">重试加载</ElButton></template
        >
      </FaAsyncState>
      <ElTable
        v-loading="loading"
        :data="rows"
        row-key="id"
        empty-text="没有匹配的分类"
        @sort-change="changeSort"
      >
        <ElTableColumn
          prop="name"
          label="分类名称"
          min-width="180"
          sortable="custom"
          show-overflow-tooltip
        />
        <ElTableColumn prop="order" label="排序" width="100" sortable="custom" />
        <ElTableColumn label="状态" width="100">
          <template #default="{ row }"
            ><ElTag :type="row.status === 0 ? 'success' : 'info'">{{
              row.status === 0 ? "启用" : "停用"
            }}</ElTag></template
          >
        </ElTableColumn>
        <ElTableColumn prop="description" label="说明" min-width="200" show-overflow-tooltip />
        <ElTableColumn prop="created_time" label="创建时间" min-width="180" />
        <ElTableColumn label="操作" width="150">
          <template #default="{ row }">
            <ElButton
              v-auth="'module_demo:category:update'"
              link
              type="primary"
              :disabled="saving"
              @click="openEdit(row)"
              >编辑</ElButton
            >
            <ElButton
              v-auth="'module_demo:category:delete'"
              link
              type="danger"
              :loading="deletingId === row.id"
              :disabled="deletingId !== null"
              @click="remove(row)"
              >删除</ElButton
            >
          </template>
        </ElTableColumn>
      </ElTable>
      <ElPagination
        v-model:current-page="query.page_no"
        v-model:page-size="query.page_size"
        :total="total"
        layout="total, prev, pager, next"
        :pager-count="5"
        @current-change="loadData"
      />
    </ElCard>
    <ElDialog
      v-model="dialogVisible"
      :title="editingId === null ? '新增分类' : '编辑分类'"
      width="min(92vw, 520px)"
      :close-on-click-modal="false"
      :close-on-press-escape="!saving"
      :show-close="!saving"
    >
      <ElForm
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        :disabled="saving"
        @submit.prevent="save"
      >
        <ElFormItem label="分类名称" prop="name"
          ><ElInput v-model="form.name" maxlength="64" placeholder="例如：办公用品"
        /></ElFormItem>
        <ElFormItem label="显示排序" prop="order"
          ><ElInputNumber v-model="form.order" :min="0" :max="999999"
        /></ElFormItem>
        <ElFormItem label="状态"
          ><ElRadioGroup v-model="form.status"
            ><ElRadio :value="0">启用</ElRadio><ElRadio :value="1">停用</ElRadio></ElRadioGroup
          ></ElFormItem
        >
        <ElFormItem label="说明"
          ><ElInput
            v-model="form.description"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
        /></ElFormItem>
      </ElForm>
      <p v-if="saveError" class="category-error" role="alert">{{ saveError }}</p>
      <template #footer
        ><ElButton :disabled="saving" @click="dialogVisible = false">取消</ElButton
        ><ElButton type="primary" :loading="saving" @click="save">保存</ElButton></template
      >
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import CategoryAPI, {
  type Category,
  type CategoryForm,
  type CategoryQuery,
} from "@/api/module_demo/category";
import FaAsyncState from "@/components/feedback/fa-async-state/index.vue";

defineOptions({ name: "DemoCategory" });

const query = reactive<CategoryQuery>({ page_no: 1, page_size: 10 });
const rows = ref<Category[]>([]);
const total = ref(0);
const loading = ref(false);
const loadError = ref(false);
const dialogVisible = ref(false);
const editingId = ref<number | null>(null);
const deletingId = ref<number | null>(null);
const saving = ref(false);
const saveError = ref("");
const formRef = ref<FormInstance>();
const form = reactive<CategoryForm>({ name: "", order: 0, status: 0, description: null });
const rules: FormRules = {
  name: [{ required: true, whitespace: true, message: "请输入分类名称", trigger: "blur" }],
  order: [
    {
      required: true,
      type: "number",
      min: 0,
      max: 999999,
      message: "请输入有效的显示排序",
      trigger: "blur",
    },
  ],
};
let loadVersion = 0;

async function loadData(): Promise<void> {
  const version = ++loadVersion;
  loading.value = true;
  loadError.value = false;
  try {
    const response = await CategoryAPI.list({ ...query });
    if (version !== loadVersion) return;
    rows.value = response.data.data.items;
    total.value = response.data.data.total;
  } catch {
    if (version === loadVersion) loadError.value = true;
  } finally {
    if (version === loadVersion) loading.value = false;
  }
}

function search(): void {
  query.page_no = 1;
  void loadData();
}
function resetQuery(): void {
  query.name = undefined;
  query.status = undefined;
  search();
}
function changeSort({ prop, order }: { prop: string; order: string | null }): void {
  query.order_by = JSON.stringify(
    order ? [{ [prop]: order === "ascending" ? "asc" : "desc" }] : [{ id: "desc" }]
  );
  search();
}
function openCreate(): void {
  editingId.value = null;
  Object.assign(form, { name: "", order: 0, status: 0, description: null });
  saveError.value = "";
  formRef.value?.clearValidate();
  dialogVisible.value = true;
}
function openEdit(row: Category): void {
  editingId.value = row.id;
  Object.assign(form, {
    name: row.name,
    order: row.order,
    status: row.status,
    description: row.description,
  });
  saveError.value = "";
  formRef.value?.clearValidate();
  dialogVisible.value = true;
}
async function save(): Promise<void> {
  if (saving.value) return;
  saving.value = true;
  saveError.value = "";
  try {
    if (!(await formRef.value?.validate().catch(() => false))) return;
    const data = { ...form, name: form.name.trim(), description: form.description?.trim() || null };
    if (editingId.value === null) await CategoryAPI.create(data);
    else await CategoryAPI.update(editingId.value, data);
    dialogVisible.value = false;
    await loadData();
  } catch {
    saveError.value = "保存失败，输入已保留。请检查名称是否重复后重试。";
  } finally {
    saving.value = false;
  }
}
async function remove(row: Category): Promise<void> {
  if (deletingId.value !== null) return;
  try {
    await ElMessageBox.confirm(
      `删除分类「${row.name}」？删除后不再显示，名称仍保留。`,
      "删除分类",
      { type: "warning" }
    );
  } catch {
    return;
  }
  deletingId.value = row.id;
  try {
    await CategoryAPI.delete([row.id]);
    if (rows.value.length === 1 && (query.page_no || 1) > 1)
      query.page_no = (query.page_no || 1) - 1;
    await loadData();
  } catch {
    ElMessage.error("删除失败，请刷新后重试。");
  } finally {
    deletingId.value = null;
  }
}
onMounted(loadData);
</script>

<style scoped lang="scss">
.category-header {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--fa-color-text);
}

.category-header p {
  margin: 8px 0 0;
  color: var(--fa-color-text-muted);
}

.category-filters .el-select {
  width: 140px;
}

.el-pagination {
  justify-content: flex-end;
  margin-top: 20px;
}

.category-error {
  color: var(--el-color-danger);
}
@media (width <= 768px) {
  .category-header {
    align-items: flex-start;
  }

  .category-filters {
    display: flex;
    flex-direction: column;
  }

  .category-filters :deep(.el-form-item) {
    margin-right: 0;
  }

  .category-filters :deep(.el-form-item__content) {
    flex: 1;
  }

  .category-filters .el-select {
    width: 100%;
  }

  .category-page :deep(.el-button:not(.is-link)),
  .category-page :deep(.el-input__wrapper),
  .category-page :deep(.el-select__wrapper) {
    min-height: 44px;
  }
}
</style>
