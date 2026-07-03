import { describe, expect, it } from "vitest";
import { chatSessions, modules } from "./mock";

describe("mock data", () => {
  it("does not seed fake consultation sessions", () => {
    expect(chatSessions).toEqual([]);
  });

  it("uses case-file workflow labels for the main modules", () => {
    expect(modules.map((item) => item.label)).toEqual(["事实咨询", "证据整理", "申请书"]);
  });
});
