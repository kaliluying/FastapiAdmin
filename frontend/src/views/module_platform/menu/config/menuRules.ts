import type { Ref } from "vue";
import type { MenuForm } from "@/api/module_platform/menu";
import { MenuTypeEnum } from "@/enums/system/menu.enum";

/**
 * 新增/编辑抽屉的校验规则
 *
 * @param formData 当前表单模型，重定向校验依赖菜单类型。
 * @returns Element Plus 表单规则对象。
 */
export function buildMenuRules(formData: Ref<MenuForm>) {
  return {
    name: [
      { required: true, message: "请输入菜单名称", trigger: "blur" },
      { min: 2, max: 50, message: "长度 2 到 50 个字符", trigger: "blur" },
    ],
    parent_id: [{ required: true, message: "请选择父级菜单", trigger: "blur" }],
    type: [{ required: true, message: "请选择菜单类型", trigger: "blur" }],
    order: [{ required: true, message: "请输入排序", trigger: "blur" }],
    permission: [{ required: true, message: "请输入权限标识", trigger: "blur" }],
    route_name: [{ required: true, message: "请输入路由名称", trigger: "blur" }],
    route_path: [{ required: true, message: "请输入路由路径", trigger: "blur" }],
    component_path: [{ required: true, message: "请输入组件路径", trigger: "blur" }],
    title: [
      { required: true, message: "请输入菜单标题", trigger: "blur" },
      { min: 2, max: 50, message: "长度 2 到 50 个字符", trigger: "blur" },
    ],
    keep_alive: [{ required: true, message: "请选择是否缓存", trigger: "change" }],
    hidden: [{ required: true, message: "请选择是否隐藏", trigger: "change" }],
    status: [{ required: true, message: "请选择状态", trigger: "change" }],
    redirect: [
      {
        validator: (_rule: unknown, value: string | undefined, callback: (e?: Error) => void) => {
          if (formData.value.type === MenuTypeEnum.CATALOG) {
            if (value === undefined || value === null || String(value).trim() === "") {
              callback(new Error("目录类型必须填写重定向地址"));
              return;
            }
          }
          callback();
        },
        trigger: "blur",
      },
    ],
  };
}
