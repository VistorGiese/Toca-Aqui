import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { avaliacaoService, Avaliacao } from "@/http/avaliacaoService";
import { bookingService } from "@/http/bookingService";
import api from "@/http/api";
import { ArtistStackParamList } from "@/navigation/ArtistNavigator";
import { EstabelecimentoInfo, EventBooking } from "./types";
import { buildApplyParams, buildEventDisplay } from "./utils";

type NavProp = NativeStackNavigationProp<ArtistStackParamList>;
type RouteType = RouteProp<ArtistStackParamList, "EventDetailArtist">;

export function useArtistEventDetail() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { eventId } = route.params;

  const [booking, setBooking] = useState<EventBooking | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [estabelecimento, setEstabelecimento] = useState<EstabelecimentoInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBooking = useCallback(async () => {
    try {
      const [data, reviewsData] = await Promise.all([
        bookingService.getBookingById(eventId),
        avaliacaoService.getAvaliacoesByShow(eventId).catch(() => ({ avaliacoes: [] })),
      ]);
      setBooking(data);
      setAvaliacoes(reviewsData.avaliacoes);
      if (data.perfil_estabelecimento_id) {
        api
          .get(`/estabelecimentos/${data.perfil_estabelecimento_id}`)
          .then((r) => setEstabelecimento(r.data.estabelecimento || r.data))
          .catch(() => {});
      }
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os detalhes da vaga.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [eventId, navigation]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const display = useMemo(
    () => (booking ? buildEventDisplay(booking, estabelecimento) : null),
    [booking, estabelecimento]
  );

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleCandidatar = useCallback(() => {
    if (!booking) return;
    navigation.navigate("ApplyConfirmation", buildApplyParams(booking));
  }, [booking, navigation]);

  return {
    loading,
    booking,
    display,
    avaliacoes,
    goBack,
    handleCandidatar,
  };
}
