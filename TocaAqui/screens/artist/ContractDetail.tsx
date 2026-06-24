import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { contractService, mapApiContractToTemplateData } from "@/http/contractService";
import { ArtistStackParamList } from "@/navigation/ArtistNavigator";
import ContractPdfWorkflowPanel, { useContractPdfWorkflow } from "@/components/contract/ContractPdfWorkflowPanel";
import { canArtistViewSigned, workflowStatusLabel, resolveWorkflow } from "@/services/contractPdfWorkflowService";

const DS = {
  bg: "#09090F",
  bgCard: "#16163A",
  accent: "#6C5CE7",
  white: "#FFFFFF",
  textSec: "#A0A0B8",
  textDis: "#555577",
  success: "#10B981",
  amber: "#F59E0B",
};

type NavProp = NativeStackNavigationProp<ArtistStackParamList>;
type RouteType = RouteProp<ArtistStackParamList, "ContractDetail">;

export default function ContractDetail() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { contractId } = route.params;

  const [contract, setContract] = useState<Awaited<ReturnType<typeof contractService.getContractById>> | null>(null);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  }

  if (!contract) return null;

  const preview = mapApiContractToTemplateData(contract as unknown as Record<string, unknown>);
  const refNumber = `SE-2026-${String(contract.id).padStart(4, "0")}-GIG`;
  const resolvedWorkflow = resolveWorkflow(workflow, contract as unknown as Record<string, unknown>);
  const artistCanSeeContract = canArtistViewSigned(resolvedWorkflow, contract as unknown as Record<string, unknown>);
  const artistMustResubmit = Boolean(resolvedWorkflow?.artistRejectedAt) && resolvedWorkflow?.s === "sent_to_artist";

  const formattedDate = contract.data_evento
    ? new Date(contract.data_evento).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Data não informada";

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <FontAwesome5 name="arrow-left" size={18} color={DS.white} />
        </TouchableOpacity>
        <Text style={styles.brandName}>TOCA AQUI</Text>
        <FontAwesome5 name="music" size={18} color={DS.accent} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.docIconContainer}>
          <View style={styles.docIconCircle}>
            <FontAwesome5 name="file-contract" size={32} color={DS.accent} />
          </View>
        </View>

        <Text style={styles.contractTitle}>Show Contratado</Text>
        <Text style={styles.contractRef}>Ref. #{refNumber}</Text>

        <View style={styles.statusBadge}>
          <FontAwesome5 name="check" size={11} color={DS.success} />
          <Text style={styles.statusBadgeText}>VOCÊ FOI CONTRATADO(A)</Text>
        </View>

        {artistMustResubmit && (
          <View style={styles.rejectBanner}>
            <FontAwesome5 name="exclamation-circle" size={14} color={DS.danger} />
            <Text style={styles.rejectBannerText}>
              O estabelecimento não aceitou o contrato enviado. Anexe e envie uma nova versão assinada.
            </Text>
          </View>
        )}

        {!artistCanSeeContract && !artistMustResubmit && (
          <View style={styles.waitBanner}>
            <FontAwesome5 name="clock" size={14} color={DS.amber} />
            <Text style={styles.waitBannerText}>
              Aguardando o estabelecimento enviar o contrato assinado. Você será notificado quando estiver disponível.
            </Text>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoCardLabel}>EVENTO</Text>
          <Text style={styles.infoCardValue}>{preview.tituloEvento}</Text>
        </View>

        <View style={styles.gridRow}>
          <View style={[styles.infoCard, { flex: 1 }]}>
            <FontAwesome5 name="calendar-alt" size={14} color={DS.accent} />
            <Text style={styles.infoCardLabel}>DATA</Text>
            <Text style={styles.infoCardValueSmall}>{formattedDate}</Text>
          </View>
          <View style={[styles.infoCard, { flex: 1 }]}>
            <FontAwesome5 name="map-marker-alt" size={14} color={DS.accent} />
            <Text style={styles.infoCardLabel}>LOCAL</Text>
            <Text style={styles.infoCardValueSmall}>{preview.localEvento}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Termos Acordados</Text>
        <View style={styles.termsCard}>
          <View style={styles.termRow}>
            <Text style={styles.termLabel}>Cachê</Text>
            <Text style={styles.termValue}>R$ {preview.cacheTotal}</Text>
          </View>
          <View style={styles.termDivider} />
          <View style={styles.termRow}>
            <Text style={styles.termLabel}>Horário</Text>
            <Text style={styles.termNote}>
              {preview.horarioInicio} — {preview.horarioFim}
            </Text>
          </View>
          <View style={styles.termDivider} />
          <View style={styles.termRow}>
            <Text style={styles.termLabel}>Estabelecimento</Text>
            <Text style={styles.termNote}>{preview.nomeContratante}</Text>
          </View>
        </View>

        {artistCanSeeContract && (
          <>
            <Text style={styles.sectionTitle}>Contrato Assinado</Text>
            <Text style={styles.workflowHint}>
              Status: {workflowStatusLabel(resolvedWorkflow?.s)}
            </Text>
            <ContractPdfWorkflowPanel
              contractId={contractId}
              contractData={contract as unknown as Record<string, unknown>}
              role="artist"
              workflow={workflow}
              onRefresh={async () => { await refreshWorkflow(); await fetchContract(); }}
            />
          </>
        )}

        <Text style={styles.legalText}>
          Você foi selecionado para este show. O contrato é assinado offline em PDF e trocado
          pela plataforma. O show só será divulgado para venda de ingressos após aprovação
          final do estabelecimento.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.bg },
  loadingContainer: {
    flex: 1, backgroundColor: DS.bg, justifyContent: "center", alignItems: "center",
  },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16,
  },
  brandName: {
    fontFamily: "AkiraExpanded-Superbold", fontSize: 14, color: DS.accent, letterSpacing: 2,
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  docIconContainer: { alignItems: "center", marginBottom: 16 },
  docIconCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: DS.accent + "22",
    justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: DS.accent + "44",
  },
  contractTitle: {
    fontFamily: "AkiraExpanded-Superbold", fontSize: 20, color: DS.white, textAlign: "center", marginBottom: 6,
  },
  contractRef: {
    fontFamily: "Montserrat-Regular", fontSize: 13, color: DS.textDis, textAlign: "center", marginBottom: 16,
  },
  statusBadge: {
    flexDirection: "row", alignItems: "center", alignSelf: "center",
    backgroundColor: DS.success + "22", borderWidth: 1, borderColor: DS.success,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, gap: 6, marginBottom: 16,
  },
  statusBadgeText: {
    fontFamily: "Montserrat-Bold", fontSize: 11, color: DS.success, letterSpacing: 1.5,
  },
  waitBanner: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: DS.amber + "18", borderRadius: 12, borderWidth: 1, borderColor: DS.amber + "44",
    padding: 14, marginBottom: 16,
  },
  waitBannerText: {
    flex: 1, fontFamily: "Montserrat-Regular", fontSize: 12, color: DS.textSec, lineHeight: 18,
  },
  rejectBanner: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: "#EF444418", borderRadius: 12, borderWidth: 1, borderColor: "#EF444444",
    padding: 14, marginBottom: 16,
  },
  rejectBannerText: {
    flex: 1, fontFamily: "Montserrat-Regular", fontSize: 12, color: DS.textSec, lineHeight: 18,
  },
  infoCard: {
    backgroundColor: DS.bgCard, borderRadius: 12, padding: 14, marginBottom: 10, gap: 4,
  },
  gridRow: { flexDirection: "row", gap: 10 },
  infoCardLabel: {
    fontFamily: "Montserrat-SemiBold", fontSize: 10, color: DS.textDis, letterSpacing: 2,
  },
  infoCardValue: { fontFamily: "Montserrat-Bold", fontSize: 16, color: DS.white },
  infoCardValueSmall: { fontFamily: "Montserrat-SemiBold", fontSize: 13, color: DS.white, lineHeight: 18 },
  sectionTitle: {
    fontFamily: "Montserrat-Bold", fontSize: 13, color: DS.textSec, letterSpacing: 2, marginTop: 20, marginBottom: 10,
  },
  workflowHint: {
    fontFamily: "Montserrat-Regular", fontSize: 12, color: DS.textSec, marginBottom: 8,
  },
  termsCard: { backgroundColor: DS.bgCard, borderRadius: 12, padding: 16, marginBottom: 16 },
  termRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  termLabel: { fontFamily: "Montserrat-SemiBold", fontSize: 14, color: DS.white },
  termNote: { fontFamily: "Montserrat-Regular", fontSize: 12, color: DS.textSec, flex: 1, textAlign: "right" },
  termValue: { fontFamily: "Montserrat-Bold", fontSize: 16, color: DS.success },
  termDivider: { height: 1, backgroundColor: "#1A1040", marginVertical: 8 },
  legalText: {
    fontFamily: "Montserrat-Regular", fontSize: 11, color: DS.textDis,
    textAlign: "center", lineHeight: 17, paddingHorizontal: 10, marginTop: 16,
  },
});
