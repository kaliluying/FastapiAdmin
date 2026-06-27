import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("KnowledgeAPI", () => {
  it("exposes knowledge, document, and retrieval methods", () => {
    const source = readFileSync(resolve(__dirname, "../api/module_ai/knowledge.ts"), "utf-8");
    expect(source).toContain("listKnowledgeBase");
    expect(source).toContain("uploadDocument");
    expect(source).toContain("testRetrieval");
  });
});
