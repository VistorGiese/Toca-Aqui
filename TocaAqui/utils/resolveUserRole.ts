import { UserRole } from "@/types";

/** Extrai o papel principal a partir de role ou roles[] (resposta da API). */
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
