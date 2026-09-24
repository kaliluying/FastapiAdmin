import { defineComponent, reactive } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfilePage from "@/views/profile/index.vue";

const { getCurrentUserInfo, updateCurrentUserInfo, changeCurrentUserPassword, getUserInfo, logout } = vi.hoisted(() => ({
  getCurrentUserInfo: vi.fn(),
  updateCurrentUserInfo: vi.fn(),
  changeCurrentUserPassword: vi.fn(),
  getUserInfo: vi.fn(),
  logout: vi.fn(),
}));

vi.mock("@/api/module_system/user", () => ({
  default: { getCurrentUserInfo, updateCurrentUserInfo, changeCurrentUserPassword },
}));
vi.mock("@stores", () => ({
  useUserStore: () => ({ info: { is_superuser: true }, getUserInfo, logout }),
}));
vi.mock("vue-router", () => ({
  useRoute: () => reactive({ query: { tab: "password" } }),
  useRouter: () => ({ replace: vi.fn() }),
}));
vi.mock("element-plus", () => ({
  ElMessage: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const FormStub = defineComponent({
  setup(_props, { expose }) {
    expose({ validate: () => Promise.resolve(true) });
  },
  template: "<form><slot /></form>",
});

const stubs = {
  ElAlert: true,
  ElButton: { emits: ["click"], template: '<button type="button" @click="$emit(\'click\')"><slot /></button>' },
  ElForm: FormStub,
  ElFormItem: { template: "<div><slot /></div>" },
  ElInput: {
    props: ["modelValue"],
    template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
  ElOption: true,
  ElSelect: true,
  ElTabs: { template: "<div><slot /></div>" },
  ElTabPane: { template: "<section><slot /></section>" },
  FaPageHeader: true,
  FaSvgIcon: true,
};

describe("Profile page", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends only changed profile fields", async () => {
    getCurrentUserInfo.mockResolvedValue({ data: { data: {
      username: "super", name: "原姓名", email: "super@example.com", mobile: "13800138000", gender: "0",
    } } });
    updateCurrentUserInfo.mockResolvedValue({ data: { code: 200 } });
    getUserInfo.mockResolvedValue(undefined);
    const wrapper = mount(ProfilePage, { global: { stubs, directives: { loading: {} } } });
    await flushPromises();

    await wrapper.findAll("input")[1]!.setValue("新姓名");
    await wrapper.findAll("button").find((button) => button.text() === "保存资料")!.trigger("click");
    await flushPromises();

    expect(updateCurrentUserInfo).toHaveBeenCalledWith({ name: "新姓名" });
    expect(getUserInfo).toHaveBeenCalledOnce();
  });

  it("submits only old and new passwords, then signs out", async () => {
    getCurrentUserInfo.mockResolvedValue({ data: { data: { username: "super", name: "超级管理员", gender: "2" } } });
    changeCurrentUserPassword.mockResolvedValue({ data: { code: 200 } });
    logout.mockResolvedValue(undefined);

    const wrapper = mount(ProfilePage, { global: { stubs, directives: { loading: {} } } });
    await flushPromises();
    changeCurrentUserPassword.mockClear();
    logout.mockClear();
    const inputs = wrapper.findAll("input");
    await inputs.at(-3)!.setValue("Current123");
    await inputs.at(-2)!.setValue("Changed123");
    await inputs.at(-1)!.setValue("Changed123");
    await wrapper.findAll("button").find((button) => button.text() === "修改密码")!.trigger("click");
    await flushPromises();

    expect(changeCurrentUserPassword).toHaveBeenCalledWith({ old_password: "Current123", new_password: "Changed123" });
    expect(logout).toHaveBeenCalledOnce();
    expect(updateCurrentUserInfo).not.toHaveBeenCalled();
  });
});
