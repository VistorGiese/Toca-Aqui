import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { showService, Show } from "@/http/showService";
import { UserStackParamList } from "@/navigation/UserNavigator";
import { getApiErrorMessage } from "@/utils/errorHandler";
import { SearchFilterTab } from "./types";
import { filterShows } from "./utils";

type NavProp = NativeStackNavigationProp<UserStackParamList>;

const SHOWS_LIMIT = 80;

export function useUserSearch() {
  const navigation = useNavigation<NavProp>();

  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<SearchFilterTab>("TODOS");

  const fetchShows = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const response = await showService.getConfirmedShows({ limit: SHOWS_LIMIT });
      setShows(Array.isArray(response.shows) ? response.shows : []);
    } catch (error: unknown) {
      Alert.alert("Erro", getApiErrorMessage(error, "Não foi possível carregar os shows."));
      setShows([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchShows();
    }, [fetchShows])
  );

  const filteredShows = useMemo(
    () => filterShows(shows, searchText, activeTab),
    [shows, searchText, activeTab]
  );

  const goToNotifications = useCallback(() => {
    navigation.navigate("UserNotifications");
  }, [navigation]);

  const goToShowDetail = useCallback(
    (showId: number) => {
      navigation.navigate("UserShowDetail", { showId });
    },
    [navigation]
  );

  const refresh = useCallback(() => {
    fetchShows(true);
  }, [fetchShows]);

  return {
    loading,
    refreshing,
    searchText,
    setSearchText,
    activeTab,
    setActiveTab,
    filteredShows,
    goToNotifications,
    goToShowDetail,
    refresh,
  };
}
