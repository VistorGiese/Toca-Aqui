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
import { showService, Show, ShowsParams } from "@/http/showService";

type NavProp = NativeStackNavigationProp<UserStackParamList>;

const FILTERS = ["Esta semana", "Fim de semana", "Hoje", "Gratuitos"];

const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function formatShowDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = MONTH_NAMES[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${day} de ${month}, ${year}`;
}

function getShowTitle(show: Show): string {
  return show.titulo_evento;
}

function getShowVenue(show: Show): string {
  return show.EstablishmentProfile?.nome_estabelecimento || "";
}

function getShowPrice(show: Show): number {
  return show.preco_ingresso_inteira ?? 0;
}

function getShowColor(show: Show): string {
  if (show.genero_musical) {
    return getGenreColor(show.genero_musical) + "55";
  }
  return "#2D1B4E";
}

export default function UserFeed() {
  const navigation = useNavigation<NavProp>();
  const [activeFilter, setActiveFilter] = useState("Esta semana");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [featuredShows, setFeaturedShows] = useState<Show[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingShows, setLoadingShows] = useState(true);

  const loadFeatured = useCallback(async () => {
    setLoadingFeatured(true);
    try {
      const data = await showService.getShowsDestaque();
      setFeaturedShows(data);
    } catch {
      setFeaturedShows([]);
    } finally {
      setLoadingFeatured(false);
    }
  }, []);

  const loadShows = useCallback(async (filter: string) => {
    setLoadingShows(true);
    try {
      const params: ShowsParams = {};
      if (filter === "Esta semana") {
        params.esta_semana = true;
      } else if (filter === "Fim de semana") {
        params.fim_de_semana = true;
      } else if (filter === "Hoje") {
        params.esta_hoje = true;
      }
      const response = await showService.getPublicShows(params);
      let result = response.shows;
      if (filter === "Gratuitos") {
        result = result.filter((s) => (s.preco_ingresso_inteira ?? 0) === 0);
      }
      setShows(result);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os shows.");
      setShows([]);
    } finally {
      setLoadingShows(false);
    }
  }, []);

  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

  useEffect(() => {
    loadShows(activeFilter);
  }, [activeFilter, loadShows]);

  const featured = featuredShows[0] || shows[0] || null;
  const listShows = shows.filter((s) => s.id !== featured?.id);

  function toggleFavorite(id: number) {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function goToDetail(showId: number) {
    navigation.navigate("UserShowDetail", { showId });
  }

  function goToSearch() {
    navigation.navigate("UserSearch");
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090F" />

      <View style={styles.header}>
        <View style={styles.avatarSmall}>
          <FontAwesome5 name="user" size={14} color="#A78BFA" />
        </View>
        <Text style={styles.headerBrand}>TOCA AQUI</Text>
        <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate("UserNotifications")}>
          <FontAwesome5 name="bell" size={18} color="#A0A0B8" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.searchBar} onPress={goToSearch} activeOpacity={0.8}>
          <FontAwesome5 name="search" size={14} color="#555577" style={{ marginRight: 10 }} />
          <Text style={styles.searchPlaceholder}>
            Buscar artistas, locais ou vibes...
          </Text>
          <FontAwesome5 name="sliders-h" size={14} color="#A78BFA" />
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === f && styles.filterChipTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Em Destaque</Text>
        </View>

        {loadingFeatured ? (
          <View style={styles.featuredPlaceholder}>
            <ActivityIndicator size="large" color="#A78BFA" />
          </View>
        ) : featured ? (
          <TouchableOpacity
            style={[styles.featuredCard, { backgroundColor: getShowColor(featured) }]}
            onPress={() => goToDetail(featured.id)}
            activeOpacity={0.9}
          >
            <View style={styles.featuredOverlay}>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>AO VIVO</Text>
              </View>
              <View style={styles.featuredInfo}>
                <View
                  style={[
                    styles.genreBadge,
                    { backgroundColor: getGenreColor(featured.genero_musical ?? "") + "33" },
                  ]}
                >
                  <Text
                    style={[
                      styles.genreBadgeText,
                      { color: getGenreColor(featured.genero_musical ?? "") },
                    ]}
                  >
                    {(featured.genero_musical ?? "").toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.featuredTitle}>{getShowTitle(featured)}</Text>
                <View style={styles.featuredMeta}>
                  <FontAwesome5 name="map-marker-alt" size={12} color="#A0A0B8" />
                  <Text style={styles.featuredVenue}>{getShowVenue(featured)}</Text>
                  <Text style={styles.featuredPrice}>
                    {getShowPrice(featured) === 0
                      ? "Free Entry"
                      : `R$ ${getShowPrice(featured)}`}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.featuredPlaceholder}>
            <Text style={styles.emptyText}>Nenhum destaque disponível</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>{activeFilter}</Text>
            <Text style={styles.sectionSubtitle}>Eventos acontecendo perto de você</Text>
          </View>
        </View>

        {loadingShows ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="large" color="#A78BFA" />
          </View>
        ) : listShows.length === 0 ? (
          <View style={styles.loadingRow}>
            <Text style={styles.emptyText}>Nenhum show encontrado</Text>
          </View>
        ) : (
          listShows.map((show) => {
            const price = getShowPrice(show);
            const genreColor = getGenreColor(show.genero_musical ?? "");
            return (
              <TouchableOpacity
                key={show.id}
                style={styles.showCard}
                onPress={() => goToDetail(show.id)}
                activeOpacity={0.85}
              >
                <View style={[styles.showCardImage, { backgroundColor: getShowColor(show) }]}>
                  <FontAwesome5 name="music" size={22} color="rgba(255,255,255,0.3)" />
                  <TouchableOpacity
                    style={styles.heartBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleFavorite(show.id);
                    }}
                  >
                    <FontAwesome5
                      name="heart"
                      size={16}
                      color={favorites.includes(show.id) ? "#A78BFA" : "#888"}
                      solid={favorites.includes(show.id)}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.showCardBody}>
                  <View style={styles.showCardTop}>
                    <View
                      style={[
                        styles.genreBadge,
                        { backgroundColor: genreColor + "22" },
                      ]}
                    >
                      <Text style={[styles.genreBadgeText, { color: genreColor }]}>
                        {(show.genero_musical ?? "").toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.showTitle}>{getShowTitle(show)}</Text>

                  <View style={styles.showMeta}>
                    <FontAwesome5 name="map-marker-alt" size={11} color="#555577" />
                    <Text style={styles.showMetaText}>{getShowVenue(show)}</Text>
                  </View>
                  <View style={styles.showMeta}>
                    <FontAwesome5 name="calendar-alt" size={11} color="#555577" />
                    <Text style={styles.showMetaText}>{formatShowDate(show.data_show)}</Text>
                  </View>

                  <View style={styles.showCardFooter}>
                    <Text style={styles.showPrice}>
                      {price === 0 ? "Free Entry" : `R$ ${price}`}
                    </Text>
                    <TouchableOpacity
                      style={price === 0 ? styles.confirmBtn : styles.buyBtn}
                      onPress={() => goToDetail(show.id)}
                    >
                      <Text style={price === 0 ? styles.confirmBtnText : styles.buyBtnText}>
                        {price === 0 ? "CONFIRMAR PRESENÇA" : "GARANTIR INGRESSO"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090F" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  avatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(167,139,250,0.15)",
    borderWidth: 1,
    borderColor: "#A78BFA",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBrand: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#A78BFA",
    letterSpacing: 2,
  },
  bellBtn: { padding: 4 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 16,
  },
  searchPlaceholder: {
    flex: 1,
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: "#555577",
  },
  filterRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 4 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  filterChipActive: {
    backgroundColor: "rgba(108,92,231,0.3)",
    borderColor: "#A78BFA",
  },
  filterChipText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: "#888",
  },
  filterChipTextActive: { color: "#A78BFA" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 17,
    color: "#FFFFFF",
  },
  sectionSubtitle: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  seeAll: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: "#A78BFA",
    letterSpacing: 1,
    marginTop: 2,
  },
  featuredCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    height: 220,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  featuredPlaceholder: {
    marginHorizontal: 20,
    borderRadius: 16,
    height: 220,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    padding: 16,
    justifyContent: "space-between",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,107,107,0.9)",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  liveBadgeText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 10,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  featuredInfo: {},
  genreBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  genreBadgeText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 10,
    letterSpacing: 1,
  },
  featuredTitle: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 22,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  featuredMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  featuredVenue: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: "#A0A0B8",
    flex: 1,
  },
  featuredPrice: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#00C896",
  },
  loadingRow: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: "#555577",
  },
  showCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  showCardImage: {
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  heartBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  showCardBody: { padding: 14 },
  showCardTop: { marginBottom: 6 },
  showTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  showMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  showMetaText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: "#A0A0B8",
  },
  showCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  showPrice: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: "#00C896",
  },
  buyBtn: {
    backgroundColor: "#6C5CE7",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  buyBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 11,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  confirmBtn: {
    borderWidth: 1,
    borderColor: "#A78BFA",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  confirmBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 11,
    color: "#A78BFA",
    letterSpacing: 0.5,
  },
});
