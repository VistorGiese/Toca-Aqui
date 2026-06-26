import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { bandApplicationService, BandApplication } from "@/http/bandApplicationService";
import { ArtistStackParamList } from "@/navigation/ArtistNavigator";
import { ApplicationTab } from "./types";
import { filterApplicationsByTab } from "./utils";

type NavProp = NativeStackNavigationProp<ArtistStackParamList>;

export function useArtistApplications() {
  const navigation = useNavigation<NavProp>();

  const [applications, setApplications] = useState<BandApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<ApplicationTab>("Em análise");

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await bandApplicationService.getMyApplications();
      setApplications(data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar as candidaturas.");
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

  const filtered = useMemo(
    () => filterApplicationsByTab(applications, activeTab),
    [applications, activeTab]
  );

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const goToContract = useCallback(
    (contractId: number) => {
      navigation.navigate("ContractDetail", { contractId });
    },
    [navigation]
  );

  return {
    loading,
    refreshing,
    activeTab,
    setActiveTab,
    filtered,
    refresh: () => load(true),
    goBack,
    goToContract,
  };
}
