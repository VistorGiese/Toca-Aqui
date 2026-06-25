export interface BandView {
  id: number;
  nome: string;
  descricao?: string;
  generos: string[];
  foto?: string;
  esta_ativo?: boolean;
  data_criacao?: string;
}

export interface EstArtistProfileHeroDisplay {
  nome: string;
  tipoLabel: string;
  localizacao?: string;
  fotoUrl: string | null;
  coverUrl: string | null;
  fallbackIcon: "user" | "users";
}

export interface EstArtistProfileArtistDisplay extends EstArtistProfileHeroDisplay {
  pressKitUrls: string[];
  instrumentos: string[];
  showsCount: number;
  cacheLabel: string;
}
