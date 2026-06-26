import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Linking } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArtistStackParamList } from "@/navigation/ArtistNavigator";
import { contractService } from "@/http/contractService";
import { CONTACT_ALERTS, REPORT_ALERT } from "./constants";
import { ShowDetailContract } from "./types";
import { buildMapsUrl, buildShowDetailDisplay } from "./utils";

type NavProp = NativeStackNavigationProp<ArtistStackParamList, "ShowDetail">;
type RouteType = RouteProp<ArtistStackParamList, "ShowDetail">;

export function useArtistShowDetail() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { contractId } = route.params;

  const [contract, setContract] = useState<ShowDetailContract | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchContract = useCallback(async () => {
    try {
      const data = await contractService.getContractById(contractId);
      setContract(data as ShowDetailContract);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os detalhes do show.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [contractId, navigation]);

  useEffect(() => {
    fetchContract();
  }, [fetchContract]);

  const display = useMemo(
    () => (contract ? buildShowDetailDisplay(contract) : null),
    [contract]
  );

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const openMaps = useCallback(() => {
    Linking.openURL(buildMapsUrl(contract?.endereco, contract?.cidade));
  }, [contract]);

  const reportProblem = useCallback(() => {
    Alert.alert(REPORT_ALERT.title, REPORT_ALERT.message);
  }, []);

  const handleCall = useCallback(() => {
    Alert.alert(CONTACT_ALERTS.call.title, CONTACT_ALERTS.call.message);
  }, []);

  const handleMessage = useCallback(() => {
    Alert.alert(CONTACT_ALERTS.message.title, CONTACT_ALERTS.message.message);
  }, []);

  const handleContactProfile = useCallback(() => {
    if (!display?.responsavel) return;
    Alert.alert("Perfil", `Responsável: ${display.responsavel.nome}`);
  }, [display]);

  return {
    loading,
    display,
    goBack,
    openMaps,
    reportProblem,
    handleCall,
    handleMessage,
    handleContactProfile,
  };
}
