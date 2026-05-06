import React, { useState, useEffect, useCallback } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import { UserStackParamList } from "@/navigation/UserNavigator";
import { getGenreColor } from "@/utils/colors";
import { ingressoService, Ingresso } from "@/http/ingressoService";

type NavProp = NativeStackNavigationProp<UserStackParamList>;

function formatDate(dataShow: string, horarioInicio: string): string {
  const date = new Date(dataShow);
  const months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
  const day = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  return `${day} ${month} • ${horarioInicio.slice(0, 5)}`;
}

function calcDaysLeft(dataShow: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const show = new Date(dataShow);
  show.setHours(0, 0, 0, 0);
  return Math.round((show.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function calcProgress(daysLeft: number): number {
  if (daysLeft <= 0) return 1.0;
  if (daysLeft >= 30) return 0.1;
  return (30 - daysLeft) / 30;
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

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

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
        <TouchableOpacity style={styles.menuBtn}>
          <FontAwesome5 name="bars" size={18} color="#A0A0B8" />
        </TouchableOpacity>
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
          {activeTab === "upcoming" ? (
            <>
              {tickets.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum ingresso encontrado</Text>
              ) : (
                tickets.map((ingresso) => {
                  const genre = ingresso.Show?.genero_musical ?? "";
                  const genreColor = getGenreColor(genre);
                  const imageColor = genreColor ? genreColor + "33" : "#2D1B4E";
                  const daysLeft = ingresso.Show?.data_show
                    ? calcDaysLeft(ingresso.Show.data_show)
                    : 0;
                  const progress = calcProgress(daysLeft);
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

                  return (
                    <View key={ingresso.id} style={styles.ticketCard}>
                      <View style={[styles.ticketImage, { backgroundColor: imageColor }]}>
                        <FontAwesome5 name="music" size={24} color="rgba(255,255,255,0.25)" />
                        {genre ? (
                          <View
                            style={[
                              styles.genreBadge,
                              { backgroundColor: genreColor + "33" },
                            ]}
                          >
                            <Text style={[styles.genreBadgeText, { color: genreColor }]}>
                              {genre.toUpperCase()}
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <View style={styles.ticketBody}>
                        <Text style={styles.ticketTitle}>
                          {ingresso.Show?.titulo_evento ?? "Show"}
                        </Text>
                        {venue ? (
                          <View style={styles.ticketMeta}>
                            <FontAwesome5 name="map-marker-alt" size={11} color="#555577" />
                            <Text style={styles.ticketMetaText}>{venue}</Text>
                          </View>
                        ) : null}
                        {dateStr ? (
                          <View style={styles.ticketMeta}>
                            <FontAwesome5 name="clock" size={11} color="#555577" />
                            <Text style={styles.ticketMetaText}>{dateStr}</Text>
                          </View>
                        ) : null}

                        <View style={styles.daysRow}>
                          <View style={styles.daysBadge}>
                            <FontAwesome5 name="fire" size={10} color="#FF6B6B" />
                            <Text style={styles.daysBadgeText}>
                              FALTAM {daysLeft > 0 ? daysLeft : 0} DIAS
                            </Text>
                          </View>
                        </View>

                        <View style={styles.progressTrack}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${progress * 100}%` },
                            ]}
                          />
                        </View>

                        <TouchableOpacity
                          style={styles.viewBtn}
                          onPress={() => goToDetail(ingresso.id)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.viewBtnText}>VER INGRESSO</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}

              <View style={styles.exploreCard}>
                <FontAwesome5
                  name="compass"
                  size={24}
                  color="#A78BFA"
                  style={{ marginBottom: 12 }}
                />
                <Text style={styles.exploreTitle}>Procurando por mais eventos?</Text>
                <Text style={styles.exploreSubtitle}>
                  Descubra shows incríveis que estão acontecendo perto de você.
                </Text>
                <TouchableOpacity
                  style={styles.exploreBtn}
                  onPress={goToFeed}
                  activeOpacity={0.85}
                >
                  <Text style={styles.exploreBtnText}>EXPLORAR EVENTOS</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.historyTitle}>Histórico Recente</Text>
              {tickets.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum ingresso encontrado</Text>
              ) : (
                tickets.map((ingresso) => {
                  const genre = ingresso.Show?.genero_musical ?? "";
                  const genreColor = getGenreColor(genre);
                  const imageColor = genreColor ? genreColor + "22" : "#2D1B4E";
                  const venue = ingresso.Show?.EstablishmentProfile?.nome_estabelecimento ?? "";
                  const dateStr =
                    ingresso.Show?.data_show && ingresso.Show?.horario_inicio
                      ? formatDate(ingresso.Show.data_show, ingresso.Show.horario_inicio)
                      : "";

                  return (
                    <View key={ingresso.id} style={styles.pastCard}>
                      <View
                        style={[
                          styles.pastCardImage,
                          { backgroundColor: imageColor },
                        ]}
                      >
                        <FontAwesome5
                          name="music"
                          size={16}
                          color="rgba(255,255,255,0.3)"
                        />
                      </View>
                      <View style={styles.pastCardInfo}>
                        {genre ? (
                          <View
                            style={[
                              styles.genreBadge,
                              { backgroundColor: genreColor + "22" },
                            ]}
                          >
                            <Text
                              style={[styles.genreBadgeText, { color: genreColor }]}
                            >
                              {genre.toUpperCase()}
                            </Text>
                          </View>
                        ) : null}
                        <Text style={styles.pastCardTitle}>
                          {ingresso.Show?.titulo_evento ?? "Show"}
                        </Text>
                        {venue ? (
                          <Text style={styles.pastCardVenue}>{venue}</Text>
                        ) : null}
                        {dateStr ? (
                          <Text style={styles.pastCardDate}>{dateStr}</Text>
                        ) : null}
                      </View>
                      <TouchableOpacity
                        style={styles.rateBtn}
                        onPress={() => goToRateShow(ingresso)}
                      >
                        <FontAwesome5 name="star" size={14} color="#A78BFA" />
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </>
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
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  menuBtn: { marginTop: 2 },
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
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  emptyText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: "#555577",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 24,
  },
  ticketCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    marginBottom: 16,
  },
  ticketImage: {
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  genreBadge: {
    position: "absolute",
    bottom: 10,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  genreBadgeText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 9,
    letterSpacing: 1,
  },
  ticketBody: { padding: 14 },
  ticketTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 6,
  },
  ticketMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  ticketMetaText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: "#A0A0B8",
  },
  daysRow: { flexDirection: "row", marginTop: 8, marginBottom: 8 },
  daysBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,107,107,0.12)",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  daysBadgeText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 10,
    color: "#FF6B6B",
    letterSpacing: 0.5,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 2,
    marginBottom: 14,
  },
  progressFill: {
    height: 4,
    backgroundColor: "#A78BFA",
    borderRadius: 2,
  },
  viewBtn: {
    backgroundColor: "#6C5CE7",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  viewBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  exploreCard: {
    backgroundColor: "rgba(167,139,250,0.08)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.2)",
    padding: 20,
    alignItems: "center",
    marginBottom: 8,
  },
  exploreTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 15,
    color: "#FFFFFF",
    marginBottom: 6,
    textAlign: "center",
  },
  exploreSubtitle: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: "#A0A0B8",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  exploreBtn: {
    backgroundColor: "#6C5CE7",
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  exploreBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  historyTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 15,
    color: "#FFFFFF",
    marginBottom: 12,
  },
  pastCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 12,
    marginBottom: 10,
  },
  pastCardImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pastCardInfo: { flex: 1 },
  pastCardTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: "#FFFFFF",
    marginBottom: 2,
  },
  pastCardVenue: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: "#A0A0B8",
  },
  pastCardDate: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: "#555577",
  },
  rateBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(167,139,250,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
});
