import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { establishmentService, Gig } from "@/http/establishmentService";
import { DEFAULT_HEADER_NAME } from "./constants";
import { GigTab } from "./types";
import { filterGigsByTab } from "./utils";

type NavProp = NativeStackNavigationProp<EstStackParamList>;

export function useEstGigs() {
  const navigation = useNavigation<NavProp>();

  const [tab, setTab] = useState<GigTab>("abertas");
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [headerName, setHeaderName] = useState(DEFAULT_HEADER_NAME);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const estIdStr = await AsyncStorage.getItem("estabelecimentoId");
      const estId = estIdStr ? Number(estIdStr) : undefined;
      const [gigsData, profile] = await Promise.allSettled([
        establishmentService.getMyGigs(estId),
        establishmentService.getMyEstablishmentProfile(),
      ]);

      if (gigsData.status === "fulfilled") {
        setGigs(gigsData.value);
      } else {
        setGigs([]);
      }

      if (profile.status === "fulfilled") {
        setHeaderName(profile.value.nome_estabelecimento ?? DEFAULT_HEADER_NAME);
      }
    } catch {
      Alert.alert("Erro", "Não foi possível carregar as vagas.");
      setGigs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filteredGigs = useMemo(() => filterGigsByTab(gigs, tab), [gigs, tab]);

  const goToNotifications = useCallback(() => {
    navigation.navigate("EstNotifications");
  }, [navigation]);

  const goToNewGig = useCallback(() => {
    navigation.navigate("EstNewGig", {});
  }, [navigation]);

  const goToEditGig = useCallback(
    (gigId: number) => {
      navigation.navigate("EstNewGig", { gigId });
    },
    [navigation]
  );

  const goToApplications = useCallback(
    (gig: Gig) => {
      navigation.navigate("EstGigApplications", {
        gigId: gig.id,
        gigTitle: gig.titulo_evento,
      });
    },
    [navigation]
  );

  const handleDelete = useCallback(
    (id: number) => {
      Alert.alert("Excluir vaga", "Tem certeza?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await establishmentService.deleteGig(id);
              load(true);
            } catch {
              Alert.alert("Erro", "Não foi possível excluir.");
            }
          },
        },
      ]);
    },
    [load]
  );

  const showGigOptions = useCallback(
    (gig: Gig) => {
      Alert.alert("Opções", "O que deseja fazer?", [
        { text: "Editar", onPress: () => goToEditGig(gig.id) },
        { text: "Excluir", style: "destructive", onPress: () => handleDelete(gig.id) },
        { text: "Cancelar", style: "cancel" },
      ]);
    },
    [goToEditGig, handleDelete]
  );

  const refresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, [load]);

  return {
    tab,
    setTab,
    headerName,
    loading,
    refreshing,
    filteredGigs,
    goToNotifications,
    goToNewGig,
    goToApplications,
    showGigOptions,
    refresh,
  };
}
