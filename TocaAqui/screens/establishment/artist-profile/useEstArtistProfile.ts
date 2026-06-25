import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { establishmentService } from "@/http/establishmentService";
import { favoriteService } from "@/http/favoriteService";
import { ArtistProfileSnapshot } from "@/utils/artistProfile";
import { BandView } from "./types";
import { buildArtistDisplay, buildBandHeroDisplay, mapBand } from "./utils";

type NavProp = NativeStackNavigationProp<EstStackParamList, "EstArtistProfile">;
type RouteType = RouteProp<EstStackParamList, "EstArtistProfile">;

export function useEstArtistProfile() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { artistId, bandaId, profile: profileHint } = route.params;

  const [artistProfile, setArtistProfile] = useState<ArtistProfileSnapshot | null>(null);
  const [bandProfile, setBandProfile] = useState<BandView | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      if (bandaId) {
        const data = await establishmentService.getBandById(bandaId);
        setBandProfile(mapBand(data));
        setArtistProfile(null);
        return;
      }
      if (artistId) {
        const data = await establishmentService.findArtistById(artistId, profileHint);
        setArtistProfile(data);
        setBandProfile(null);
        return;
      }
      throw new Error("Identificador de perfil ausente");
    } catch {
      setArtistProfile(null);
      setBandProfile(null);
      setErrorMessage("Não foi possível carregar os dados do perfil.");
    } finally {
      setLoading(false);
    }
  }, [artistId, bandaId, profileHint]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!artistProfile?.id) {
      setIsFavorite(false);
      setFavoriteCount(0);
      return;
    }
    favoriteService.checkWithCount("perfil_artista", artistProfile.id).then(({ isFavorite, totalFavorites }) => {
      setIsFavorite(isFavorite);
      setFavoriteCount(totalFavorites);
    });
  }, [artistProfile?.id]);

  const artistDisplay = useMemo(
    () => (artistProfile ? buildArtistDisplay(artistProfile) : null),
    [artistProfile]
  );

  const bandDisplay = useMemo(
    () => (bandProfile ? buildBandHeroDisplay(bandProfile) : null),
    [bandProfile]
  );

  const headerTitle = bandProfile ? "Perfil da Banda" : "Perfil do Artista";
  const hasProfile = Boolean(artistProfile || bandProfile);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const toggleFavorite = useCallback(async () => {
    if (!artistProfile?.id || favoriteLoading) return;
    setFavoriteLoading(true);
    try {
      const next = await favoriteService.toggleArtist(artistProfile.id, isFavorite);
      setIsFavorite(next);
      const status = await favoriteService.checkWithCount("perfil_artista", artistProfile.id);
      setIsFavorite(status.isFavorite);
      setFavoriteCount(status.totalFavorites);
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar seus favoritos.");
    } finally {
      setFavoriteLoading(false);
    }
  }, [artistProfile?.id, favoriteLoading, isFavorite]);

  return {
    loading,
    errorMessage,
    artistProfile,
    bandProfile,
    artistDisplay,
    bandDisplay,
    headerTitle,
    hasProfile,
    isFavorite,
    favoriteCount,
    favoriteLoading,
    goBack,
    toggleFavorite,
  };
}
