import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { UserStackParamList } from "@/navigation/UserNavigator";
import { showService, Show } from "@/http/showService";
import { avaliacaoService, AvaliacoesResponse } from "@/http/avaliacaoService";
import { getGenreColor } from "@/utils/colors";
import {
  getShowArtistName,
  getShowCoverUrl,
  isShowFree,
} from "@/screens/user/feed/showHelpers";
import {
  SHOW_LOAD_ERROR_MESSAGE,
  SHOW_LOAD_ERROR_TITLE,
  DS,
} from "./constants";
import { ConfirmedBand } from "./types";
import { buildAddress, formatShowDate } from "./utils";

type NavProp = NativeStackNavigationProp<UserStackParamList, "UserShowDetail">;
type RouteType = RouteProp<UserStackParamList, "UserShowDetail">;

export function useUserShowDetail() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { showId } = route.params;

  const [show, setShow] = useState<Show | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacoesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadShow = useCallback(async () => {
    setLoading(true);
    try {
      const data = await showService.getShowById(showId);
      setShow(data);
    } catch {
      Alert.alert(SHOW_LOAD_ERROR_TITLE, SHOW_LOAD_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, [showId]);

  const loadAvaliacoes = useCallback(async () => {
    try {
      const data = await avaliacaoService.getAvaliacoesByShow(showId);
      setAvaliacoes(data);
    } catch {
      setAvaliacoes(null);
    }
  }, [showId]);

  useEffect(() => {
    loadShow();
    loadAvaliacoes();
  }, [loadShow, loadAvaliacoes]);

  const derived = useMemo(() => {
    if (!show) {
      return null;
    }

    const confirmedBand: ConfirmedBand | null = show.Contract?.Band ?? null;
    const artistId = confirmedBand?.id ?? null;
    const venue = show.EstablishmentProfile?.nome_estabelecimento || "";
    const genre = show.genero_musical ?? "";

    return {
      isFree: isShowFree(show),
      soldOut: show.esgotado === true,
      artistName: getShowArtistName(show),
      artistId,
      confirmedBand,
      venue,
      address: buildAddress(show),
      attendees: show.ingressos_vendidos ?? 0,
      rating:
        avaliacoes && avaliacoes.total > 0 ? avaliacoes.media_artista : null,
      genreColor: getGenreColor(genre),
      coverUrl: getShowCoverUrl(show),
      imageColor: genre ? getGenreColor(genre) + "55" : DS.coverFallback,
    };
  }, [show, avaliacoes]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const goToCheckout = useCallback(() => {
    if (!show || derived?.soldOut) return;
    navigation.navigate("UserCheckout", {
      showId,
      showTitle: show.titulo_evento,
      showDate: formatShowDate(show.data_show),
      venue: derived?.venue ?? "",
    });
  }, [navigation, show, showId, derived?.soldOut, derived?.venue]);

  const goToArtist = useCallback(() => {
    if (!derived?.artistId) return;
    navigation.navigate("UserArtistProfile", { artistId: derived.artistId });
  }, [navigation, derived?.artistId]);

  const goToComments = useCallback(() => {
    if (!show) return;
    navigation.navigate("UserComments", {
      showId,
      showTitle: show.titulo_evento,
    });
  }, [navigation, show, showId]);

  return {
    show,
    avaliacoes,
    loading,
    showId,
    ...derived,
    goBack,
    goToCheckout,
    goToArtist,
    goToComments,
  };
}
