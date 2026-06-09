import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { showService, Show, ShowsParams } from "@/http/showService";
import { UserStackParamList } from "@/navigation/UserNavigator";
import { getApiErrorMessage } from "@/utils/errorHandler";
import { isShowFree } from "./showHelpers";
import { FeedFilter, UserFeedViewModel } from "./types";

type NavProp = NativeStackNavigationProp<UserStackParamList>;

const CONFIRMED_SHOWS_LIMIT = 50;

function buildShowsParams(filter: FeedFilter): ShowsParams {
  const params: ShowsParams = { limit: CONFIRMED_SHOWS_LIMIT };
  if (filter === "Esta semana") params.esta_semana = true;
  if (filter === "Fim de semana") params.fim_de_semana = true;
  if (filter === "Hoje") params.esta_hoje = true;
  return params;
}

function applyClientFilter(shows: Show[], filter: FeedFilter): Show[] {
  if (filter !== "Gratuitos") return shows;
  return shows.filter((show) => isShowFree(show));
}

export function useUserFeed(): UserFeedViewModel {
  const navigation = useNavigation<NavProp>();
  const [activeFilter, setActiveFilter] = useState<FeedFilter>("Todos");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [loadingShows, setLoadingShows] = useState(true);

  const loadShows = useCallback(async (filter: FeedFilter) => {
    setLoadingShows(true);
    try {
      const params = buildShowsParams(filter);
      const response = await showService.getConfirmedShows(params);
      const list = Array.isArray(response.shows) ? response.shows : [];
      setShows(applyClientFilter(list, filter));
    } catch (error: unknown) {
      Alert.alert("Erro", getApiErrorMessage(error, "Não foi possível carregar os shows."));
      setShows([]);
    } finally {
      setLoadingShows(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadShows(activeFilter);
    }, [activeFilter, loadShows])
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
    shows,
    loadingShows,
    setActiveFilter,
    toggleFavorite,
    goToDetail,
    goToSearch,
    goToNotifications,
  };
}
