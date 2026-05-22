import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { showService, Show, ShowsParams } from "@/http/showService";
import { UserStackParamList } from "@/navigation/UserNavigator";
import { getApiErrorMessage } from "@/utils/errorHandler";
import { FeedFilter, UserFeedViewModel } from "./types";

type NavProp = NativeStackNavigationProp<UserStackParamList>;

function buildShowsParams(filter: FeedFilter): ShowsParams {
  const params: ShowsParams = {};
  if (filter === "Esta semana") params.esta_semana = true;
  if (filter === "Fim de semana") params.fim_de_semana = true;
  if (filter === "Hoje") params.esta_hoje = true;
  return params;
}

function applyClientFilter(shows: Show[], filter: FeedFilter): Show[] {
  if (filter !== "Gratuitos") return shows;
  return shows.filter((show) => (show.preco_ingresso_inteira ?? 0) === 0);
}

export function useUserFeed(): UserFeedViewModel {
  const navigation = useNavigation<NavProp>();
  const [activeFilter, setActiveFilter] = useState<FeedFilter>("Esta semana");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [featuredShows, setFeaturedShows] = useState<Show[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingShows, setLoadingShows] = useState(true);

  const loadFeatured = useCallback(async () => {
    setLoadingFeatured(true);
    try {
      const data = await showService.getShowsDestaque();
      setFeaturedShows(data);
    } catch {
      setFeaturedShows([]);
    } finally {
      setLoadingFeatured(false);
    }
  }, []);

  const loadShows = useCallback(async (filter: FeedFilter) => {
    setLoadingShows(true);
    try {
      const params = buildShowsParams(filter);
      const response = await showService.getPublicShows(params);
      setShows(applyClientFilter(response.shows, filter));
    } catch (error: unknown) {
      Alert.alert("Erro", getApiErrorMessage(error, "Não foi possível carregar os shows."));
      setShows([]);
    } finally {
      setLoadingShows(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFeatured();
      loadShows(activeFilter);
    }, [activeFilter, loadFeatured, loadShows])
  );

  const featured = useMemo(() => featuredShows[0] || shows[0] || null, [featuredShows, shows]);
  const listShows = useMemo(
    () => shows.filter((show) => show.id !== featured?.id),
    [shows, featured]
  );

  const toggleFavorite = useCallback((showId: number) => {
    setFavorites((prev) =>
      prev.includes(showId) ? prev.filter((id) => id !== showId) : [...prev, showId]
    );
  }, []);

  const goToDetail = useCallback(
    (showId: number) => navigation.navigate("UserShowDetail", { showId }),
    [navigation]
  );
  const goToSearch = useCallback(() => navigation.navigate("UserSearch"), [navigation]);
  const goToNotifications = useCallback(
    () => navigation.navigate("UserNotifications"),
    [navigation]
  );

  return {
    activeFilter,
    favorites,
    featured,
    listShows,
    loadingFeatured,
    loadingShows,
    setActiveFilter,
    toggleFavorite,
    goToDetail,
    goToSearch,
    goToNotifications,
  };
}
