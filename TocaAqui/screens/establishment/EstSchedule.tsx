import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, StatusBar, RefreshControl,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { establishmentService } from "@/http/establishmentService";

const DS = {
  bg: "#09090F", card: "#13101F", surface: "#0F0B1E",
  border: "#1E1A30", accent: "#7B61FF", cyan: "#00CEC9",
  success: "#00C853", danger: "#EF4444", amber: "#F59E0B",
  textPrimary: "#FFFFFF", textSecondary: "#8888AA", textMuted: "#555577",
};

const STATUS_COLOR: Record<string, string> = {
  aceito: DS.success,
  concluido: DS.cyan,
  realizado: DS.cyan,
  cancelado: DS.danger,
  recusado: DS.danger,
  aguardando_aceite: DS.amber,
};

const STATUS_LABEL: Record<string, string> = {
  aceito: "Confirmado",
  concluido: "Realizado",
  realizado: "Realizado",
  cancelado: "Cancelado",
  recusado: "Recusado",
  aguardando_aceite: "Aguardando",
};

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

type NavProp = NativeStackNavigationProp<EstStackParamList>;
type TabType = "proximos" | "passados" | "todos";

function formatData(d: string) {
  try {
    const dt = new Date(d);
    return {
      dia: String(dt.getDate()).padStart(2, "0"),
      mes: MESES[dt.getMonth()],
      ano: dt.getFullYear(),
      diaSemana: dt.toLocaleDateString("pt-BR", { weekday: "short" }).toUpperCase().replace(".", ""),
    };
  } catch {
    return { dia: "--", mes: "---", ano: 0, diaSemana: "---" };
  }
}

export default function EstSchedule() {
  const navigation = useNavigation<NavProp>();
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<TabType>("proximos");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await establishmentService.getMyContracts();
      const raw = Array.isArray(data) ? data : [];
      const normalized = raw.map((c: any) => ({
        ...c,
        data_show: c.data_show ?? c.data_evento ?? c.Event?.data_show ?? null,
        nome_evento: c.nome_evento ?? c.Event?.titulo_evento ?? c.local_evento ?? `Show #${c.id}`,
        nome_artista: c.nome_artista ?? c.nome_contratado ?? c.ArtistProfile?.nome_artistico ?? c.Band?.nome_banda,
        horario_inicio: c.horario_inicio ?? c.Event?.horario_inicio,
        cache_acordado: c.cache_acordado ?? c.cache_total,
      }));
      setContracts(normalized);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar a agenda.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const now = new Date();

  const filtered = contracts.filter((c) => {
    const dt = c.data_show ? new Date(c.data_show) : null;
    if (tab === "proximos") {
      return (c.status === "aceito" || c.status === "aguardando_aceite") && (!dt || dt >= now);
    }
    if (tab === "passados") {
      return (c.status === "concluido" || c.status === "realizado") || (dt && dt < now && c.status !== "cancelado");
    }
    return true;
  });

  const confirmedCount = contracts.filter((c) => c.status === "aceito").length;
  const pendingCount = contracts.filter((c) => c.status === "aguardando_aceite").length;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Agenda</Text>
        <Text style={s.headerSub}>{confirmedCount} confirmado(s) · {pendingCount} aguardando</Text>
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {(["proximos", "passados", "todos"] as TabType[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.tabBtn, tab === t && s.tabBtnOn]}
            onPress={() => setTab(t)}
            activeOpacity={0.7}
          >
            <Text style={[s.tabText, tab === t && s.tabTextOn]}>
              {t === "proximos" ? "Próximos" : t === "passados" ? "Passados" : "Todos"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#A78BFA" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={DS.accent} />
          }
        >
          {filtered.length === 0 ? (
            <View style={s.emptyWrap}>
              <FontAwesome5 name="calendar-times" size={36} color={DS.textMuted} />
              <Text style={s.emptyText}>Nenhum show nesta aba.</Text>
            </View>
          ) : (
            filtered.map((c) => {
              const { dia, mes, diaSemana } = formatData(c.data_show ?? "");
              const statusColor = STATUS_COLOR[c.status] ?? DS.textMuted;
              const statusLabel = STATUS_LABEL[c.status] ?? c.status;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={s.card}
                  onPress={() => navigation.navigate("EstShowDetail", { contractId: c.id })}
                  activeOpacity={0.8}
                >
                  {/* Data badge */}
                  <View style={s.dateBadge}>
                    <Text style={s.dateDia}>{dia}</Text>
                    <Text style={s.dateMes}>{mes}</Text>
                    <Text style={s.dateDiaSem}>{diaSemana}</Text>
                  </View>

                  {/* Info */}
                  <View style={s.cardInfo}>
                    <Text style={s.cardTitle} numberOfLines={1}>
                      {c.nome_evento ?? `Show #${c.id}`}
                    </Text>
                    <Text style={s.cardSub} numberOfLines={1}>
                      {c.nome_artista ? `${c.nome_artista} · ` : ""}
                      {c.horario_inicio ? c.horario_inicio.substring(0, 5) : "--:--"}
                    </Text>
                    <View style={[s.statusBadge, { backgroundColor: statusColor + "22", borderColor: statusColor + "55" }]}>
                      <Text style={[s.statusText, { color: statusColor }]}>{statusLabel.toUpperCase()}</Text>
                    </View>
                  </View>

                  {/* Cachê */}
                  {c.cache_acordado ? (
                    <View style={s.cacheWrap}>
                      <Text style={s.cacheValue}>
                        R${Number(c.cache_acordado).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                      </Text>
                      <FontAwesome5 name="chevron-right" size={11} color={DS.textMuted} style={{ marginTop: 2 }} />
                    </View>
                  ) : (
                    <FontAwesome5 name="chevron-right" size={12} color={DS.textMuted} />
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.bg },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { fontFamily: "AkiraExpanded-Superbold", fontSize: 22, color: DS.textPrimary, marginBottom: 4 },
  headerSub: { fontFamily: "Montserrat-Regular", fontSize: 13, color: DS.textSecondary },

  tabs: { flexDirection: "row", paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  tabBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: DS.border,
  },
  tabBtnOn: { backgroundColor: DS.accent, borderColor: DS.accent },
  tabText: { fontFamily: "Montserrat-SemiBold", fontSize: 12, color: DS.textSecondary },
  tabTextOn: { color: DS.textPrimary },

  list: { paddingHorizontal: 20, paddingBottom: 40 },
  emptyWrap: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontFamily: "Montserrat-SemiBold", fontSize: 14, color: DS.textMuted },

  card: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: DS.card, borderRadius: 14, borderWidth: 1, borderColor: DS.border,
    padding: 14, marginBottom: 10,
  },
  dateBadge: {
    width: 52, backgroundColor: DS.surface, borderRadius: 10,
    alignItems: "center", paddingVertical: 8,
  },
  dateDia: { fontFamily: "Montserrat-Bold", fontSize: 20, color: DS.textPrimary, lineHeight: 22 },
  dateMes: { fontFamily: "Montserrat-SemiBold", fontSize: 11, color: DS.accent },
  dateDiaSem: { fontFamily: "Montserrat-Regular", fontSize: 9, color: DS.textMuted, marginTop: 2 },

  cardInfo: { flex: 1 },
  cardTitle: { fontFamily: "Montserrat-Bold", fontSize: 14, color: DS.textPrimary, marginBottom: 3 },
  cardSub: { fontFamily: "Montserrat-Regular", fontSize: 12, color: DS.textSecondary, marginBottom: 6 },
  statusBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  statusText: { fontFamily: "Montserrat-Bold", fontSize: 9, letterSpacing: 1 },

  cacheWrap: { alignItems: "flex-end", gap: 2 },
  cacheValue: { fontFamily: "Montserrat-Bold", fontSize: 13, color: DS.success },
});
