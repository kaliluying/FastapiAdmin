import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("global components", () => {
  it("keeps the watermark component disabled", () => {
    const source = readFileSync(join(process.cwd(), "src/config/modules/component.ts"), "utf-8");

    expect(source).toMatch(/key:\s*"watermark"[\s\S]*?enabled:\s*false/);
  });
});
