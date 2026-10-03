import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import ElementPlus from "element-plus";
import FaTable from "./index.vue";
import { useTable } from "@/hooks/core/useTable";

vi.mock("@utils", async () => import("@/utils/table"));
vi.mock("@stores", () => ({
  useTableStore: () => ({
    isBorder: ref(false),
    isZebra: ref(false),
    tableSize: ref("default"),
    isFullScreen: ref(false),
    isHeaderBackground: ref(false),
    isRowDrag: ref(false),
    highlightCurrentRow: ref(false),
  }),
}));
vi.mock("@/hooks/core/useCommon", () => ({ useCommon: () => ({ scrollToTop: vi.fn() }) }));
vi.mock("@/hooks/core/useTableHeight", () => ({ useTableHeight: vi.fn() }));
vi.stubGlobal("useResizeObserver", vi.fn());

afterEach(() => vi.restoreAllMocks());

describe("responsive pagination", () => {
  it("updates its layout after resizing without overriding caller options", async () => {
    const initialWidth = window.innerWidth;
    const wrapper = mount(FaTable, {
      props: { data: [], pagination: { current: 1, size: 10, total: 100 } },
      global: {
        plugins: [ElementPlus],
        stubs: {
          VueDraggable: { template: "<div><slot /></div>" },
          FaPagination: {
            props: ["layout", "pagerCount"],
            template:
              '<div class="pagination-probe" :data-layout="layout" :data-count="pagerCount" />',
          },
        },
      },
    });
    for (const [width, layout, count] of [
      [1440, "total, prev, pager, next, sizes, jumper", 7],
      [375, "prev, next, total", 5],
    ] as const) {
      Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
      window.dispatchEvent(new Event("resize"));
      await nextTick();
      expect(wrapper.get(".pagination-probe").attributes("data-layout")).toBe(layout);
      expect(wrapper.get(".pagination-probe").attributes("data-count")).toBe(String(count));
    }
    await wrapper.setProps({ paginationOptions: { layout: "prev, next", pagerCount: 9 } });
    expect(wrapper.get(".pagination-probe").attributes("data-layout")).toBe("prev, next");
    expect(wrapper.get(".pagination-probe").attributes("data-count")).toBe("9");
    wrapper.unmount();
    Object.defineProperty(window, "innerWidth", { configurable: true, value: initialWidth });
  });
});

function createTable(apiFn: (params: Record<string, unknown>) => Promise<unknown>) {
  let table!: ReturnType<typeof useTable<typeof apiFn>>;
  const wrapper = mount(
    defineComponent({
      setup() {
        table = useTable({
          core: { apiFn, apiParams: { username: "目标用户" }, immediate: false },
        });
        return () =>
          h(FaTable, {
            data: table.data.value,
            error: table.error.value,
            loading: table.loading.value,
            onRetry: table.refreshData,
          });
      },
    }),
    {
      global: {
        plugins: [ElementPlus],
        stubs: { VueDraggable: { template: "<div><slot /></div>" } },
      },
    }
  );
  return { table, wrapper };
}

describe("table failure recovery", () => {
  it("keeps failure visible and retries with the same filters and page", async () => {
    const pending = Promise.withResolvers<unknown>();
    const api = vi
      .fn()
      .mockRejectedValueOnce(new Error("网络不可用"))
      .mockRejectedValueOnce(new Error("仍然不可用"))
      .mockReturnValue(pending.promise);
    const { table, wrapper } = createTable(api);
    await table.handleCurrentChange(3);
    await flushPromises();
    expect(table.error.value?.message).toBe("网络不可用");
    expect(wrapper.get('[role="alert"]').text()).toContain("网络不可用");
    expect(wrapper.text()).not.toContain("暂无数据");
    await wrapper.get("button").trigger("click");
    await flushPromises();
    expect(api.mock.calls[1]![0]).toEqual(api.mock.calls[0]![0]);
    expect(api.mock.calls[1]![0]).toMatchObject({ username: "目标用户", page_no: 3 });
    expect(wrapper.get('[role="alert"]').text()).toContain("仍然不可用");
    expect(wrapper.text()).not.toContain("暂无数据");
    await wrapper.get("button").trigger("click");
    await flushPromises();
    expect(api.mock.calls[2]![0]).toEqual(api.mock.calls[0]![0]);
    expect(table.loading.value).toBe(true);
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(wrapper.text()).not.toContain("暂无数据");
    pending.resolve({ records: [], total: 0, current: 3, size: 10 });
    await flushPromises();
    expect(table.error.value).toBeNull();
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(wrapper.text()).toContain("暂无数据");
    wrapper.unmount();
  });

  it("records the failure for every table sharing a pending request", async () => {
    const pending = Promise.withResolvers<unknown>();
    const api = vi.fn().mockReturnValue(pending.promise);
    const first = createTable(api);
    const second = createTable(api);
    const requests = [first.table.fetchData(), second.table.fetchData()];
    pending.reject(new Error("共享请求失败"));
    await Promise.all(requests);
    expect(api).toHaveBeenCalledOnce();
    expect(first.table.error.value?.message).toBe("共享请求失败");
    expect(second.table.error.value?.message).toBe("共享请求失败");
    first.wrapper.unmount();
    second.wrapper.unmount();
  });
});
