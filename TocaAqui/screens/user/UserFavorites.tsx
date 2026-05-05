import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import { UserStackParamList } from "@/navigation/UserNavigator";
import api from "@/http/api";

type NavProp = NativeStackNavigationProp<UserStackParamList>;

interface FavoritoItem {
  id: number;
  tipo: string;
  data_criacao: string;
  item: any;
}

const favoritoService = {
  async listar(): Promise<{ favoritos: FavoritoItem[] }> {
    const r = await api.get("/favoritos");
    return r.data;
  },
  async remover(tipo: string, itemId: number) {
    await api.delete(`/favoritos/${tipo}/${itemId}`);
  },
};

const TABS = ["SHOWS", "ARTISTAS", "LOCAIS"];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function calcDaysLeft(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export default function UserFavorites() {
  const navigation = useNavigation<NavProp>();
  const [activeTab, setActiveTab] = useState("SHOWS");
  const [favoritos, setFavoritos] = useState<FavoritoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavoritos = useCallback(async () => {
    try {
      const data = await favoritoService.listar();
      setFavoritos(data.favoritos);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar seus favoritos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFavoritos();
  }, [loadFavoritos]);

  function onRefresh() {
    setRefreshing(true);
    loadFavoritos();
  }

  async function handleRemover(tipo: string, itemId: number) {
    try {
      await favoritoService.remover(tipo, itemId);
      setFavoritos((prev) => prev.filter((f) => !(f.tipo === tipo && f.item?.id === itemId)));
    } catch {
      Alert.alert("Erro", "Não foi possível remover o favorito");
    }
  }

  function goToSettings() {
    navigation.navigate("UserSettings");
  }

  function goToShowDetail(id: number) {
    navigation.navigate("UserShowDetail", { showId: id });
  }

  function goToArtist(id: number) {
    navigation.navigate("UserArtistProfile", { artistId: id });
  }

  const favShows = favoritos.filter((f) => f.tipo === "agendamento");
  const favArtistas = favoritos.filter((f) => f.tipo === "perfil_artista");
  const favLocais = favoritos.filter((f) => f.tipo === "perfil_estabelecimento");

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090F" />

      <View style={styles.header}>
        <TouchableOpacity>
          <FontAwesome5 name="ellipsis-v" size={18} color="#A0A0B8" />
        </TouchableOpacity>
        <Text style={styles.headerBrand}>TOCA AQUI</Text>
        <TouchableOpacity onPress={goToSettings}>
          <FontAwesome5 name="cog" size={18} color="#A0A0B8" />
        </TouchableOpacity>
      </View>

      <View style={styles.pageTitleArea}>
        <Text style={styles.pageTitle}>Meus favoritos</Text>
        <Text style={styles.pageSubtitle}>Sua curadoria pessoal do universo sonoro.</Text>
      </View>

      <View style={styles.tabsRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color="#A78BFA" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#A78BFA"
              colors={["#A78BFA"]}
            />
          }
        >
          {activeTab === "SHOWS" && (
            <>
              {favShows.length === 0 && (
                <Text style={styles.emptyText}>Nenhum show favoritado ainda.</Text>
              )}
              {favShows.map((f) => {
                const show = f.item;
                const genre = show?.genero_musical || "";
                const daysLeft = show?.data_show ? calcDaysLeft(show.data_show) : 0;
                const dateLabel = show?.data_show ? formatDate(show.data_show) : "—";
                const venue = show?.EstablishmentProfile?.nome_estabelecimento || "—";
                const price = show?.preco_ingresso_inteira ?? 0;
                return (
                  <TouchableOpacity
                    key={f.id}
                    style={styles.showCard}
                    onPress={() => goToShowDetail(show?.id)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.showImage, { backgroundColor: "#2D1B4E" }]}>
                      <FontAwesome5 name="music" size={22} color="rgba(255,255,255,0.2)" />
                      <View style={styles.daysBadge}>
                        <Text style={styles.daysBadgeText}>EM {daysLeft} DIAS</Text>
                      </View>
                    </View>
                    <View style={styles.showBody}>
                      <View style={styles.showBodyTop}>
                        <Text style={styles.showDate}>{dateLabel}</Text>
                        <TouchableOpacity onPress={() => handleRemover(f.tipo, show?.id)}>
                          <FontAwesome5 name="heart" size={16} color="#A78BFA" solid />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.showTitle}>{show?.titulo_evento || "Show"}</Text>
                      <Text style={styles.showVenue}>{venue}</Text>
                      <View style={styles.showFooter}>
                        <Text style={styles.showPrice}>R$ {price}</Text>
                        <TouchableOpacity
                          style={styles.detailBtn}
                          onPress={() => goToShowDetail(show?.id)}
                        >
                          <Text style={styles.detailBtnText}>DETALHES</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          {activeTab === "ARTISTAS" && (
            <View style={styles.artistGrid}>
              {favArtistas.length === 0 && (
                <Text style={styles.emptyText}>Nenhum artista favoritado ainda.</Text>
              )}
              {favArtistas.map((f) => {
                const artista = f.item;
                const genre = artista?.generos_musicais?.[0] || artista?.generos?.[0] || "—";
                return (
                  <TouchableOpacity
                    key={f.id}
                    style={styles.artistCard}
                    onPress={() => goToArtist(artista?.id)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.artistAvatar, { backgroundColor: "#1A0A3E" }]}>
                      <FontAwesome5 name="microphone" size={22} color="rgba(255,255,255,0.4)" />
                      <TouchableOpacity
                        style={styles.artistHeartOverlay}
                        onPress={() => handleRemover(f.tipo, artista?.id)}
                      >
                        <FontAwesome5 name="heart" size={10} color="#A78BFA" solid />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.artistName} numberOfLines={1}>
                      {artista?.nome_artistico || "Artista"}
                    </Text>
                    <Text style={styles.artistGenre}>{genre}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {activeTab === "LOCAIS" && (
            <>
              {favLocais.length === 0 && (
                <Text style={styles.emptyText}>Nenhum local favoritado ainda.</Text>
              )}
              {favLocais.map((f) => {
                const local = f.item;
                const city =
                  local?.cidade ||
                  local?.Address?.cidade ||
                  "—";
                return (
                  <View key={f.id} style={styles.venueCard}>
                    <View style={[styles.venueImage, { backgroundColor: "#0A1E3E" }]}>
                      <FontAwesome5 name="building" size={20} color="rgba(255,255,255,0.4)" />
                    </View>
                    <View style={styles.venueInfo}>
                      <Text style={styles.venueName}>
                        {local?.nome_estabelecimento || "Local"}
                      </Text>
                      <View style={styles.venueCityRow}>
                        <FontAwesome5 name="map-marker-alt" size={10} color="#555577" />
                        <Text style={styles.venueCity}>{city}</Text>
                      </View>
                      <View style={styles.venueNextShow}>
                        <Text style={styles.venueNextLabel}>PRÓXIMO SHOW:</Text>
                        <Text style={styles.venueNextName}>— • —</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.venueHeartBtn}
                      onPress={() => handleRemover(f.tipo, local?.id)}
                    >
                      <FontAwesome5 name="heart" size={14} color="#A78BFA" solid />
                    </TouchableOpacity>
                  </View>
                );
              })}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerBrand: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#A78BFA",
    letterSpacing: 2,
  },
  pageTitleArea: { paddingHorizontal: 20, marginBottom: 16 },
  pageTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 22,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  pageSubtitle: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: "#A0A0B8",
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
    fontSize: 12,
    color: "#555577",
    letterSpacing: 1,
  },
  tabTextActive: { color: "#A78BFA" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  emptyText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: "#555577",
    textAlign: "center",
    marginTop: 40,
  },
  showCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    marginBottom: 16,
  },
  showImage: {
    height: 130,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  daysBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(167,139,250,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  daysBadgeText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 9,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  showBody: { padding: 14 },
  showBodyTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  showDate: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: "#A78BFA",
  },
  showTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  showVenue: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: "#A0A0B8",
    marginBottom: 12,
  },
  showFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  showPrice: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: "#00C896",
  },
  detailBtn: {
    backgroundColor: "#6C5CE7",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  detailBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 11,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  artistGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  artistCard: {
    width: "47%",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 14,
  },
  artistAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    position: "relative",
  },
  artistHeartOverlay: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "rgba(167,139,250,0.2)",
    borderRadius: 10,
    padding: 4,
  },
  artistName: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 3,
  },
  artistGenre: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: "#A0A0B8",
    textAlign: "center",
  },
  venueCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 12,
    marginBottom: 10,
  },
  venueImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  venueInfo: { flex: 1 },
  venueName: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 2,
  },
  venueCityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  venueCity: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: "#A0A0B8",
  },
  venueNextShow: {},
  venueNextLabel: {
    fontFamily: "Montserrat-Bold",
    fontSize: 9,
    color: "#555577",
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  venueNextName: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: "#A78BFA",
  },
  venueHeartBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(167,139,250,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
});
