import api from "./api";
import { Band } from "../types";

export interface ArtistSearchResult {
  id: number;
  nome_artistico?: string;
  nome?: string;
  foto_url?: string;
}

const getBandById = async (id: number): Promise<Band> => {
  const response = await api.get<{ band: Band }>(`/gerenciamento-bandas/${id}`);
  return response.data.band;
};

const searchArtistProfiles = async (query: string): Promise<ArtistSearchResult[]> => {
  const response = await api.get<ArtistSearchResult[]>("/perfis-artista/busca", {
    params: { q: query },
  });
  return response.data;
};

export const artistService = {
  getBandById,
  searchArtistProfiles,
};
