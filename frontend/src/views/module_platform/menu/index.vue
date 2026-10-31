<!-- 菜单管理：Art + 树形表格；操作列最多 3 个外露，其余「更多」 -->
<template>
  <div class="fa-full-height management-page">
    <FaPageHeader
      title="菜单管理"
      description="按目录组织菜单、页面和操作按钮，保持导航与权限一致。"
    >
      <template #actions>
        <ElButton
          :aria-expanded="showSearchBar"
          aria-controls="menu-filters"
          @click="showSearchBar = !showSearchBar"
        >
          {{ showSearchBar ? "收起筛选" : "展开筛选" }}
        </ElButton>
        <ElButton :loading="loading" @click="loadMenuData">刷新列表</ElButton>
      </template>
    </FaPageHeader>
    <div class="fa-management-page">
      <FaSearchBar
        id="menu-filters"
        v-show="showSearchBar"
        ref="searchBarRef"
        v-model="searchForm"
        :items="menuSearchItems"
        :rules="searchBarRules"
        :is-expand="false"
        :show-expand="true"
        :show-reset="true"
        :show-search="true"
        :disabled-search="false"
        :default-expanded="false"
        include-audit
        @search="handleSearchBarSearch"
        @reset="onResetSearch"
      />

      <ElCard
        shadow="never"
        class="fa-table-card"
        :style="{ 'margin-top': showSearchBar ? '12px' : '0' }"
      >
        <div class="management-list-heading">
          <h2>菜单结构</h2>
          <span role="status">已选择 {{ selectedIds.length }} 项</span>
        </div>
        <FaTableHeader
          v-model:columns="columnChecks"
          layout="size,fullscreen,columns,rowDrag,settings"
          :loading="loading"
        >
          <template #left>
            <div class="inline-flex flex-wrap items-center gap-2">
              <FaTableHeaderLeft
                :remove-ids="selectedIds"
                :perm-create="['module_platform:menu:create']"
                :perm-delete="['module_platform:menu:delete']"
                :perm-patch="['module_platform:menu:patch']"
                :delete-loading="batchDeleting"
                :create-loading="createLoading"
                :more-loading="moreLoading"
                @add="handleAdd"
                @delete="handleBatchDelete"
                @more="handleMoreClick"
              />
              <ElButton :aria-expanded="isExpanded" @click="toggleExpand" v-ripple>{{
                isExpanded ? "收起全部" : "展开全部"
              }}</ElButton>
            </div>
          </template>
        </FaTableHeader>

        <ElAlert
          v-if="loadError && tableData.length"
          class="management-load-error"
          title="菜单加载失败，当前显示上次结果"
          :closable="false"
          type="error"
          show-icon
        >
          <p>{{ loadError.message }}</p>
          <ElButton :loading="loading" @click="loadMenuData">重试</ElButton>
        </ElAlert>
        <FaTable
          ref="tableRef"
          row-key="id"
          :loading="loading"
          :error="loadError"
          :columns="displayColumns"
          :data="tableData"
          :scrollbar-tabindex="0"
          empty-text="暂无匹配菜单，请调整筛选条件"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          :default-expand-all="false"
          @retry="loadMenuData"
          @selection-change="onTableSelectionChange"
          @row-click="handleRowClick"
        />
      </ElCard>

      <FaDrawer
        v-model="dialogVisible.visible"
        :title="dialogVisible.title"
        :size="drawerSize"
        :form-mode="dialogVisible.type"
        :confirm-loading="submitLoading"
        :confirm-text="dialogVisible.type === 'detail' ? '关闭' : '保存菜单'"
        @cancel="handleCloseDialog"
        @confirm="dialogVisible.type === 'detail' ? handleCloseDialog() : handleSubmit()"
      >
        <!-- 详情 -->
        <template v-if="dialogVisible.type === 'detail'">
          <FaDescriptions
            :column="isCompact ? 2 : 4"
            :data="detailFormData"
            :items="menuDetailItems"
            :scrollbar="false"
          >
            <template #type="{ row }">
              <FaStatusTag v-if="row?.type === MenuTypeEnum.CATALOG" type="warning" label="目录" />
              <FaStatusTag v-if="row?.type === MenuTypeEnum.MENU" type="success" label="菜单" />
              <FaStatusTag v-if="row?.type === MenuTypeEnum.BUTTON" type="danger" label="按钮" />
              <FaStatusTag v-if="row?.type === MenuTypeEnum.EXTLINK" type="info" label="外链" />
            </template>
            <template #icon="{ row }">
              <template v-if="row?.icon">
                <FaMenuRouteIcon :icon="row?.icon as string" :style="'vertical-align: -0.15em'" />
              </template>
            </template>
          </FaDescriptions>
        </template>

        <!-- 新增、编辑表单 -->
        <template v-else>
          <FaForm
            :key="menuFormRenderKey"
            ref="dataFormRef"
            v-model="formData"
            :items="menuDialogFormItems"
            :rules="rules"
            label-suffix=":"
            :label-width="100"
            :label-position="isCompact ? 'top' : 'right'"
            :span="12"
            :gutter="16"
            :show-reset="false"
            :show-submit="false"
            class="crud-dialog-art-form management-form"
          >
            <!-- 父级菜单(条件显示) -->
            <template #parent_id>
              <ElTreeSelect
                v-model="formData.parent_id"
                placeholder="选择上级菜单"
                :data="menuOptions"
                node-key="value"
                filterable
                check-strictly
                :render-after-expand="false"
                :disabled="createParentLocked"
              />
              <ElText v-if="createParentLocked" type="info" size="small" class="block mt-1">
                在菜单下仅可新增按钮，父级已固定
              </ElText>
            </template>

            <!-- 菜单类型(动态枚举按钮组) -->
            <template #type>
              <ElRadioGroup v-model="formData.type" @change="handleMenuTypeChange">
                <ElRadio
                  v-if="allowedMenuTypeValues.includes(MenuTypeEnum.CATALOG)"
                  :value="MenuTypeEnum.CATALOG"
                >
                  目录
                </ElRadio>
                <ElRadio
                  v-if="allowedMenuTypeValues.includes(MenuTypeEnum.MENU)"
                  :value="MenuTypeEnum.MENU"
                >
                  菜单
                </ElRadio>
                <ElRadio
                  v-if="allowedMenuTypeValues.includes(MenuTypeEnum.BUTTON)"
                  :value="MenuTypeEnum.BUTTON"
                >
                  按钮
                </ElRadio>
                <ElRadio
                  v-if="allowedMenuTypeValues.includes(MenuTypeEnum.EXTLINK)"
                  :value="MenuTypeEnum.EXTLINK"
                >
                  外链
                </ElRadio>
              </ElRadioGroup>
            </template>

            <!-- 外链地址 -->
            <template #link>
              <ElInput v-model="formData.link" placeholder="请输入外链完整路径" />
            </template>

            <!-- 嵌入iframe -->
            <template #is_iframe>
              <ElRadioGroup v-model="formData.is_iframe">
                <ElRadio :value="true">是</ElRadio>
                <ElRadio :value="false">否</ElRadio>
              </ElRadioGroup>
            </template>

            <!-- 路由名称 -->
            <template #route_name>
              <ElInput v-model="formData.route_name" placeholder="请输入路由名称" />
            </template>

            <!-- 路由路径 -->
            <template #route_path>
              <ElInput v-model="formData.route_path" placeholder="请输入路由路径，如 system" />
            </template>

            <!-- 组件路径 -->
            <template #component_path>
              <ElInput
                v-model="formData.component_path"
                placeholder="请输入组件路径，如system/user/index"
                :style="'width: 95%'"
              >
                <template #prepend>src/views/</template>
                <template #append>.vue</template>
              </ElInput>
            </template>

            <!-- 激活菜单路径 -->
            <template #active_path>
              <ElInput
                v-model="formData.active_path"
                placeholder="请输入激活菜单路径，用于高亮父级菜单"
              />
            </template>

            <!-- 是否隐藏 -->
            <template #hidden>
              <ElRadioGroup v-model="formData.hidden">
                <ElRadio :value="true">是</ElRadio>
                <ElRadio :value="false">否</ElRadio>
              </ElRadioGroup>
            </template>

            <!-- 缓存页面 -->
            <template #keep_alive>
              <ElRadioGroup v-model="formData.keep_alive">
                <ElRadio :value="true">开启</ElRadio>
                <ElRadio :value="false">关闭</ElRadio>
              </ElRadioGroup>
            </template>

            <!-- 权限标识 -->
            <template #permission>
              <ElInput v-model="formData.permission" placeholder="请输入权限标识，如sys:user:add" />
            </template>

            <!-- 图标 -->
            <template #icon>
              <FaIconSelect v-model="formData.icon" />
            </template>

            <!-- 重定向(动态placeholder) -->
            <template #redirect>
              <ElInput
                v-model="formData.redirect"
                :placeholder="
                  formData.type === MenuTypeEnum.CATALOG
                    ? '目录必填，一般为默认子路由 path，如 /system/user'
                    : '可选，请输入重定向路由'
                "
              />
            </template>

            <!-- 常驻标签栏 -->
            <template #affix>
              <ElRadioGroup v-model="formData.affix">
                <ElRadio :value="true">是</ElRadio>
                <ElRadio :value="false">否</ElRadio>
              </ElRadioGroup>
            </template>

            <!-- 隐藏标签页 -->
            <template #is_hide_tab>
              <ElRadioGroup v-model="formData.is_hide_tab">
                <ElRadio :value="true">是</ElRadio>
                <ElRadio :value="false">否</ElRadio>
              </ElRadioGroup>
            </template>

            <!-- 显示红点角标 -->
            <template #show_badge>
              <ElRadioGroup v-model="formData.show_badge">
                <ElRadio :value="true">是</ElRadio>
                <ElRadio :value="false">否</ElRadio>
              </ElRadioGroup>
            </template>

            <!-- 文字角标内容 -->
            <template #show_text_badge>
              <ElInput v-model="formData.show_text_badge" placeholder="请输入文字角标内容" />
            </template>
          </FaForm>
        </template>
      </FaDrawer>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useWindowSize } from "@vueuse/core";
import FaPageHeader from "@/components/layouts/fa-page-header/index.vue";
import { MenuTypeEnum } from "@/enums/system/menu.enum";
import type { ColumnOption } from "@/types/component";
import type { MenuTable } from "@/api/module_platform/menu";
import { menuDetailItems } from "./config/menuDetailItems";
import { useMenuColumns } from "./config/menuColumns";
import { useMenuManagement } from "./composables/useMenuManagement";

defineOptions({
  name: "SysMenu",
  inheritAttrs: false,
});

const { width } = useWindowSize();
const isCompact = computed(() => width.value <= 640);

const {
  searchForm,
  showSearchBar,
  searchBarRef,
  searchBarRules,
  menuSearchItems,
  handleSearchBarSearch,
  onResetSearch,
  tableRef,
  tableData,
  loading,
  loadError,
  isExpanded,
  selectedIds,
  toggleExpand,
  loadMenuData,
  onTableSelectionChange,
  handleRowClick,
  batchDeleting,
  createLoading,
  moreLoading,
  handleAdd,
  handleBatchDelete,
  handleMoreClick,
  submitLoading,
  formData,
  detailFormData,
  menuDialogFormItems,
  menuOptions,
  createParentLocked,
  dialogVisible,
  drawerSize,
  dataFormRef,
  menuFormRenderKey,
  rules,
  allowedMenuTypeValues,
  handleMenuTypeChange,
  handleCloseDialog,
  handleSubmit,
  opCtx,
} = useMenuManagement();

const { columnChecks, columns } = useMenuColumns(opCtx);

const displayColumns = computed(() =>
  isCompact.value
    ? columns.value.map((column: ColumnOption<MenuTable>) => ({ ...column, fixed: undefined }))
    : columns.value
);
</script>

<style scoped lang="scss">
.management-page {
  min-width: 0;

  :deep(.data-table__toolbar--left .el-space) {
    flex-wrap: wrap;
  }

  :deep(.data-table__toolbar--left .el-button--primary.is-plain) {
    --el-button-text-color: var(--el-color-white);
    --el-button-bg-color: var(--el-color-primary);
    --el-button-hover-text-color: var(--el-color-white);
    --el-button-hover-bg-color: var(--el-color-primary-dark-2);
  }

  :deep(.data-table__toolbar--left .el-button--success),
  :deep(.data-table__toolbar--left .el-button--warning) {
    --el-button-text-color: var(--fa-color-text);
    --el-button-bg-color: var(--fa-color-surface);
    --el-button-border-color: var(--fa-color-border);
  }

  :deep(button:focus-visible) {
    outline: 2px solid var(--el-color-primary);
    outline-offset: 2px;
  }
}

.management-list-heading {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fa-space-2);
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--fa-space-4);

  h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--fa-color-text);
  }

  span {
    font-size: 13px;
    color: var(--fa-color-text-muted);
  }
}

@media (width <= 640px) {
  .management-page {
    :deep(.el-button + .el-button) {
      margin-left: 0;
    }
  }

  .management-form :deep(.el-radio),
  .management-form :deep(.el-checkbox) {
    min-height: 44px;
  }
}

.management-load-error {
  margin-bottom: var(--fa-space-4);
}

:deep(.menu-table-actions .inline-flex) {
  vertical-align: middle;
}
</style>
