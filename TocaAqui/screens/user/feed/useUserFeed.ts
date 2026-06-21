import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { showService, Show, ShowsParams } from "@/http/showService";
import {
  ArtistPublicProfile,
  EstablishmentPublicProfile,
  establishmentService,
} from "@/http/establishmentService";
import { UserStackParamList } from "@/navigation/UserNavigator";
import { getApiErrorMessage } from "@/utils/errorHandler";
import { isShowFree } from "./showHelpers";
import { FeedFilter, UserFeedViewModel } from "./types";

type NavProp = NativeStackNavigationProp<UserStackParamList>;

const CONFIRMED_SHOWS_LIMIT = 50;
const RECOMMENDED_LIMIT = 5;

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
  const [recommendedArtists, setRecommendedArtists] = useState<ArtistPublicProfile[]>([]);
  const [recommendedEstablishments, setRecommendedEstablishments] = useState<
    EstablishmentPublicProfile[]
  >([]);
  const [loadingRecommended, setLoadingRecommended] = useState(true);

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

  const loadRecommended = useCallback(async () => {
    setLoadingRecommended(true);
    try {
      const [artistsResult, establishmentsResult] = await Promise.allSettled([
        establishmentService.searchArtists(),
        establishmentService.searchEstablishments({ limit: 20 }),
      ]);

      if (artistsResult.status === "fulfilled") {
        setRecommendedArtists(artistsResult.value.slice(0, RECOMMENDED_LIMIT));
      } else {
        setRecommendedArtists([]);
      }

      if (establishmentsResult.status === "fulfilled") {
        setRecommendedEstablishments(establishmentsResult.value.slice(0, RECOMMENDED_LIMIT));
      } else {
        setRecommendedEstablishments([]);
      }
    } finally {
      setLoadingRecommended(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadShows(activeFilter);
      loadRecommended();
    }, [activeFilter, loadShows, loadRecommended])
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
  const goToArtistProfile = useCallback(
    (artist: ArtistPublicProfile) =>
      navigation.navigate("UserArtistProfile", { artistId: artist.id, profile: artist }),
    [navigation]
  );
  const goToEstablishmentProfile = useCallback(
    (establishment: EstablishmentPublicProfile) =>
      navigation.navigate("UserEstablishmentProfile", { establishmentId: establishment.id }),
    [navigation]
  );

  return {
    activeFilter,
    favorites,
    shows,
    loadingShows,
    recommendedArtists,
    recommendedEstablishments,
    loadingRecommended,
    setActiveFilter,
    toggleFavorite,
    goToDetail,
    goToSearch,
    goToNotifications,
    goToArtistProfile,
    goToEstablishmentProfile,
  };
}
