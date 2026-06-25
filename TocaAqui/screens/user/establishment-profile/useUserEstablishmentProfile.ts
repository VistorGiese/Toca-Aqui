import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { UserStackParamList } from "@/navigation/UserNavigator";
import {
  EstablishmentPublicProfile,
  establishmentService,
} from "@/http/establishmentService";
import { showService, Show } from "@/http/showService";
import { favoriteService } from "@/http/favoriteService";
import { useAuth } from "@/contexts/AuthContext";
import { EMPTY_DISPLAY } from "./types";
import { buildDisplayData } from "./utils";

type NavProp = NativeStackNavigationProp<UserStackParamList, "UserEstablishmentProfile">;
type RouteType = RouteProp<UserStackParamList, "UserEstablishmentProfile">;

export function useUserEstablishmentProfile() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { establishmentId, canBuyTickets = true } = route.params;
  const { paginas } = useAuth();

  const isOwnEstablishment = paginas?.pagina_estabelecimento?.id === establishmentId;
  const showFavoriteHeart = !isOwnEstablishment;

  const [profile, setProfile] = useState<EstablishmentPublicProfile | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const [establishment, showsResponse, favorited] = await Promise.allSettled([
        establishmentService.getEstablishmentById(establishmentId),
        showService.getConfirmedShows({ limit: 50 }),
        showFavoriteHeart
          ? favoriteService.check("perfil_estabelecimento", establishmentId)
          : Promise.resolve(false),
      ]);

      if (establishment.status === "fulfilled") {
        setProfile(establishment.value);
      } else {
        setProfile(null);
      }

      if (showsResponse.status === "fulfilled") {
        const venueShows = showsResponse.value.shows.filter(
          (show) => show.EstablishmentProfile?.id === establishmentId
        );
        setShows(venueShows.slice(0, 5));
      } else {
        setShows([]);
      }

      if (favorited.status === "fulfilled") {
        setIsFavorite(favorited.value);
      }
    } finally {
      setLoading(false);
    }
  }, [establishmentId, showFavoriteHeart]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const display = useMemo(
    () => (profile ? buildDisplayData(profile) : EMPTY_DISPLAY),
    [profile]
  );

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const goToShow = useCallback(
    (showId: number) => {
      if (!canBuyTickets) return;
      navigation.navigate("UserShowDetail", { showId });
    },
    [navigation, canBuyTickets]
  );

  const toggleFavorite = useCallback(async () => {
    if (!showFavoriteHeart || favoriteLoading) return;
    setFavoriteLoading(true);
    try {
      const next = await favoriteService.toggleEstablishment(establishmentId, isFavorite);
      setIsFavorite(next);
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar seus favoritos. Faça login e tente novamente.");
    } finally {
      setFavoriteLoading(false);
    }
  }, [showFavoriteHeart, favoriteLoading, establishmentId, isFavorite]);

  return {
    loading,
    profile,
    display,
    shows,
    canBuyTickets,
    showFavoriteHeart,
    isFavorite,
    favoriteLoading,
    goBack,
    goToShow,
    toggleFavorite,
  };
}
