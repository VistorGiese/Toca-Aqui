import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { bandApplicationService, BandApplication } from "@/http/bandApplicationService";
import { ArtistStackParamList } from "@/navigation/ArtistNavigator";

const DS = {
  bg: "#09090F",
  bgCard: "#16163A",
  bgInput: "#1E1250",
  accent: "#6C5CE7",
  accentLight: "#8B7CF8",
  cyan: "#4ECDC4",
  white: "#FFFFFF",
  textSec: "#A0A0B8",
  textDis: "#555577",
  danger: "#E53E3E",
  success: "#10B981",
  amber: "#F59E0B",
  bgSurface: "#1A1040",
};

const TABS = ["Em análise", "Aceitas", "Recusadas"] as const;
type Tab = typeof TABS[number];

type NavProp = NativeStackNavigationProp<ArtistStackParamList>;

export default function MyApplications() {
  const navigation = useNavigation<NavProp>();
  const [applications, setApplications] = useState<BandApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("Em análise");

  const fetchApplications = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await bandApplicationService.getMyApplications();
      setApplications(data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar as candidaturas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchApplications();
    }, [fetchApplications])
  );

  const getFiltered = (): BandApplication[] => {
    switch (activeTab) {
      case "Em análise":
        return applications.filter((a) => a.status === "pendente");
      case "Aceitas":
        return applications.filter((a) => a.status === "aceito");
      case "Recusadas":
        return applications.filter((a) => a.status === "recusado");
      default:
        return [];
    }
  };

  const filtered = getFiltered();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <FontAwesome5 name="arrow-left" size={16} color={DS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas candidaturas</Text>
        <View>
          <FontAwesome5 name="ellipsis-v" size={16} color={DS.white} />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const active = activeTab === tab;
          const tabColor =
            tab === "Em análise" ? DS.accent : tab === "Aceitas" ? DS.success : DS.danger;
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                active && { borderColor: tabColor, backgroundColor: tabColor + "22" },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, active && { color: tabColor }]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ApplicationCard
            application={item}
            onViewContract={(contractId) => navigation.navigate("ContractDetail", { contractId })}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchApplications(true)}
            tintColor={DS.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="file-alt" size={36} color={DS.textDis} />
            <Text style={styles.emptyText}>
              {activeTab === "Em análise"
                ? "Nenhuma candidatura em análise"
                : activeTab === "Aceitas"
                ? "Nenhum contrato aceito ainda"
                : "Nenhuma candidatura recusada"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

function ApplicationCard({ application, onViewContract }: { application: BandApplication; onViewContract?: (contractId: number) => void }) {
  const isPending = application.status === "pendente";
  const isAccepted = application.status === "aceito";

  const statusIcon = isPending
    ? { name: "clock", color: DS.accent }
    : isAccepted
    ? { name: "check-circle", color: DS.success }
    : { name: "times-circle", color: DS.danger };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Data não informada";
    try {
      return new Date(dateStr).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.thumbnail}>
        <FontAwesome5 name="music" size={20} color={DS.textDis} />
      </View>

      <View style={cardStyles.info}>
        <View style={cardStyles.nameRow}>
          <Text style={cardStyles.eventName} numberOfLines={1}>
            {application.nome_evento || `Vaga #${application.evento_id}`}
          </Text>
          <FontAwesome5 name={statusIcon.name as any} size={16} color={statusIcon.color} solid />
        </View>

        {application.nome_estabelecimento ? (
          <Text style={cardStyles.venueText}>{application.nome_estabelecimento}</Text>
        ) : null}

        <Text style={cardStyles.dateText}>{formatDate(application.data_show)}</Text>

        {application.horario_inicio ? (
          <Text style={cardStyles.timeText}>
            {application.horario_inicio} — {application.horario_fim}
          </Text>
        ) : null}

        {application.valor_proposto != null && (
          <Text style={{ color: DS.textSec, fontSize: 13, marginTop: 2 }}>
            Valor proposto: R$ {Number(application.valor_proposto).toFixed(2).replace('.', ',')}
          </Text>
        )}

        {isPending ? (
          <View style={cardStyles.statusBadgePending}>
            <Text style={cardStyles.statusBadgePendingText}>Candidatura em análise...</Text>
          </View>
        ) : isAccepted ? (
          <>
            <View style={cardStyles.statusBadgeAccepted}>
              <Text style={cardStyles.statusBadgeAcceptedText}>ACEITA</Text>
            </View>
            {application.contrato_id != null && onViewContract && (
              <TouchableOpacity
                style={{
                  marginTop: 8,
                  backgroundColor: DS.accent,
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: "center",
                }}
                onPress={() => onViewContract(application.contrato_id!)}
                activeOpacity={0.85}
              >
                <Text style={{ fontFamily: "Montserrat-Bold", fontSize: 12, color: DS.white, letterSpacing: 1 }}>
                  VER CONTRATO
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={cardStyles.statusBadgeRejected}>
            <Text style={cardStyles.statusBadgeRejectedText}>RECUSADA</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: DS.bgCard,
    borderRadius: 14,
    marginBottom: 12,
    overflow: "hidden",
  },
  thumbnail: {
    width: 72,
    backgroundColor: DS.bgSurface,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  eventName: {
    flex: 1,
    fontFamily: "Montserrat-SemiBold",
    fontSize: 14,
    color: DS.white,
    marginRight: 8,
  },
  venueText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: DS.accentLight,
    marginBottom: 2,
  },
  dateText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: DS.textSec,
  },
  timeText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: DS.textDis,
  },
  cacheRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  cacheLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 9,
    color: DS.textDis,
    letterSpacing: 1,
  },
  cacheValue: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: DS.success,
  },
  contractBtn: {
    backgroundColor: DS.cyan + "22",
    borderWidth: 1,
    borderColor: DS.cyan,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  contractBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 10,
    color: DS.cyan,
    letterSpacing: 1,
  },
  statusBadgePending: {
    marginTop: 6,
  },
  statusBadgePendingText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: DS.textSec,
    fontStyle: "italic",
  },
  statusBadgeAccepted: {
    backgroundColor: DS.success + "22",
    borderWidth: 1,
    borderColor: DS.success,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  statusBadgeAcceptedText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 10,
    color: DS.success,
    letterSpacing: 1,
  },
  statusBadgeRejected: {
    backgroundColor: DS.danger + "22",
    borderWidth: 1,
    borderColor: DS.danger,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  statusBadgeRejectedText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 10,
    color: DS.danger,
    letterSpacing: 1,
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS.bg,
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: DS.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 17,
    color: DS.white,
  },
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: DS.textDis,
    alignItems: "center",
  },
  tabText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: DS.textDis,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    gap: 14,
  },
  emptyText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: DS.textSec,
    textAlign: "center",
  },
});
