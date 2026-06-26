import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect, useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useContractPdfWorkflow } from "@/components/contract/ContractPdfWorkflowPanel";
import { contractService, mapApiContractToTemplateData } from "@/http/contractService";
import { ArtistStackParamList } from "@/navigation/ArtistNavigator";
import {
  canArtistViewSigned,
  resolveWorkflow,
  workflowStatusLabel,
} from "@/services/contractPdfWorkflowService";
import { ContractData, ContractDetailDisplay } from "./types";
import { buildRefNumber, formatContractDate } from "./utils";

type NavProp = NativeStackNavigationProp<ArtistStackParamList>;
type RouteType = RouteProp<ArtistStackParamList, "ContractDetail">;

export function useArtistContractDetail() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { contractId } = route.params;

  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const { workflow, refresh: refreshWorkflow } = useContractPdfWorkflow(contractId);

  const fetchContract = useCallback(async () => {
    try {
      const data = await contractService.getContractById(contractId);
      setContract(data);
      await refreshWorkflow();
    } catch {
      Alert.alert("Erro", "Não foi possível carregar o contrato.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [contractId, navigation, refreshWorkflow]);

  useFocusEffect(
    useCallback(() => {
      fetchContract();
    }, [fetchContract])
  );

  const display = useMemo<ContractDetailDisplay | null>(() => {
    if (!contract) return null;

    const preview = mapApiContractToTemplateData(contract as unknown as Record<string, unknown>);
    const resolvedWorkflow = resolveWorkflow(workflow, contract as unknown as Record<string, unknown>);
    const artistCanSeeContract = canArtistViewSigned(
      resolvedWorkflow,
      contract as unknown as Record<string, unknown>
    );
    const artistMustResubmit =
      Boolean(resolvedWorkflow?.artistRejectedAt) && resolvedWorkflow?.s === "sent_to_artist";

    return {
      refNumber: buildRefNumber(contract.id),
      formattedDate: formatContractDate(contract.data_evento),
      preview: {
        tituloEvento: preview.tituloEvento,
        localEvento: preview.localEvento,
        cacheTotal: preview.cacheTotal,
        horarioInicio: preview.horarioInicio,
        horarioFim: preview.horarioFim,
        nomeContratante: preview.nomeContratante,
      },
      artistCanSeeContract,
      artistMustResubmit,
      workflowStatus: workflowStatusLabel(resolvedWorkflow?.s),
    };
  }, [contract, workflow]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const refreshWorkflowAndLoad = useCallback(async () => {
    await refreshWorkflow();
    await fetchContract();
  }, [refreshWorkflow, fetchContract]);

  return {
    contractId,
    contract,
    workflow,
    loading,
    display,
    goBack,
    refreshWorkflowAndLoad,
  };
}
