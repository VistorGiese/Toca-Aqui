import { ArtistaPublico } from "@/http/artistaPublicoService";
import { ArtistProfileSnapshot } from "@/utils/artistProfile";

export type UpcomingShow = NonNullable<ArtistaPublico["ProximosShows"]>[number];

export interface UserArtistProfileDisplay {
  nome: string;
  tipoLabel: string;
  localizacao?: string;
  fotoUrl: string | null;
  coverUrl: string | null;
  pressKitUrls: string[];
  instrumentos: string[];
  generos: string[];
  showsCount: number;
  cacheLabel: string;
  rating: number;
}

export interface UserArtistProfileRouteParams {
  artistId: number;
  profile?: ArtistProfileSnapshot;
  canBuyTickets?: boolean;
}
