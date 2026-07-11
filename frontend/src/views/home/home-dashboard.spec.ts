import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("operations dashboard", () => {
  const home = readFileSync(resolve(__dirname, "index.vue"), "utf-8");

  it("shows system health and marks static metrics as sample data", () => {
    expect(home).toContain("运营总览");
    expect(home).toContain("示例数据");
    expect(home).toContain("平均响应");
    expect(home).toContain("待处理事项");
  });
});
