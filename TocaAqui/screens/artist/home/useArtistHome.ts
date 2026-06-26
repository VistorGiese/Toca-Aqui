import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import {
  CompositeNavigationProp,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "@/contexts/AuthContext";
import { contractService, Contract } from "@/http/contractService";
import { ArtistPublicProfile, EstablishmentPublicProfile } from "@/http/establishmentService";
import { Show, showService, showToDetailParams } from "@/http/showService";
import { useRecommendedHome } from "@/hooks/useRecommendedHome";
import { ArtistStackParamList, ArtistTabParamList } from "@/navigation/ArtistNavigator";
import { DEFAULT_GREETING_NAME } from "./constants";
import { ArtistHomeMetrics } from "./types";
import { getFirstName } from "./utils";

type NavProp = CompositeNavigationProp<
  BottomTabNavigationProp<ArtistTabParamList, "ArtistHome">,
  NativeStackNavigationProp<ArtistStackParamList>
>;

export function useArtistHome() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [upcomingShows, setUpcomingShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const { artists, establishments, loading: loadingRecommended } = useRecommendedHome();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [contractData, upcoming] = await Promise.allSettled([
        contractService.getMyContracts(),
        showService.getConfirmedShows({ limit: 3 }),
      ]);

      if (contractData.status === "fulfilled") {
        setContracts(Array.isArray(contractData.value) ? contractData.value : []);
      }
      if (upcoming.status === "fulfilled") {
        setUpcomingShows(upcoming.value.shows);
      }
    } catch {
      Alert.alert("Erro", "Não foi possível carregar seus dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const metrics = useMemo<ArtistHomeMetrics>(() => {
    const confirmedCount = contracts.filter((c) => c.status === "aceito").length;
    const pendingCount = contracts.filter((c) => c.status === "aguardando_aceite").length;
    return {
      confirmedCount,
      pendingCount,
      totalContracts: contracts.length,
    };
  }, [contracts]);

  const recentContracts = useMemo(() => contracts.slice(0, 3), [contracts]);
  const greetingName = getFirstName(user?.nome_completo) || DEFAULT_GREETING_NAME;

  const goToNotifications = useCallback(() => {
    const stackNav = navigation.getParent<NativeStackNavigationProp<ArtistStackParamList>>();
    if (stackNav) {
      stackNav.navigate("ArtistNotifications");
      return;
    }
    navigation.navigate("ArtistNotifications");
  }, [navigation]);

  const goToAllConfirmed = useCallback(() => {
    navigation.navigate("ArtistAllConfirmedShows");
  }, [navigation]);

  const goToShowDetail = useCallback(
    (show: Show) => {
      navigation.navigate("ArtistUpcomingShowDetail", showToDetailParams(show));
    },
    [navigation]
  );

  const goToArtistProfile = useCallback(
    (artist: ArtistPublicProfile) => {
      navigation.navigate("UserArtistProfile", {
        artistId: artist.id,
        profile: artist,
        canBuyTickets: false,
      });
    },
    [navigation]
  );

  const goToEstablishment = useCallback(
    (establishment: EstablishmentPublicProfile) => {
      navigation.navigate("UserEstablishmentProfile", {
        establishmentId: establishment.id,
        canBuyTickets: false,
      });
    },
    [navigation]
  );

  const goToBrowseEvents = useCallback(() => {
    navigation.navigate("ArtistTabs", { screen: "BrowseEvents" } as never);
  }, [navigation]);

  const goToContractDetail = useCallback(
    (contractId: number) => {
      navigation.navigate("ContractDetail", { contractId });
    },
    [navigation]
  );

  return {
    loading,
    greetingName,
    metrics,
    upcomingShows,
    recentContracts,
    artists,
    establishments,
    loadingRecommended,
    goToNotifications,
    goToAllConfirmed,
    goToShowDetail,
    goToArtistProfile,
    goToEstablishment,
    goToBrowseEvents,
    goToContractDetail,
  };
}
