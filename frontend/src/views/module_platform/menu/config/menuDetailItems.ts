import type { DescriptionsItem } from "@/components/others/fa-descriptions/index.vue";

/** 菜单详情抽屉的字段列表（顺序即展示顺序） */
export const menuDetailItems: DescriptionsItem[] = [
  { label: "编号", prop: "id" },
  { label: "菜单名称", prop: "name" },
  { label: "菜单类型", prop: "type", slot: "type" },
  { label: "图标", prop: "icon", slot: "icon" },
  { label: "权限标识", prop: "permission" },
  { label: "路由名称", prop: "route_name" },
  { label: "路由路径", prop: "route_path" },
  { label: "组件路径", prop: "component_path" },
  { label: "激活菜单路径", prop: "active_path" },
  { label: "重定向", prop: "redirect" },
  { label: "外链地址", prop: "link" },
  { label: "父级编号", prop: "parent_id" },
  { label: "父级菜单", prop: "parent_name" },
  {
    label: "是否缓存",
    prop: "keep_alive",
    tag: {
      map: { true: { type: "success", text: "是" }, false: { type: "danger", text: "否" } },
    },
  },
  {
    label: "是否显示",
    prop: "hidden",
    tag: {
      map: { true: { type: "success", text: "是" }, false: { type: "danger", text: "否" } },
    },
  },
  { label: "菜单标题", prop: "title" },
  {
    label: "是否固定路由",
    prop: "affix",
    tag: {
      map: { true: { type: "success", text: "是" }, false: { type: "danger", text: "否" } },
    },
  },
  {
    label: "嵌入iframe",
    prop: "is_iframe",
    tag: {
      map: { true: { type: "success", text: "是" }, false: { type: "danger", text: "否" } },
    },
  },
  {
    label: "隐藏标签页",
    prop: "is_hide_tab",
    tag: {
      map: { true: { type: "success", text: "是" }, false: { type: "danger", text: "否" } },
    },
  },
  {
    label: "显示红点角标",
    prop: "show_badge",
    tag: {
      map: { true: { type: "success", text: "是" }, false: { type: "danger", text: "否" } },
    },
  },
  { label: "文字角标内容", prop: "show_text_badge" },
  {
    label: "状态",
    prop: "status",
    tag: {
      map: { 0: { type: "success", text: "启用" }, 1: { type: "danger", text: "停用" } },
    },
  },
  { label: "排序", prop: "order" },
  { label: "创建时间", prop: "created_time" },
  { label: "更新时间", prop: "updated_time" },
  { label: "描述", prop: "description", span: 4 },
];
