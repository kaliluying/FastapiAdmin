import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("AI workspace responsive contract", () => {
  it("defines tablet and mobile panel behavior", () => {
    const chat = readFileSync(join(process.cwd(), "src/views/module_ai/chat/index.vue"), "utf-8");
    expect(chat).toContain("@media");
    expect(chat).toContain("1024px");
    expect(chat).toContain("768px");
    expect(chat).toContain("ElDrawer");
  });
});
