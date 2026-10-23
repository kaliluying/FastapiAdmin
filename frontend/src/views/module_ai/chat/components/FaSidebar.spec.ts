import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import ElementPlus, {
  ElDropdown,
  ElMessage,
  ElMessageBox,
  type MessageBoxData,
} from "element-plus";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FaSidebar from "./FaSidebar.vue";

const api = vi.hoisted(() => ({
  list: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}));
vi.mock("@/api/module_ai/chat", () => ({
  default: {
    getSessionList: api.list,
    updateSession: api.update,
    deleteSession: api.delete,
  },
}));
vi.mock("@stores", () => ({ useUserStoreHook: () => ({ basicInfo: { name: "测试用户" } }) }));

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
};
const snapshot = (title: string) => ({
  data: {
    data: {
      items: [
        {
          session_id: "B",
          session_data: { session_name: title },
          updated_at: Math.floor(Date.now() / 1000),
        },
      ],
    },
  },
});
type Snapshot = ReturnType<typeof snapshot>;
interface Sidebar {
  loadSessions: () => Promise<void>;
  loading: boolean;
  loadError: boolean;
  sessions: { id: string; title: string }[];
}
let wrapper: VueWrapper;
let sidebar: Sidebar;
let initial: ReturnType<typeof deferred<Snapshot>>;

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  vi.spyOn(ElMessage, "error").mockImplementation(() => ({ close: vi.fn() }));
  vi.spyOn(ElMessage, "success").mockImplementation(() => ({ close: vi.fn() }));
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(ElMessageBox, "confirm").mockResolvedValue("confirm" as MessageBoxData);
  vi.spyOn(ElMessageBox, "prompt").mockResolvedValue({
    value: "renamed",
    action: "confirm",
  } as MessageBoxData);
  initial = deferred<Snapshot>();
  api.list.mockReset().mockReturnValueOnce(initial.promise);
  api.update.mockReset().mockResolvedValue({});
  api.delete.mockReset().mockResolvedValue({});
  wrapper = mount(FaSidebar, { global: { plugins: [ElementPlus] } });
  sidebar = wrapper.vm as unknown as Sidebar;
});
afterEach(() => {
  wrapper.unmount();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const finishInitial = async () => {
  initial.resolve(snapshot("original"));
  await flushPromises();
};
const command = async (name: "rename" | "delete") => {
  wrapper.getComponent(ElDropdown).vm.$emit("command", name);
  await flushPromises();
};

describe("session list races", () => {
  it("keeps the latest snapshot when concurrent requests resolve in reverse order", async () => {
    const latest = deferred<Snapshot>();
    api.list.mockReturnValueOnce(latest.promise);
    const request = sidebar.loadSessions();
    latest.resolve(snapshot("latest"));
    await request;
    initial.resolve(snapshot("stale"));
    await flushPromises();
    expect(wrapper.findAll(".session-title").map((title) => title.text())).toEqual(["latest"]);
    expect(sidebar.loading).toBe(false);
    expect(sidebar.loadError).toBe(false);
  });

  it.each(["success", "error"])(
    "does not let stale %s finish loading or set an error during a newer request",
    async (outcome) => {
      const latest = deferred<Snapshot>();
      api.list.mockReturnValueOnce(latest.promise);
      const request = sidebar.loadSessions();
      if (outcome === "error") initial.reject(new Error("stale failure"));
      else initial.resolve(snapshot("stale"));
      await flushPromises();
      expect(sidebar.loading).toBe(true);
      expect(sidebar.loadError).toBe(false);
      expect(wrapper.find(".session-title").exists()).toBe(false);
      latest.resolve(snapshot("latest"));
      await request;
      expect(sidebar.loading).toBe(false);
      expect(sidebar.loadError).toBe(false);
    }
  );

  it("keeps the latest error when an older successful snapshot arrives", async () => {
    const latest = deferred<Snapshot>();
    api.list.mockReturnValueOnce(latest.promise);
    const request = sidebar.loadSessions();
    latest.reject(new Error("latest failure"));
    await request;
    initial.resolve(snapshot("stale"));
    await flushPromises();
    expect(sidebar.loadError).toBe(true);
    expect(sidebar.loading).toBe(false);
    expect(wrapper.text()).toContain("会话列表加载失败");
    expect(wrapper.find(".session-title").exists()).toBe(false);
  });

  it.each([
    ["rename", "success"],
    ["rename", "error"],
    ["delete", "success"],
    ["delete", "error"],
  ] as const)(
    "invalidates snapshots started before and during %s, including stale %s and loading",
    async (name, outcome) => {
      await finishInitial();
      const before = deferred<Snapshot>();
      api.list.mockReturnValueOnce(before.promise);
      const beforeRequest = sidebar.loadSessions();
      const mutation = deferred<object>();
      (name === "rename" ? api.update : api.delete).mockReturnValueOnce(mutation.promise);
      await command(name);
      const during = deferred<Snapshot>();
      api.list.mockReturnValueOnce(during.promise);
      const duringRequest = sidebar.loadSessions();
      mutation.resolve({});
      await flushPromises();
      expect(sidebar.loading).toBe(false);
      expect(sidebar.loadError).toBe(false);
      expect(wrapper.findAll(".session-title").map((title) => title.text())).toEqual(
        name === "rename" ? ["renamed"] : []
      );
      before.resolve(snapshot("stale"));
      if (outcome === "success") during.resolve(snapshot("stale"));
      else during.reject(new Error("stale failure"));
      await Promise.all([beforeRequest, duringRequest]);
      await flushPromises();
      expect(wrapper.findAll(".session-title").map((title) => title.text())).toEqual(
        name === "rename" ? ["renamed"] : []
      );
      expect(sidebar.loadError).toBe(false);
      expect(sidebar.loading).toBe(false);
      const newest = deferred<Snapshot>();
      api.list.mockReturnValueOnce(newest.promise);
      const newestRequest = sidebar.loadSessions();
      expect(sidebar.loading).toBe(true);
      newest.resolve(snapshot("fresh"));
      await newestRequest;
      await flushPromises();
      expect(wrapper.get(".session-title").text()).toBe("fresh");
      expect(sidebar.loading).toBe(false);
    }
  );

  it("renames the currently rendered item after a snapshot replaces it during the mutation", async () => {
    await finishInitial();
    const rename = deferred<object>();
    api.update.mockReturnValueOnce(rename.promise);
    await command("rename");
    api.list.mockResolvedValueOnce(snapshot("replacement"));
    await sidebar.loadSessions();
    rename.resolve({});
    await flushPromises();
    expect(wrapper.get(".session-title").text()).toBe("renamed");
    expect(api.update).toHaveBeenCalledWith("B", { title: "renamed" });
  });

  it.each(["success", "error"])("ignores a late list %s after unmount", async (outcome) => {
    wrapper.unmount();
    if (outcome === "error") initial.reject(new Error("after unmount"));
    else initial.resolve(snapshot("late"));
    await flushPromises();
    expect(sidebar.loading).toBe(false);
    expect(sidebar.loadError).toBe(false);
    expect(console.error).not.toHaveBeenCalled();
    expect(api.list).toHaveBeenCalledTimes(1);
    await sidebar.loadSessions();
    expect(api.list).toHaveBeenCalledTimes(1);
  });

  it.each(["rename", "delete"] as const)(
    "ignores a late %s mutation after unmount",
    async (name) => {
      await finishInitial();
      const mutation = deferred<object>();
      (name === "rename" ? api.update : api.delete).mockReturnValueOnce(mutation.promise);
      await command(name);
      wrapper.unmount();
      mutation.resolve({});
      await flushPromises();
      expect(sidebar.sessions.map((session) => session.title)).toEqual(["original"]);
      expect(wrapper.emitted("delete-session")).toBeUndefined();
      expect(ElMessage.success).not.toHaveBeenCalled();
    }
  );
});
