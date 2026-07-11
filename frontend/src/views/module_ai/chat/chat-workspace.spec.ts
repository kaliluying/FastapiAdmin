import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("AI chat workspace", () => {
  const source = readFileSync(join(process.cwd(), "src/views/module_ai/chat/index.vue"), "utf-8");
  it("contains sessions, conversation and evidence regions", () => {
    expect(source).toContain('aria-label="会话列表"');
    expect(source).toContain('aria-label="对话内容"');
    expect(source).toContain('aria-label="回答依据"');
    expect(source).toContain("FaAiProcessStatus");
  });
});
