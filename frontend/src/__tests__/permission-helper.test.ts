import { describe, expect, it } from "vitest";

import { hasPermissionCode } from "@/utils/auth/permission";

describe("permission helper", () => {
  it("allows superusers without role-code shortcuts", () => {
    expect(
      hasPermissionCode("module_system:user:delete", {
        is_superuser: true,
        permissions: [],
        roles: [{ code: "USER" }],
      })
    ).toBe(true);
  });

  it("uses backend-provided permissions as the normal source of truth", () => {
    expect(
      hasPermissionCode("module_system:user:create", {
        is_superuser: false,
        permissions: ["module_system:user:create"],
        roles: [{ code: "SUPER_ADMIN" }],
      })
    ).toBe(true);

    expect(
      hasPermissionCode("module_system:user:delete", {
        is_superuser: false,
        permissions: ["module_system:user:create"],
        roles: [{ code: "SUPER_ADMIN" }],
      })
    ).toBe(false);
  });
});
