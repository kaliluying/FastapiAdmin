import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("model config workspace", () => {
  const source = readFileSync(join(process.cwd(), "src/views/module_ai/model-config/index.vue"), "utf-8");
  it("shows api key as configured status only", () => {
    expect(source).toContain("<FaAiPageHeader");
    expect(source).not.toContain("config?.openai_api_key }}");
  });
});
