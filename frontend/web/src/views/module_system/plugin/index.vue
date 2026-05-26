<!-- 插件市场：FA + useTable；支持超管 CRUD 与租户安装/卸载 -->
<template>
  <div class="fa-full-height">
    <FaSearchBar
      v-show="showSearchBar"
      ref="searchBarRef"
      v-model="searchForm"
      :items="pluginSearchItems"
      :is-expand="false"
      :show-expand="true"
      :show-reset="true"
      :show-search="true"
      :disabled-search="false"
      :default-expanded="false"
      @search="handleSearchBarSearch"
      @reset="onResetSearch"
    />

    <ElCard
      shadow="hover"
      class="fa-table-card"
      :style="{ 'margin-top': showSearchBar ? '12px' : '0' }"
    >
      <FaTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <FaTableHeaderLeft
            :remove-ids="selectedIds"
            :perm-create="['module_system:plugin:create']"
            :perm-delete="['module_system:plugin:delete']"
            :delete-loading="batchDeleting"
            @add="handleOpenDialog('create')"
            @delete="handleBatchDelete"
          />
        </template>
      </FaTableHeader>

      <FaTable
        ref="faTableRef"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="onTableSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>

    <FaDialog
      v-model="dialogVisible.visible"
      :title="dialogVisible.title"
      width="720px"
      dialog-class="crud-embed-dialog"
      modal-class="crud-embed-dialog"
      :form-mode="dialogVisible.type"
      :confirm-loading="submitLoading"
      @cancel="handleCloseDialog"
      @confirm="dialogVisible.type === 'detail' ? handleCloseDialog() : handleSubmit()"
    >
      <template v-if="dialogVisible.type === 'detail'">
        <FaDescriptions
          :column="2"
          :data="detailFormData"
          :items="pluginDetailItems"
          max-height="75vh"
        >
          <template #status>
            <ElTag :type="detailFormData.status === '0' ? 'success' : 'danger'">
              {{ detailFormData.status === "0" ? "启用" : "停用" }}
            </ElTag>
          </template>
          <template #price>
            {{
              detailFormData.price === 0
                ? "免费"
                : "¥" + ((detailFormData.price ?? 0) / 100).toFixed(2)
            }}
          </template>
        </FaDescriptions>
      </template>
      <template v-else>
        <FaForm
          scrollbar
          max-height="75vh"
          :key="pluginFormRenderKey"
          ref="dataFormRef"
          v-model="formData"
          :items="pluginDialogFormItems"
          :rules="rules"
          label-suffix=":"
          :label-width="100"
          label-position="right"
          :span="24"
          :gutter="16"
          :show-reset="false"
          :show-submit="false"
          class="crud-dialog-art-form"
        >
          <template #status>
            <ElRadioGroup v-model="formData.status">
              <ElRadio value="0">启用</ElRadio>
              <ElRadio value="1">停用</ElRadio>
            </ElRadioGroup>
          </template>
        </FaForm>
      </template>
    </FaDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from "vue";
import { useTable } from "@/hooks/core/useTable";
import { useCrudDialog } from "@/hooks/core/useCrudDialog";
import { useTableSelection } from "@/hooks/core/useTableSelection";
import { useCrudForm } from "@/hooks/core/useCrudForm";
import { confirmDelete, confirmBatchDelete } from "@/hooks/core/useConfirm";
import { cleanEmptyArrayParams } from "@/utils/query";
import type { ColumnOption } from "@/types/component";
import PluginAPI, {
  type PluginForm,
  type PluginQueryParam,
  type PluginTable,
} from "@/api/module_system/plugin";
import { useAuth } from "@/hooks/core/useAuth";
import type { SearchFormItem } from "@/components/forms/fa-search-bar/index.vue";
import type { FormItem } from "@/components/forms/fa-form/index.vue";
import FaSearchBar from "@/components/forms/fa-search-bar/index.vue";
import FaForm from "@/components/forms/fa-form/index.vue";
import FaButtonTable from "@/components/forms/fa-button-table/index.vue";
import {
  ElTag,
  ElMessage,
  ElTooltip,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
} from "element-plus";

defineOptions({
  name: "PluginMarketplace",
  inheritAttrs: false,
});

const MAX_INLINE_ROW_ACTIONS = 3;
const { hasAuth } = useAuth();

type PluginSearchForm = {
  name?: string;
  category?: string;
  status?: string;
};

function normalizePluginQuery(params: Record<string, unknown>): PluginQueryParam {
  return cleanEmptyArrayParams({ ...params }) as unknown as PluginQueryParam;
}

type RowAction = {
  key: string;
  label: string;
  artType: "add" | "edit" | "delete" | "view" | "more";
  icon?: string;
  perm: string;
  disabled?: boolean;
  run: () => void;
};

function buildPluginRowActions(
  row: PluginTable,
  ctx: {
    onDetail: (id: number) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onInstall: (row: PluginTable) => void;
    onUninstall: (row: PluginTable) => void;
    onToggle: (row: PluginTable) => void;
  }
): RowAction[] {
  const all: RowAction[] = [
    {
      key: "detail",
      label: "详情",
      artType: "view",
      perm: "module_system:plugin:query",
      run: () => ctx.onDetail(row.id!),
    },
  ];

  if (hasAuth("module_system:plugin:update")) {
    all.push({
      key: "edit",
      label: "编辑",
      artType: "edit",
      perm: "module_system:plugin:update",
      run: () => ctx.onEdit(row.id!),
    });
  }

  if (hasAuth("module_system:plugin:delete")) {
    all.push({
      key: "delete",
      label: "删除",
      artType: "delete",
      perm: "module_system:plugin:delete",
      run: () => ctx.onDelete(row.id!),
    });
  }

  if (hasAuth("module_system:plugin:install")) {
    if (row.installed) {
      all.push({
        key: "uninstall",
        label: "卸载",
        artType: "more",
        perm: "module_system:plugin:uninstall",
        run: () => ctx.onUninstall(row),
      });
      all.push({
        key: "toggle",
        label: row.status === "0" ? "禁用" : "启用",
        artType: "more",
        perm: "module_system:plugin:toggle",
        run: () => ctx.onToggle(row),
      });
    } else {
      all.push({
        key: "install",
        label: "安装",
        artType: "add",
        perm: "module_system:plugin:install",
        run: () => ctx.onInstall(row),
      });
    }
  }

  return all.filter((a) => hasAuth(a.perm));
}

function formatPluginOperationCell(
  row: PluginTable,
  ctx: Parameters<typeof buildPluginRowActions>[1]
) {
  const actions = buildPluginRowActions(row, ctx);
  if (actions.length === 0) {
    return h("span", { class: "text-g-400" }, "—");
  }
  const inline = actions.slice(0, MAX_INLINE_ROW_ACTIONS);
  const overflow = actions.slice(MAX_INLINE_ROW_ACTIONS);

  const inlineNodes = inline.map((a) =>
    h(ElTooltip, { content: a.label, placement: "top" }, () =>
      h("span", { class: "inline-flex" }, [
        h(FaButtonTable, {
          type: a.artType,
          icon: a.icon,
          onClick: a.run,
        }),
      ])
    )
  );

  if (overflow.length === 0) {
    return h(
      "div",
      { class: "inline-flex flex-wrap items-center justify-end gap-1 plugin-table-actions" },
      inlineNodes
    );
  }

  const dropdown = h(
    ElDropdown,
    { trigger: "click" },
    {
      default: () =>
        h(ElTooltip, { content: "更多", placement: "top" }, () =>
          h("span", { class: "inline-flex align-middle" }, [
            h(FaButtonTable, {
              type: "more",
              onClick: () => {},
            }),
          ])
        ),
      dropdown: () =>
        h(
          ElDropdownMenu,
          null,
          overflow.map((a) =>
            h(
              ElDropdownItem,
              {
                key: a.key,
                disabled: a.disabled,
                onClick: () => a.run(),
              },
              () => a.label
            )
          )
        ),
    }
  );

  return h(
    "div",
    { class: "inline-flex flex-wrap items-center justify-end gap-1 plugin-table-actions" },
    [...inlineNodes, dropdown]
  );
}

const searchForm = ref<PluginSearchForm>({
  name: undefined,
  category: undefined,
  status: undefined,
});

const showSearchBar = ref(true);

const categoryOptions = ref([
  { label: "工具", value: "tool" },
  { label: "AI", value: "ai" },
  { label: "监控", value: "monitor" },
  { label: "业务", value: "business" },
]);

const statusOptions = ref([
  { label: "启用", value: "0" },
  { label: "停用", value: "1" },
]);

const pluginSearchItems = computed<SearchFormItem[]>(() => [
  {
    label: "插件名称",
    key: "name",
    type: "input",
    placeholder: "请输入插件名称",
    clearable: true,
    span: 6,
  },
  {
    label: "分类",
    key: "category",
    type: "select",
    props: {
      placeholder: "请选择分类",
      options: categoryOptions.value,
      clearable: true,
    },
    span: 6,
  },
  {
    label: "状态",
    key: "status",
    type: "select",
    props: {
      placeholder: "请选择状态",
      options: statusOptions.value,
      clearable: true,
    },
    span: 6,
  },
]);

const faTableRef = ref<{ elTableRef?: { clearSelection: () => void } } | null>(null);
const { selectedIds, batchDeleting, onTableSelectionChange } = useTableSelection<PluginTable>();

async function deletePluginRow(id: number) {
  try {
    await confirmDelete("确认删除该插件?");
    await PluginAPI.delete([id]);
    ElMessage.success("删除成功");
    await refreshRemove();
  } catch {
    ElMessage.error("删除失败");
  }
}

async function handleBatchDelete() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning("请先选择要删除的插件");
    return;
  }
  try {
    await confirmBatchDelete(selectedIds.value.length);
    await PluginAPI.delete(selectedIds.value as number[]);
    ElMessage.success("批量删除成功");
    faTableRef.value?.elTableRef?.clearSelection();
    await refreshData();
  } catch {
    ElMessage.error("批量删除失败");
  }
}

async function doInstall(row: PluginTable) {
  if (!row.id) return;
  try {
    await PluginAPI.install(row.id);
    ElMessage.success("安装成功");
    row.installed = true;
    await refreshData();
  } catch {
    ElMessage.error("安装失败");
  }
}

async function doUninstall(row: PluginTable) {
  if (!row.id) return;
  try {
    await PluginAPI.uninstall(row.id);
    ElMessage.success("卸载成功");
    row.installed = false;
    await refreshData();
  } catch {
    ElMessage.error("卸载失败");
  }
}

async function doToggle(row: PluginTable) {
  if (!row.id) return;
  try {
    await PluginAPI.toggle(row.id);
    ElMessage.success(row.status === "0" ? "已禁用" : "已启用");
    row.status = row.status === "0" ? "1" : "0";
    await refreshData();
  } catch {
    ElMessage.error("操作失败");
  }
}

const opCtx = {
  onDetail: (id: number) => void handleOpenDialog("detail", id),
  onEdit: (id: number) => void handleOpenDialog("update", id),
  onDelete: deletePluginRow,
  onInstall: doInstall,
  onUninstall: doUninstall,
  onToggle: doToggle,
};

const {
  columns,
  columnChecks,
  data,
  loading,
  pagination,
  getData,
  replaceSearchParams,
  resetSearchParams,
  handleSizeChange,
  handleCurrentChange,
  refreshData,
  refreshCreate,
  refreshUpdate,
  refreshRemove,
} = useTable({
  core: {
    apiFn: PluginAPI.list,
    apiParams: {
      page_no: 1,
      page_size: 10,
    },
    columnsFactory: (): ColumnOption<PluginTable>[] => [
      { type: "selection", width: 48, fixed: "left" },
      { type: "globalIndex", width: 56, label: "序号" },
      { prop: "name", label: "插件名称", minWidth: 140, showOverflowTooltip: true },
      { prop: "code", label: "插件编码", minWidth: 120, showOverflowTooltip: true },
      { prop: "version", label: "版本", width: 88 },
      {
        prop: "category",
        label: "分类",
        width: 88,
        formatter: (row: PluginTable) => {
          const map: Record<string, string> = {
            tool: "🛠️ 工具",
            ai: "🤖 AI",
            monitor: "📊 监控",
            business: "💼 业务",
          };
          return (row.category && map[row.category]) || row.category || "—";
        },
      },
      {
        prop: "price",
        label: "价格",
        width: 88,
        formatter: (row: PluginTable) =>
          row.price === 0 ? "免费" : "¥" + ((row.price ?? 0) / 100).toFixed(2),
      },
      {
        prop: "status",
        label: "状态",
        width: 88,
        formatter: (row: PluginTable) =>
          h(ElTag, { type: row.status === "0" ? "success" : "danger" }, () =>
            row.status === "0" ? "启用" : "停用"
          ),
      },
      {
        prop: "installed",
        label: "安装状态",
        width: 96,
        formatter: (row: PluginTable) =>
          h(ElTag, { type: row.installed ? "success" : "info" }, () =>
            row.installed ? "已安装" : "未安装"
          ),
      },
      { prop: "author", label: "作者", width: 100, showOverflowTooltip: true },
      { prop: "description", label: "描述", minWidth: 160, showOverflowTooltip: true },
      { prop: "created_time", label: "创建时间", width: 168, showOverflowTooltip: true },
      { prop: "updated_time", label: "更新时间", width: 168, showOverflowTooltip: true },
      {
        prop: "operation",
        label: "操作",
        width: 220,
        fixed: "right",
        align: "right",
        formatter: (row: PluginTable) => formatPluginOperationCell(row, opCtx),
      },
    ],
  },
});

async function handleSearchBarSearch(params: PluginSearchForm) {
  replaceSearchParams(normalizePluginQuery(params as unknown as Record<string, unknown>) as any);
  await getData();
}

function onResetSearch() {
  resetSearchParams();
  getData();
}

// ─── 对话框状态 ───
const { dialogVisible } = useCrudDialog();

const detailFormData = ref<PluginTable>({} as PluginTable);

const pluginDetailItems = [
  { label: "插件名称", prop: "name" },
  { label: "插件编码", prop: "code" },
  { label: "版本", prop: "version" },
  { label: "分类", prop: "category" },
  { label: "作者", prop: "author" },
  { label: "状态", prop: "status", slot: "status" },
  { label: "价格", prop: "price", slot: "price" },
  { label: "排序", prop: "sort" },
  { label: "菜单路径", prop: "menu_path" },
  { label: "权限前缀", prop: "permission_prefix" },
  { label: "依赖插件", prop: "dependencies" },
  { label: "描述", prop: "description", span: 4 },
];

const formData = ref<PluginForm>({
  name: undefined,
  code: undefined,
  category: "tool",
  version: "1.0.0",
  status: "0",
  price: 0,
  sort: 0,
  description: undefined,
  author: undefined,
  icon: undefined,
  menu_path: undefined,
  permission_prefix: undefined,
  dependencies: undefined,
});

const initialFormData: PluginForm = { ...formData.value };
const pluginFormRenderKey = ref(0);
const dataFormRef = ref<any>(null);

const rules = {
  name: [{ required: true, message: "请输入插件名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入插件编码", trigger: "blur" }],
  category: [{ required: true, message: "请选择分类", trigger: "change" }],
};

const pluginDialogFormItems: FormItem[] = [
  {
    label: "插件名称",
    key: "name",
    type: "input",
    span: 12,
    props: { placeholder: "请输入插件名称", clearable: true },
  },
  {
    label: "插件编码",
    key: "code",
    type: "input",
    span: 12,
    props: { placeholder: "请输入插件编码", clearable: true },
  },
  {
    label: "分类",
    key: "category",
    type: "select",
    span: 12,
    props: { options: categoryOptions.value, placeholder: "请选择分类", clearable: true },
  },
  {
    label: "版本",
    key: "version",
    type: "input",
    span: 12,
    props: { placeholder: "版本号", clearable: true },
  },
  {
    label: "作者",
    key: "author",
    type: "input",
    span: 12,
    props: { placeholder: "请输入作者", clearable: true },
  },
  {
    label: "图标URL",
    key: "icon",
    type: "input",
    span: 12,
    props: { placeholder: "图标URL", clearable: true },
  },
  {
    label: "价格(分)",
    key: "price",
    type: "input-number",
    span: 12,
    props: { min: 0, placeholder: "0=免费" },
  },
  { label: "排序", key: "sort", type: "input-number", span: 12, props: { min: 0 } },
  {
    label: "菜单路径",
    key: "menu_path",
    type: "input",
    span: 12,
    props: { placeholder: "安装后的菜单路径", clearable: true },
  },
  {
    label: "权限前缀",
    key: "permission_prefix",
    type: "input",
    span: 12,
    props: { placeholder: "权限前缀", clearable: true },
  },
  {
    label: "依赖插件",
    key: "dependencies",
    type: "textarea",
    span: 24,
    props: { placeholder: "依赖插件编码(JSON数组)", rows: 2 },
  },
  {
    label: "描述",
    key: "description",
    type: "textarea",
    span: 24,
    props: { placeholder: "请输入描述", rows: 3 },
  },
];

const { submitLoading, handleCloseDialog, handleOpenDialog, handleSubmit } =
  useCrudForm<PluginForm>({
    formData,
    initialFormData,
    dialogVisible,
    dataFormRef,
    formRenderKey: pluginFormRenderKey,
    detailApi: PluginAPI.detail as any,
    createApi: PluginAPI.create,
    updateApi: PluginAPI.update,
    titles: { create: "新增插件", update: "编辑插件", detail: "插件详情" },
    detailFormData,
    onCreateSuccess: async () => {
      await refreshCreate();
    },
    onUpdateSuccess: async () => {
      await refreshUpdate();
    },
    onSubmitSuccess: async () => {
      await refreshData();
    },
  });
</script>
