<!-- 菜单权限树表：搜索 + 展开/收起 + 父子联动 + 树形勾选 -->
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <div class="mb-3 flex items-center gap-3 shrink-0">
      <ElInput
        v-model="filterText"
        placeholder="搜索菜单名称"
        clearable
        class="menu-tree-search-input"
        :prefix-icon="Search"
        size="small"
      />
      <ElButton type="primary" size="small" plain @click="toggleExpand">
        <template #icon><SwitchIcon /></template>
        {{ isExpanded ? "收起" : "展开" }}
      </ElButton>
      <ElCheckbox v-model="parentChildLinked"> 父子联动 </ElCheckbox>
    </div>

    <ElTable
      ref="permTableRef"
      v-loading="loading"
      :data="tableData"
      row-key="id"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      :default-expand-all="true"
      class="flex-1 min-h-0"
      @selection-change="onSelectionChange"
      @select="(selection, row) => onSelect(selection as MenuTreeNode[], asMenuNode(row))"
      @select-all="onSelectAll"
    >
      <ElTableColumn type="selection" width="48" />
      <ElTableColumn
        prop="name"
        label="菜单名称"
        width="220"
        show-overflow-tooltip
        :formatter="(row) => formatMenuName(asMenuNode(row))"
      />
      <ElTableColumn label="功能权限">
        <template #default="{ row }">
          <ElCheckboxGroup
            v-model="checkedBtns[row.id]"
            class="flex flex-wrap gap-x-3"
            @change="(val: CheckboxValueType[]) => onBtnChange(asMenuNode(row), val)"
          >
            <ElCheckbox
              v-for="btn in getMenuBtns(asMenuNode(row))"
              :key="btn.id"
              :value="btn.id"
              :label="btn.name"
            />
          </ElCheckboxGroup>
        </template>
      </ElTableColumn>
    </ElTable>
  </div>
</template>

<script setup lang="ts">
import { Search, Switch as SwitchIcon } from "@element-plus/icons-vue";
import type { CheckboxValueType } from "element-plus";
import { useMenuTreeTable, type MenuTreeNode } from "./composables/useMenuTreeTable";

defineOptions({ name: "FaMenuTreeTable" });

interface Props {
  menuTree: MenuTreeNode[];
  checkedIds?: number[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  checkedIds: () => [],
});

/** ElTable 的插槽行类型较宽松，在边界处收敛为菜单节点。 */
const asMenuNode = (row: unknown) => row as MenuTreeNode;

const {
  filterText,
  isExpanded,
  parentChildLinked,
  permTableRef,
  tableData,
  checkedBtns,
  formatMenuName,
  getMenuBtns,
  onSelectionChange,
  onSelectAll,
  onSelect,
  onBtnChange,
  toggleExpand,
  getCheckedIds,
  refresh,
} = useMenuTreeTable(props);

defineExpose({ getCheckedIds, refresh });
</script>

<style scoped lang="scss">
.menu-tree-search-input {
  width: 320px;
}
</style>
