import { ArtistaPublico } from "@/http/artistaPublicoService";
import { Ingresso } from "@/http/ingressoService";
import { ProfileStatItem } from "@/components/profile/types";

export type UserProfileStat = ProfileStatItem;

export interface UserProfileViewModel {
  displayName: string;
  fotoPerfil: string | null;
  localizacao: string | null;
  uploadingFoto: boolean;
  loading: boolean;
  proximosShows: Ingresso[];
  artistasSeguidos: ArtistaPublico[];
  stats: UserProfileStat[];
  handleSelecionarFoto: () => Promise<void>;
  goToSettings: () => void;
  goToShowDetail: (showId: number) => void;
  goToArtist: (artistId: number) => void;
  goToAllTickets: () => void;
}
