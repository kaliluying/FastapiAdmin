import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Knowledge document page", () => {
  it("keeps the upload entry clickable before a knowledge base is selected", () => {
    const source = readFileSync(resolve(__dirname, "../views/module_ai/document/index.vue"), "utf-8");

    expect(source).not.toContain(':disabled="!query.knowledge_base_id"');
    expect(source).toContain("openUploadDialog");
  });
});
