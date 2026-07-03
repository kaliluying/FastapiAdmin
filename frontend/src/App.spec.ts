import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("App watermark", () => {
  it("does not render from persisted watermark settings", () => {
    const source = readFileSync(join(process.cwd(), "src/App.vue"), "utf-8");

    expect(source).not.toContain("settingsStore.showWatermark");
    expect(source).not.toContain("ElWatermark");
  });
});
