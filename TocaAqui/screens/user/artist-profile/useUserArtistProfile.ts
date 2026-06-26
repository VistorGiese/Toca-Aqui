import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArtistaPublico, artistaPublicoService } from "@/http/artistaPublicoService";
import { artistProfileService } from "@/http/artistProfileService";
import { establishmentService } from "@/http/establishmentService";
import { favoriteService } from "@/http/favoriteService";
import { useAuth } from "@/contexts/AuthContext";
import { ArtistProfileSnapshot } from "@/utils/artistProfile";
import { UpcomingShow, UserArtistProfileRouteParams } from "./types";
import {
  buildArtistDisplay,
  formatShowDate,
  mergeOwnProfileFields,
  mergePublicProfile,
  profileFromHint,
} from "./utils";

type NavProp = NativeStackNavigationProp<{
  UserArtistProfile: UserArtistProfileRouteParams;
  UserCheckout: {
    showId: number;
    showTitle: string;
    showDate: string;
    venue: string;
  };
}>;

type RouteType = RouteProp<{ UserArtistProfile: UserArtistProfileRouteParams }, "UserArtistProfile">;

export function useUserArtistProfile() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { artistId, profile: profileHint, canBuyTickets = true } = route.params;
  const { user } = useAuth();

  const isOwnProfile = user?.perfilArtistaId === artistId;
  const showFavoriteHeart = !isOwnProfile;

  const [profile, setProfile] = useState<ArtistProfileSnapshot | null>(null);
  const [upcomingShows, setUpcomingShows] = useState<UpcomingShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [snapshotResult, publicoResult, ownResult] = await Promise.allSettled([
        establishmentService.findArtistById(artistId, profileHint),
        artistaPublicoService.getPerfilPublico(artistId),
        isOwnProfile ? artistProfileService.getMyProfile() : Promise.resolve(null),
      ]);

      let merged: ArtistProfileSnapshot | null = null;

      if (snapshotResult.status === "fulfilled") {
        merged = snapshotResult.value;
      } else if (profileHint) {
        merged = profileFromHint(artistId, profileHint);
      }

      if (ownResult.status === "fulfilled" && ownResult.value) {
        merged = mergeOwnProfileFields(merged ?? { id: artistId }, ownResult.value);
      }

      let publico: ArtistaPublico | null = null;
      if (publicoResult.status === "fulfilled") {
        publico = publicoResult.value;
        merged = merged
          ? mergePublicProfile(merged, publico)
          : profileFromHint(artistId, {
              nome_artistico: publico.nome_artistico,
              biografia: publico.biografia,
              foto_perfil: publico.foto_perfil,
              generos: publico.generos,
              instrumentos: publico.instrumentos,
              nota_media: publico.media_nota,
              cidade: publico.cidade,
              estado: publico.estado,
            });
        setUpcomingShows(publico.ProximosShows ?? []);
      } else {
        setUpcomingShows([]);
      }

      setProfile(merged);
    } catch {
      setProfile(null);
      setUpcomingShows([]);
    } finally {
      setLoading(false);
    }
  }, [artistId, profileHint, isOwnProfile]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!profile?.id || !showFavoriteHeart) {
      setIsFavorite(false);
      setFavoriteCount(0);
      return;
    }
    favoriteService.checkWithCount("perfil_artista", profile.id).then(({ isFavorite, totalFavorites }) => {
      setIsFavorite(isFavorite);
      setFavoriteCount(totalFavorites);
    });
  }, [profile?.id, showFavoriteHeart]);

  const rating = profile?.nota_media ?? 0;

  const display = useMemo(
    () => (profile ? buildArtistDisplay(profile, rating) : null),
    [profile, rating]
  );

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const toggleFavorite = useCallback(async () => {
    if (!profile?.id || !showFavoriteHeart || favoriteLoading) return;
    setFavoriteLoading(true);
    try {
      await favoriteService.toggleArtist(profile.id, isFavorite);
      const status = await favoriteService.checkWithCount("perfil_artista", profile.id);
      setIsFavorite(status.isFavorite);
      setFavoriteCount(status.totalFavorites);
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar seus favoritos.");
    } finally {
      setFavoriteLoading(false);
    }
  }, [profile?.id, showFavoriteHeart, favoriteLoading, isFavorite]);

  const goToCheckout = useCallback(
    (show: UpcomingShow) => {
      navigation.navigate("UserCheckout", {
        showId: show.id,
        showTitle: show.titulo_evento,
        showDate: formatShowDate(show.data_show),
        venue: show.EstablishmentProfile?.nome_estabelecimento ?? "Local não informado",
      });
    },
    [navigation]
  );

  return {
    loading,
    profile,
    display,
    upcomingShows,
    canBuyTickets,
    showFavoriteHeart,
    isFavorite,
    favoriteCount,
    favoriteLoading,
    goBack,
    toggleFavorite,
    goToCheckout,
  };
}
