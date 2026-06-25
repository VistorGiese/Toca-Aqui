import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { RouteProp, useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { establishmentService } from "@/http/establishmentService";
import { contractService } from "@/http/contractService";
import api from "@/http/api";
import { useContractPdfWorkflow } from "@/components/contract/ContractPdfWorkflowPanel";
import {
  fetchWorkflow,
  isShowPublic,
  resolveWorkflow,
  syncShowPublicationIfApproved,
} from "@/services/contractPdfWorkflowService";
import { CANCEL_MOTIVO } from "./constants";
import { ContractDetail } from "./types";
import { buildShowDetailDisplay, getApiErrorMessage, getArtistName } from "./utils";

type NavProp = NativeStackNavigationProp<EstStackParamList, "EstShowDetail">;
type RouteType = RouteProp<EstStackParamList, "EstShowDetail">;

export function useEstShowDetail() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { contractId } = route.params;

  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [completing, setCompleting] = useState(false);
  const { workflow, refresh: refreshWorkflow } = useContractPdfWorkflow(contractId);

  const load = useCallback(async () => {
    try {
      const data = (await establishmentService.getContractById(contractId)) as ContractDetail;
      setContract(data);
      const wf = await fetchWorkflow(contractId);
      await refreshWorkflow();
      if (data.evento_id) {
        await syncShowPublicationIfApproved(Number(data.evento_id), wf, contractId);
      }
    } catch {
      Alert.alert("Erro", "Não foi possível carregar o show.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [contractId, navigation, refreshWorkflow]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const display = useMemo(() => {
    if (!contract) return null;
    const showIsPublic = isShowPublic(
      resolveWorkflow(workflow, contract as Record<string, unknown>)
    );
    return buildShowDetailDisplay(contract, contractId, showIsPublic);
  }, [contract, contractId, workflow]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleContractApproved = useCallback(async () => {
    await load();
  }, [load]);

  const refreshWorkflowAndLoad = useCallback(async () => {
    await refreshWorkflow();
    await load();
  }, [refreshWorkflow, load]);

  const handleCancel = useCallback(() => {
    Alert.alert(
      "Cancelar show",
      "Tem certeza que deseja cancelar este show? Esta ação não pode ser desfeita e pode gerar multa.",
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Cancelar show",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              await api.put(`/contratos/${contractId}/cancelar`, {
                motivo: CANCEL_MOTIVO,
              });
              Alert.alert("Show cancelado", "O artista será notificado.", [
                { text: "OK", onPress: goBack },
              ]);
            } catch (err: unknown) {
              Alert.alert("Erro", getApiErrorMessage(err, "Erro ao cancelar."));
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  }, [contractId, goBack]);

  const handleComplete = useCallback(() => {
    Alert.alert(
      "Marcar como realizado",
      "Confirma que este show foi realizado com sucesso?",
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            setCompleting(true);
            try {
              await contractService.completeContract(contractId);
              await load();
            } catch (err: unknown) {
              Alert.alert("Erro", getApiErrorMessage(err, "Erro ao concluir."));
            } finally {
              setCompleting(false);
            }
          },
        },
      ]
    );
  }, [contractId, load]);

  const handleRateArtist = useCallback(() => {
    if (!contract) return;
    navigation.navigate("EstRateArtist", {
      contractId,
      artistName: getArtistName(contract),
      showDate: contract.data_evento ?? "",
    });
  }, [navigation, contract, contractId]);

  return {
    contract,
    contractId,
    workflow,
    loading,
    cancelling,
    completing,
    display,
    goBack,
    handleContractApproved,
    refreshWorkflowAndLoad,
    handleCancel,
    handleComplete,
    handleRateArtist,
  };
}
