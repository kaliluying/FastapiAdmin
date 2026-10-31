import type { Ref } from "vue";
import type { FormItem } from "@/components/forms/fa-form/index.vue";
import type { MenuForm } from "@/api/module_platform/menu";
import { MenuTypeEnum } from "@/enums/system/menu.enum";

/**
 * 新增/编辑抽屉的表单项：条件控制走 hidden，布局走 span 12（半宽）/24（全宽）
 *
 * @param formData 当前表单模型，用于按菜单类型切换字段显隐。
 * @returns Element Plus 表单项配置数组。
 */
export function buildMenuFormItems(formData: Ref<MenuForm>): FormItem[] {
  const t = formData.value.type as MenuTypeEnum;
  return [
    { key: "type", label: "菜单类型", type: "input" },
    {
      key: "parent_id",
      label: "父级菜单",
      type: "input",
      hidden: t === MenuTypeEnum.CATALOG,
    },
    { key: "name", label: "菜单名称", type: "input", props: { placeholder: "请输入菜单名称" } },
    { key: "title", label: "菜单标题", type: "input", props: { placeholder: "请输入菜单标题" } },
    { key: "icon", label: "图标", type: "input", hidden: t === MenuTypeEnum.BUTTON },
    { key: "link", label: "外链地址", type: "input", hidden: t !== MenuTypeEnum.EXTLINK },
    { key: "route_name", label: "路由名称", type: "input", hidden: t === MenuTypeEnum.BUTTON },
    {
      key: "permission",
      label: "权限标识",
      type: "input",
      hidden: t !== MenuTypeEnum.BUTTON && t !== MenuTypeEnum.MENU,
    },
    {
      key: "route_path",
      label: "路由路径",
      type: "input",
      hidden: t !== MenuTypeEnum.CATALOG && t !== MenuTypeEnum.MENU && t !== MenuTypeEnum.EXTLINK,
    },
    {
      key: "component_path",
      label: "组件路径",
      type: "input",
      hidden: t !== MenuTypeEnum.MENU,
    },
    {
      key: "active_path",
      label: "激活菜单路径",
      type: "input",
      hidden: t !== MenuTypeEnum.CATALOG && t !== MenuTypeEnum.MENU,
    },
    {
      key: "redirect",
      label: "重定向",
      type: "input",
      hidden: t !== MenuTypeEnum.CATALOG && t !== MenuTypeEnum.MENU,
    },
    { key: "order", label: "排序", type: "number", props: { controlsPosition: "right", min: 1 } },
    { key: "is_iframe", label: "嵌入iframe", type: "input", hidden: t !== MenuTypeEnum.EXTLINK },
    {
      key: "status",
      label: "状态",
      type: "radiogroup",
      props: {
        options: [
          { label: "启用", value: 0 },
          { label: "禁用", value: 1 },
        ],
      },
    },
    { key: "hidden", label: "是否隐藏", type: "input", hidden: t === MenuTypeEnum.BUTTON },
    {
      key: "keep_alive",
      label: "缓存页面",
      type: "input",
      hidden: t !== MenuTypeEnum.MENU,
    },
    { key: "affix", label: "常驻标签栏", type: "input", hidden: t === MenuTypeEnum.BUTTON },
    { key: "is_hide_tab", label: "隐藏标签页", type: "input", hidden: t === MenuTypeEnum.BUTTON },
    { key: "show_badge", label: "显示红点角标", type: "input", hidden: t === MenuTypeEnum.BUTTON },
    {
      key: "show_text_badge",
      label: "文字角标内容",
      type: "input",
      hidden: t === MenuTypeEnum.BUTTON || !formData.value.show_badge,
    },
    {
      key: "description",
      label: "描述",
      type: "input",
      span: 24,
      props: {
        type: "textarea",
        rows: 4,
        maxlength: 100,
        showWordLimit: true,
        placeholder: "请输入描述",
      },
    },
  ];
}
