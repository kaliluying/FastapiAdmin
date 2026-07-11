import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("document workspace", () => {
  const source = readFileSync(join(process.cwd(), "src/views/module_ai/document/index.vue"), "utf-8");
  it("maps backend processing states and exposes retry", () => {
    expect(source).toContain("documentStatusMeta");
    expect(source).toContain("解析失败");
    expect(source).toContain("重新索引");
    expect(source).toContain("<FaAsyncState");
  });
});
