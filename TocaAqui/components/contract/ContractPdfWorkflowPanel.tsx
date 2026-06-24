import React, { useCallback, useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import {
  attachSignedPdf,
  downloadAttachedPdf,
  sendToArtist,
  sendToEstablishment,
  saveWorkflow,
  publishShowAfterContractApproval,
  rejectArtistSignedContract,
  workflowStatusLabel,
  canEstAttachSigned,
  canEstSendToArtist,
  canEstApprove,
  canEstReviewArtistContract,
  canEstDownloadTemplate,
  canArtistViewSigned,
  canArtistAttachSigned,
  canArtistSend,
  fetchWorkflow,
  resolveWorkflow,
} from "@/services/contractPdfWorkflowService";
import { mapApiContractToTemplateData } from "@/http/contractService";
import { downloadContractPdf } from "@/utils/generate-contract-pdf";
import type { ContractPdfWorkflowMeta } from "@/types/contractPdf";

const DS = {
  card: "#13101F", border: "#1E1A30", accent: "#7B61FF", cyan: "#00CEC9",
  success: "#00C853", danger: "#EF4444", amber: "#F59E0B",
  textPrimary: "#FFFFFF", textSecondary: "#8888AA", textMuted: "#555577",
};

type Props = {
  contractId: number;
  eventoId?: number;
  contractData?: Record<string, unknown>;
  role: "est" | "artist";
  workflow: ContractPdfWorkflowMeta | null;
  onRefresh: () => void;
  onApproved?: () => void;
};

export default function ContractPdfWorkflowPanel({
  contractId,
  eventoId,
  contractData,
  role,
  workflow,
  onRefresh,
  onApproved,
}: Props) {
  const [busy, setBusy] = useState(false);
  const resolvedWorkflow = resolveWorkflow(workflow, contractData);

  const run = async (fn: () => Promise<void>, successMsg?: string) => {
    setBusy(true);
    try {
      await fn();
      await onRefresh();
      if (successMsg) Alert.alert("Sucesso", successMsg);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Operação falhou.";
      Alert.alert("Erro", msg);
    } finally {
      setBusy(false);
    }
  };

  const pickAndAttach = () => {
    Alert.alert(
      "Anexar contrato assinado",
      "Selecione o arquivo PDF assinado do seu dispositivo.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Selecionar PDF",
          onPress: async () => {
            try {
              const result = await DocumentPicker.getDocumentAsync({
                type: "application/pdf",
                copyToCacheDirectory: true,
              });
              if (result.canceled || !result.assets?.[0]?.uri) return;
              await run(
                () => attachSignedPdf(contractId, role, result.assets![0].uri),
                "Contrato assinado anexado com sucesso."
              );
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : "Não foi possível anexar o PDF.";
              Alert.alert("Erro", msg);
            }
          },
        },
      ]
    );
  };

  const handleDownloadTemplate = () =>
    run(async () => {
      if (!contractData) throw new Error("Dados do contrato indisponíveis.");
      await downloadContractPdf(mapApiContractToTemplateData(contractData));
    });

  const handleDownloadSigned = () =>
    run(async () => {
      const path = await downloadAttachedPdf(contractId, "est");
      if (!path) throw new Error("Contrato assinado do estabelecimento não encontrado.");
    });

  const handleSendToArtist = () =>
    run(() => sendToArtist(contractId), "Contrato enviado ao artista contratado.");

  const handleSendToEst = () =>
    run(() => sendToEstablishment(contractId), "Contrato enviado ao estabelecimento para aprovação.");

  const handleViewArtistContract = () =>
    run(async () => {
      const path = await downloadAttachedPdf(contractId, "artist");
      if (!path) throw new Error("Contrato assinado pelo artista não encontrado.");
    });

  const handleRejectArtistContract = () => {
    Alert.alert(
      "Cancelar contrato",
      "O artista será notificado e poderá anexar e enviar um novo contrato assinado. Confirmar?",
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Cancelar contrato",
          style: "destructive",
          onPress: () =>
            run(
              () => rejectArtistSignedContract(contractId),
              "Contrato recusado. O artista pode enviar uma nova versão assinada."
            ),
        },
      ]
    );
  };

  const handleApprove = () => {
    Alert.alert(
      "Aprovar contrato",
      "Ao aprovar, o show ficará público para venda de ingressos. Confirmar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Aprovar",
          onPress: () =>
            run(async () => {
              if (!eventoId) {
                await saveWorkflow(contractId, "approved", { approvedAt: new Date().toISOString() });
                onApproved?.();
                return;
              }
              await publishShowAfterContractApproval(contractId, eventoId);
              onApproved?.();
            }, "Contrato aprovado! O show está disponível para venda de ingressos."),
        },
      ]
    );
  };

  const status = resolvedWorkflow?.s;

  return (
    <View style={s.wrap}>
      <Text style={s.sectionTitle}>FLUXO DO CONTRATO PDF</Text>
      <View style={s.statusCard}>
        <FontAwesome5 name="file-pdf" size={16} color={DS.accent} />
        <Text style={s.statusText}>{workflowStatusLabel(status)}</Text>
      </View>

      {role === "est" && (
        <>
          {canEstDownloadTemplate(resolvedWorkflow) && contractData && (
            <ActionBtn
              icon="file-download"
              label="BAIXAR MODELO DO CONTRATO"
              onPress={handleDownloadTemplate}
              busy={busy}
              color={DS.cyan}
            />
          )}
          {canEstAttachSigned(resolvedWorkflow, contractData) && (
            <ActionBtn
              icon="paperclip"
              label="ANEXAR CONTRATO ASSINADO"
              onPress={pickAndAttach}
              busy={busy}
              color={DS.accent}
            />
          )}
          {canEstSendToArtist(resolvedWorkflow) && (
            <ActionBtn
              icon="paper-plane"
              label="ENVIAR PARA O ARTISTA"
              onPress={handleSendToArtist}
              busy={busy}
              color={DS.cyan}
            />
          )}
          {canEstReviewArtistContract(resolvedWorkflow) && (
            <ActionBtn
              icon="file-pdf"
              label="VER CONTRATO DO ARTISTA"
              onPress={handleViewArtistContract}
              busy={busy}
              color={DS.cyan}
            />
          )}
          {canEstApprove(resolvedWorkflow) && (
            <ActionBtn
              icon="check-circle"
              label="APROVAR CONTRATO E ABRIR PARA ANÚNCIO"
              onPress={handleApprove}
              busy={busy}
              color={DS.success}
            />
          )}
          {canEstApprove(resolvedWorkflow) && (
            <ActionBtn
              icon="times-circle"
              label="CANCELAR CONTRATO"
              onPress={handleRejectArtistContract}
              busy={busy}
              color={DS.danger}
            />
          )}
        </>
      )}

      {role === "artist" && (
        <>
          {canArtistViewSigned(resolvedWorkflow, contractData) && (
            <ActionBtn
              icon="download"
              label="BAIXAR CONTRATO DO ESTABELECIMENTO"
              onPress={handleDownloadSigned}
              busy={busy}
              color={DS.cyan}
            />
          )}
          {canArtistAttachSigned(resolvedWorkflow, contractData) && (
            <ActionBtn
              icon="paperclip"
              label="ANEXAR CONTRATO ASSINADO"
              onPress={pickAndAttach}
              busy={busy}
              color={DS.accent}
            />
          )}
          {canArtistSend(resolvedWorkflow, contractData) && (
            <ActionBtn
              icon="paper-plane"
              label="ENVIAR CONTRATO"
              onPress={handleSendToEst}
              busy={busy}
              color={DS.cyan}
            />
          )}
        </>
      )}
    </View>
  );
}

function ActionBtn({
  icon, label, onPress, busy, color,
}: {
  icon: string; label: string; onPress: () => void; busy: boolean; color: string;
}) {
  return (
    <TouchableOpacity
      style={[s.btn, { backgroundColor: color }, busy && s.disabled]}
      onPress={onPress}
      disabled={busy}
      activeOpacity={0.85}
    >
      {busy ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <>
          <FontAwesome5 name={icon} size={14} color="#fff" />
          <Text style={s.btnText}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

/** Hook auxiliar para telas de contrato/show. */
export function useContractPdfWorkflow(contractId: number) {
  const [workflow, setWorkflow] = useState<ContractPdfWorkflowMeta | null>(null);

  const refresh = useCallback(async () => {
    const wf = await fetchWorkflow(contractId);
    setWorkflow(wf);
  }, [contractId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { workflow, refresh };
}

const s = StyleSheet.create({
  wrap: { marginTop: 8, marginBottom: 16 },
  sectionTitle: {
    fontFamily: "Montserrat-Bold", fontSize: 11, color: DS.textMuted,
    letterSpacing: 1.5, marginBottom: 10,
  },
  statusCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: DS.card, borderRadius: 10, borderWidth: 1, borderColor: DS.border,
    padding: 12, marginBottom: 12,
  },
  statusText: { fontFamily: "Montserrat-SemiBold", fontSize: 13, color: DS.textPrimary, flex: 1 },
  btn: {
    borderRadius: 12, paddingVertical: 14, flexDirection: "row",
    justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 10,
  },
  btnText: { fontFamily: "Montserrat-Bold", fontSize: 12, color: "#fff", letterSpacing: 0.5 },
  disabled: { opacity: 0.5 },
});
