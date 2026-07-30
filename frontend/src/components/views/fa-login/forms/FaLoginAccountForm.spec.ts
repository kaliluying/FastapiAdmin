import { mount } from "@vue/test-utils";
import { ref } from "vue";
import { describe, expect, it } from "vitest";
import FaLoginAccountForm from "./FaLoginAccountForm.vue";

Object.assign(globalThis, { ref });

const stubs = {
  ElButton: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
  ElCheckbox: { template: "<label><slot /></label>" },
  ElForm: { template: "<form><slot /></form>" },
  ElFormItem: { template: "<div><slot /></div>" },
  ElIcon: { template: "<i><slot /></i>" },
  ElInput: true,
  ElSelect: true,
  ElTooltip: { template: "<div><slot /></div>" },
};

describe("FaLoginAccountForm", () => {
  it("只保留账号密码登录，并能提交表单", async () => {
    const wrapper = mount(FaLoginAccountForm, {
      props: {
        loginForm: { username: "", password: "", remember: true, login_type: "PC" },
        rules: {},
        formKey: 0,
        loading: false,
      },
      global: {
        directives: { ripple: {} },
        mocks: { $t: (key: string) => key },
        stubs,
      },
    });

    expect(wrapper.findComponent({ name: "ElSelect" }).exists()).toBe(false);

    await wrapper.get("button").trigger("click");
    expect(wrapper.emitted("submit")).toBeTruthy();
  });
});
