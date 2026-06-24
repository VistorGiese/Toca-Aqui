import React, { useCallback, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, StatusBar,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { contractService, mapApiContractToTemplateData } from "@/http/contractService";
import { downloadContractPdf } from "@/utils/generate-contract-pdf";
import {
  fetchWorkflow,
  downloadAttachedPdf,
  publishShowAfterContractApproval,
  rejectArtistSignedContract,
  workflowStatusLabel,
  resolveWorkflow,
  canEstReviewArtistContract,
  isShowPublic,
} from "@/services/contractPdfWorkflowService";
import type { ContractPdfWorkflowMeta } from "@/types/contractPdf";

const DS = {
  bg: "#09090F", card: "#13101F", border: "#1E1A30", accent: "#7B61FF",
  cyan: "#00CEC9", success: "#00C853", danger: "#EF4444", amber: "#F59E0B",
  textPrimary: "#FFFFFF", textSecondary: "#8888AA", textMuted: "#555577",
};

type NavProp = NativeStackNavigationProp<EstStackParamList>;
type RouteType = RouteProp<EstStackParamList, "EstContractPreview">;

export default function EstContractPreview() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { contractId, artistName, gigTitle, eventoId, initialContract } = route.params;

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [contractRaw, setContractRaw] = useState<Record<string, unknown> | null>(
    initialContract ?? null
  );
  const [workflow, setWorkflow] = useState<ContractPdfWorkflowMeta | null>(null);
  const [preview, setPreview] = useState<ReturnType<typeof mapApiContractToTemplateData> | null>(
    initialContract ? mapApiContractToTemplateData(initialContract) : null
  );

  const load = useCallback(async () => {
    try {
      const data = (await contractService.getContractById(contractId)) as unknown as Record<string, unknown>;
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

  const resolvedWorkflow = resolveWorkflow(workflow, contractRaw);
  const awaitingApproval = resolvedWorkflow?.s === "awaiting_approval";
  const approved = isShowPublic(resolvedWorkflow);

  const run = async (fn: () => Promise<void>, successMsg?: string) => {
    setBusy(true);
    try {
      await fn();
      await load();
      if (successMsg) Alert.alert("Sucesso", successMsg);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Operação falhou.";
      Alert.alert("Erro", msg);
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadModel = async () => {
    if (!preview) return;
    setBusy(true);
    try {
      await downloadContractPdf(preview);
      Alert.alert(
        "Contrato baixado",
        "O PDF foi gerado. Assine offline e depois anexe o contrato assinado na tela do show.",
        [{ text: "OK", onPress: () => navigation.replace("EstShowDetail", { contractId }) }]
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao gerar PDF.";
      Alert.alert("Erro", msg);
    } finally {
      setBusy(false);
    }
  };

  const handleViewArtistContract = () =>
    run(async () => {
      const path = await downloadAttachedPdf(contractId, "artist");
      if (!path) throw new Error("Contrato assinado pelo artista não encontrado.");
    });

  const handleApprove = () => {
    Alert.alert(
      "Aprovar contrato",
      "Ao aprovar, o show ficará público para venda de ingressos. Confirmar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Aprovar",
          onPress: () =>
            run(
              () => publishShowAfterContractApproval(contractId, eventoId),
              "Contrato aprovado! O show está disponível para venda de ingressos."
            ),
        },
      ]
    );
  };

  const handleReject = () => {
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

  if (loading) {
    return (
      <View style={[s.root, s.center]}>
        <ActivityIndicator size="large" color={DS.accent} />
      </View>
    );
  }

  if (!preview) return null;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <FontAwesome5 name="arrow-left" size={18} color={DS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Contrato Gerado</Text>
        <View style={{ width: 18 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.iconWrap}>
          <View style={s.iconCircle}>
            <FontAwesome5 name="file-contract" size={32} color={DS.accent} />
          </View>
        </View>

        <Text style={s.title}>Mini-Contrato</Text>
        <Text style={s.subtitle}>{gigTitle}</Text>
        <Text style={s.ref}>Ref. {preview.refContrato}</Text>

        <View style={s.badge}>
          <Text style={s.badgeText}>{workflowStatusLabel(resolvedWorkflow?.s)}</Text>
        </View>

        {approved && (
          <View style={s.successBanner}>
            <FontAwesome5 name="check-circle" size={14} color={DS.success} />
            <Text style={s.successBannerText}>
              Contrato aprovado — o evento está público para venda de ingressos.
            </Text>
          </View>
        )}

        <View style={s.card}>
          <Text style={s.label}>CONTRATANTE</Text>
          <Text style={s.value}>{preview.nomeContratante}</Text>
          <Text style={s.label}>CONTRATADO</Text>
          <Text style={s.value}>{artistName || preview.nomeContratado}</Text>
          <View style={s.divider} />
          <Text style={s.label}>CACHÊ</Text>
          <Text style={[s.value, { color: DS.cyan }]}>R$ {preview.cacheTotal}</Text>
          <Text style={s.label}>DATA DO SHOW</Text>
          <Text style={s.value}>{preview.dataEvento}</Text>
          <Text style={s.label}>HORÁRIO</Text>
          <Text style={s.value}>{preview.horarioInicio} — {preview.horarioFim}</Text>
          <Text style={s.label}>LOCAL</Text>
          <Text style={s.valueSm}>{preview.localEvento}</Text>
        </View>

        {canEstReviewArtistContract(resolvedWorkflow) && (
          <View style={s.reviewSection}>
            <Text style={s.reviewTitle}>REVISÃO DO CONTRATO DO ARTISTA</Text>
            <Text style={s.reviewHint}>
              {awaitingApproval
                ? "O artista enviou o contrato assinado. Revise, aprove para liberar o anúncio ou cancele para solicitar novo envio."
                : "Contrato aprovado. Você ainda pode baixar a versão assinada pelo artista."}
            </Text>

            <TouchableOpacity
              style={[s.btnCyan, busy && s.disabled]}
              onPress={handleViewArtistContract}
              disabled={busy}
              activeOpacity={0.85}
            >
              {busy ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <FontAwesome5 name="file-pdf" size={14} color="#fff" />
                  <Text style={s.btnPrimaryText}>VER CONTRATO</Text>
                </>
              )}
            </TouchableOpacity>

            {awaitingApproval && (
              <>
                <TouchableOpacity
                  style={[s.btnSuccess, busy && s.disabled]}
                  onPress={handleApprove}
                  disabled={busy}
                  activeOpacity={0.85}
                >
                  <FontAwesome5 name="check-circle" size={14} color="#fff" />
                  <Text style={s.btnPrimaryText}>APROVAR CONTRATO E ABRIR PARA ANÚNCIO</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.btnDanger, busy && s.disabled]}
                  onPress={handleReject}
                  disabled={busy}
                  activeOpacity={0.8}
                >
                  <FontAwesome5 name="times-circle" size={14} color={DS.danger} />
                  <Text style={s.btnDangerText}>CANCELAR CONTRATO</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {!awaitingApproval && !approved && (
          <>
            <View style={s.infoCard}>
              <FontAwesome5 name="info-circle" size={16} color={DS.cyan} />
              <Text style={s.infoText}>
                Baixe o contrato, assine offline e depois anexe a versão assinada na tela do show.
                O artista será notificado somente após você enviar o contrato assinado.
              </Text>
            </View>

            <TouchableOpacity
              style={[s.btnPrimary, busy && s.disabled]}
              onPress={handleDownloadModel}
              disabled={busy}
              activeOpacity={0.85}
            >
              {busy ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <FontAwesome5 name="download" size={14} color="#fff" />
                  <Text style={s.btnPrimaryText}>BAIXAR CONTRATO</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={s.btnSecondary}
              onPress={() => navigation.replace("EstShowDetail", { contractId })}
              activeOpacity={0.8}
            >
              <Text style={s.btnSecondaryText}>IR PARA O SHOW</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.bg },
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: DS.border,
  },
  headerTitle: { fontFamily: "Montserrat-Bold", fontSize: 17, color: DS.textPrimary },
  scroll: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 40 },
  iconWrap: { alignItems: "center", marginBottom: 16 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: DS.accent + "22",
    borderWidth: 2, borderColor: DS.accent + "44", justifyContent: "center", alignItems: "center",
  },
  title: { fontFamily: "Montserrat-Bold", fontSize: 20, color: DS.textPrimary, textAlign: "center" },
  subtitle: { fontFamily: "Montserrat-Regular", fontSize: 14, color: DS.textSecondary, textAlign: "center", marginTop: 6 },
  ref: { fontFamily: "Montserrat-Regular", fontSize: 12, color: DS.textMuted, textAlign: "center", marginTop: 4, marginBottom: 12 },
  badge: {
    alignSelf: "center", backgroundColor: DS.accent + "22", borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6, marginBottom: 20,
  },
  badgeText: { fontFamily: "Montserrat-Bold", fontSize: 10, color: DS.accent, letterSpacing: 1 },
  successBanner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: DS.success + "18", borderRadius: 10, borderWidth: 1, borderColor: DS.success + "44",
    padding: 12, marginBottom: 16,
  },
  successBannerText: {
    flex: 1, fontFamily: "Montserrat-Regular", fontSize: 12, color: DS.textSecondary, lineHeight: 18,
  },
  card: { backgroundColor: DS.card, borderRadius: 14, borderWidth: 1, borderColor: DS.border, padding: 16, marginBottom: 16 },
  label: { fontFamily: "Montserrat-SemiBold", fontSize: 10, color: DS.textMuted, letterSpacing: 1.5, marginTop: 8 },
  value: { fontFamily: "Montserrat-Bold", fontSize: 15, color: DS.textPrimary },
  valueSm: { fontFamily: "Montserrat-Regular", fontSize: 13, color: DS.textSecondary, lineHeight: 18 },
  divider: { height: 1, backgroundColor: DS.border, marginVertical: 12 },
  reviewSection: { marginBottom: 16 },
  reviewTitle: {
    fontFamily: "Montserrat-Bold", fontSize: 11, color: DS.textMuted,
    letterSpacing: 1.5, marginBottom: 8,
  },
  reviewHint: {
    fontFamily: "Montserrat-Regular", fontSize: 12, color: DS.textSecondary,
    lineHeight: 18, marginBottom: 16,
  },
  infoCard: {
    flexDirection: "row", gap: 12, backgroundColor: DS.cyan + "11", borderRadius: 12,
    borderWidth: 1, borderColor: DS.cyan + "33", padding: 14, marginBottom: 24,
  },
  infoText: { flex: 1, fontFamily: "Montserrat-Regular", fontSize: 12, color: DS.textSecondary, lineHeight: 18 },
  btnPrimary: {
    backgroundColor: DS.accent, borderRadius: 12, paddingVertical: 16,
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 12,
  },
  btnCyan: {
    backgroundColor: DS.cyan, borderRadius: 12, paddingVertical: 16,
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 12,
  },
  btnSuccess: {
    backgroundColor: DS.success, borderRadius: 12, paddingVertical: 16,
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 12,
  },
  btnDanger: {
    borderWidth: 1.5, borderColor: DS.danger, borderRadius: 12, paddingVertical: 14,
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 12,
    backgroundColor: DS.danger + "11",
  },
  btnPrimaryText: { fontFamily: "Montserrat-Bold", fontSize: 12, color: "#fff", letterSpacing: 0.5, textAlign: "center" },
  btnDangerText: { fontFamily: "Montserrat-Bold", fontSize: 12, color: DS.danger, letterSpacing: 0.5 },
  btnSecondary: { borderWidth: 1.5, borderColor: DS.border, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  btnSecondaryText: { fontFamily: "Montserrat-Bold", fontSize: 13, color: DS.textSecondary },
  disabled: { opacity: 0.5 },
});
