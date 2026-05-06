import React, { useEffect, useState, useCallback } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "@/contexts/AuthContext";
import { contractService, Contract } from "@/http/contractService";
import { RootStackParamList } from "@/navigation/Navigate";

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
  gold: "#F6C90E",
  success: "#10B981",
  amber: "#F59E0B",
  bgSurface: "#1A1040",
};


type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function ArtistHome() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContracts = useCallback(async () => {
    try {
      const data = await contractService.getMyContracts();
      setContracts(Array.isArray(data) ? data : []);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar seus dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const confirmedCount = contracts.filter((c) => c.status === "aceito").length;
  const pendingCount = contracts.filter((c) => c.status === "aguardando_aceite").length;
  const recentContracts = contracts.slice(0, 3);

  const getFirstName = () => {
    if (!user?.nome_completo) return "Artista";
    return user.nome_completo.split(" ")[0];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DS.accent} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarSmall}>
            <FontAwesome5 name="user" size={16} color={DS.accent} />
          </View>
          <Text style={styles.brandName}>TOCA AQUI</Text>
          <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} onPress={() => (navigation as any).navigate("UserNotifications")}>
            <FontAwesome5 name="bell" size={18} color={DS.white} />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greetingBlock}>
          <Text style={styles.greetingText}>Bem-vindo de volta,</Text>
          <Text style={styles.greetingName}>{getFirstName()}</Text>
          <Text style={styles.greetingSub}>Sua jornada musical está crescendo...</Text>
        </View>

        {/* Metric Cards */}
        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, { borderLeftColor: DS.cyan }]}>
            <FontAwesome5 name="calendar-check" size={20} color={DS.cyan} />
            <Text style={styles.metricValue}>{confirmedCount}</Text>
            <Text style={styles.metricLabel}>SHOWS{"\n"}CONFIRMADOS</Text>
          </View>
          <View style={[styles.metricCard, { borderLeftColor: DS.danger }]}>
            <FontAwesome5 name="clock" size={20} color={DS.danger} />
            <Text style={styles.metricValue}>{pendingCount}</Text>
            <Text style={styles.metricLabel}>PROPOSTAS{"\n"}PENDENTES</Text>
          </View>
        </View>

        {/* Resumo */}
        <View style={styles.analyticsSmallRow}>
          <View style={[styles.analyticsSmallCard, { flex: 1 }]}>
            <Text style={styles.analyticsSmallTitle}>CONTRATOS{"\n"}CONFIRMADOS</Text>
            <Text style={styles.analyticsSmallValue}>
              {String(confirmedCount).padStart(2, "0")}
            </Text>
            <Text style={styles.analyticsSmallSub}>Neste ciclo</Text>
          </View>
          <View style={[styles.analyticsSmallCard, { flex: 1 }]}>
            <Text style={styles.analyticsSmallTitle}>TOTAL DE{"\n"}CONTRATOS</Text>
            <Text style={styles.analyticsSmallValue}>
              {String(contracts.length).padStart(2, "0")}
            </Text>
            <Text style={styles.analyticsSmallSub}>Todos os status</Text>
          </View>
        </View>

        {/* Últimas Candidaturas */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimas Candidaturas</Text>
          <Text style={styles.sectionSub}>ÚLTIMAS 3</Text>
        </View>

        {recentContracts.length === 0 ? (
          <View style={styles.emptyCard}>
            <FontAwesome5 name="guitar" size={28} color={DS.textDis} />
            <Text style={styles.emptyText}>Nenhuma candidatura ainda</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => (navigation as any).navigate("BrowseEvents")}
            >
              <Text style={styles.emptyBtnText}>Explorar vagas</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recentContracts.map((c) => (
            <GigCard
              key={c.id}
              contract={c}
              onPress={() =>
                (navigation as any).navigate("ContractDetail", { contractId: c.id })
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function GigCard({ contract, onPress }: { contract: Contract; onPress: () => void }) {
  const isConfirmed = contract.status === "aceito";
  const isNegotiating = contract.status === "aguardando_aceite";

  return (
    <View style={gigStyles.card}>
      <View style={gigStyles.imagePlaceholder}>
        <FontAwesome5 name="music" size={24} color={DS.textDis} />
      </View>
      <View style={gigStyles.info}>
        <View style={gigStyles.badgeRow}>
          <View
            style={[
              gigStyles.badge,
              {
                backgroundColor: isConfirmed
                  ? DS.success + "33"
                  : isNegotiating
                  ? DS.amber + "33"
                  : DS.accent + "33",
              },
            ]}
          >
            <Text
              style={[
                gigStyles.badgeText,
                {
                  color: isConfirmed
                    ? DS.success
                    : isNegotiating
                    ? DS.amber
                    : DS.accent,
                },
              ]}
            >
              {isConfirmed ? "CONFIRMADO" : isNegotiating ? "NEGOCIANDO" : "ENVIADO"}
            </Text>
          </View>
        </View>
        <Text style={gigStyles.eventName} numberOfLines={1}>
          {contract.nome_evento || `Contrato #${contract.id}`}
        </Text>
        {contract.cidade ? (
          <View style={gigStyles.locationRow}>
            <FontAwesome5 name="map-marker-alt" size={10} color={DS.textDis} />
            <Text style={gigStyles.locationText}>{contract.cidade}</Text>
          </View>
        ) : null}
        {contract.data_show ? (
          <Text style={gigStyles.dateText}>
            {new Date(contract.data_show).toLocaleDateString("pt-BR")}
          </Text>
        ) : null}
        {contract.cache_acordado > 0 ? (
          <Text style={gigStyles.cacheText}>
            R${" "}
            {Number(contract.cache_acordado).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </Text>
        ) : null}
      </View>
      <TouchableOpacity style={gigStyles.fab} onPress={onPress}>
        <FontAwesome5 name="chevron-right" size={12} color={DS.white} />
      </TouchableOpacity>
    </View>
  );
}

const gigStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: DS.bgCard,
    borderRadius: 14,
    marginBottom: 12,
    overflow: "hidden",
  },
  imagePlaceholder: {
    width: 80,
    backgroundColor: DS.bgSurface,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    padding: 12,
  },
  badgeRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 9,
    letterSpacing: 1,
  },
  eventName: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 14,
    color: DS.white,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 3,
  },
  locationText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: DS.textDis,
  },
  dateText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: DS.textSec,
    marginBottom: 3,
  },
  cacheText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: DS.success,
  },
  fab: {
    width: 36,
    alignSelf: "stretch",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: DS.accent,
    margin: 12,
    borderRadius: 8,
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS.bg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: DS.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  avatarSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: DS.bgCard,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: DS.accent,
  },
  brandName: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 14,
    color: DS.accent,
    letterSpacing: 2,
  },
  greetingBlock: {
    marginBottom: 24,
  },
  greetingText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 15,
    color: DS.textSec,
  },
  greetingName: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 22,
    color: DS.accent,
    marginTop: 2,
  },
  greetingSub: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: DS.textDis,
    marginTop: 4,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: DS.bgCard,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    gap: 6,
  },
  metricValue: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 26,
    color: DS.white,
    marginTop: 8,
  },
  metricLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 10,
    color: DS.textSec,
    letterSpacing: 1,
    lineHeight: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: DS.white,
  },
  sectionLink: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: DS.accentLight,
  },
  sectionSub: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: DS.textDis,
  },
  analyticsCard: {
    backgroundColor: DS.bgCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  analyticsCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  analyticsCardTitle: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: DS.textSec,
    letterSpacing: 2,
  },
  badgeMonthly: {
    backgroundColor: DS.bgSurface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeMonthlyText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 9,
    color: DS.textSec,
    letterSpacing: 1,
  },
  analyticsValue: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 28,
    color: DS.white,
    marginBottom: 4,
  },
  analyticsGrowth: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: DS.success,
    marginBottom: 12,
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 50,
    gap: 3,
  },
  bar: {
    flex: 1,
    borderRadius: 3,
    minHeight: 4,
  },
  analyticsSmallRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  analyticsSmallCard: {
    backgroundColor: DS.bgCard,
    borderRadius: 14,
    padding: 14,
  },
  analyticsSmallTitle: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 10,
    color: DS.textSec,
    letterSpacing: 1.5,
    lineHeight: 15,
    marginBottom: 8,
  },
  analyticsSmallValue: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 22,
    color: DS.white,
    marginBottom: 4,
  },
  analyticsSmallSub: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: DS.textDis,
  },
  emptyCard: {
    backgroundColor: DS.bgCard,
    borderRadius: 14,
    padding: 28,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: DS.textSec,
  },
  emptyBtn: {
    backgroundColor: DS.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyBtnText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: DS.white,
  },
});
