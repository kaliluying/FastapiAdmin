import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("retrieval test workspace", () => {
  const source = readFileSync(join(process.cwd(), "src/views/module_ai/retrieval/index.vue"), "utf-8");
  it("separates primary query from advanced settings and results", () => {
    expect(source).toContain("高级设置");
    expect(source).toContain("检索结果");
    expect(source).toContain("result-rank");
    expect(source).toContain("<FaAsyncState");
  });
});
