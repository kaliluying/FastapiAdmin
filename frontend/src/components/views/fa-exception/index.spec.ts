import { mount } from "@vue/test-utils";
import { ref } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Exception from "./index.vue";

const { push, user } = vi.hoisted(() => ({ push: vi.fn(), user: { isLogin: false } }));
vi.mock("@stores", () => ({ useUserStore: () => user }));
vi.mock("@/hooks/core/useCommon", () => ({ useCommon: () => ({ homePath: ref("/home") }) }));
Object.assign(globalThis, { useRouter: () => ({ push }) });

describe("exception recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    user.isLogin = false;
  });

  it.each(["401", "403", "404", "500"])(
    "announces %s and preserves login-aware navigation",
    async (code) => {
      const wrapper = mount(Exception, {
        attachTo: document.body,
        props: {
          data: { title: code, desc: "页面不可用", btnText: "返回首页", imgUrl: "/local.svg" },
        },
        global: {
          directives: { ripple: {} },
          stubs: {
            FaThemeSvg: true,
            ElButton: {
              emits: ["click"],
              template: "<button @click=\"$emit('click')\"><slot /></button>",
            },
          },
        },
      });
      expect(document.activeElement).toBe(wrapper.get("h1").element);
      expect(wrapper.get("section").attributes("aria-describedby")).toBe(`exception-help-${code}`);
      expect(wrapper.get("p").text()).not.toBe("你可以返回工作台继续操作。");
      await wrapper.get("button").trigger("click");
      expect(push).toHaveBeenLastCalledWith({ name: "Login", query: { redirect: "/home" } });
      user.isLogin = true;
      await wrapper.get("button").trigger("click");
      expect(push).toHaveBeenLastCalledWith("/home");
      wrapper.unmount();
    }
  );
});
