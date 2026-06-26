import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "@/contexts/AuthContext";
import { contractService } from "@/http/contractService";
import { avaliacaoService } from "@/http/avaliacaoService";
import { artistaPublicoService } from "@/http/artistaPublicoService";
import { artistProfileService, ArtistProfileData } from "@/http/artistProfileService";
import { userService } from "@/http/userService";
import { ArtistStackParamList } from "@/navigation/ArtistNavigator";
import {
  ArtistProfileDisplayData,
  ArtistProfileReview,
  ArtistProfileStats,
  EMPTY_DISPLAY,
  EMPTY_STATS,
} from "./types";
import { buildDisplayData } from "./utils";

type NavProp = NativeStackNavigationProp<ArtistStackParamList>;

function parseGeneros(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((g): g is string => typeof g === "string");
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

async function resolveArtistProfile(
  perfilArtistaId?: number
): Promise<ArtistProfileData | Record<string, unknown> | null> {
  const ownProfile = await artistProfileService.getMyProfile();
  if (ownProfile) return ownProfile;

  if (perfilArtistaId) {
    try {
      return (await artistaPublicoService.getPerfilPublico(perfilArtistaId)) as Record<
        string,
        unknown
      >;
    } catch {
    }
  }

  const res = await userService.getProfile();
  return res.user.artist_profiles?.[0] ?? null;
}

export function useArtistProfile() {
  const navigation = useNavigation<NavProp>();
  const { signOut, user } = useAuth();

  const [profile, setProfile] = useState<ArtistProfileData | Record<string, unknown> | null>(
    null
  );
  const [stats, setStats] = useState<ArtistProfileStats>(EMPTY_STATS);
  const [reviews, setReviews] = useState<ArtistProfileReview[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const contractsData = await contractService.getMyContracts();
      const artistProfile = await resolveArtistProfile(user?.perfilArtistaId);
      setProfile(artistProfile);

      const completedShows = contractsData.filter((c) => c.status === "concluido").length;
      const acceptedShows = contractsData.filter((c) => c.status === "aceito").length;
      const totalShows = completedShows + acceptedShows;

      let mediaAvaliacao = 0;
      const concluidos = contractsData.filter((c) => c.status === "concluido").slice(0, 3);

      if (concluidos.length > 0) {
        const reviewResults = await Promise.allSettled(
          concluidos.map((c) => avaliacaoService.getAvaliacoesByShow(c.evento_id))
        );
        const allReviews: ArtistProfileReview[] = [];
        let totalNota = 0;
        let totalCount = 0;

        for (const result of reviewResults) {
          if (result.status === "fulfilled") {
            allReviews.push(...result.value.avaliacoes);
            totalNota += result.value.media_artista * result.value.total;
            totalCount += result.value.total;
          }
        }

        setReviews(allReviews.slice(0, 5));
        if (totalCount > 0) {
          mediaAvaliacao = parseFloat((totalNota / totalCount).toFixed(1));
        }
      } else {
        setReviews([]);
      }

      const profileNota =
        artistProfile && "nota_media" in artistProfile && artistProfile.nota_media != null
          ? Number(artistProfile.nota_media)
          : 0;

      setStats({
        totalShows:
          artistProfile && "shows_realizados" in artistProfile
            ? Number(artistProfile.shows_realizados ?? totalShows) || totalShows
            : totalShows,
        mediaAvaliacao: mediaAvaliacao > 0 ? mediaAvaliacao : profileNota,
        bookingsAtivos: acceptedShows,
      });
    } catch {
      setProfile(null);
      setStats(EMPTY_STATS);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [user?.perfilArtistaId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const display = useMemo<ArtistProfileDisplayData>(() => {
    const base = buildDisplayData(profile, user?.nome_completo);
    if (!profile) return base;

    const generos = parseGeneros((profile as Record<string, unknown>).generos);
    if (generos.length > 0) {
      return { ...base, generos };
    }
    return base;
  }, [profile, user?.nome_completo]);

  const goToEdit = useCallback(() => {
    navigation.getParent()?.navigate("ArtistProfileManage");
  }, [navigation]);

  const goToUserProfile = useCallback(() => {
    const rootNav = navigation.getParent()?.getParent();
    rootNav?.navigate("UserNavigator");
  }, [navigation]);

  const handleSignOut = useCallback(() => {
    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  }, [signOut]);

  return {
    loading,
    display,
    stats,
    reviews,
    goToEdit,
    goToUserProfile,
    handleSignOut,
  };
}
