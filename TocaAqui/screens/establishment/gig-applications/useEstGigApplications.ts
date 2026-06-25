import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { RouteProp, useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { Candidatura, establishmentService } from "@/http/establishmentService";
import { ApplicationTab } from "./types";
import { filterCandidatesByTab, getArtistDisplayName } from "./utils";

type NavProp = NativeStackNavigationProp<EstStackParamList>;
type RoutePropType = RouteProp<EstStackParamList, "EstGigApplications">;

export function useEstGigApplications() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { gigId, gigTitle } = route.params;

  const [tab, setTab] = useState<ApplicationTab>("todas");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [candidates, setCandidates] = useState<Candidatura[]>([]);
  const [eventClosed, setEventClosed] = useState(false);
  const [closedMessage, setClosedMessage] = useState<string | undefined>();
  const [contractId, setContractId] = useState<number | null>(null);
  const [openingContract, setOpeningContract] = useState(false);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const result = await establishmentService.getGigApplications(gigId);
        const list = Array.isArray(result?.candidaturas) ? result.candidaturas : [];
        setCandidates(list);
        setEventClosed(result.closed);
        setClosedMessage(result.message);

        const hasAccepted = list.some((c) => c.status === "aceito") || result.closed;
        if (hasAccepted) {
          const fromList = list.find((c) => c.status === "aceito")?.contrato_id ?? null;
          if (fromList) {
            setContractId(fromList);
          } else {
            const contrato = await establishmentService.getContractByEventId(gigId);
            setContractId(contrato?.id ?? null);
          }
        } else {
          setContractId(null);
        }
      } catch {
        Alert.alert("Erro", "Não foi possível carregar as candidaturas.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [gigId]
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filteredCandidates = useMemo(
    () => filterCandidatesByTab(candidates, tab),
    [candidates, tab]
  );

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const goToNotifications = useCallback(() => {
    navigation.navigate("EstNotifications");
  }, [navigation]);

  const navigateToReview = useCallback(
    (item: Candidatura) => {
      const artistName = getArtistDisplayName(item);
      navigation.navigate("EstAcceptContract", {
        applicationId: item.id,
        gigId,
        status: item.status,
        artistaId: item.artista_id,
        bandaId: item.banda_id,
        artistName,
        gigTitle,
        valorProposto: item.valor_proposto,
        mensagem: item.mensagem,
        eventClosed,
      });
    },
    [navigation, gigId, gigTitle, eventClosed]
  );

  const openProfile = useCallback(
    (item: Candidatura) => {
      if (item.artista_id) {
        navigation.navigate("EstArtistProfile", {
          artistId: item.artista_id,
          profile: item.profileSnapshot,
        });
        return;
      }
      if (item.banda_id) {
        navigation.navigate("EstArtistProfile", { bandaId: item.banda_id });
        return;
      }
      Alert.alert("Erro", "Perfil indisponível para esta candidatura.");
    },
    [navigation]
  );

  const openContract = useCallback(
    async (item: Candidatura) => {
      const artistName = getArtistDisplayName(item);
      setOpeningContract(true);
      try {
        let id = item.contrato_id ?? contractId;
        let contrato: Record<string, unknown> | null = null;

        if (!id) {
          contrato = await establishmentService.getContractByEventId(gigId);
          id = contrato?.id ?? null;
          if (id) setContractId(id);
        }

        if (!id) {
          Alert.alert(
            "Contrato não encontrado",
            "Não foi possível localizar o contrato deste evento. Tente novamente em instantes."
          );
          return;
        }

        navigation.navigate("EstContractPreview", {
          contractId: id,
          artistName,
          gigTitle,
          eventoId: gigId,
          initialContract: contrato ?? undefined,
        });
      } finally {
        setOpeningContract(false);
      }
    },
    [navigation, contractId, gigId, gigTitle]
  );

  const refresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, [load]);

  return {
    gigTitle,
    tab,
    setTab,
    loading,
    refreshing,
    filteredCandidates,
    eventClosed,
    closedMessage,
    openingContract,
    goBack,
    goToNotifications,
    navigateToReview,
    openProfile,
    openContract,
    refresh,
  };
}
