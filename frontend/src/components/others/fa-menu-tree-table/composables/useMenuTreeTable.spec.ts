import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, type PropType } from "vue";
import { describe, expect, it } from "vitest";

import { useMenuTreeTable } from "./useMenuTreeTable";

const Harness = defineComponent({
  props: {
    menuTree: { type: Array, required: true },
    checkedIds: { type: Array as PropType<number[]>, default: () => [] },
  },
  setup(props) {
    const { tableData } = useMenuTreeTable(props);
    return () => h("div", tableData.value.map((menu) => menu.name).join(","));
  },
});

describe("useMenuTreeTable", () => {
  it("renders menus loaded after the permission drawer opens", async () => {
    const wrapper = mount(Harness, { props: { menuTree: [], checkedIds: [] } });
    expect(wrapper.text()).toBe("");

    await wrapper.setProps({
      menuTree: [{ id: 1, name: "系统管理", type: 1, children: [{ id: 2, name: "角色管理", type: 2 }] }],
    });
    await nextTick();

    expect(wrapper.text()).toBe("系统管理");
  });
});
