import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { UserStackParamList } from "@/navigation/UserNavigator";
import { ingressoService, Ingresso } from "@/http/ingressoService";
import { TICKETS_ERROR_MESSAGE, TICKETS_ERROR_TITLE } from "./constants";
import { TicketsTab } from "./types";
import { isShowPast } from "./utils";

type NavProp = NativeStackNavigationProp<UserStackParamList>;

export function useUserTickets() {
  const navigation = useNavigation<NavProp>();
  const [activeTab, setActiveTab] = useState<TicketsTab>("upcoming");
  const [tickets, setTickets] = useState<Ingresso[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const tipo = activeTab === "upcoming" ? "proximos" : "passados";
      const data = await ingressoService.getMeusIngressos(tipo);
      setTickets(data);
    } catch {
      Alert.alert(TICKETS_ERROR_TITLE, TICKETS_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [fetchTickets]),
  );

  function goToDetail(ticketId: number) {
    navigation.navigate("UserTicketDetail", { ticketId });
  }

  function goToFeed() {
    navigation.navigate("UserFeed");
  }

  function goToRateShow(ingresso: Ingresso) {
    if (!ingresso.Show) return;
    navigation.navigate("UserRateShow", {
      showId: ingresso.Show.id,
      showTitle: ingresso.Show.titulo_evento,
      venueName: ingresso.Show.EstablishmentProfile?.nome_estabelecimento ?? "",
    });
  }

  function getTicketRateHandler(ingresso: Ingresso) {
    if (
      activeTab === "past" &&
      ingresso.Show?.data_show &&
      isShowPast(ingresso.Show.data_show)
    ) {
      return () => goToRateShow(ingresso);
    }
    return undefined;
  }

  return {
    activeTab,
    setActiveTab,
    tickets,
    loading,
    goToDetail,
    goToFeed,
    getTicketRateHandler,
  };
}
