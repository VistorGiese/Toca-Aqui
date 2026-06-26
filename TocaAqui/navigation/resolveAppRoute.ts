import { MinhasPaginas, User } from "@/types";
import { RootStackParamList } from "./Navigate";

/** @deprecated Mantido para compatibilidade em telas legadas. */
export function isEstablishmentRole(role?: string | null): boolean {
  return role === "establishment_owner" || role === "establishment";
}

export function resolveAppRoute(
  user: User | null,
  _paginas: MinhasPaginas | null
): keyof RootStackParamList {
  if (!user) return "UserNavigator";

  // Sempre inicia como usuário comum; estabelecimento/artista via Configurações.
  return "UserNavigator";
}
