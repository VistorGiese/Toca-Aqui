import { useCallback, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { establishmentService, confirmedGigToShow } from "@/http/establishmentService";
import { Show, showToDetailParams } from "@/http/showService";
import { SHOWS_PAGE_LIMIT } from "./constants";

type NavProp = NativeStackNavigationProp<EstStackParamList, "EstAllConfirmedShows">;

export function useEstAllConfirmedShows() {
  const navigation = useNavigation<NavProp>();
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const storedId = await AsyncStorage.getItem("estabelecimentoId");
      const estId = storedId ? Number(storedId) : undefined;
      const [gigs, profile] = await Promise.all([
        establishmentService.getUpcomingPublishedGigs(estId, SHOWS_PAGE_LIMIT),
        establishmentService.getMyEstablishmentProfile().catch(() => null),
      ]);
      setShows(gigs.map((gig) => confirmedGigToShow(gig, profile)));
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
      navigation.navigate("EstUpcomingShowDetail", showToDetailParams(show));
    },
    [navigation]
  );

  return {
    loading,
    shows,
    goBack: () => navigation.goBack(),
    goToShowDetail,
  };
}
