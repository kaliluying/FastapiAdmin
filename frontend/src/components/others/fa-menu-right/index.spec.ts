import { mount } from "@vue/test-utils";
import { nextTick, onUnmounted } from "vue";
import { describe, expect, it } from "vitest";

import FaMenuRight from "./index.vue";

Object.assign(globalThis, { onUnmounted });

describe("FaMenuRight", () => {
  it("将视口定位的右键菜单传送到 body，避免被顶部栏定位上下文偏移", async () => {
    const wrapper = mount(FaMenuRight, {
      attachTo: document.body,
      props: {
        menuItems: [{ key: "refresh", label: "刷新" }],
      },
      global: {
        stubs: {
          FaSvgIcon: { template: "<i />" },
        },
      },
    });

    const exposed = wrapper.vm as unknown as {
      show: (event: MouseEvent) => void;
    };
    exposed.show(new MouseEvent("contextmenu", { clientX: 240, clientY: 180 }));
    await nextTick();

    const menuRoot = document.body.querySelector(".menu-right");
    const menu = document.body.querySelector<HTMLElement>(".context-menu");

    expect(menuRoot?.parentElement).toBe(document.body);
    expect(menu?.style.position).toBe("fixed");
    expect(menu?.style.left).toBe("240px");
    expect(menu?.style.top).toBe("180px");

    wrapper.unmount();
  });
});
