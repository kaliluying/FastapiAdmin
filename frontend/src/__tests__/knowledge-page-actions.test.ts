import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Knowledge page actions", () => {
  it("surfaces document actions and index status from the knowledge list", () => {
    const source = readFileSync(resolve(__dirname, "../views/module_ai/knowledge/index.vue"), "utf-8");

    expect(source).toContain("indexed_document_count");
    expect(source).toContain("failed_document_count");
    expect(source).toContain("上传文档");
    expect(source).toContain("查看文档");
    expect(source).toContain("检索测试");
    expect(source).toContain("goUploadDocuments");
  });

  it("renders table actions as a compact button group", () => {
    const source = readFileSync(resolve(__dirname, "../views/module_ai/knowledge/index.vue"), "utf-8");

    expect(source).toContain('class="action-buttons"');
    expect(source).toContain('class="action-button"');
    expect(source).toContain('class="action-button action-button-danger"');
  });

  it("prompts for document upload after a new knowledge base is created", () => {
    const source = readFileSync(resolve(__dirname, "../views/module_ai/knowledge/index.vue"), "utf-8");

    expect(source).toContain("知识库已创建");
    expect(source).toContain("去上传文档");
  });
});
