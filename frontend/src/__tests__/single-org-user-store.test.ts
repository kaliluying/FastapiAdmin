import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("single organization auth API", () => {
  it("does not expose tenant selection helpers", () => {
    const source = readFileSync(resolve(__dirname, "../api/module_system/auth.ts"), "utf-8");
    expect(source).not.toContain("getTenants(");
    expect(source).not.toContain("selectTenant(");
    expect(source).not.toContain("tenantRegister(");
  });
});
