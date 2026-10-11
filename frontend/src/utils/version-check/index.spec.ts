import { ElNotification } from "element-plus";
import { afterEach, describe, expect, it, vi } from "vitest";
import { checkForUpdate } from ".";

vi.mock("element-plus", () => ({
  ElNotification: vi.fn(),
}));

describe("version check", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("ignores an unchanged build", async () => {
    vi.stubGlobal("__APP_INFO__", { buildTimestamp: 100 });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ buildTimestamp: 100 }),
      })
    );
    const notification = vi.mocked(ElNotification);

    await checkForUpdate();

    expect(notification).not.toHaveBeenCalled();
  });

  it("notifies when the deployed build is newer", async () => {
    vi.stubGlobal("__APP_INFO__", { buildTimestamp: 100 });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ buildTimestamp: 101 }),
      })
    );
    const notification = vi.mocked(ElNotification);

    await checkForUpdate();

    expect(notification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "发现新版本",
        message: "发现新版本，点击刷新",
        duration: 0,
      })
    );
  });
});
