<!-- 角色授权 -->
<template>
  <FaDrawer
    v-model="drawerVisible"
    :title="'【' + props.roleName + '】权限分配'"
    :size="drawerSize"
    destroy-on-close
    @close="handleCancel"
  >
    <div class="drawer-perm-content flex flex-col flex-1 overflow-hidden">
      <ElContainer class="h-full min-h-0 flex-1">
        <!-- 数据权限 -->
        <ElAside>
          <div
            class="border-r border-r-(--el-border-color-lighter) b-r-solid h-full p-[20px] box-border"
          >
            <div class="flex items-center">
              <div class="flex gap-[10px]">
                <div class="w-[10px] bg-(--el-color-primary)"></div>
                <div>
                  <span class="text-[16px]">数据授权</span>
                  <ElTooltip placement="right">
                    <template #content>
                      <span>授权用户可操作的数据范围</span>
                    </template>
                    <ElIcon class="ml-1 inline-block cursor-pointer">
                      <QuestionFilled />
                    </ElIcon>
                  </ElTooltip>
                </div>
              </div>
            </div>
            <div class="mt-3">
              <ElForm ref="dataFormRef" :model="permissionState">
                <ElFormItem prop="data_scope">
                  <ElSelect v-model="permissionState.data_scope">
                    <ElOption :key="1" label="仅本人数据权限" :value="1" />
                    <ElOption :key="2" label="本部门数据权限" :value="2" />
                    <ElOption :key="3" label="本部门及以下数据权限" :value="3" />
                    <ElOption :key="4" label="全部数据权限" :value="4" />
                    <ElOption :key="5" label="自定义数据权限" :value="5" />
                  </ElSelect>
                </ElFormItem>
              </ElForm>

              <div
                v-if="permissionState.data_scope === 5 && deptTreeData.length"
                class="mt-5 max-h-[72vh] b-1 b-solid b-[var(--el-border-color-lighter)] p-10px overflow-auto box-border"
              >
                <ElInput v-model="deptFilterText" placeholder="部门名称" />
                <ElTree
                  ref="deptTreeRef"
                  node-key="value"
                  show-checkbox
                  :data="deptTreeData"
                  :filter-node-method="handleFilter"
                  default-expand-all
                  :highlight-current="true"
                  :check-strictly="!parentChildLinked"
                  :style="'height: calc(100% - 60px); margin-top: 10px; overflow-y: auto'"
                  @check="deptTreeCheck"
                >
                  <template #empty>
                    <ElEmpty :image-size="80" description="暂无数据" />
                  </template>
                </ElTree>
              </div>
            </div>
          </div>
        </ElAside>

        <!-- 菜单权限 -->
        <ElMain>
          <div class="flex gap-[10px]">
            <div class="w-[10px] bg-(--el-color-primary)"></div>
            <div>
              <span class="text-[16px]">菜单授权</span>
              <ElTooltip placement="right">
                <template #content>
                  <span>勾选菜单和对应的功能按钮权限</span>
                </template>
                <ElIcon class="ml-1 inline-block cursor-pointer">
                  <QuestionFilled />
                </ElIcon>
              </ElTooltip>
            </div>
          </div>
          <div class="mt-3 flex items-center gap-3">
            <ElInput v-model="permFilterText" placeholder="菜单名称" class="flex-1" />
            <ElButton type="primary" size="small" plain @click="togglePermTree">
              <template #icon>
                <SwitchIcon />
              </template>
              {{ isExpanded ? "收缩" : "展开" }}
            </ElButton>
            <ElCheckbox v-model="parentChildLinked">
              父子联动
            </ElCheckbox>
            <ElTooltip placement="bottom">
              <template #content> 勾选父级菜单时自动勾选所有子菜单 </template>
              <ElIcon class="color-[--el-color-primary] inline-block cursor-pointer">
                <QuestionFilled />
              </ElIcon>
            </ElTooltip>
          </div>

          <!-- 菜单树表 -->
          <div class="mt-3 b-1 b-solid b-[var(--el-border-color-lighter)] rounded-lg">
            <ElTable
              ref="permTableRef"
              :data="tableData"
              row-key="id"
              :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
              :default-expand-all="true"
              max-height="72vh"
              @selection-change="handleSelectionChange"
              @select="handleSelect"
              @select-all="handleSelectAll"
            >
              <ElTableColumn type="selection" width="48" />
              <ElTableColumn
                prop="name"
                label="菜单名称"
                width="200"
                show-overflow-tooltip
                :formatter="formatMenuName"
              />
              <ElTableColumn label="功能权限" min-width="400">
                <template #default="{ row }">
                  <ElCheckboxGroup
                    v-model="checkedBtns[row.id]"
                    class="flex flex-wrap gap-x-3"
                    @change="(val) => handleBtnChange(row, val)"
                  >
                    <ElCheckbox
                      v-for="btn in getMenuBtns(row)"
                      :key="btn.id"
                      :value="btn.id"
                      :label="btn.name"
                    />
                  </ElCheckboxGroup>
                </template>
              </ElTableColumn>
            </ElTable>
          </div>
        </ElMain>
      </ElContainer>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="handleCancel">取 消</ElButton>
        <ElButton type="primary" :loading="loading" @click.stop="handleDrawerSave">确 定</ElButton>
      </div>
    </template>
  </FaDrawer>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick, h } from "vue";
import { QuestionFilled, Switch as SwitchIcon } from "@element-plus/icons-vue";
import type { TreeInstance, TableInstance, CheckboxValueType } from "element-plus";
import FaDrawer from "@/components/modal/fa-drawer/index.vue";
import FaMenuRouteIcon from "@/components/others/fa-menu-routeIcon/index.vue";
import { listToTree, formatTree } from "@utils";
import RoleAPI, { permissionDataType, permissionDeptType } from "@/api/module_system/role";
import DeptAPI from "@/api/module_system/dept";
import MenuAPI, { MenuTable } from "@/api/module_system/menu";
import { DeviceEnum } from "@/enums/settings/device.enum";
import { useAppStore, useUserStore } from "@stores";
import { ElMessage } from "element-plus";

const props = defineProps<{
  roleName: string;
  roleId: number;
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [v: boolean];
  saved: [];
}>();

const appStore = useAppStore();
const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "1600px" : "90%"));

const drawerVisible = computed({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
    emit("update:modelValue", value);
  },
});

const deptTreeRef = ref<TreeInstance>();
const deptFilterText = ref("");
const permFilterText = ref("");
const dataFormRef = ref();
const isExpanded = ref(true);
const parentChildLinked = ref(false);
/** 防止 toggleRowSelection 触发 @select 递归级联 */
const isHandlingCascade = ref(false);
const loading = ref(false);
const deptTreeData = ref<permissionDeptType[]>([]);
const rawMenuTree = ref<MenuTable[]>([]);
const tableData = ref<MenuTable[]>([]);
const permTableRef = ref<TableInstance>();
const checkedBtns = ref<Record<number, number[]>>({});
/** 跟踪选中的菜单 ID */
const selectedMenuIds = ref<Set<number>>(new Set());

/** 菜单类型枚举: 1=目录, 2=菜单, 3=按钮/权限, 4=链接 */
const DIR_TYPE = 1;
const MENU_TYPE = 2;
const BTN_TYPE = 3;
const LINK_TYPE = 4;

// 功能权限类型（按钮+链接）
const PERM_TYPES = [BTN_TYPE, LINK_TYPE];

/** 判断是否是功能权限类型（按钮或链接） */
function isPermType(type: number | undefined): boolean {
  return type != null && PERM_TYPES.includes(type);
}

/** 过滤按钮，只保留目录+菜单作为树表行数据 */
function filterTableData(nodes: MenuTable[]): MenuTable[] {
  return nodes
    .filter((n) => n.type === DIR_TYPE || n.type === MENU_TYPE)
    .map((n) => ({
      ...n,
      children: n.children ? filterTableData(n.children) : undefined,
    }));
}

function formatMenuName(row: MenuTable): string | ReturnType<typeof h> {
  const name = row.name || "";
  if (row.icon) {
    return h("span", { class: "inline-flex items-center gap-1.5" }, [
      h(FaMenuRouteIcon, { icon: row.icon, style: { verticalAlign: "-0.15em" } }),
      name,
    ]);
  }
  return name;
}

/** 获取某菜单下的功能按钮 */
function getMenuBtns(row: MenuTable): MenuTable[] {
  const fullNode = findRawNode(row.id!, rawMenuTree.value);
  if (!fullNode?.children) return [];
  return (fullNode.children as MenuTable[]).filter((c: MenuTable) => isPermType(c.type as number));
}

/** 处理按钮勾选变化 */
function handleBtnChange(row: MenuTable, val: CheckboxValueType[]) {
  checkedBtns.value[row.id!] = val.map((v) => Number(v));
  if (!parentChildLinked.value) return;

  withCascadeGuard(() => {
    if (val.length > 0) {
      permTableRef.value?.toggleRowSelection(row, true);
      selectAncestors(row);
    } else if (!hasAnySelectedDescendant(row)) {
      permTableRef.value?.toggleRowSelection(row, false);
      deselectAncestorsIfNeeded(row);
    }
  });
}

/** 检查某菜单是否有任何选中的子孙（包括子孙菜单和按钮） */
function hasAnySelectedDescendant(node: MenuTable): boolean {
  // 检查当前节点是否有选中的按钮
  if (checkedBtns.value[node.id!]?.length > 0) {
    return true;
  }
  
  // 检查子菜单
  const tableNode = findTableNode(node.id!, tableData.value);
  if (tableNode?.children) {
    for (const child of tableNode.children) {
      if ((child.type === MENU_TYPE || child.type === DIR_TYPE) && hasAnySelectedDescendant(child)) {
        return true;
      }
    }
  }
  
  return false;
}

/** 递归获取所有祖先节点（必须是菜单或目录类型） */
function findAncestors(nodeId: number, nodes: any[]): any[] {
  for (const node of nodes) {
    if ((node.type === DIR_TYPE || node.type === MENU_TYPE) && node.children) {
      const childIndex = node.children.findIndex((c: any) => c.id === nodeId);
      if (childIndex !== -1) {
        // 从 tableData 中获取正确的节点引用
        const tableNode = findTableNode(node.id!, tableData.value);
        // 继续向上查找当前节点的祖先
        const parentAncestors = findAncestors(node.id!, rawMenuTree.value);
        if (tableNode) {
          return [tableNode, ...parentAncestors];
        }
        return parentAncestors;
      }
      const ancestors = findAncestors(nodeId, node.children);
      if (ancestors.length > 0) {
        return ancestors;
      }
    }
  }
  return [];
}

/** 处理表格选中行变化 */
function handleSelectionChange() {
  const selection = (permTableRef.value as any)?.store?.states?.selection?.value || [];
  const newSelected = new Set<number>();
  selection.forEach((row: MenuTable) => {
    if (row.type === DIR_TYPE || row.type === MENU_TYPE) {
      newSelected.add(row.id!);
    }
  });
  selectedMenuIds.value = newSelected;

  // 当没有任何菜单行被选中时，清空所有功能按钮状态
  // 作为安全网：覆盖 @select-all 事件可能无法触发取消全选逻辑的场景
  if (newSelected.size === 0) {
    checkedBtns.value = {};
  }
}

/** 处理全选/取消全选 */
function handleSelectAll() {
  const selection = (permTableRef.value as any)?.store?.states?.selection?.value || [];
  withCascadeGuard(() => {
    if (!selection.length) {
      checkedBtns.value = {};
      selectedMenuIds.value.clear();
      return;
    }
    for (const row of selection) {
      if (row.type === DIR_TYPE || row.type === MENU_TYPE) {
        selectedMenuIds.value.add(row.id!);
        if (parentChildLinked.value) collectBtnState(row);
      }
    }
  });
}

function handleSelect(selection: MenuTable[], row: MenuTable) {
  if (isHandlingCascade.value || !parentChildLinked.value) return;

  const tableRow = findTableNode(row.id!, tableData.value);
  if (!tableRow) return;

  const isSelected = selection.some((r) => r.id === tableRow.id);

  withCascadeGuard(() => {
    if (isSelected) {
      selectAncestors(tableRow);
      cascadeSelect(tableRow);
    } else {
      cascadeDeselect(tableRow);
      deselectAncestorsIfNeeded(tableRow);
    }
  });
}

/** 向上检查祖先是否需要取消选中 */
function deselectAncestorsIfNeeded(node: MenuTable) {
  const ancestors = findAncestors(node.id!, rawMenuTree.value);
  ancestors.forEach((ancestor) => {
    const hasSelectedDescendant = hasAnySelectedDescendant(ancestor);
    if (!hasSelectedDescendant) {
      permTableRef.value?.toggleRowSelection(ancestor, false);
    }
  });
}

/** 选中所有祖先菜单行（向上级联） */
function selectAncestors(node: MenuTable) {
  const ancestors = findAncestors(node.id!, rawMenuTree.value);
  ancestors.forEach((ancestor) => {
    permTableRef.value?.toggleRowSelection(ancestor, true);
  });
}

/** 级联选中：选中当前节点及所有子孙菜单，并为每个菜单收集其按钮 */
function cascadeSelect(node: MenuTable) {
  // 先选中当前节点（此时 handleSelect 因 isHandlingCascade 被跳过）
  permTableRef.value?.toggleRowSelection(node, true);
  // 收集当前节点的功能按钮
  collectBtnState(node);

  // 递归处理子节点
  const tableNode = findTableNode(node.id!, tableData.value);
  if (tableNode?.children) {
    for (const child of tableNode.children) {
      if (child.type === MENU_TYPE || child.type === DIR_TYPE) {
        cascadeSelect(child);
      }
    }
  }
}

/** 级联取消：取消当前节点及所有子孙菜单，并清空所有按钮 */
function cascadeDeselect(node: MenuTable) {
  permTableRef.value?.toggleRowSelection(node, false);
  checkedBtns.value[node.id!] = [];

  // 递归处理子节点
  const tableNode = findTableNode(node.id!, tableData.value);
  if (tableNode?.children) {
    for (const child of tableNode.children) {
      if (child.type === MENU_TYPE || child.type === DIR_TYPE) {
        cascadeDeselect(child);
      }
    }
  }
}

/** 收集某个菜单节点的功能按钮到 checkedBtns */
function collectBtnState(node: MenuTable) {
  const ids = getMenuBtns(node).map((b) => b.id!);
  if (ids.length) checkedBtns.value[node.id!] = ids;
}

/** 在 isHandlingCascade 保护下执行操作，防止复选事件递归 */
function withCascadeGuard(fn: () => void) {
  isHandlingCascade.value = true;
  try { fn(); } finally { isHandlingCascade.value = false; }
}

/** 递归遍历树节点并对每个节点执行回调 */
function walkTree(nodes: MenuTable[], fn: (node: MenuTable) => void) {
  for (const node of nodes) {
    fn(node);
    if (node.children) walkTree(node.children, fn);
  }
}

/** 从 tableData 中递归查找节点 */
function findTableNode(id: number, nodes: MenuTable[]): MenuTable | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findTableNode(id, node.children);
      if (found) return found;
    }
  }
  return undefined;
}

/** 从原始树中递归查找节点 */
function findRawNode(id: number, nodes: any[]): any | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findRawNode(id, node.children);
      if (found) return found;
    }
  }
  return undefined;
}

const permissionState = ref<permissionDataType>({
  role_ids: [],
  menu_ids: [],
  data_scope: 1,
  dept_ids: [],
});

const init = async () => {
  loading.value = true;

  try {
    const deptResponse = await DeptAPI.listDept();
    deptTreeData.value = formatTree(listToTree(deptResponse.data.data));

    const menuResponse = await MenuAPI.listMenu();
    const rawTree = menuResponse.data.data || [];
    rawMenuTree.value = rawTree;
    tableData.value = filterTableData(rawTree);

    const roleResponse = await RoleAPI.detailRole(props.roleId);
    const savedMenuIds = roleResponse.data.data.menus?.map((menu) => menu.id) || [];

    permissionState.value = {
      role_ids: [props.roleId],
      menu_ids: savedMenuIds,
      data_scope: roleResponse.data.data.data_scope || 1,
      dept_ids: roleResponse.data.data.depts?.map((dept) => dept.id) || [],
    };

    parentChildLinked.value = checkParentChildLinked(savedMenuIds, rawMenuTree.value);

    // 设置表格选中状态和按钮选中状态
    await nextTick();
    const btnsState: Record<number, number[]> = {};
    const rowsToSelect: MenuTable[] = [];

    // 从 tableData 中收集需要选中的菜单行（与表格同数据源，确保对象引用一致）
    walkTree(tableData.value, (node) => {
      if ((node.type === DIR_TYPE || node.type === MENU_TYPE) && savedMenuIds.includes(node.id!)) {
        rowsToSelect.push(node);
      }
    });

    // 从原始树中收集功能按钮状态
    walkTree(rawMenuTree.value, (node) => {
      if (node.type !== BTN_TYPE || !savedMenuIds.includes(node.id!)) return;
      const parent = findParentMenu(node.id!, rawMenuTree.value);
      if (parent) {
        (btnsState[parent.id!] ??= []).push(node.id!);
      }
    });

    checkedBtns.value = btnsState;
    withCascadeGuard(() => {
      if (!permTableRef.value) return;
      const store = (permTableRef.value as any)?.store;
      if (!store) return;
      store.clearSelection();
      rowsToSelect.forEach((row) => store.toggleRowSelection(row, true, false));
    });

    if (permissionState.value.data_scope === 5 && deptTreeRef.value) {
      await deptTreeRef.value.setCheckedKeys(permissionState.value.dept_ids);
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    ElMessage.error("获取权限数据失败: " + msg);
  } finally {
    loading.value = false;
  }
};

function handleCancel() {
  drawerVisible.value = false;
}

async function handleDrawerSave() {
  try {
    if (props.roleId === 1) {
      ElMessage.warning("系统默认角色，不可操作");
      return;
    }
    loading.value = true;

    // 收集所有选中的菜单ID和按钮ID
    const allIds = new Set<number>();

    // 使用 selectedMenuIds 获取选中的菜单
    selectedMenuIds.value.forEach((id) => {
      allIds.add(id);
    });

    // 添加选中的按钮
    Object.values(checkedBtns.value).forEach((btnIds) => {
      btnIds.forEach((id) => allIds.add(id));
    });

    const menu_ids = expandMenuIdsWithAncestors([...allIds], rawMenuTree.value);

    const submitData: permissionDataType = {
      role_ids: [props.roleId],
      menu_ids,
      data_scope: permissionState.value.data_scope,
      dept_ids: (deptTreeRef.value?.getCheckedKeys() || []).map((key) => Number(key)),
    };

    await RoleAPI.setPermission(submitData);

    const userStore = useUserStore();
    await userStore.getUserInfo();

    drawerVisible.value = false;
    emit("saved");
  } catch (error: unknown) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

const deptTreeCheck = (checkedIds: number[]) => {
  permissionState.value.dept_ids = checkedIds;
};

function expandAllRows(expanded: boolean) {
  nextTick(() => {
    const el = permTableRef.value;
    if (!el || !tableData.value.length) return;
    walkTree(tableData.value, (row) => {
      if (row.children?.length) el.toggleRowExpansion(row, expanded);
    });
  });
}

function togglePermTree() {
  isExpanded.value = !isExpanded.value;
  expandAllRows(isExpanded.value);
}

watch(deptFilterText, (val) => {
  deptTreeRef.value!.filter(val);
});

watch(permFilterText, (val) => {
  if (val) expandAllRows(true);
});

function handleFilter(value: string, data: { [key: string]: any }) {
  if (!value) return true;
  return data.label?.includes(value);
}

function findParentMenu(menuId: number, menuTreeData: MenuTable[]): MenuTable | null {
  for (const menu of menuTreeData) {
    if (menu.children?.some((child) => child.id === menuId)) return menu;
    if (menu.children) {
      const found = findParentMenu(menuId, menu.children);
      if (found) return found;
    }
  }
  return null;
}

function checkParentChildLinked(menuIds: number[], menuTreeData: MenuTable[]): boolean {
  if (!menuIds.length || !menuTreeData.length) return false;

  const menuMap = new Map<number, MenuTable>();
  const buildMenuMap = (menus: MenuTable[]) => {
    menus.forEach((menu) => {
      menuMap.set(menu.id!, menu);
      if (menu.children) {
        buildMenuMap(menu.children);
      }
    });
  };
  buildMenuMap(menuTreeData);

  let hasParentChildConflict = false;

  for (const menuId of menuIds) {
    const menu = menuMap.get(menuId);
    if (!menu) continue;

    if (menu.children && menu.children.length > 0) {
      const hasUnselectedChildren = menu.children.some((child) => !menuIds.includes(child.id!));
      if (hasUnselectedChildren) {
        hasParentChildConflict = true;
        break;
      }
    }

    const parentMenu = findParentMenu(menuId, menuTreeData);
    if (parentMenu && !menuIds.includes(parentMenu.id!)) {
      hasParentChildConflict = true;
      break;
    }
  }

  return !hasParentChildConflict;
}

function expandMenuIdsWithAncestors(checkedIds: number[], roots: MenuTable[]): number[] {
  const parentById = new Map<number, number | undefined>();
  const walk = (nodes: MenuTable[], parent: number | undefined) => {
    for (const n of nodes) {
      const id = n.id!;
      parentById.set(id, parent);
      if (n.children?.length) walk(n.children as MenuTable[], id);
    }
  };
  walk(roots, undefined);
  const out = new Set<number>();
  for (const id of checkedIds) {
    let cur: number | undefined = id;
    while (cur !== undefined) {
      out.add(cur);
      cur = parentById.get(cur);
    }
  }
  return [...out];
}

onMounted(async () => {
  await init();
});
</script>
