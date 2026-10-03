import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, reactive } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Profile from "./index.vue";

const {
  getProfile,
  updateProfile,
  updatePassword,
  refreshUser,
  logout,
  validateProfile,
  validatePassword,
} = vi.hoisted(() => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  updatePassword: vi.fn(),
  refreshUser: vi.fn(),
  logout: vi.fn(),
  validateProfile: vi.fn(),
  validatePassword: vi.fn(),
}));
const route = reactive({ query: {} as Record<string, string> });
vi.mock("vue-router", () => ({
  useRoute: () => route,
  useRouter: () => ({ replace: vi.fn() }),
}));
vi.mock("@stores", () => ({
  useUserStore: () => ({ info: {}, getUserInfo: refreshUser, logout }),
}));
vi.mock("@/api/module_system/user", () => ({
  default: {
    getCurrentUserInfo: getProfile,
    updateCurrentUserInfo: updateProfile,
    changeCurrentUserPassword: updatePassword,
  },
}));
vi.mock("element-plus", () => ({ ElMessage: { success: vi.fn(), info: vi.fn(), error: vi.fn() } }));
vi.mock("@/components/layouts/fa-page-header/index.vue", () => ({
  default: { template: "<header />" },
}));

const Form = defineComponent({
  props: ["model"],
  setup(props, { expose }) {
    expose({
      validate: () => ("old_password" in props.model ? validatePassword() : validateProfile()),
    });
  },
  template: "<form><slot /></form>",
});
const Input = defineComponent({
  props: ["modelValue", "type"],
  emits: ["update:modelValue"],
  template:
    '<input :value="modelValue" :type="type" @input="$emit(\'update:modelValue\', $event.target.value)" />',
});

function renderProfile() {
  return mount(Profile, {
    global: {
      directives: { loading: {} },
      stubs: {
        ElTabs: { template: "<div><slot /></div>" },
        ElTabPane: { template: "<section><slot /></section>" },
        ElForm: Form,
        ElFormItem: { template: "<label><slot /></label>" },
        ElInput: Input,
        ElSelect: { template: "<select><slot /></select>" },
        ElOption: { template: "<option />" },
        ElButton: {
          props: ["nativeType"],
          template: "<button :type=\"nativeType || 'button'\"><slot /></button>",
        },
        ElAlert: { props: ["title"], template: '<div role="alert">{{ title }}<slot /></div>' },
        FaSvgIcon: true,
      },
    },
  });
}

describe("profile feedback and submission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    route.query = {};
    getProfile.mockResolvedValue({
      data: {
        data: {
          id: 4,
          username: "owner",
          name: "Owner",
          email: "old@example.test",
          mobile: "",
          gender: "2",
          roles: [{ name: "普通用户" }],
        },
      },
    });
    updateProfile.mockResolvedValue({});
    updatePassword.mockResolvedValue({});
    refreshUser.mockResolvedValue(undefined);
    logout.mockResolvedValue(undefined);
    validateProfile.mockResolvedValue(true);
    validatePassword.mockResolvedValue(true);
  });

  it("keeps edits after a failed save and sends only changed fields", async () => {
    const wrapper = renderProfile();
    await flushPromises();
    const inputs = wrapper.findAll<HTMLInputElement>(".profile-form--info input");
    await inputs[1]!.setValue("New name");
    await inputs[2]!.setValue("");
    updateProfile.mockRejectedValueOnce(new Error("unavailable"));
    await wrapper.get(".profile-form--info").trigger("submit");
    await flushPromises();
    expect(updateProfile).toHaveBeenCalledWith({ name: "New name", email: null });
    expect(inputs[1]!.element.value).toBe("New name");
    expect(wrapper.get('[role="alert"]').text()).toContain("已保留您的修改");
    expect(wrapper.get('[role="status"]').text()).toContain("尚未保存");
    wrapper.unmount();
  });

  it("locks while validation is pending and releases after failed validation", async () => {
    const wrapper = renderProfile();
    await flushPromises();
    await wrapper.findAll(".profile-form--info input")[1]!.setValue("New name");
    const validation = Promise.withResolvers<boolean>();
    validateProfile.mockReturnValueOnce(validation.promise);
    await wrapper.get(".profile-form--info").trigger("submit");
    await wrapper.get(".profile-form--info").trigger("submit");
    expect(validateProfile).toHaveBeenCalledOnce();
    expect(updateProfile).not.toHaveBeenCalled();
    validation.resolve(false);
    await flushPromises();
    await wrapper.get(".profile-form--info").trigger("submit");
    await flushPromises();
    expect(updateProfile).toHaveBeenCalledOnce();
    wrapper.unmount();
  });

  it("preserves raw password spaces and only logs out after a successful change", async () => {
    const wrapper = renderProfile();
    await flushPromises();
    const inputs = wrapper.findAll<HTMLInputElement>(".profile-form--password input");
    await inputs[0]!.setValue(" old password ");
    await inputs[1]!.setValue(" new password ");
    await inputs[2]!.setValue(" new password ");
    updatePassword.mockRejectedValueOnce(new Error("incorrect password"));
    await wrapper.get(".profile-form--password").trigger("submit");
    await flushPromises();
    expect(logout).not.toHaveBeenCalled();
    expect(inputs[1]!.element.value).toBe(" new password ");
    await wrapper.get(".profile-form--password").trigger("submit");
    await flushPromises();
    expect(updatePassword).toHaveBeenLastCalledWith({
      old_password: " old password ",
      new_password: " new password ",
    });
    expect(logout).toHaveBeenCalledOnce();
    expect(inputs[1]!.element.value).toBe("");
    wrapper.unmount();
  });

  it("offers a retry after profile loading fails without submitting blank defaults", async () => {
    getProfile.mockRejectedValueOnce(new Error("unavailable"));
    const wrapper = renderProfile();
    await flushPromises();
    expect(wrapper.get('[role="alert"]').text()).toContain("个人资料加载失败");
    expect(wrapper.find(".profile-form--info").exists()).toBe(false);
    await wrapper.get('[role="alert"] button').trigger("click");
    await flushPromises();
    expect(getProfile).toHaveBeenCalledTimes(2);
    expect(wrapper.get(".identity-account").text()).toBe("owner");
    expect(updateProfile).not.toHaveBeenCalled();
    wrapper.unmount();
  });
});
