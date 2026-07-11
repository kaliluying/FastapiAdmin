import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("knowledge workspace", () => {
  const source = readFileSync(join(process.cwd(), "src/views/module_ai/knowledge/index.vue"), "utf-8");
  it("uses shared page and async-state primitives", () => {
    expect(source).toContain("<FaAiPageHeader");
    expect(source).toContain("<FaAsyncState");
    expect(source).toContain("上传文档");
    expect(source).toContain("检索测试");
  });
});
