import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("AI operations pages", () => {
  it("uses shared AI headers for memory and model configuration", () => {
    const memory = readFileSync(join(process.cwd(), "src/views/module_ai/memory/index.vue"), "utf-8");
    const model = readFileSync(join(process.cwd(), "src/views/module_ai/model-config/index.vue"), "utf-8");
    expect(memory).toContain("<FaAiPageHeader");
    expect(model).toContain("<FaAiPageHeader");
    expect(model).toContain("openai_api_key_configured");
    expect(model).not.toContain("config?.openai_api_key }}");
  });
});
