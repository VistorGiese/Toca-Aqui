import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import { UserStackParamList } from "@/navigation/UserNavigator";
import { getGenreColor } from "@/utils/colors";
import { ingressoService, Ingresso } from "@/http/ingressoService";
import { formatBRL } from "@/utils/ticketPricing";

type NavProp = NativeStackNavigationProp<UserStackParamList>;

function formatDate(dataShow: string, horarioInicio: string): string {
  const date = new Date(dataShow);
  const months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
  const day = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  return `${day} ${month} • ${horarioInicio.slice(0, 5)}`;
}

function isShowPast(dataShow: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const show = new Date(dataShow);
  show.setHours(0, 0, 0, 0);
  return show.getTime() < today.getTime();
}

function calcDaysLeft(dataShow: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const show = new Date(dataShow);
  show.setHours(0, 0, 0, 0);
  return Math.round((show.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

type CompactTicketCardProps = {
  ingresso: Ingresso;
  variant: "upcoming" | "past";
  onPress: () => void;
  onRate?: () => void;
};

function CompactTicketCard({ ingresso, variant, onPress, onRate }: CompactTicketCardProps) {
  const genre = ingresso.Show?.genero_musical ?? "";
  const genreColor = getGenreColor(genre);
  const imageColor = genreColor ? `${genreColor}22` : "#2D1B4E";
  const venue = ingresso.Show
    ? [
        ingresso.Show.EstablishmentProfile?.nome_estabelecimento,
        ingresso.Show.EstablishmentProfile?.Address?.cidade,
      ]
        .filter(Boolean)
        .join(", ")
    : "";
  const dateStr =
    ingresso.Show?.data_show && ingresso.Show?.horario_inicio
      ? formatDate(ingresso.Show.data_show, ingresso.Show.horario_inicio)
      : "";
  const daysLeft =
    variant === "upcoming" && ingresso.Show?.data_show
      ? calcDaysLeft(ingresso.Show.data_show)
      : null;

  return (
    <TouchableOpacity
      style={styles.ticketCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.ticketThumb, { backgroundColor: imageColor }]}>
        <FontAwesome5 name="ticket-alt" size={14} color="rgba(255,255,255,0.45)" />
      </View>

      <View style={styles.ticketInfo}>
        {genre ? (
          <Text style={[styles.genreText, { color: genreColor }]} numberOfLines={1}>
            {genre.toUpperCase()}
          </Text>
        ) : null}
        <Text style={styles.ticketTitle} numberOfLines={1}>
          {ingresso.Show?.titulo_evento ?? "Show"}
        </Text>
        {venue ? (
          <Text style={styles.ticketMeta} numberOfLines={1}>{venue}</Text>
        ) : null}
        {dateStr ? (
          <Text style={styles.ticketDate}>{dateStr}</Text>
        ) : null}
        <View style={styles.ticketFooter}>
          <Text style={styles.ticketPrice}>
            {Number(ingresso.preco) === 0 ? "Gratuito" : formatBRL(Number(ingresso.preco))}
          </Text>
          {daysLeft != null && daysLeft >= 0 ? (
            <Text style={styles.daysText}>
              {daysLeft === 0 ? "Hoje" : `Em ${daysLeft} dia${daysLeft !== 1 ? "s" : ""}`}
            </Text>
          ) : null}
        </View>
      </View>

      {variant === "past" && onRate ? (
        <TouchableOpacity
          style={styles.rateBtn}
          onPress={(e) => {
            e.stopPropagation();
            onRate();
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <FontAwesome5 name="star" size={13} color="#A78BFA" />
        </TouchableOpacity>
      ) : (
        <FontAwesome5 name="chevron-right" size={11} color="#555577" />
      )}
    </TouchableOpacity>
  );
}

export default function UserTickets() {
  const navigation = useNavigation<NavProp>();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [tickets, setTickets] = useState<Ingresso[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const tipo = activeTab === "upcoming" ? "proximos" : "passados";
      const data = await ingressoService.getMeusIngressos(tipo);
      setTickets(data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os ingressos");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [fetchTickets])
  );

  function goToDetail(ticketId: number) {
    navigation.navigate("UserTicketDetail", { ticketId });
  }

  function goToFeed() {
    navigation.navigate("UserFeed");
  }

  function goToRateShow(ingresso: Ingresso) {
    if (!ingresso.Show) return;
    navigation.navigate("UserRateShow", {
      showId: ingresso.Show.id,
      showTitle: ingresso.Show.titulo_evento,
      venueName: ingresso.Show.EstablishmentProfile?.nome_estabelecimento ?? "",
    });
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090F" />

      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Meus ingressos</Text>
          <Text style={styles.headerSubtitle}>
            Gerencie suas experiências e prepare-se para o show.
          </Text>
        </View>
      </View>

      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "upcoming" && styles.tabActive]}
          onPress={() => setActiveTab("upcoming")}
        >
          <Text style={[styles.tabText, activeTab === "upcoming" && styles.tabTextActive]}>
            Próximos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "past" && styles.tabActive]}
          onPress={() => setActiveTab("past")}
        >
          <Text style={[styles.tabText, activeTab === "past" && styles.tabTextActive]}>
            Passados
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A78BFA" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {tickets.length === 0 ? (
            <Text style={styles.emptyText}>
              {activeTab === "upcoming"
                ? "Nenhum ingresso próximo"
                : "Nenhum ingresso passado"}
            </Text>
          ) : (
            tickets.map((ingresso) => (
              <CompactTicketCard
                key={ingresso.id}
                ingresso={ingresso}
                variant={activeTab}
                onPress={() => goToDetail(ingresso.id)}
                onRate={
                  activeTab === "past" && ingresso.Show?.data_show && isShowPast(ingresso.Show.data_show)
                    ? () => goToRateShow(ingresso)
                    : undefined
                }
              />
            ))
          )}

          {activeTab === "upcoming" && (
            <View style={styles.exploreCard}>
              <FontAwesome5 name="compass" size={20} color="#A78BFA" style={{ marginBottom: 8 }} />
              <Text style={styles.exploreTitle}>Procurando por mais eventos?</Text>
              <Text style={styles.exploreSubtitle}>
                Descubra shows incríveis perto de você.
              </Text>
              <TouchableOpacity style={styles.exploreBtn} onPress={goToFeed} activeOpacity={0.85}>
                <Text style={styles.exploreBtnText}>EXPLORAR EVENTOS</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090F" },
  header: {
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerText: { flex: 1 },
  headerTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 20,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: "#A0A0B8",
    lineHeight: 19,
  },
  tabsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: "#A78BFA" },
  tabText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: "#555577",
    letterSpacing: 0.5,
  },
  tabTextActive: { color: "#A78BFA" },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20, gap: 8 },
  emptyText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: "#555577",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 24,
  },
  ticketCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 10,
  },
  ticketThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  ticketInfo: { flex: 1, minWidth: 0 },
  genreText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 8,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  ticketTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: "#FFFFFF",
    marginBottom: 2,
  },
  ticketMeta: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: "#A0A0B8",
  },
  ticketDate: {
    fontFamily: "Montserrat-Regular",
    fontSize: 10,
    color: "#555577",
    marginTop: 2,
  },
  ticketFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  ticketPrice: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: "#00C896",
  },
  daysText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 10,
    color: "#A78BFA",
  },
  rateBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(167,139,250,0.1)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  exploreCard: {
    backgroundColor: "rgba(167,139,250,0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.2)",
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  exploreTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 4,
    textAlign: "center",
  },
  exploreSubtitle: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: "#A0A0B8",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 12,
  },
  exploreBtn: {
    backgroundColor: "#6C5CE7",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  exploreBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});
