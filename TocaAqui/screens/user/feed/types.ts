import { Show } from "@/http/showService";

export const FEED_FILTERS = [
  "Todos",
  "Esta semana",
  "Fim de semana",
  "Hoje",
  "Gratuitos",
] as const;

export type FeedFilter = (typeof FEED_FILTERS)[number];

export interface UserFeedViewModel {
  activeFilter: FeedFilter;
  favorites: number[];
  shows: Show[];
  loadingShows: boolean;
  setActiveFilter: (filter: FeedFilter) => void;
  toggleFavorite: (showId: number) => void;
  goToDetail: (showId: number) => void;
  goToSearch: () => void;
  goToNotifications: () => void;
}
