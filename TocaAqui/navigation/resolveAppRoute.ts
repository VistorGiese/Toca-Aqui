import { MinhasPaginas, User, UserRole } from "@/types";
import { RootStackParamList } from "./Navigate";

const ESTABLISHMENT_ROLES: UserRole[] = ["establishment_owner", "establishment"];

export function isEstablishmentRole(role?: string | null): boolean {
  return ESTABLISHMENT_ROLES.includes(role as UserRole);
}

/** Define a tela inicial após login ou restauração de sessão. */
export function resolveAppRoute(
  user: User | null,
  paginas: MinhasPaginas | null
): keyof RootStackParamList {
  if (!user) return "UserNavigator";

  const hasEstPage = !!paginas?.pagina_estabelecimento;
  const hasArtistPage = !!paginas?.pagina_artista;

  // Dono/gestor de estabelecimento sempre entra no fluxo do estabelecimento
  if (isEstablishmentRole(user.role)) {
    return hasEstPage ? "EstablishmentNavigator" : "EstablishmentOnboarding";
  }

  if (hasEstPage && !hasArtistPage) {
    return "EstablishmentNavigator";
  }

  if (hasArtistPage || user.role === "artist" || !!user.perfilArtistaId) {
    return "ArtistNavigator";
  }

  if (hasEstPage) {
    return "EstablishmentNavigator";
  }

  return "UserNavigator";
}
