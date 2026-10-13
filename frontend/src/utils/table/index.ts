/**
 * 表格列表工具：分页响应适配、错误处理、防抖与操作列。
 * 列表 API 返回全局 PageResult（total + items），可包在标准 data 字段内。
 */

import { h } from "vue";
import type { VNode } from "vue";
import { ElTooltip } from "element-plus";
import FaButtonMore from "@/components/forms/fa-button-more/index.vue";
import type { ButtonMoreItem } from "@/components/forms/fa-button-more/types";
import FaButtonTable from "@/components/forms/fa-button-table/index.vue";

export * from "./request";

// --- 操作列渲染（表格单元格内按钮 + 溢出「更多」） ---

export const DEFAULT_MAX_INLINE_TABLE_OPERATIONS = 3;

export interface TableOperationAction {
  key: string | number;
  label: string;
  artType: "add" | "edit" | "delete" | "view" | "more";
  icon?: string;
  perm?: string;
  disabled?: boolean;
  iconColor?: string;
  color?: string;
  run: () => void;
}

export interface RenderTableOperationCellOptions {
  maxInline?: number;
  wrapperClass?: string;
  emptyText?: string;
}

const ART_TYPE_DEFAULT_ICONS: Record<TableOperationAction["artType"], string> = {
  add: "ri:add-fill",
  edit: "ri:pencil-line",
  delete: "ri:delete-bin-5-line",
  view: "ri:eye-line",
  more: "ri:more-2-fill",
};

function iconForOperation(a: TableOperationAction): string {
  return a.icon ?? ART_TYPE_DEFAULT_ICONS[a.artType];
}

const ART_TYPE_ICON_COLORS: Record<TableOperationAction["artType"], string> = {
  add: "var(--el-color-primary)",
  edit: "var(--el-color-success)",
  delete: "var(--el-color-danger)",
  view: "var(--el-color-info)",
  more: "var(--el-text-color-regular)",
};

function iconColorForOperation(a: TableOperationAction): string | undefined {
  if (a.iconColor != null) return a.iconColor;
  return ART_TYPE_ICON_COLORS[a.artType];
}

function defaultMoreItemColor(a: TableOperationAction): string | undefined {
  if (a.color != null) return a.color;
  return String(a.key) === "delete" ? "var(--el-color-danger)" : undefined;
}

export function renderTableOperationCell(
  actions: TableOperationAction[],
  options?: RenderTableOperationCellOptions
): VNode {
  const maxInline = options?.maxInline ?? DEFAULT_MAX_INLINE_TABLE_OPERATIONS;
  const wrapperClass =
    options?.wrapperClass ?? "inline-flex flex-wrap items-center justify-end gap-1";
  const emptyText = options?.emptyText ?? "—";

  if (actions.length === 0) return h("span", { class: "text-g-400" }, emptyText);

  const inline = actions.slice(0, maxInline);
  const overflow = actions.slice(maxInline);

  const inlineNodes = inline.map((a) =>
    h(ElTooltip, { content: a.label, placement: "top" }, () =>
      h(
        "span",
        { class: a.disabled ? "inline-flex opacity-40 pointer-events-none" : "inline-flex" },
        [
          h(FaButtonTable, {
            type: a.artType,
            icon: iconForOperation(a),
            iconColor: iconColorForOperation(a),
            onClick: a.run,
          }),
        ]
      )
    )
  );

  if (overflow.length === 0) return h("div", { class: wrapperClass }, inlineNodes);

  const moreDropdown = h(FaButtonMore, {
    list: overflow.map((a) => ({
      key: a.key,
      label: a.label,
      icon: iconForOperation(a),
      auth: a.perm,
      disabled: a.disabled,
      iconColor: iconColorForOperation(a),
      color: defaultMoreItemColor(a),
    })),
    onClick: (item: ButtonMoreItem) => {
      const act = overflow.find((x) => String(x.key) === String(item.key));
      act?.run();
    },
  });

  return h("div", { class: wrapperClass }, [...inlineNodes, moreDropdown]);
}

/* ============ 状态 Tag 工具 ============ */
// 表格 status formatter：消除 50+ 处 h(ElTag, { type }, () => text) 重复
export * from "./statusFormatter";
