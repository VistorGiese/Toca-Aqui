import { Show } from "@/http/showService";
import {
  ArtistPublicProfile,
  EstablishmentPublicProfile,
} from "@/http/establishmentService";

export const FEED_FILTERS = [
  "Todos",
  "Esta semana",
  "Fim de semana",
  "Gratuitos",
] as const;

export type FeedFilter = (typeof FEED_FILTERS)[number];

export interface UserFeedViewModel {
  activeFilter: FeedFilter;
  favorites: number[];
  shows: Show[];
  loadingShows: boolean;
  recommendedArtists: ArtistPublicProfile[];
  recommendedEstablishments: EstablishmentPublicProfile[];
  loadingRecommended: boolean;
  setActiveFilter: (filter: FeedFilter) => void;
  toggleFavorite: (showId: number) => void;
  goToDetail: (showId: number) => void;
  goToSearch: () => void;
  goToNotifications: () => void;
  goToArtistProfile: (artist: ArtistPublicProfile) => void;
  goToEstablishmentProfile: (establishment: EstablishmentPublicProfile) => void;
}
