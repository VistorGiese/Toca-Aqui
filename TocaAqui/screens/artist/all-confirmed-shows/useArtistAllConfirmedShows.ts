import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Show, showService, showToDetailParams, ShowDetailParams } from "@/http/showService";
import { SHOWS_PAGE_LIMIT } from "./constants";

type NavProp = NativeStackNavigationProp<{
  ArtistAllConfirmedShows: undefined;
  ArtistUpcomingShowDetail: ShowDetailParams;
}>;

export function useArtistAllConfirmedShows() {
  const navigation = useNavigation<NavProp>();
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await showService.getConfirmedShows({ limit: SHOWS_PAGE_LIMIT });
      setShows(response.shows);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os shows confirmados.");
      setShows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const goToShowDetail = useCallback(
    (show: Show) => {
      navigation.navigate("ArtistUpcomingShowDetail", showToDetailParams(show));
    },
    [navigation]
  );

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return { loading, shows, goBack, goToShowDetail };
}
