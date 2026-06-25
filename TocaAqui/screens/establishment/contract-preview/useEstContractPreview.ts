import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { RouteProp, useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { contractService, mapApiContractToTemplateData } from "@/http/contractService";
import { downloadContractPdf } from "@/utils/generate-contract-pdf";
import {
  fetchWorkflow,
  downloadAttachedPdf,
  publishShowAfterContractApproval,
  rejectArtistSignedContract,
} from "@/services/contractPdfWorkflowService";
import type { ContractPdfWorkflowMeta } from "@/types/contractPdf";
import { DOWNLOAD_SUCCESS_MESSAGE } from "./constants";
import { ContractPreviewData } from "./types";
import { buildContractPreviewDisplay, getErrorMessage } from "./utils";

type NavProp = NativeStackNavigationProp<EstStackParamList, "EstContractPreview">;
type RouteType = RouteProp<EstStackParamList, "EstContractPreview">;

export function useEstContractPreview() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { contractId, artistName, gigTitle, eventoId, initialContract } = route.params;

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [contractRaw, setContractRaw] = useState<Record<string, unknown> | null>(
    initialContract ?? null
  );
  const [workflow, setWorkflow] = useState<ContractPdfWorkflowMeta | null>(null);
  const [preview, setPreview] = useState<ContractPreviewData | null>(
    initialContract ? mapApiContractToTemplateData(initialContract) : null
  );

  const load = useCallback(async () => {
    try {
      const data = (await contractService.getContractById(contractId)) as unknown as Record<
        string,
        unknown
      >;
      setContractRaw(data);
      setPreview(mapApiContractToTemplateData(data));
      const wf = await fetchWorkflow(contractId);
      setWorkflow(wf);
    } catch {
      if (initialContract) {
        setContractRaw(initialContract);
        setPreview(mapApiContractToTemplateData(initialContract));
        return;
      }
      Alert.alert("Erro", "Não foi possível carregar o contrato.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [contractId, initialContract, navigation]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const display = useMemo(() => {
    if (!preview) return null;
    return buildContractPreviewDisplay({
      gigTitle,
      artistName,
      preview,
      workflow,
      contractRaw,
    });
  }, [gigTitle, artistName, preview, workflow, contractRaw]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const goToShowDetail = useCallback(() => {
    navigation.replace("EstShowDetail", { contractId });
  }, [navigation, contractId]);

  const runWorkflowAction = useCallback(
    async (fn: () => Promise<void>, successMsg?: string) => {
      setBusy(true);
      try {
        await fn();
        await load();
        if (successMsg) Alert.alert("Sucesso", successMsg);
      } catch (err: unknown) {
        Alert.alert("Erro", getErrorMessage(err, "Operação falhou."));
      } finally {
        setBusy(false);
      }
    },
    [load]
  );

  const handleDownloadModel = useCallback(async () => {
    if (!preview) return;
    setBusy(true);
    try {
      await downloadContractPdf(preview);
      Alert.alert("Contrato baixado", DOWNLOAD_SUCCESS_MESSAGE, [
        { text: "OK", onPress: goToShowDetail },
      ]);
    } catch (err: unknown) {
      Alert.alert("Erro", getErrorMessage(err, "Erro ao gerar PDF."));
    } finally {
      setBusy(false);
    }
  }, [preview, goToShowDetail]);

  const handleViewArtistContract = useCallback(() => {
    runWorkflowAction(async () => {
      const path = await downloadAttachedPdf(contractId, "artist");
      if (!path) throw new Error("Contrato assinado pelo artista não encontrado.");
    });
  }, [contractId, runWorkflowAction]);

  const handleApprove = useCallback(() => {
    Alert.alert(
      "Aprovar contrato",
      "Ao aprovar, o show ficará público para venda de ingressos. Confirmar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Aprovar",
          onPress: () =>
            runWorkflowAction(
              () => publishShowAfterContractApproval(contractId, eventoId),
              "Contrato aprovado! O show está disponível para venda de ingressos."
            ),
        },
      ]
    );
  }, [contractId, eventoId, runWorkflowAction]);

  const handleReject = useCallback(() => {
    Alert.alert(
      "Cancelar contrato",
      "O artista será notificado e poderá anexar e enviar um novo contrato assinado. Confirmar?",
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Cancelar contrato",
          style: "destructive",
          onPress: () =>
            runWorkflowAction(
              () => rejectArtistSignedContract(contractId),
              "Contrato recusado. O artista pode enviar uma nova versão assinada."
            ),
        },
      ]
    );
  }, [contractId, runWorkflowAction]);

  return {
    loading,
    busy,
    display,
    goBack,
    goToShowDetail,
    handleDownloadModel,
    handleViewArtistContract,
    handleApprove,
    handleReject,
  };
}
