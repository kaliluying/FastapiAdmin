import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "index.vue"), "utf-8");

describe("sidebar layout sizing", () => {
  it("binds the parent width in both expanded and collapsed states", () => {
    expect(source).toContain(".menu-left-open");
    expect(source).toContain("width: v-bind(menuopenwidth)");
    expect(source).toContain(".menu-left-close");
    expect(source).toContain("width: v-bind(menuclosewidth)");
  });

  it("allows the brand title to shrink instead of widening the sidebar", () => {
    expect(source).toContain("width: calc(100% - 34px)");
    expect(source).toContain("text-overflow: ellipsis");
  });
});
