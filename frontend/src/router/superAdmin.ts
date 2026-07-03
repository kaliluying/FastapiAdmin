import type { UserInfo } from "@/api/module_system/user";

export function isSuperAdministrator(info: Partial<UserInfo> | undefined): boolean {
  if (info?.is_superuser === true) {
    return true;
  }

  return (
    info?.roles?.some((role) => {
      const code = role.code?.trim().toUpperCase();
      return code === "SUPER_ADMIN";
    }) ?? false
  );
}
