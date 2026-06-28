import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("MenuProcessor AI route fallbacks", () => {
  it("adds hidden document and retrieval routes when backend menu is stale", () => {
    const source = readFileSync(resolve(__dirname, "../router/MenuProcessor.ts"), "utf-8");

    expect(source).toContain("mergeMissingBuiltinRoutes");
    expect(source).toContain('path: "/module_ai/document"');
    expect(source).toContain('component: "/module_ai/document/index"');
    expect(source).toContain('path: "/module_ai/retrieval"');
    expect(source).toContain('component: "/module_ai/retrieval/index"');
    expect(source).toContain("mergeMissingBuiltinRoutes(routes, builtinFrontendRoutes)");
  });
});
