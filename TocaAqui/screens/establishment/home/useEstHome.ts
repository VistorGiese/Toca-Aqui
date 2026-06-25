import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import {
  ArtistPublicProfile,
  confirmedGigToShow,
  EstablishmentProfile,
  EstablishmentPublicProfile,
  establishmentService,
  Gig,
  isGigAberta,
} from "@/http/establishmentService";
import { Show, showToDetailParams } from "@/http/showService";
import { useRecommendedHome } from "@/hooks/useRecommendedHome";
import { useAuth } from "@/contexts/AuthContext";
import { DS, DEFAULT_GREETING_NAME, DEFAULT_HEADER_NAME } from "./constants";
import { EstHomeMetricItem } from "./types";

type NavProp = NativeStackNavigationProp<EstStackParamList>;

export function useEstHome() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [upcomingShows, setUpcomingShows] = useState<Show[]>([]);
  const [confirmedShowsCount, setConfirmedShowsCount] = useState(0);
  const [profile, setProfile] = useState<EstablishmentProfile | null>(null);

  const { artists, establishments, loading: loadingRecommended } = useRecommendedHome();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const storedId = await AsyncStorage.getItem("estabelecimentoId");
      const estId = storedId ? Number(storedId) : undefined;
      const [g, upcoming, p] = await Promise.allSettled([
        establishmentService.getMyGigs(estId),
        establishmentService.getUpcomingPublishedGigs(estId, 3),
        establishmentService.getMyEstablishmentProfile(),
      ]);

      if (g.status === "fulfilled") {
        setGigs(g.value);
        setConfirmedShowsCount(g.value.filter((item) => item.status === "aceito").length);
      }

      if (upcoming.status === "fulfilled" && p.status === "fulfilled") {
        setUpcomingShows(upcoming.value.map((gig) => confirmedGigToShow(gig, p.value)));
      } else if (upcoming.status === "fulfilled") {
        setUpcomingShows(upcoming.value.map((gig) => confirmedGigToShow(gig, null)));
      }

      if (p.status === "fulfilled") {
        setProfile(p.value);
      }
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const metrics = useMemo<EstHomeMetricItem[]>(() => {
    const abertas = gigs.filter((g) => isGigAberta(g.status)).length;
    const candidaturas = gigs.reduce((acc, g) => acc + (g.candidaturas_count || 0), 0);
    const nota = profile?.nota_media ?? 0;

    return [
      { label: "VAGAS ABERTAS", value: abertas, color: DS.cyan },
      { label: "CANDIDATURAS", value: candidaturas, color: DS.accent },
      { label: "SHOWS/MÊS", value: confirmedShowsCount, color: DS.error },
      {
        label: "NOTA GERAL",
        value: nota > 0 ? `${nota.toFixed(1)} ★` : "--",
        color: DS.rating,
      },
    ];
  }, [gigs, confirmedShowsCount, profile?.nota_media]);

  const headerName = profile?.nome_estabelecimento ?? DEFAULT_HEADER_NAME;
  const greetingName = user?.nome_completo?.split(" ")[0] ?? DEFAULT_GREETING_NAME;

  const filteredEstablishments = useMemo(
    () => establishments.filter((item) => item.id !== profile?.id),
    [establishments, profile?.id]
  );

  const goToNotifications = useCallback(() => {
    navigation.navigate("EstNotifications");
  }, [navigation]);

  const goToNewGig = useCallback(() => {
    navigation.navigate("EstNewGig", {});
  }, [navigation]);

  const goToAllConfirmed = useCallback(() => {
    navigation.navigate("EstAllConfirmedShows");
  }, [navigation]);

  const goToShowDetail = useCallback(
    (show: Show) => {
      navigation.navigate("EstUpcomingShowDetail", showToDetailParams(show));
    },
    [navigation]
  );

  const goToArtistProfile = useCallback(
    (artist: ArtistPublicProfile) => {
      navigation.navigate("EstArtistProfile", { artistId: artist.id, profile: artist });
    },
    [navigation]
  );

  const goToEstablishmentProfile = useCallback(
    (establishment: EstablishmentPublicProfile) => {
      navigation.navigate("UserEstablishmentProfile", {
        establishmentId: establishment.id,
        canBuyTickets: false,
        viewerContext: "establishment",
      });
    },
    [navigation]
  );

  return {
    loading,
    headerName,
    greetingName,
    metrics,
    upcomingShows,
    artists,
    establishments: filteredEstablishments,
    loadingRecommended,
    goToNotifications,
    goToNewGig,
    goToAllConfirmed,
    goToShowDetail,
    goToArtistProfile,
    goToEstablishmentProfile,
  };
}
