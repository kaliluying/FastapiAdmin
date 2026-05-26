import { describe, it, expect, beforeEach } from "vitest";

/* ============================================================
   测试数据：与组件中 MenuTable 结构一致
   ============================================================ */
const DIR_TYPE = 1;
const MENU_TYPE = 2;
const BTN_TYPE = 3;
const LINK_TYPE = 4;
const PERM_TYPES = [BTN_TYPE, LINK_TYPE];

type MenuTable = {
  id?: number;
  name?: string;
  type?: number;
  icon?: string;
  children?: MenuTable[];
  [key: string]: any;
};

function isPermType(type: number | undefined): boolean {
  return type != null && PERM_TYPES.includes(type);
}

function filterTableData(nodes: MenuTable[]): MenuTable[] {
  return nodes
    .filter((n) => n.type === DIR_TYPE || n.type === MENU_TYPE)
    .map((n) => ({
      ...n,
      children: n.children ? filterTableData(n.children) : undefined,
    }));
}

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

function findAncestors(nodeId: number, nodes: any[]): any[] {
  for (const node of nodes) {
    if ((node.type === DIR_TYPE || node.type === MENU_TYPE) && node.children) {
      const childIndex = node.children.findIndex((c: any) => c.id === nodeId);
      if (childIndex !== -1) {
        const tableNode = findTableNode(node.id!, mockTableData);
        const parentAncestors = findAncestors(node.id!, mockRawTree);
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

function getMenuBtns(row: MenuTable, rawTree: MenuTable[]): MenuTable[] {
  const fullNode = findRawNode(row.id!, rawTree);
  if (!fullNode?.children) return [];
  return (fullNode.children as MenuTable[]).filter((c) => isPermType(c.type));
}

function findParentMenu(menuId: number, menuTreeData: MenuTable[]): MenuTable | null {
  for (const menu of menuTreeData) {
    if (menu.children) {
      for (const child of menu.children) {
        if (child.id === menuId) return menu;
        const found = findParentMenu(menuId, [child]);
        if (found) return found;
      }
    }
  }
  return null;
}

function hasAnySelectedDescendant(
  node: MenuTable,
  checkedBtns: Record<number, number[]>,
  tableData: MenuTable[],
): boolean {
  if (checkedBtns[node.id!]?.length > 0) return true;
  const tableNode = findTableNode(node.id!, tableData);
  if (tableNode?.children) {
    for (const child of tableNode.children) {
      if ((child.type === MENU_TYPE || child.type === DIR_TYPE) && hasAnySelectedDescendant(child, checkedBtns, tableData)) {
        return true;
      }
    }
  }
  return false;
}

function checkParentChildLinked(menuIds: number[], menuTreeData: MenuTable[]): boolean {
  if (!menuIds.length || !menuTreeData.length) return false;
  const menuMap = new Map<number, MenuTable>();
  const buildMenuMap = (menus: MenuTable[]) => {
    menus.forEach((menu) => {
      menuMap.set(menu.id!, menu);
      if (menu.children) buildMenuMap(menu.children);
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

/* ============================================================
   测试数据
   ============================================================ */
const mockRawTree: MenuTable[] = [
  {
    id: 1, name: "系统管理", type: DIR_TYPE, icon: "Setting",
    children: [
      { id: 2, name: "用户管理", type: MENU_TYPE,
        children: [
          { id: 21, name: "新增用户", type: BTN_TYPE },
          { id: 22, name: "编辑用户", type: BTN_TYPE },
          { id: 23, name: "删除用户", type: BTN_TYPE },
        ],
      },
      { id: 3, name: "角色管理", type: MENU_TYPE,
        children: [
          { id: 31, name: "新增角色", type: BTN_TYPE },
          { id: 32, name: "编辑角色", type: BTN_TYPE },
        ],
      },
      { id: 4, name: "菜单管理", type: MENU_TYPE, children: [] },
    ],
  },
  {
    id: 5, name: "业务管理", type: DIR_TYPE, icon: "DataAnalysis",
    children: [
      { id: 6, name: "订单管理", type: MENU_TYPE,
        children: [
          { id: 61, name: "查看订单", type: BTN_TYPE },
          { id: 62, name: "导出订单", type: LINK_TYPE },
        ],
      },
    ],
  },
];

const mockTableData = filterTableData(mockRawTree);

/* ============================================================
   Test Suite: 纯逻辑函数
   ============================================================ */
describe("纯逻辑函数", () => {
  describe("isPermType", () => {
    it("应识别按钮类型", () => {
      expect(isPermType(BTN_TYPE)).toBe(true);
    });
    it("应识别链接类型", () => {
      expect(isPermType(LINK_TYPE)).toBe(true);
    });
    it("应排除目录类型", () => {
      expect(isPermType(DIR_TYPE)).toBe(false);
    });
    it("应排除菜单类型", () => {
      expect(isPermType(MENU_TYPE)).toBe(false);
    });
    it("应处理 undefined", () => {
      expect(isPermType(undefined)).toBe(false);
    });
  });

  describe("filterTableData", () => {
    it("应过滤掉所有按钮和链接节点", () => {
      const result = filterTableData(mockRawTree);
      const ids = flattenIds(result);
      expect(ids).not.toContain(21);
      expect(ids).not.toContain(22);
      expect(ids).not.toContain(31);
      expect(ids).not.toContain(61);
      expect(ids).not.toContain(62);
    });
    it("应保留目录和菜单节点", () => {
      const result = filterTableData(mockRawTree);
      const ids = flattenIds(result);
      expect(ids).toContain(1);
      expect(ids).toContain(2);
      expect(ids).toContain(3);
      expect(ids).toContain(4);
      expect(ids).toContain(5);
      expect(ids).toContain(6);
    });
  });

  describe("findTableNode", () => {
    it("应找到根节点", () => {
      const node = findTableNode(1, mockTableData);
      expect(node).toBeDefined();
      expect(node!.name).toBe("系统管理");
    });
    it("应找到深层节点", () => {
      const node = findTableNode(3, mockTableData);
      expect(node).toBeDefined();
      expect(node!.name).toBe("角色管理");
    });
    it("找不到时返回 undefined", () => {
      expect(findTableNode(999, mockTableData)).toBeUndefined();
    });
    it("按钮ID应返回 undefined（已在过滤后的数据中移除）", () => {
      expect(findTableNode(21, mockTableData)).toBeUndefined();
    });
  });

  describe("findRawNode", () => {
    it("应找到原始树中的按钮节点", () => {
      const node = findRawNode(21, mockRawTree);
      expect(node).toBeDefined();
      expect(node!.name).toBe("新增用户");
    });
    it("应找到原始树中的根节点", () => {
      const node = findRawNode(1, mockRawTree);
      expect(node).toBeDefined();
      expect(node!.name).toBe("系统管理");
    });
    it("找不到时返回 undefined", () => {
      expect(findRawNode(999, mockRawTree)).toBeUndefined();
    });
  });

  describe("findAncestors", () => {
    it("应返回节点 2 的祖先 [节点 1]", () => {
      const ancestors = findAncestors(2, mockRawTree);
      expect(ancestors.length).toBe(1);
      expect(ancestors[0].id).toBe(1);
    });
    it("应返回节点 6 的祖先 [节点 5]", () => {
      const ancestors = findAncestors(6, mockRawTree);
      expect(ancestors.length).toBe(1);
      expect(ancestors[0].id).toBe(5);
    });
    it("根节点无祖先", () => {
      const ancestors = findAncestors(1, mockRawTree);
      expect(ancestors.length).toBe(0);
    });
    it("按钮节点 21 的祖先链应包含节点 1", () => {
      const ancestors = findAncestors(21, mockRawTree);
      const ancestorIds = ancestors.map((n) => n.id);
      expect(ancestorIds).toContain(1);
      expect(ancestorIds).toContain(2);
    });
  });

  describe("getMenuBtns", () => {
    it("应返回菜单 2 下的按钮列表", () => {
      const row = findTableNode(2, mockTableData)!;
      const btns = getMenuBtns(row, mockRawTree);
      expect(btns.length).toBe(3);
      expect(btns.map((b) => b.id)).toEqual([21, 22, 23]);
    });
    it("菜单 4（无子节点）应返回空数组", () => {
      const row = findTableNode(4, mockTableData)!;
      const btns = getMenuBtns(row, mockRawTree);
      expect(btns.length).toBe(0);
    });
  });

  describe("findParentMenu", () => {
    it("应找到按钮 21 的父菜单为 2", () => {
      const parent = findParentMenu(21, mockRawTree);
      expect(parent).not.toBeNull();
      expect(parent!.id).toBe(2);
    });
    it("应找到菜单 2 的父目录为 1", () => {
      const parent = findParentMenu(2, mockRawTree);
      expect(parent).not.toBeNull();
      expect(parent!.id).toBe(1);
    });
    it("根节点无父节点", () => {
      expect(findParentMenu(1, mockRawTree)).toBeNull();
    });
  });

  describe("hasAnySelectedDescendant", () => {
    it("节点自身有选中按钮时应返回 true", () => {
      const checkedBtns: Record<number, number[]> = { 2: [21] };
      const node = findTableNode(2, mockTableData)!;
      expect(hasAnySelectedDescendant(node, checkedBtns, mockTableData)).toBe(true);
    });
    it("子节点有选中按钮时应返回 true", () => {
      const checkedBtns: Record<number, number[]> = { 3: [31] };
      const node = findTableNode(1, mockTableData)!;
      expect(hasAnySelectedDescendant(node, checkedBtns, mockTableData)).toBe(true);
    });
    it("无选中时应返回 false", () => {
      const checkedBtns: Record<number, number[]> = {};
      const node = findTableNode(2, mockTableData)!;
      expect(hasAnySelectedDescendant(node, checkedBtns, mockTableData)).toBe(false);
    });
  });

  describe("checkParentChildLinked", () => {
    it("父子节点全部选中时返回 true", () => {
      const ids = [1, 2, 3, 4, 5, 6, 21, 22, 23, 31, 32, 61, 62];
      expect(checkParentChildLinked(ids, mockRawTree)).toBe(true);
    });
    it("子选中但父未选中时返回 false", () => {
      const ids = [2];
      expect(checkParentChildLinked(ids, mockRawTree)).toBe(false);
    });
    it("父选中但子未完全选中时返回 false", () => {
      const ids = [1, 2];
      // 节点 2 有三个子按钮未选
      expect(checkParentChildLinked(ids, mockRawTree)).toBe(false);
    });
    it("空数组返回 false", () => {
      expect(checkParentChildLinked([], mockRawTree)).toBe(false);
    });
  });

  describe("expandMenuIdsWithAncestors", () => {
    it("应补充所有祖先节点到结果中", () => {
      const ids = expandMenuIdsWithAncestors([21], mockRawTree);
      expect(ids).toContain(21);
      expect(ids).toContain(2);
      expect(ids).toContain(1);
    });
    it("根节点本身应保留", () => {
      const ids = expandMenuIdsWithAncestors([1], mockRawTree);
      expect(ids).toEqual([1]);
    });
  });
});

/* ============================================================
   Test Suite: handleSelectAll 行为
   ============================================================ */
describe("handleSelectAll 行为模拟", () => {
  let checkedBtns: Record<number, number[]>;
  let selectedMenuIds: Set<number>;

  function simulateHandleSelectAll(selectionIds: number[], parentChildLinked: boolean) {
    const selection = selectionIds
      .map((id) => findTableNode(id, mockTableData))
      .filter(Boolean) as MenuTable[];

    if (!selection.length) {
      checkedBtns = {};
      selectedMenuIds.clear();
    } else if (parentChildLinked) {
      for (const row of selection) {
        if (row.type === DIR_TYPE || row.type === MENU_TYPE) {
          selectedMenuIds.add(row.id!);
          const btns = getMenuBtns(row, mockRawTree);
          if (btns.length > 0) {
            checkedBtns[row.id!] = btns.map((b) => b.id!);
          }
        }
      }
    } else {
      for (const row of selection) {
        if (row.type === DIR_TYPE || row.type === MENU_TYPE) {
          selectedMenuIds.add(row.id!);
        }
      }
    }
  }

  beforeEach(() => {
    checkedBtns = {};
    selectedMenuIds = new Set();
  });

  describe("取消全选", () => {
    it("选中行为空时应清空所有按钮状态", () => {
      // 预设一些按钮选中状态
      checkedBtns = { 2: [21, 22], 6: [61] };
      selectedMenuIds = new Set([2, 6]);

      simulateHandleSelectAll([], false);
      expect(Object.keys(checkedBtns).length).toBe(0);
      expect(selectedMenuIds.size).toBe(0);
    });

    it("即使有父子联动，取消全选也应清空按钮", () => {
      checkedBtns = { 2: [21, 22, 23], 3: [31, 32] };
      selectedMenuIds = new Set([1, 2, 3]);

      simulateHandleSelectAll([], true);
      expect(Object.keys(checkedBtns).length).toBe(0);
      expect(selectedMenuIds.size).toBe(0);
    });

    it("选中行为空时再次取消全选应保持清空状态", () => {
      simulateHandleSelectAll([], false);
      expect(Object.keys(checkedBtns).length).toBe(0);
      expect(selectedMenuIds.size).toBe(0);
    });
  });

  describe("全选（无父子联动）", () => {
    it("应选中所有菜单行但不清空按钮", () => {
      simulateHandleSelectAll([1, 2, 3, 4, 5, 6], false);
      // 所有菜单行应被记录
      expect(selectedMenuIds.has(1)).toBe(true);
      expect(selectedMenuIds.has(2)).toBe(true);
      expect(selectedMenuIds.has(6)).toBe(true);
      // 无联动时不应自动收集按钮
      expect(checkedBtns[2]).toBeUndefined();
      expect(checkedBtns[6]).toBeUndefined();
    });
  });

  describe("全选（有父子联动）", () => {
    it("应为每个菜单行收集其下的功能按钮", () => {
      simulateHandleSelectAll([1, 2, 3, 4, 5, 6], true);
      // 应收集菜单 2 的按钮
      expect(checkedBtns[2]).toEqual([21, 22, 23]);
      // 应收集菜单 3 的按钮
      expect(checkedBtns[3]).toEqual([31, 32]);
      // 应收集菜单 6 的按钮（含链接类型）
      expect(checkedBtns[6]).toEqual([61, 62]);
      // 目录 1 和 5 没有功能按钮，应为空数组或 undefined
      expect(checkedBtns[1]).toBeUndefined();
    });

    it("菜单下无按钮时不应设置 checkedBtns", () => {
      simulateHandleSelectAll([4], true);
      expect(checkedBtns[4]).toBeUndefined();
    });
  });

  describe("部分选择", () => {
    it("只选中部分菜单行时只收集这些行的按钮", () => {
      simulateHandleSelectAll([2, 6], true);
      expect(selectedMenuIds.has(2)).toBe(true);
      expect(selectedMenuIds.has(6)).toBe(true);
      expect(selectedMenuIds.has(1)).toBe(false);
      expect(checkedBtns[2]).toEqual([21, 22, 23]);
      expect(checkedBtns[6]).toEqual([61, 62]);
      // 未选中的菜单不应有按钮
      expect(checkedBtns[3]).toBeUndefined();
    });
  });
});

/* ============================================================
   Test Suite: handleSelectionChange 行为（安全网）
   ============================================================ */
describe("handleSelectionChange 安全网", () => {
  let checkedBtns: Record<number, number[]>;

  function simulateHandleSelectionChange(selectionIds: number[]) {
    const newSelected = new Set(selectionIds);
    if (newSelected.size === 0) {
      checkedBtns = {};
    }
  }

  beforeEach(() => {
    checkedBtns = { 2: [21, 22], 3: [31] };
  });

  it("选中行为空时应清空按钮状态", () => {
    simulateHandleSelectionChange([]);
    expect(Object.keys(checkedBtns).length).toBe(0);
  });

  it("选中行非空时不应清空按钮", () => {
    simulateHandleSelectionChange([2]);
    expect(checkedBtns[2]).toEqual([21, 22]);
    expect(checkedBtns[3]).toEqual([31]);
  });

  it("部分选中不应影响按钮状态", () => {
    simulateHandleSelectionChange([2, 3]);
    expect(checkedBtns[2]).toEqual([21, 22]);
    expect(checkedBtns[3]).toEqual([31]);
  });
});

/* ============================================================
   Test Suite: collectBtnState + cascadeDeselect
   ============================================================ */
describe("collectBtnState / cascadeDeselect", () => {
  it("collectBtnState 应为有按钮的行收集按钮 ID", () => {
    const row = findTableNode(2, mockTableData)!;
    const btns = getMenuBtns(row, mockRawTree);
    expect(btns.length).toBeGreaterThan(0);
    const checkedBtns: Record<number, number[]> = {};
    checkedBtns[row.id!] = btns.map((b) => b.id!);
    expect(checkedBtns[2]).toEqual([21, 22, 23]);
  });

  it("cascadeDeselect 应清空指定行及其子行的按钮", () => {
    const checkedBtns: Record<number, number[]> = {
      2: [21, 22, 23],
      3: [31, 32],
    };
    // 模拟级联取消: 清空节点 1 下所有子菜单的按钮
    function cascadeDeselect(id: number) {
      delete checkedBtns[id];
      const node = findTableNode(id, mockTableData);
      if (node?.children) {
        for (const child of node.children) {
          if (child.type === MENU_TYPE || child.type === DIR_TYPE) {
            cascadeDeselect(child.id!);
          }
        }
      }
    }
    cascadeDeselect(1);
    expect(Object.keys(checkedBtns).length).toBe(0);
  });

  it("级联取消不应影响无关行的按钮", () => {
    const checkedBtns: Record<number, number[]> = {
      2: [21, 22],
      6: [61],
    };
    function cascadeDeselect(id: number) {
      delete checkedBtns[id];
      const node = findTableNode(id, mockTableData);
      if (node?.children) {
        for (const child of node.children) {
          if (child.type === MENU_TYPE || child.type === DIR_TYPE) {
            cascadeDeselect(child.id!);
          }
        }
      }
    }
    cascadeDeselect(2);
    // 节点 2 的按钮被清空
    expect(checkedBtns[2]).toBeUndefined();
    // 节点 6 不受影响
    expect(checkedBtns[6]).toEqual([61]);
  });
});

/* ============================================================
   辅助函数
   ============================================================ */
function flattenIds(nodes: MenuTable[]): number[] {
  const ids: number[] = [];
  const walk = (list: MenuTable[]) => {
    list.forEach((n) => {
      ids.push(n.id!);
      if (n.children) walk(n.children);
    });
  };
  walk(nodes);
  return ids;
}