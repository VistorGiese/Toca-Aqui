import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { UserStackParamList } from "@/navigation/UserNavigator";
import {
  favoriteService,
  FavoriteArtistItem,
  FavoriteEstablishmentItem,
  FavoriteShowItem,
} from "@/http/favoriteService";
import {
  FAVORITES_ERROR_MESSAGE,
  FAVORITES_ERROR_TITLE,
  REMOVE_ERROR_MESSAGE,
} from "./constants";
import { FavoritesTab } from "./types";

type NavProp = NativeStackNavigationProp<UserStackParamList>;

export function useUserFavorites() {
  const navigation = useNavigation<NavProp>();
  const [activeTab, setActiveTab] = useState<FavoritesTab>("SHOWS");
  const [favShows, setFavShows] = useState<FavoriteShowItem[]>([]);
  const [favArtistas, setFavArtistas] = useState<FavoriteArtistItem[]>([]);
  const [favLocais, setFavLocais] = useState<FavoriteEstablishmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavoritos = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [shows, artistas, locais] = await Promise.all([
        favoriteService.listFavoriteShows(),
        favoriteService.listFavoriteArtists(),
        favoriteService.listFavoriteEstablishments(),
      ]);
      setFavShows(shows);
      setFavArtistas(artistas);
      setFavLocais(locais);
    } catch {
      Alert.alert(FAVORITES_ERROR_TITLE, FAVORITES_ERROR_MESSAGE);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavoritos();
    }, [loadFavoritos]),
  );

  function onRefresh() {
    loadFavoritos(true);
  }

  async function handleRemoverArtista(artistId: number) {
    try {
      await favoriteService.remove("perfil_artista", artistId);
      setFavArtistas((prev) => prev.filter((item) => item.id !== artistId));
    } catch {
      Alert.alert(FAVORITES_ERROR_TITLE, REMOVE_ERROR_MESSAGE);
    }
  }

  async function handleRemoverLocal(establishmentId: number) {
    try {
      await favoriteService.remove("perfil_estabelecimento", establishmentId);
      setFavLocais((prev) => prev.filter((item) => item.id !== establishmentId));
    } catch {
      Alert.alert(FAVORITES_ERROR_TITLE, REMOVE_ERROR_MESSAGE);
    }
  }

  async function handleRemoverShow(showId: number) {
    try {
      await favoriteService.remove("agendamento", showId);
      setFavShows((prev) => prev.filter((item) => item.show.id !== showId));
    } catch {
      Alert.alert(FAVORITES_ERROR_TITLE, REMOVE_ERROR_MESSAGE);
    }
  }

  function goToSettings() {
    navigation.navigate("UserSettings");
  }

  function goToShowDetail(id: number) {
    navigation.navigate("UserShowDetail", { showId: id });
  }

  function goToArtist(id: number) {
    navigation.navigate("UserArtistProfile", { artistId: id });
  }

  function goToEstablishment(id: number) {
    navigation.navigate("UserEstablishmentProfile", {
      establishmentId: id,
      viewerContext: "user",
    });
  }

  return {
    activeTab,
    setActiveTab,
    favShows,
    favArtistas,
    favLocais,
    loading,
    refreshing,
    onRefresh,
    handleRemoverArtista,
    handleRemoverLocal,
    handleRemoverShow,
    goToSettings,
    goToShowDetail,
    goToArtist,
    goToEstablishment,
  };
}
