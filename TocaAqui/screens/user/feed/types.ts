import { Show } from "@/http/showService";

export const FEED_FILTERS = [
  "Esta semana",
  "Fim de semana",
  "Hoje",
  "Gratuitos",
] as const;

export type FeedFilter = (typeof FEED_FILTERS)[number];

export interface UserFeedViewModel {
  activeFilter: FeedFilter;
  favorites: number[];
  featured: Show | null;
  listShows: Show[];
  loadingFeatured: boolean;
  loadingShows: boolean;
  setActiveFilter: (filter: FeedFilter) => void;
  toggleFavorite: (showId: number) => void;
  goToDetail: (showId: number) => void;
  goToSearch: () => void;
  goToNotifications: () => void;
}
