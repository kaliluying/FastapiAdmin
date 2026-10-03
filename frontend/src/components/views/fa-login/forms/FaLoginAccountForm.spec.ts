import { mount } from "@vue/test-utils";
import { ref, defineComponent } from "vue";
import { describe, expect, it } from "vitest";
import FaLoginAccountForm from "./FaLoginAccountForm.vue";

Object.assign(globalThis, { ref });

const stubs = {
  ElButton: { template: "<button @click=\"$emit('click')\"><slot /></button>" },
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
    wrapper.unmount();
  });

  it("密码框 Enter 只提交一次，保留密码空格并提供自动填充标记", async () => {
    const loginForm = { username: "", password: "", remember: true, login_type: "PC" };
    const wrapper = mount(FaLoginAccountForm, {
      props: { loginForm, rules: {}, formKey: 0, loading: false },
      global: {
        directives: { ripple: {} },
        mocks: { $t: (key: string) => key },
        stubs: {
          ...stubs,
          ElInput: defineComponent({
            props: ["modelValue", "type"],
            emits: ["update:modelValue"],
            template:
              '<input :type="type" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
          }),
        },
      },
    });
    const password = wrapper.get('input[type="password"]');
    await password.setValue(" secret123 ");
    expect(loginForm.password).toBe(" secret123 ");
    expect(password.attributes("autocomplete")).toBe("current-password");
    expect(wrapper.get('input[name="username"]').attributes("autocomplete")).toBe("username");
    await password.trigger("keyup", { key: "Enter" });
    expect(wrapper.emitted("submit")).toHaveLength(1);
    wrapper.unmount();
  });
});
