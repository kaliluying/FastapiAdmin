import { ref, watch, nextTick, computed, h } from "vue";
import type { TableInstance, CheckboxValueType } from "element-plus";
import FaMenuRouteIcon from "@/components/others/fa-menu-route-icon/index.vue";

// ---- 类型常量 ----
const DIR_TYPE = 1;
const MENU_TYPE = 2;
const BTN_TYPE = 3;

function isDirOrMenu(type: number | undefined): boolean {
  return type === DIR_TYPE || type === MENU_TYPE;
}

function isPermission(type: number | undefined): boolean {
  return type != null && type >= BTN_TYPE;
}

/** 菜单树节点：仅声明本组合式函数实际读写的字段，其余属性原样透传给表格。 */
export interface MenuTreeNode {
  id: number;
  name?: string;
  type?: number;
  icon?: string;
  children?: MenuTreeNode[];
}

interface MenuTreeTableProps {
  menuTree: MenuTreeNode[];
  checkedIds?: number[];
  loading?: boolean;
}

/** Element Plus 表格实例内部 store 的最小接口（仅用到选中状态与勾选操作）。 */
interface TableStore {
  states?: { selection?: { value: MenuTreeNode[] } };
  clearSelection: () => void;
  toggleRowSelection: (row: MenuTreeNode, selected?: boolean, ignoreSelectable?: boolean) => void;
}

/**
 * 菜单树表格业务逻辑
 * 负责：搜索过滤、级联勾选、父子联动、展开/收起、初始化选中、对外方法
 */
export function useMenuTreeTable(rawProps: MenuTreeTableProps) {
  const props = rawProps;
  // ---- 状态 ----
  const filterText = ref("");
  const isExpanded = ref(true);
  const parentChildLinked = ref(true);
  const isHandlingCascade = ref(false);
  const permTableRef = ref<TableInstance>();
  const tableData = ref<MenuTreeNode[]>([]);
  const checkedBtns = ref<Record<number, number[]>>({});
  const selectedMenuIds = ref<Set<number>>(new Set());

  /** 读取表格实例内部的选中状态（Element Plus 未对外暴露该状态）。 */
  function getTableStore(): TableStore | undefined {
    return (permTableRef.value as unknown as { store?: TableStore } | undefined)?.store;
  }

  // ---- 搜索过滤后的菜单树 ----
  const filteredMenuTree = computed(() =>
    filterText.value ? filterMenuTree(props.menuTree, filterText.value) : props.menuTree
  );

  function filterMenuTree(nodes: MenuTreeNode[], text: string): MenuTreeNode[] {
    if (!text) return nodes;
    const lower = text.toLowerCase();

    function walk(n: MenuTreeNode): MenuTreeNode | null {
      const nameMatch = (n.name || "").toLowerCase().includes(lower);
      const filteredChildren = n.children?.map(walk).filter(Boolean) ?? [];

      if (nameMatch || filteredChildren.length > 0) {
        return {
          ...n,
          children: filteredChildren.length > 0 ? (filteredChildren as MenuTreeNode[]) : n.children,
        };
      }
      return null;
    }

    return nodes.map(walk).filter(Boolean) as MenuTreeNode[];
  }

  // ---- 工具函数 ----
  function walkTree(nodes: MenuTreeNode[], fn: (node: MenuTreeNode) => void) {
    for (const node of nodes) {
      fn(node);
      if (node.children) walkTree(node.children, fn);
    }
  }

  function findRawNode(id: number, nodes: MenuTreeNode[]): MenuTreeNode | undefined {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findRawNode(id, node.children);
        if (found) return found;
      }
    }
    return undefined;
  }

  function findTableNode(id: number, nodes: MenuTreeNode[]): MenuTreeNode | undefined {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findTableNode(id, node.children);
        if (found) return found;
      }
    }
    return undefined;
  }

  function findParentInRawTree(menuId: number, nodes: MenuTreeNode[]): MenuTreeNode | null {
    for (const n of nodes) {
      if (n.children?.some((c) => c.id === menuId)) return n;
      if (n.children) {
        const found = findParentInRawTree(menuId, n.children);
        if (found) return found;
      }
    }
    return null;
  }

  function formatMenuName(row: MenuTreeNode) {
    const name = row.name || "";
    if (row.icon) {
      return h("span", { class: "inline-flex items-center gap-1.5" }, [
        h(FaMenuRouteIcon, { icon: row.icon, style: { verticalAlign: "-0.15em" } }),
        name,
      ]);
    }
    return name;
  }

  function getMenuBtns(row: MenuTreeNode): MenuTreeNode[] {
    const fullNode = findRawNode(row.id, props.menuTree);
    if (!fullNode?.children) return [];
    return fullNode.children.filter((c) => isPermission(c.type));
  }

  function hasAnySelectedDescendant(node: MenuTreeNode): boolean {
    if ((checkedBtns.value[node.id]?.length ?? 0) > 0) return true;
    const tableNode = findTableNode(node.id, tableData.value);
    if (tableNode?.children) {
      for (const child of tableNode.children) {
        if (isDirOrMenu(child.type) && hasAnySelectedDescendant(child)) return true;
      }
    }
    return false;
  }

  function findAncestors(nodeId: number): MenuTreeNode[] {
    function collectAncestorIds(nodes: MenuTreeNode[], target: number): number[] {
      for (const n of nodes) {
        if (n.children?.some((c) => c.id === target)) {
          return [n.id, ...collectAncestorIds(props.menuTree, n.id)];
        }
        if (n.children) {
          const found = collectAncestorIds(n.children, target);
          if (found.length > 0) return found;
        }
      }
      return [];
    }
    return collectAncestorIds(props.menuTree, nodeId)
      .map((id) => findTableNode(id, tableData.value))
      .filter(Boolean) as MenuTreeNode[];
  }

  function filterTableData(nodes: MenuTreeNode[]): MenuTreeNode[] {
    return nodes
      .filter((n) => isDirOrMenu(n.type))
      .map((n) => ({
        ...n,
        children: n.children ? filterTableData(n.children) : undefined,
      }));
  }

  // ---- 级联 ----
  function collectBtnState(node: MenuTreeNode) {
    const ids = getMenuBtns(node).map((b) => b.id);
    if (ids.length) checkedBtns.value[node.id] = ids;
  }

  function cascadeSelect(node: MenuTreeNode) {
    permTableRef.value?.toggleRowSelection(node, true);
    collectBtnState(node);
    const tableNode = findTableNode(node.id, tableData.value);
    if (tableNode?.children) {
      for (const child of tableNode.children) {
        if (isDirOrMenu(child.type)) cascadeSelect(child);
      }
    }
  }

  function cascadeDeselect(node: MenuTreeNode) {
    permTableRef.value?.toggleRowSelection(node, false);
    checkedBtns.value[node.id] = [];
    const tableNode = findTableNode(node.id, tableData.value);
    if (tableNode?.children) {
      for (const child of tableNode.children) {
        if (isDirOrMenu(child.type)) cascadeDeselect(child);
      }
    }
  }

  function selectAncestors(node: MenuTreeNode) {
    findAncestors(node.id).forEach((a) => permTableRef.value?.toggleRowSelection(a, true));
  }

  function deselectAncestorsIfNeeded(node: MenuTreeNode) {
    findAncestors(node.id).forEach((a) => {
      if (!hasAnySelectedDescendant(a)) permTableRef.value?.toggleRowSelection(a, false);
    });
  }

  function withCascadeGuard(fn: () => void) {
    isHandlingCascade.value = true;
    try {
      fn();
    } finally {
      isHandlingCascade.value = false;
    }
  }

  // ---- Table 事件 ----
  function onSelectionChange() {
    const selection = getTableStore()?.states?.selection?.value ?? [];
    const newSelected = new Set<number>();
    selection.forEach((row) => {
      if (isDirOrMenu(row.type)) newSelected.add(row.id);
    });
    selectedMenuIds.value = newSelected;
    if (newSelected.size === 0) checkedBtns.value = {};
  }

  function onSelectAll() {
    const selection = getTableStore()?.states?.selection?.value ?? [];
    withCascadeGuard(() => {
      if (!selection.length) {
        checkedBtns.value = {};
        selectedMenuIds.value.clear();
        return;
      }
      for (const row of selection) {
        if (isDirOrMenu(row.type)) {
          selectedMenuIds.value.add(row.id);
          if (parentChildLinked.value) collectBtnState(row);
        }
      }
    });
  }

  function onSelect(selection: MenuTreeNode[], row: MenuTreeNode) {
    if (isHandlingCascade.value || !parentChildLinked.value) return;
    const tableRow = findTableNode(row.id, tableData.value);
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

  function onBtnChange(row: MenuTreeNode, val: CheckboxValueType[]) {
    checkedBtns.value[row.id] = val.map((v) => Number(v));
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

  // ---- 展开/收起 ----
  function setAllRowsExpanded(expanded: boolean) {
    nextTick(() => {
      const el = permTableRef.value;
      if (!el || !tableData.value.length) return;
      walkTree(tableData.value, (row) => {
        if (row.children?.length) el.toggleRowExpansion(row, expanded);
      });
    });
  }

  function toggleExpand() {
    isExpanded.value = !isExpanded.value;
    setAllRowsExpanded(isExpanded.value);
  }

  // ---- 初始化 ----
  function checkParentChildLinked(ids: number[], nodes: MenuTreeNode[]): boolean {
    if (!ids.length || !nodes.length) return true;
    const idMap = new Map<number, MenuTreeNode>();
    walkTree(nodes, (n) => idMap.set(n.id, n));
    for (const id of ids) {
      const node = idMap.get(id);
      if (!node) continue;
      if (node.children?.length && node.children.some((c) => !ids.includes(c.id))) return false;
      const parent = findParentInRawTree(id, nodes);
      if (parent && !ids.includes(parent.id)) return false;
    }
    return true;
  }

  async function initSelection(ids: number[]) {
    await nextTick();
    const btnsState: Record<number, number[]> = {};
    const rowsToSelect: MenuTreeNode[] = [];

    walkTree(tableData.value, (node) => {
      if (isDirOrMenu(node.type) && ids.includes(node.id)) {
        rowsToSelect.push(node);
      }
    });

    walkTree(props.menuTree, (node) => {
      if (!isPermission(node.type) || !ids.includes(node.id)) return;
      const parent = findParentInRawTree(node.id, props.menuTree);
      if (parent) (btnsState[parent.id] ??= []).push(node.id);
    });

    checkedBtns.value = btnsState;

    withCascadeGuard(() => {
      const store = getTableStore();
      if (!store) return;
      store.clearSelection();
      rowsToSelect.forEach((row) => store.toggleRowSelection(row, true, false));
    });
  }

  // ---- 对外方法 ----
  function getCheckedIds(): number[] {
    const allIds = new Set<number>();
    selectedMenuIds.value.forEach((id) => allIds.add(id));
    Object.values(checkedBtns.value).forEach((btnIds) => btnIds.forEach((id) => allIds.add(id)));
    return [...allIds];
  }

  function refresh() {
    filterText.value = "";
    const tree = props.menuTree;
    parentChildLinked.value = checkParentChildLinked(props.checkedIds ?? [], tree);
    tableData.value = filterTableData(tree);
    nextTick(() => initSelection(props.checkedIds ?? []));
  }

  // ---- 数据变化监听 ----
  watch(
    () => [props.menuTree, props.checkedIds] as const,
    () => refresh(),
    { immediate: false }
  );

  watch(filterText, () => {
    const tree = filteredMenuTree.value;
    tableData.value = filterTableData(tree);
    nextTick(() => initSelection(props.checkedIds ?? []));
    if (filterText.value) setAllRowsExpanded(true);
  });

  return {
    // 状态
    filterText,
    isExpanded,
    parentChildLinked,
    permTableRef,
    tableData,
    checkedBtns,
    // 工具
    formatMenuName,
    getMenuBtns,
    // 事件
    onSelectionChange,
    onSelectAll,
    onSelect,
    onBtnChange,
    toggleExpand,
    // 对外方法
    getCheckedIds,
    refresh,
  };
}
