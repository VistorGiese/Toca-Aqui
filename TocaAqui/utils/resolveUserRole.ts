import { UserRole } from "@/types";

export function resolvePrimaryRole(
  user: { role?: string; roles?: string[] },
  fallback: UserRole = "common_user"
): UserRole {
  if (user.role) return user.role as UserRole;
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    return user.roles[0] as UserRole;
  }
  return fallback;
}
