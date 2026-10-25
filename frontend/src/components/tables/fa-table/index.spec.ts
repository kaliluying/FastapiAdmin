import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import ElementPlus from "element-plus";
import FaTable from "./index.vue";
import { useTable } from "@/hooks/core/useTable";
import { Auth } from "@/utils/auth";

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

describe("table request lifecycle", () => {
  it("fetches fresh results after completion while merging pending requests", async () => {
    const pending = Promise.withResolvers<unknown>();
    const api = vi
      .fn()
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValue({
        records: [{ id: 2 }],
        total: 1,
        current: 1,
        size: 10,
      });
    const { table, wrapper } = createTable(api);
    const first = table.fetchData();
    const duplicate = table.fetchData();
    expect(api).toHaveBeenCalledOnce();
    pending.resolve({ records: [{ id: 1 }], total: 1, current: 1, size: 10 });
    await Promise.all([first, duplicate]);
    expect(table.data.value).toEqual([{ id: 1 }]);
    await table.refreshUpdate();
    expect(api).toHaveBeenCalledTimes(2);
    expect(table.data.value).toEqual([{ id: 2 }]);
    wrapper.unmount();
  });

  it("ignores an older response after a new search replaces the request", async () => {
    const oldRequest = Promise.withResolvers<unknown>();
    const newRequest = Promise.withResolvers<unknown>();
    const api = vi
      .fn()
      .mockReturnValueOnce(oldRequest.promise)
      .mockReturnValueOnce(newRequest.promise);
    const { table, wrapper } = createTable(api);
    const first = table.getData({ username: "旧查询" });
    const second = table.getData({ username: "新查询" });
    newRequest.resolve({ records: [{ id: 2 }], total: 1, current: 1, size: 10 });
    await second;
    oldRequest.resolve({ records: [{ id: 1 }], total: 1, current: 1, size: 10 });
    await first;
    expect(table.data.value).toEqual([{ id: 2 }]);
    expect(table.error.value).toBeNull();
    wrapper.unmount();
  });
});

describe("table shared request isolation", () => {
  it("does not merge different APIs with identical parameters", async () => {
    const pending = Promise.withResolvers<unknown>();
    const firstApi = vi.fn().mockReturnValue(pending.promise);
    const secondApi = vi
      .fn()
      .mockResolvedValue({ records: [{ id: 2 }], total: 1, current: 1, size: 10 });
    const first = createTable(firstApi);
    const second = createTable(secondApi);
    const calls = [first.table.fetchData(), second.table.fetchData()];
    pending.resolve({ records: [{ id: 1 }], total: 1, current: 1, size: 10 });
    await Promise.all(calls);
    expect(secondApi).toHaveBeenCalledOnce();
    expect(first.table.data.value).toEqual([{ id: 1 }]);
    expect(second.table.data.value).toEqual([{ id: 2 }]);
    first.wrapper.unmount();
    second.wrapper.unmount();
  });

  it("does not let a shared older response replace a newer query", async () => {
    const pending = Promise.withResolvers<unknown>();
    const api = vi
      .fn()
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce({ records: [{ id: 2 }], total: 1, current: 1, size: 10 });
    const first = createTable(api);
    const second = createTable(api);
    const calls = [first.table.fetchData(), second.table.fetchData()];
    await second.table.getData({ username: "新查询" });
    pending.resolve({ records: [{ id: 1 }], total: 1, current: 1, size: 10 });
    await Promise.all(calls);
    expect(second.table.data.value).toEqual([{ id: 2 }]);
    expect(second.table.error.value).toBeNull();
    first.wrapper.unmount();
    second.wrapper.unmount();
  });

  it("does not let a shared older failure clear newer results", async () => {
    const pending = Promise.withResolvers<unknown>();
    const api = vi
      .fn()
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce({ records: [{ id: 2 }], total: 1, current: 1, size: 10 });
    const first = createTable(api);
    const second = createTable(api);
    const calls = [first.table.fetchData(), second.table.fetchData()];
    await second.table.getData({ username: "新查询" });
    pending.reject(new Error("旧请求失败"));
    await Promise.all(calls);
    expect(second.table.data.value).toEqual([{ id: 2 }]);
    expect(second.table.error.value).toBeNull();
    first.wrapper.unmount();
    second.wrapper.unmount();
  });

  it("keeps shared requests usable when the first consumer unmounts", async () => {
    const pending = Promise.withResolvers<unknown>();
    const api = vi.fn().mockReturnValue(pending.promise);
    const first = createTable(api);
    const second = createTable(api);
    const calls = [first.table.fetchData(), second.table.fetchData()];
    first.wrapper.unmount();
    pending.resolve({ records: [{ id: 1 }], total: 1, current: 1, size: 10 });
    await Promise.all(calls);
    expect(api).toHaveBeenCalledOnce();
    expect(second.table.data.value).toEqual([{ id: 1 }]);
    expect(second.table.loading.value).toBe(false);
    second.wrapper.unmount();
  });
});

it("does not share pending responses across authentication sessions", async () => {
  const pending = Promise.withResolvers<unknown>();
  const api = vi
    .fn()
    .mockReturnValueOnce(pending.promise)
    .mockResolvedValueOnce({ records: [{ id: 2 }], total: 1, current: 1, size: 10 });
  const first = createTable(api);
  Auth.setTokens("test-session-a", "", false);
  const firstRequest = first.table.fetchData();
  Auth.setTokens("test-session-b", "", false);
  const second = createTable(api);
  await second.table.fetchData();
  pending.resolve({ records: [{ id: 1 }], total: 1, current: 1, size: 10 });
  await firstRequest;
  expect(api).toHaveBeenCalledTimes(2);
  expect(second.table.data.value).toEqual([{ id: 2 }]);
  expect(first.table.data.value).toEqual([]);
  first.wrapper.unmount();
  second.wrapper.unmount();
  Auth.clearAuth();
});

it("accepts a pending response after token renewal within the same session", async () => {
  const pending = Promise.withResolvers<unknown>();
  const api = vi.fn().mockReturnValue(pending.promise);
  const token = (expiry: number) =>
    `header.${btoa(JSON.stringify({ sub: "test-same-session", exp: expiry }))}.signature`;
  Auth.setTokens(token(1), "refresh", false);
  const first = createTable(api);
  const firstRequest = first.table.fetchData();
  const { default: AuthAPI } = await import("@/api/module_system/auth");
  vi.spyOn(AuthAPI, "refreshToken").mockResolvedValue({
    data: { data: { access_token: token(2), refresh_token: "renewed-refresh" } },
  } as Awaited<ReturnType<typeof AuthAPI.refreshToken>>);
  await Auth.refreshTokens();
  const second = createTable(api);
  const secondRequest = second.table.fetchData();
  pending.resolve({ records: [{ id: 1 }], total: 1, current: 1, size: 10 });
  await Promise.all([firstRequest, secondRequest]);
  expect(api).toHaveBeenCalledOnce();
  expect(first.table.data.value).toEqual([{ id: 1 }]);
  expect(second.table.data.value).toEqual([{ id: 1 }]);
  first.wrapper.unmount();
  second.wrapper.unmount();
  Auth.clearAuth();
});

describe("table virtual mode", () => {
  it("switches to virtual wrapper when virtual prop is enabled", async () => {
    const wrapper = mount(FaTable, {
      props: {
        virtual: true,
        data: [{ id: 1, name: "item-1" }],
        columns: [{ prop: "name", label: "名称" }],
      },
      global: {
        plugins: [ElementPlus],
        stubs: {
          ElAutoResizer: {
            template: '<div class="auto-resizer-stub"><slot :height="500" :width="800" /></div>',
          },
          ElTableV2: {
            props: ["data", "columns", "height", "width"],
            template: '<div class="table-v2-stub" :data-count="data.length" />',
          },
        },
      },
    });

    expect(wrapper.find(".fa-table__virtual-wrap").exists()).toBe(true);
    expect(wrapper.find(".fa-table__drag-wrap").exists()).toBe(false);
    expect(wrapper.find(".table-v2-stub").attributes("data-count")).toBe("1");

    await wrapper.setProps({ virtual: false });
    expect(wrapper.find(".fa-table__virtual-wrap").exists()).toBe(false);
    wrapper.unmount();
  });
});
