import { computed, defineComponent, nextTick, reactive, ref } from "vue";
import { flushPromises, shallowMount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import UserPage from "@/views/module_system/user/index.vue";

const { importUser, refreshData, success, warning, error } = vi.hoisted(() => ({
  importUser: vi.fn(),
  refreshData: vi.fn(),
  success: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
}));

vi.mock("@/api/module_system/user", () => ({ default: { importUser } }));
vi.mock("@/api/module_system/role", () => ({ default: {} }));
vi.mock("@stores", () => ({
  useAppStore: () => ({ device: "desktop" }),
  useUserStore: () => ({ basicInfo: { id: 1 } }),
}));
vi.mock("@utils", () => ({
  renderTableOperationCell: vi.fn(),
  resolveStatusColumns: (factory: unknown) => factory,
}));
vi.mock("@/hooks/core/useAuth", () => ({ useAuth: () => ({ hasAuth: () => true }) }));
vi.mock("@/hooks/core/useCrudDialog", () => ({
  useCrudDialog: () => ({ dialogVisible: reactive({ visible: false }) }),
}));
vi.mock("@/hooks/core/useTableSelection", () => ({
  useTableSelection: () => ({
    selectedRows: ref([]),
    selectedIds: ref([]),
    batchDeleting: ref(false),
    onTableSelectionChange: vi.fn(),
  }),
}));
vi.mock("@/hooks/core/useTable", () => ({
  useTable: (config: { core: { columnsFactory: () => unknown[] } }) => ({
    columns: ref(config.core.columnsFactory()),
    columnChecks: ref([]),
    data: ref([]),
    loading: ref(false),
    pagination: {},
    searchParams: {},
    refreshData,
  }),
}));
vi.mock("@/hooks/core/useConfirm", () => ({
  confirmDelete: vi.fn(),
  confirmBatchDelete: vi.fn(),
  confirmToggleStatus: vi.fn(),
}));
vi.mock("element-plus", () => ({
  ElMessage: { success, warning, error },
  ElMessageBox: {},
  ElAvatar: {},
}));
vi.mock("@/components/layouts/fa-page-header/index.vue", () => ({
  default: { template: "<header />" },
}));

const ImportStub = defineComponent({
  name: "ImportStub",
  props: ["modelValue", "loading"],
  emits: ["upload"],
  template: "<div />",
});
const AlertStub = defineComponent({
  props: ["title", "type"],
  template: "<section role='status'><h2>{{ title }}</h2><slot /></section>",
});
const TableStub = defineComponent({ name: "FaTable", props: ["columns"], template: "<div />" });

function mountPage() {
  return shallowMount(UserPage, {
    global: {
      stubs: {
        FaImportDialog: ImportStub,
        FaTable: TableStub,
        ElAlert: AlertStub,
        ElCard: { template: "<div><slot /></div>" },
      },
      directives: { auth: {} },
    },
  });
}

describe("User batch import feedback", () => {
  afterEach(() => vi.unstubAllGlobals());
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("ref", ref);
    vi.stubGlobal("reactive", reactive);
    vi.stubGlobal("computed", computed);
    vi.stubGlobal("nextTick", nextTick);
  });

  it.each([
    [2, 0, "success"],
    [1, 1, "warning"],
    [0, 2, "error"],
  ] as const)(
    "shows accurate feedback for %i successful and %i failed rows",
    async (successCount, failedCount, level) => {
      importUser.mockResolvedValue({
        data: {
          code: 0,
          data: {
            success_count: successCount,
            failed_count: failedCount,
            errors: failedCount ? [{ row: 3, message: "性别不合法" }] : [],
            message: "兼容摘要",
          },
        },
      });
      const wrapper = mountPage();
      wrapper.getComponent(ImportStub).vm.$emit("upload", new FormData());
      await flushPromises();

      expect({ success, warning, error }[level]).toHaveBeenCalledWith(
        `导入结果：成功 ${successCount} 条，失败 ${failedCount} 条`
      );
      expect(wrapper.getComponent(AlertStub).props("type")).toBe(level);
      expect(wrapper.text()).toContain(`成功 ${successCount} 条，失败 ${failedCount} 条`);
      if (failedCount) expect(wrapper.text()).toContain("第 3 行：性别不合法");
      expect(refreshData).toHaveBeenCalledTimes(successCount ? 1 : 0);
      expect(wrapper.getComponent(ImportStub).props("loading")).toBe(false);
      wrapper.unmount();
    }
  );

  it("keeps compatibility with the previous string response", async () => {
    importUser.mockResolvedValue({
      data: { code: 0, msg: "导入用户成功", data: "成功导入 1 条数据" },
    });
    const wrapper = mountPage();
    wrapper.getComponent(ImportStub).vm.$emit("upload", new FormData());
    await flushPromises();
    expect(success).toHaveBeenCalledWith("导入用户成功，成功导入 1 条数据");
    expect(refreshData).toHaveBeenCalledOnce();
    wrapper.unmount();
  });

  it("uses the schema gender codes for table display", () => {
    const wrapper = mountPage();
    const columns = wrapper.findComponent({ name: "FaTable" }).props("columns");
    expect(columns.find((column: { prop: string }) => column.prop === "gender").status).toEqual({
      "0": { type: "success", text: "男" },
      "1": { type: "warning", text: "女" },
      "2": { type: "info", text: "未知" },
    });
    wrapper.unmount();
  });
});
