import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import FaPageHeader from "./index.vue";

describe("FaPageHeader", () => {
  it("renders semantic title, description and actions", () => {
    const wrapper = mount(FaPageHeader, {
      props: { title: "用户管理", description: "维护账号与访问范围" },
      slots: { actions: "<button>新建用户</button>" },
    });
    expect(wrapper.get("h1").text()).toBe("用户管理");
    expect(wrapper.text()).toContain("维护账号与访问范围");
    expect(wrapper.get("button").text()).toBe("新建用户");
  });
});
