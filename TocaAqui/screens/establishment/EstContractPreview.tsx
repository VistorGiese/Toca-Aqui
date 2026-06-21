import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, StatusBar,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { contractService, mapApiContractToTemplateData } from "@/http/contractService";
import { downloadContractPdf } from "@/utils/generate-contract-pdf";
import { saveWorkflow, workflowStatusLabel } from "@/services/contractPdfWorkflowService";

const DS = {
  bg: "#09090F", card: "#13101F", border: "#1E1A30", accent: "#7B61FF",
  cyan: "#00CEC9", success: "#00C853", textPrimary: "#FFFFFF",
  textSecondary: "#8888AA", textMuted: "#555577",
};

type NavProp = NativeStackNavigationProp<EstStackParamList>;
type RouteType = RouteProp<EstStackParamList, "EstContractPreview">;

export default function EstContractPreview() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { contractId, artistName, gigTitle, initialContract } = route.params;

  const [loading, setLoading] = useState(!initialContract);
  const [downloading, setDownloading] = useState(false);
  const [preview, setPreview] = useState<ReturnType<typeof mapApiContractToTemplateData> | null>(
    initialContract ? mapApiContractToTemplateData(initialContract) : null
  );

  const load = useCallback(async () => {
    try {
      let data: Record<string, unknown> | null = initialContract ?? null;
      if (!data) {
        data = (await contractService.getContractById(contractId)) as unknown as Record<string, unknown>;
      }
      setPreview(mapApiContractToTemplateData(data));
      try {
        await saveWorkflow(contractId, "generated");
      } catch {
        // workflow é auxiliar; não bloqueia preview do contrato
      }
    } catch {
      if (initialContract) {
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

  useEffect(() => { load(); }, [load]);

  const handleDownload = async () => {
    if (!preview) return;
    setDownloading(true);
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
      setDownloading(false);
    }
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
          <Text style={s.badgeText}>{workflowStatusLabel("generated")}</Text>
        </View>

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

        <View style={s.infoCard}>
          <FontAwesome5 name="info-circle" size={16} color={DS.cyan} />
          <Text style={s.infoText}>
            Baixe o contrato, assine offline e depois anexe a versão assinada na tela do show.
            O artista será notificado somente após você enviar o contrato assinado.
          </Text>
        </View>

        <TouchableOpacity
          style={[s.btnPrimary, downloading && s.disabled]}
          onPress={handleDownload}
          disabled={downloading}
          activeOpacity={0.85}
        >
          {downloading ? (
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
  card: { backgroundColor: DS.card, borderRadius: 14, borderWidth: 1, borderColor: DS.border, padding: 16, marginBottom: 16 },
  label: { fontFamily: "Montserrat-SemiBold", fontSize: 10, color: DS.textMuted, letterSpacing: 1.5, marginTop: 8 },
  value: { fontFamily: "Montserrat-Bold", fontSize: 15, color: DS.textPrimary },
  valueSm: { fontFamily: "Montserrat-Regular", fontSize: 13, color: DS.textSecondary, lineHeight: 18 },
  divider: { height: 1, backgroundColor: DS.border, marginVertical: 12 },
  infoCard: {
    flexDirection: "row", gap: 12, backgroundColor: DS.cyan + "11", borderRadius: 12,
    borderWidth: 1, borderColor: DS.cyan + "33", padding: 14, marginBottom: 24,
  },
  infoText: { flex: 1, fontFamily: "Montserrat-Regular", fontSize: 12, color: DS.textSecondary, lineHeight: 18 },
  btnPrimary: {
    backgroundColor: DS.accent, borderRadius: 12, paddingVertical: 16,
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 12,
  },
  btnPrimaryText: { fontFamily: "Montserrat-Bold", fontSize: 13, color: "#fff", letterSpacing: 0.5 },
  btnSecondary: { borderWidth: 1.5, borderColor: DS.border, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  btnSecondaryText: { fontFamily: "Montserrat-Bold", fontSize: 13, color: DS.textSecondary },
  disabled: { opacity: 0.5 },
});
