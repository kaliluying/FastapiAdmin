import { describe, expect, it } from "vitest";

import { isSuperAdministrator } from "./superAdmin";

describe("isSuperAdministrator", () => {
  it("recognizes the explicit superuser flag", () => {
    expect(isSuperAdministrator({ is_superuser: true })).toBe(true);
  });

  it("falls back to the SUPER_ADMIN role code", () => {
    expect(
      isSuperAdministrator({
        is_superuser: undefined,
        roles: [{ id: 1, name: "超级管理员", code: "SUPER_ADMIN" }],
      })
    ).toBe(true);
  });
});
