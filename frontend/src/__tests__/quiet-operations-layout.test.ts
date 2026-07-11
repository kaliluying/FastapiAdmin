import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(__dirname, "..", path), "utf-8");

describe("Quiet Operations shell", () => {
  it("uses semantic surfaces without decorative gradients", () => {
    const layout = read("components/layouts/_fa-layouts.scss");
    expect(layout).toContain("var(--fa-color-canvas)");
    expect(layout).not.toContain("radial-gradient");
    expect(layout).not.toContain("backdrop-filter");
  });

  it("keeps the header and tabs dimensionally stable", () => {
    expect(read("components/layouts/fa-header-bar/index.vue")).toContain("fa-header-shell");
    expect(read("components/layouts/fa-work-tab/index.vue")).toContain("fa-worktab-shell");
  });
});
