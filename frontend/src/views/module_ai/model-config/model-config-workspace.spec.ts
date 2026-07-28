import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("model config workspace", () => {
  const source = readFileSync(
    join(process.cwd(), "src/views/module_ai/model-config/index.vue"),
    "utf-8"
  );
  it("edits chat settings without exposing the current API key", () => {
    expect(source).toContain("<FaAiPageHeader");
    expect(source).not.toContain("config?.openai_api_key }}");
    expect(source).toContain("updateModelConfig");
    expect(source).toContain("Anthropic Claude");
    expect(source).toContain("向量运行状态");
  });
});
