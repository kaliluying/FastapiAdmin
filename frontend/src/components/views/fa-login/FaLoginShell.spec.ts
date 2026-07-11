import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("login shell", () => {
  const css = readFileSync(resolve(__dirname, "_fa-login.scss"), "utf-8");
  it("uses semantic surfaces and mobile constraints", () => {
    expect(css).toContain("var(--fa-color-canvas)");
    expect(css).toContain("@media");
    expect(css).not.toContain("radial-gradient");
  });
});
