import { h } from "vue";
import type { MenuTable } from "@/api/module_platform/menu";
import { MenuTypeEnum } from "@/enums/system/menu.enum";
import { useAuth } from "@/hooks/core/useAuth";
import { useTableColumns } from "@/hooks/core/useTableColumns";
import { renderTableOperationCell, resolveStatusColumns } from "@utils";
import type { TableOperationAction } from "@utils";
import FaMenuRouteIcon from "@/components/others/fa-menu-route-icon/index.vue";

export interface MenuRowActionContext {
  onAdd?: (row: MenuTable) => void;
  onDetail: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

/**
 * 生成单行可用的操作按钮，并按权限过滤。
 *
 * @param row 当前行数据。
 * @param ctx 页面提供的按钮回调。
 * @returns 通过权限过滤后的操作按钮列表。
 */
export function buildMenuRowActions(
  row: MenuTable,
  ctx: MenuRowActionContext,
  hasAuth: (perm: string) => boolean
): TableOperationAction[] {
  const actions: TableOperationAction[] = [];
  if (ctx.onAdd && (row.type === MenuTypeEnum.CATALOG || row.type === MenuTypeEnum.MENU)) {
    actions.push({
      key: "add",
      label: "新增",
      artType: "add",
      perm: "module_platform:menu:create",
      run: () => ctx.onAdd!(row),
    });
  }
  actions.push(
    {
      key: "detail",
      label: "详情",
      artType: "view",
      perm: "module_platform:menu:detail",
      run: () => ctx.onDetail(row.id!),
    },
    {
      key: "edit",
      label: "编辑",
      artType: "edit",
      perm: "module_platform:menu:update",
      run: () => ctx.onEdit(row.id!),
    },
    {
      key: "delete",
      label: "删除",
      artType: "delete",
      perm: "module_platform:menu:delete",
      run: () => ctx.onDelete(row.id!),
    }
  );
  return actions.filter((a) => a.perm != null && hasAuth(a.perm));
}

/**
 * 菜单表格的列定义与列显示配置
 *
 * @param opCtx 行内操作按钮的回调集合。
 * @returns `columnChecks`（列显隐状态）与 `columns`（列配置）。
 */
export function useMenuColumns(opCtx: MenuRowActionContext) {
  const { hasAuth } = useAuth();

  const formatMenuOperationCell = (row: MenuTable) =>
    renderTableOperationCell(buildMenuRowActions(row, opCtx, hasAuth), {
      wrapperClass: "inline-flex flex-wrap items-center justify-end gap-1 menu-table-actions",
    });

  const { columnChecks, columns } = useTableColumns<MenuTable>(
    resolveStatusColumns(() => [
      { type: "selection", width: 48, fixed: "left" },
      { type: "index", label: "序号", width: 60, fixed: "left" },
      { prop: "name", label: "菜单名称", minWidth: 200, showOverflowTooltip: true },
      {
        prop: "icon",
        label: "图标",
        width: 72,
        align: "center",
        formatter: (row: MenuTable) =>
          row.icon
            ? h(FaMenuRouteIcon, { icon: row.icon, style: { verticalAlign: "-0.15em" } })
            : h("span", { class: "text-g-400" }, "—"),
      },
      {
        prop: "status",
        label: "状态",
        width: 88,
        status: {
          0: { type: "success", text: "启用" },
          1: { type: "danger", text: "停用" },
        },
      },
      {
        prop: "type",
        label: "类型",
        width: 88,
        align: "center",
        status: {
          1: { type: "warning", text: "目录" },
          2: { type: "success", text: "菜单" },
          3: { type: "danger", text: "按钮" },
          4: { type: "info", text: "外链" },
        },
      },
      { prop: "order", label: "排序", width: 80 },
      { prop: "route_name", label: "路由名称", minWidth: 100, showOverflowTooltip: true },
      { prop: "route_path", label: "路由路径", minWidth: 140, showOverflowTooltip: true },
      { prop: "permission", label: "权限标识", minWidth: 160, showOverflowTooltip: true },
      { prop: "component_path", label: "组件路径", minWidth: 140, showOverflowTooltip: true },
      { prop: "active_path", label: "激活路径", minWidth: 100, showOverflowTooltip: true },
      { prop: "redirect", label: "重定向", minWidth: 100, showOverflowTooltip: true },
      { prop: "link", label: "外链地址", minWidth: 140, showOverflowTooltip: true },
      {
        prop: "keep_alive",
        label: "是否缓存",
        width: 96,
        status: {
          true: { type: "success", text: "是" },
          false: { type: "danger", text: "否" },
        },
      },
      {
        prop: "hidden",
        label: "是否隐藏",
        width: 96,
        status: {
          true: { type: "success", text: "是" },
          false: { type: "danger", text: "否" },
        },
      },
      {
        prop: "affix",
        label: "固定路由",
        width: 96,
        status: {
          true: { type: "success", text: "是" },
          false: { type: "danger", text: "否" },
        },
      },
      { prop: "title", label: "菜单标题", minWidth: 100, showOverflowTooltip: true },
      {
        prop: "is_iframe",
        label: "嵌入iframe",
        width: 100,
        status: {
          true: { type: "success", text: "是" },
          false: { type: "danger", text: "否" },
        },
      },
      {
        prop: "is_hide_tab",
        label: "隐藏标签页",
        width: 100,
        status: {
          true: { type: "success", text: "是" },
          false: { type: "danger", text: "否" },
        },
      },
      {
        prop: "show_badge",
        label: "红点角标",
        width: 96,
        status: {
          true: { type: "success", text: "是" },
          false: { type: "danger", text: "否" },
        },
      },
      { prop: "show_text_badge", label: "文字角标", width: 100, showOverflowTooltip: true },
      { prop: "description", label: "描述", minWidth: 140, showOverflowTooltip: true },
      { prop: "created_time", label: "创建时间", width: 168, showOverflowTooltip: true },
      { prop: "updated_time", label: "更新时间", width: 168, showOverflowTooltip: true },
      {
        prop: "operation",
        label: "操作",
        width: 220,
        fixed: "right",
        align: "right",
        formatter: (row: MenuTable) => formatMenuOperationCell(row),
      },
    ])
  );

  return { columnChecks, columns };
}
