import { Avaliacao } from "@/http/avaliacaoService";

export interface ArtistProfileStats {
  totalShows: number;
  mediaAvaliacao: number;
  bookingsAtivos: number;
}

export interface ArtistProfileDisplayData {
  nome: string;
  tipoLabel: string;
  localizacao: string;
  disponivel: boolean;
  biografia: string;
  generos: string[];
  instrumentos: string[];
  temEstruturaSom: boolean;
  estruturaSom: string[];
  cacheMinimo?: number;
  cacheMaximo?: number;
  anosExperiencia?: number;
  urlPortfolio?: string;
  coverUrl: string | null;
  pressKitUrls: string[];
}

export const EMPTY_STATS: ArtistProfileStats = {
  totalShows: 0,
  mediaAvaliacao: 0,
  bookingsAtivos: 0,
};

export const EMPTY_DISPLAY: ArtistProfileDisplayData = {
  nome: "Artista",
  tipoLabel: "ARTISTA",
  localizacao: "",
  disponivel: true,
  biografia: "",
  generos: [],
  instrumentos: [],
  temEstruturaSom: false,
  estruturaSom: [],
  coverUrl: null,
  pressKitUrls: [],
};

export type ArtistProfileReview = Avaliacao;
