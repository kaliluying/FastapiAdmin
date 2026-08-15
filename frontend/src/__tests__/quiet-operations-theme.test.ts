import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(__dirname, "..", path), "utf-8");

describe("Quiet Operations theme contract", () => {
  it("defines semantic surface, radius, density, and motion tokens", () => {
    const tokens = source("styles/core/_fa-tokens.scss");
    expect(tokens).toContain("--fa-color-surface");
    expect(tokens).toContain("--fa-color-sidebar");
    expect(tokens).toContain("--fa-radius-panel: 6px");
    expect(tokens).toContain("--fa-control-height: 36px");
    expect(tokens).toContain("--fa-motion-page: 200ms");
  });

  it("supports reduced motion and a real dark surface hierarchy", () => {
    expect(source("styles/animations/router-transition.scss")).toContain("prefers-reduced-motion");
    const dark = source("styles/element-plus/_dark.scss");
    expect(dark).toContain("--fa-color-surface-raised");
    expect(dark).toContain("--fa-color-border");
  });

  it("uses Quiet Operations teal as the default configurable brand color", () => {
    expect(source("config/setting.ts")).toContain('"#2d7d72"');
  });
});
