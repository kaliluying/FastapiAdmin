export interface PermissionContext {
  is_superuser?: boolean;
  permissions?: string[];
  roles?: unknown[];
}

export function hasPermissionCode(auth: string, context: PermissionContext): boolean {
  if (!auth) return true;
  if (context.is_superuser === true) return true;

  const permissions = context.permissions ?? [];
  return permissions.includes("*:*:*") || permissions.includes(auth);
}
