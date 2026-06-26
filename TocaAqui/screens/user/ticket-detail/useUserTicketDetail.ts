import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ingressoService, Ingresso } from "@/http/ingressoService";
import { getGenreColor } from "@/utils/colors";
import { LOAD_ERROR_MESSAGE, LOAD_ERROR_TITLE } from "./constants";
import { UserTicketDetailProps } from "./types";
import { formatDate, getStatusColor, getStatusLabel } from "./utils";

export function useUserTicketDetail() {
  const { ticketId } = useRoute<UserTicketDetailProps["route"]>().params;
  const navigation = useNavigation<UserTicketDetailProps["navigation"]>();
  const [ingresso, setIngresso] = useState<Ingresso | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIngresso() {
      try {
        const data = await ingressoService.getIngressoById(ticketId);
        setIngresso(data);
      } catch {
        Alert.alert(LOAD_ERROR_TITLE, LOAD_ERROR_MESSAGE);
      } finally {
        setLoading(false);
      }
    }
    fetchIngresso();
  }, [ticketId]);

  const goBack = () => navigation.goBack();

  const show = ingresso?.Show;
  const genre = show?.genero_musical ?? "";
  const cardBg = getGenreColor(genre) || "#2D1B4E";

  const showTitle = show?.titulo_evento ?? "Show";
  const artist = (show as { Contract?: { Band?: { nome_banda?: string } } })?.Contract?.Band?.nome_banda ?? "Artista";
  const venue = show?.EstablishmentProfile?.nome_estabelecimento ?? "";
  const address = show?.EstablishmentProfile?.Address
    ? `${show.EstablishmentProfile.Address.cidade}, ${show.EstablishmentProfile.Address.estado}`
    : "";
  const date = show?.data_show ? formatDate(show.data_show) : "";
  const time = show?.horario_inicio ? show.horario_inicio.slice(0, 5) : "";
  const codigoQr = ingresso?.codigo_qr ?? "";
  const status = ingresso?.status ?? "pendente";
  const statusLabel = getStatusLabel(status);
  const statusColor = getStatusColor(status);

  return {
    loading,
    goBack,
    showTitle,
    artist,
    venue,
    address,
    date,
    time,
    codigoQr,
    statusLabel,
    statusColor,
    cardBg,
  };
}
