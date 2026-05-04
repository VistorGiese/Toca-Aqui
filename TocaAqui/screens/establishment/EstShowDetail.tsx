import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, StatusBar,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { establishmentService } from "@/http/establishmentService";
import { contractService } from "@/http/contractService";
import api from "@/http/api";

const DS = {
  bg: "#09090F", card: "#13101F", surface: "#0F0B1E",
  border: "#1E1A30", accent: "#7B61FF", cyan: "#00CEC9",
  success: "#00C853", danger: "#EF4444", amber: "#F59E0B",
  textPrimary: "#FFFFFF", textSecondary: "#8888AA", textMuted: "#555577",
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  aguardando_aceite: { label: "AGUARDANDO ARTISTA", color: DS.amber },
  aceito:            { label: "CONFIRMADO", color: DS.success },
  concluido:         { label: "REALIZADO", color: DS.cyan },
  cancelado:         { label: "CANCELADO", color: DS.danger },
  recusado:          { label: "RECUSADO", color: DS.danger },
};

type NavProp = NativeStackNavigationProp<EstStackParamList>;
type RouteType = RouteProp<EstStackParamList, "EstShowDetail">;

export default function EstShowDetail() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { contractId } = route.params;

  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [completing, setCompleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await establishmentService.getContractById(contractId);
      setContract(data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar o show.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [contractId, navigation]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = () => {
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
              await api.put(`/contratos/${contractId}/cancelar`);
              Alert.alert("Show cancelado", "O artista será notificado.", [
                { text: "OK", onPress: () => navigation.goBack() },
              ]);
            } catch (err: any) {
              const msg = err?.response?.data?.message || err?.response?.data?.error || "Erro ao cancelar.";
              Alert.alert("Erro", msg);
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  const handleComplete = () => {
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
            } catch (err: any) {
              const msg = err?.response?.data?.message || err?.response?.data?.error || "Erro ao concluir.";
              Alert.alert("Erro", msg);
            } finally {
              setCompleting(false);
            }
          },
        },
      ]
    );
  };

  const handleRateArtist = () => {
    if (!contract) return;
    const artistName = contract.nome_artista ?? contract.nome_contratado ?? "Artista";
    navigation.navigate("EstRateArtist", {
      contractId,
      artistName,
      showDate: contract.data_evento ?? "",
    });
  };

  if (loading) {
    return (
      <View style={[s.root, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={DS.accent} />
      </View>
    );
  }

  if (!contract) return null;

  const status = STATUS_MAP[contract.status] ?? { label: contract.status?.toUpperCase() ?? "—", color: DS.textMuted };
  const isConcluido = contract.status === "concluido" || contract.status === "realizado";
  const isCancelled = contract.status === "cancelado" || contract.status === "recusado";
  const isActive = contract.status === "aceito" || contract.status === "aguardando_aceite";

  const formattedDate = contract.data_evento
    ? new Date(contract.data_evento).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : "Data não informada";

  const cache = Number(contract.cache_total || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  const refNumber = `TA-${String(contractId).padStart(4, "0")}`;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <FontAwesome5 name="arrow-left" size={18} color={DS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Detalhe do Show</Text>
        <View style={{ width: 18 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Ícone + status */}
        <View style={s.iconWrap}>
          <View style={s.iconCircle}>
            <FontAwesome5 name="music" size={28} color={DS.accent} />
          </View>
        </View>

        <View style={[s.statusBadge, { borderColor: status.color, backgroundColor: status.color + "18" }]}>
          <Text style={[s.statusText, { color: status.color }]}>{status.label}</Text>
        </View>

        <Text style={s.refText}>Ref. #{refNumber}</Text>

        {/* Evento */}
        <View style={s.infoCard}>
          <Text style={s.infoLabel}>EVENTO</Text>
          <Text style={s.infoValue}>{contract.nome_evento ?? `Show #${contractId}`}</Text>
        </View>

        {/* Grid data / cache */}
        <View style={s.grid}>
          <View style={[s.infoCard, { flex: 1 }]}>
            <FontAwesome5 name="calendar-alt" size={13} color={DS.accent} />
            <Text style={s.infoLabel}>DATA</Text>
            <Text style={s.infoValueSm}>{formattedDate}</Text>
          </View>
          <View style={[s.infoCard, { flex: 1 }]}>
            <FontAwesome5 name="dollar-sign" size={13} color={DS.success} />
            <Text style={s.infoLabel}>CACHÊ</Text>
            <Text style={[s.infoValueSm, { color: DS.success }]}>R$ {cache}</Text>
          </View>
        </View>

        {/* Horário */}
        {(contract.horario_inicio || contract.horario_fim) && (
          <View style={s.infoCard}>
            <Text style={s.infoLabel}>HORÁRIO</Text>
            <Text style={s.infoValue}>
              {contract.horario_inicio ?? "--"} — {contract.horario_fim ?? "--"}
            </Text>
          </View>
        )}

        {/* Artista */}
        {(contract.nome_artista || contract.artista_id) && (
          <View style={s.infoCard}>
            <Text style={s.infoLabel}>ARTISTA</Text>
            <View style={s.artistRow}>
              <View style={s.artistAvatar}>
                <FontAwesome5 name="user" size={16} color={DS.accent} />
              </View>
              <Text style={s.infoValue}>
                {contract.nome_artista ?? `Artista #${contract.artista_id}`}
              </Text>
            </View>
          </View>
        )}

        {/* Cláusula de cancelamento */}
        {isActive && (
          <View style={s.clauseCard}>
            <FontAwesome5 name="exclamation-triangle" size={14} color={DS.danger} />
            <View style={{ flex: 1 }}>
              <Text style={s.clauseTitle}>CLÁUSULA DE CANCELAMENTO</Text>
              <Text style={s.clauseText}>
                Cancelamentos com menos de 48h implicam em multa de 50% do cachê. Cancelamentos com mais de 7 dias são gratuitos.
              </Text>
            </View>
          </View>
        )}

        {/* Ações */}
        {isConcluido && (
          <TouchableOpacity style={s.btnRate} onPress={handleRateArtist} activeOpacity={0.85}>
            <FontAwesome5 name="star" size={14} color="#fff" />
            <Text style={s.btnRateText}>AVALIAR ARTISTA</Text>
          </TouchableOpacity>
        )}

        {contract.status === "aceito" && (
          <TouchableOpacity
            style={[s.btnComplete, completing && s.disabled]}
            onPress={handleComplete}
            disabled={completing}
            activeOpacity={0.85}
          >
            {completing
              ? <ActivityIndicator color="#fff" size="small" />
              : <>
                  <FontAwesome5 name="check-circle" size={14} color="#fff" />
                  <Text style={s.btnCompleteText}>MARCAR COMO REALIZADO</Text>
                </>
            }
          </TouchableOpacity>
        )}

        {isActive && (
          <TouchableOpacity
            style={[s.btnCancel, cancelling && s.disabled]}
            onPress={handleCancel}
            disabled={cancelling}
            activeOpacity={0.8}
          >
            {cancelling
              ? <ActivityIndicator color={DS.danger} size="small" />
              : <Text style={s.btnCancelText}>CANCELAR SHOW</Text>
            }
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.bg },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: DS.border,
  },
  headerTitle: { fontFamily: "Montserrat-Bold", fontSize: 17, color: DS.textPrimary },
  scroll: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 40 },

  iconWrap: { alignItems: "center", marginBottom: 16 },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: DS.accent + "22", borderWidth: 2, borderColor: DS.accent + "44",
    justifyContent: "center", alignItems: "center",
  },

  statusBadge: {
    alignSelf: "center", borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 6, marginBottom: 8,
  },
  statusText: { fontFamily: "Montserrat-Bold", fontSize: 11, letterSpacing: 1.5 },
  refText: { fontFamily: "Montserrat-Regular", fontSize: 12, color: DS.textMuted, textAlign: "center", marginBottom: 24 },

  grid: { flexDirection: "row", gap: 10, marginBottom: 0 },
  infoCard: {
    backgroundColor: DS.card, borderRadius: 12, borderWidth: 1, borderColor: DS.border,
    padding: 14, marginBottom: 10, gap: 4,
  },
  infoLabel: { fontFamily: "Montserrat-SemiBold", fontSize: 10, color: DS.textMuted, letterSpacing: 1.5 },
  infoValue: { fontFamily: "Montserrat-Bold", fontSize: 15, color: DS.textPrimary },
  infoValueSm: { fontFamily: "Montserrat-Bold", fontSize: 13, color: DS.textPrimary },

  artistRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  artistAvatar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: DS.surface,
    justifyContent: "center", alignItems: "center",
  },

  clauseCard: {
    flexDirection: "row", gap: 12, alignItems: "flex-start",
    backgroundColor: DS.danger + "11", borderRadius: 12, borderWidth: 1, borderColor: DS.danger + "33",
    padding: 14, marginTop: 8, marginBottom: 24,
  },
  clauseTitle: { fontFamily: "Montserrat-Bold", fontSize: 11, color: DS.danger, letterSpacing: 1.5, marginBottom: 4 },
  clauseText: { fontFamily: "Montserrat-Regular", fontSize: 12, color: DS.textSecondary, lineHeight: 18 },

  btnRate: {
    backgroundColor: DS.accent, borderRadius: 12, paddingVertical: 16,
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 12,
  },
  btnRateText: { fontFamily: "Montserrat-Bold", fontSize: 13, color: "#fff", letterSpacing: 0.5 },

  btnComplete: {
    backgroundColor: DS.success, borderRadius: 12, paddingVertical: 16,
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 12,
  },
  btnCompleteText: { fontFamily: "Montserrat-Bold", fontSize: 13, color: "#fff", letterSpacing: 0.5 },

  btnCancel: {
    borderWidth: 1.5, borderColor: DS.danger, borderRadius: 12, paddingVertical: 14,
    alignItems: "center", marginBottom: 12,
  },
  btnCancelText: { fontFamily: "Montserrat-Bold", fontSize: 13, color: DS.danger },

  disabled: { opacity: 0.5 },
});
