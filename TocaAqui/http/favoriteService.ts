import api from "./api";
import { parseJsonArray } from "@/utils/artistProfile";

export type FavoritavelTipo =
  | "perfil_artista"
  | "perfil_estabelecimento"
  | "banda"
  | "agendamento";

export interface FavoriteArtistItem {
  id: number;
  nome_artistico: string;
  generos?: string[];
}

export interface FavoriteEstablishmentItem {
  id: number;
  nome_estabelecimento: string;
  cidade?: string;
}

function mapFavoriteArtist(raw: Record<string, unknown>): FavoriteArtistItem | null {
  const id = Number(raw.id);
  if (!id) return null;
  return {
    id,
    nome_artistico: String(raw.nome_artistico ?? "Artista"),
    generos: parseJsonArray(raw.generos ?? raw.generos_musicais),
  };
}

function mapFavoriteEstablishment(raw: Record<string, unknown>): FavoriteEstablishmentItem | null {
  const id = Number(raw.id);
  if (!id) return null;
  const address = raw.Address as { cidade?: string } | undefined;
  return {
    id,
    nome_estabelecimento: String(raw.nome_estabelecimento ?? "Estabelecimento"),
    cidade: address?.cidade ?? (raw.cidade != null ? String(raw.cidade) : undefined),
  };
}

export const favoriteService = {
  async listFavoriteArtists(): Promise<FavoriteArtistItem[]> {
    try {
      const r = await api.get("/favoritos", { params: { tipo: "perfil_artista" } });
      const favoritos = Array.isArray(r.data?.favoritos) ? r.data.favoritos : [];
      return favoritos
        .map((fav: { item?: Record<string, unknown> }) =>
          fav.item ? mapFavoriteArtist(fav.item) : null
        )
        .filter((item): item is FavoriteArtistItem => item != null);
    } catch {
      return [];
    }
  },

  async listFavoriteEstablishments(): Promise<FavoriteEstablishmentItem[]> {
    try {
      const r = await api.get("/favoritos", { params: { tipo: "perfil_estabelecimento" } });
      const favoritos = Array.isArray(r.data?.favoritos) ? r.data.favoritos : [];
      return favoritos
        .map((fav: { item?: Record<string, unknown> }) =>
          fav.item ? mapFavoriteEstablishment(fav.item) : null
        )
        .filter((item): item is FavoriteEstablishmentItem => item != null);
    } catch {
      return [];
    }
  },

  async check(tipo: FavoritavelTipo, itemId: number): Promise<boolean> {
    try {
      const r = await api.get(`/favoritos/${tipo}/${itemId}`);
      return Boolean(r.data?.eh_favorito);
    } catch {
      return false;
    }
  },

  async add(tipo: FavoritavelTipo, itemId: number): Promise<void> {
    await api.post("/favoritos", {
      favoritavel_tipo: tipo,
      favoritavel_id: itemId,
    });
  },

  async remove(tipo: FavoritavelTipo, itemId: number): Promise<void> {
    await api.delete(`/favoritos/${tipo}/${itemId}`);
  },

  async toggleArtist(artistId: number, isFavorite: boolean): Promise<boolean> {
    if (isFavorite) {
      await this.remove("perfil_artista", artistId);
      return false;
    }
    await this.add("perfil_artista", artistId);
    return true;
  },

  async toggleEstablishment(establishmentId: number, isFavorite: boolean): Promise<boolean> {
    if (isFavorite) {
      await this.remove("perfil_estabelecimento", establishmentId);
      return false;
    }
    await this.add("perfil_estabelecimento", establishmentId);
    return true;
  },
};
