import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("global accessibility contracts", () => {
  it("keeps skip navigation and visible focus styles", () => {
    const layout = readFileSync(resolve(__dirname, "../components/layouts/index.vue"), "utf-8");
    const app = readFileSync(resolve(__dirname, "../styles/core/app.scss"), "utf-8");
    expect(layout).toContain('href="#app-content"');
    expect(app).toContain(":focus-visible");
  });
});
