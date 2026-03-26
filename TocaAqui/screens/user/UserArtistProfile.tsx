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
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import { UserStackParamList } from "@/navigation/UserNavigator";
import { getGenreColor } from "@/utils/colors";
import { artistaPublicoService, ArtistaPublico } from "@/http/artistaPublicoService";

type Props = NativeStackScreenProps<UserStackParamList, "UserArtistProfile">;

function formatShowDate(dataShow: string): string {
  try {
    const date = new Date(dataShow);
    const months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    const day = date.getUTCDate();
    const month = months[date.getUTCMonth()];
    return `${day} ${month}`;
  } catch {
    return dataShow;
  }
}

function formatFollowers(total: number): string {
  if (total >= 1000) {
    return `${Math.floor(total / 1000)}k`;
  }
  return String(total);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <FontAwesome5
          key={i}
          name="star"
          size={12}
          color={i <= Math.round(rating) ? "#FFD700" : "#333355"}
          solid={i <= Math.round(rating)}
        />
      ))}
    </View>
  );
}

export default function UserArtistProfile({ route, navigation }: Props) {
  const { artistId } = route.params;
  const [artista, setArtista] = useState<ArtistaPublico | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [totalSeguidores, setTotalSeguidores] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  const loadArtista = useCallback(async () => {
    setLoading(true);
    try {
      const data = await artistaPublicoService.getPerfilPublico(artistId);
      setArtista(data);
      setFollowing(data.seguindo);
      setTotalSeguidores(data.total_seguidores);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar o perfil do artista.");
    } finally {
      setLoading(false);
    }
  }, [artistId]);

  useEffect(() => {
    loadArtista();
  }, [loadArtista]);

  async function handleFollowToggle() {
    if (!artista || followLoading) return;
    setFollowLoading(true);
    try {
      const result = await artistaPublicoService.seguirOuDesseguir(artistId);
      setFollowing(result.seguindo);
      setTotalSeguidores(result.total_seguidores);
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar o seguimento.");
    } finally {
      setFollowLoading(false);
    }
  }

  function goToCheckout(show: NonNullable<ArtistaPublico["ProximosShows"]>[0]) {
    navigation.navigate("UserCheckout", {
      showId: show.id,
      showTitle: show.titulo_evento,
      showDate: formatShowDate(show.data_show),
      venue: show.EstablishmentProfile?.nome_estabelecimento ?? "Local não informado",
    });
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#09090F" />
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  }

  if (!artista) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#09090F" />
        <Text style={styles.errorText}>Artista não encontrado.</Text>
        <TouchableOpacity style={styles.errorBackBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.errorBackBtnText}>VOLTAR</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const primeiroGenero = artista.generos?.[0] ?? "";
  const genreLabel = primeiroGenero.toUpperCase();
  const genreColor = getGenreColor(genreLabel || "OUTROS");
  const headerColor = genreColor + "88";
  const avatarColor = genreColor + "66";
  const rating = artista.media_nota ?? 0;
  const shows = artista.ProximosShows ?? [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={[styles.headerImage, { backgroundColor: headerColor }]}>
        <View style={styles.headerOverlay} />
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="arrow-left" size={16} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <FontAwesome5 name="microphone" size={28} color="rgba(255,255,255,0.6)" />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.artistHeader}>
          <View>
            <View style={[styles.genreBadge, { backgroundColor: genreColor + "22" }]}>
              <Text style={[styles.genreBadgeText, { color: genreColor }]}>
                {genreLabel || "ARTISTA"}
              </Text>
            </View>
            {rating > 0 && (
              <View style={styles.ratingRow}>
                <StarRating rating={rating} />
                <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.artistName}>{artista.nome_artistico}</Text>
        <View style={styles.locationRow}>
          <FontAwesome5 name="map-marker-alt" size={12} color="#555577" />
          <Text style={styles.locationText}>Cidade não informada</Text>
        </View>

        {artista.biografia ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre</Text>
            <Text style={styles.bioText}>{artista.biografia}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Vídeos</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>VER TODOS</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.videosRow}
          >
            {[0, 1, 2].map((i) => (
              <TouchableOpacity key={i} style={styles.videoThumb} activeOpacity={0.8}>
                <View style={styles.videoInner}>
                  <View style={styles.playBtn}>
                    <FontAwesome5 name="play" size={14} color="#FFFFFF" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avaliações do público</Text>
          <Text style={styles.emptySection}>Sem avaliações ainda</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximos shows</Text>
          {shows.length === 0 ? (
            <Text style={styles.emptySection}>Nenhum show programado</Text>
          ) : (
            shows.map((show) => (
              <View key={show.id} style={styles.showRow}>
                <View style={styles.showDateBlock}>
                  <Text style={styles.showDate}>{formatShowDate(show.data_show)}</Text>
                </View>
                <View style={styles.showInfo}>
                  <Text style={styles.showTitle}>{show.titulo_evento}</Text>
                  <Text style={styles.showVenue}>
                    {show.EstablishmentProfile?.nome_estabelecimento ?? "Local não informado"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.buyTicketBtn}
                  onPress={() => goToCheckout(show)}
                >
                  <Text style={styles.buyTicketText}>COMPRAR</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatFollowers(totalSeguidores)}</Text>
            <Text style={styles.statLabel}>SEGUIDORES</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>OUVINTES/MÊS</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.stickyBottom}>
        <TouchableOpacity
          style={[styles.followBtn, following && styles.followBtnActive]}
          onPress={handleFollowToggle}
          activeOpacity={0.85}
          disabled={followLoading}
        >
          {followLoading ? (
            <ActivityIndicator size="small" color={following ? "#A78BFA" : "#FFFFFF"} style={{ marginRight: 8 }} />
          ) : (
            <FontAwesome5
              name={following ? "user-check" : "user-plus"}
              size={14}
              color={following ? "#A78BFA" : "#FFFFFF"}
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={[styles.followBtnText, following && styles.followBtnTextActive]}>
            {following ? "SEGUINDO" : "SEGUIR ARTISTA"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090F" },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#09090F",
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#09090F",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 16,
    color: "#A0A0B8",
    marginBottom: 20,
    textAlign: "center",
  },
  errorBackBtn: {
    backgroundColor: "#6C5CE7",
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  errorBackBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  headerImage: {
    height: 200,
    position: "relative",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  backBtn: {
    position: "absolute",
    top: 52,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarContainer: {
    position: "absolute",
    bottom: -44,
    alignSelf: "center",
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#09090F",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 56, paddingHorizontal: 20 },
  artistHeader: { alignItems: "flex-start", marginBottom: 4 },
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
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingValue: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: "#FFD700",
  },
  artistName: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 22,
    color: "#FFFFFF",
    marginBottom: 6,
    lineHeight: 30,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  locationText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: "#A0A0B8",
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seeAll: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: "#A78BFA",
    letterSpacing: 1,
  },
  emptySection: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: "#555577",
  },
  bioText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: "#A0A0B8",
    lineHeight: 22,
  },
  videosRow: { gap: 10 },
  videoThumb: {
    width: 140,
    height: 90,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#1A1040",
  },
  videoInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(167,139,250,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  showRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  showDateBlock: {
    width: 44,
    alignItems: "center",
  },
  showDate: {
    fontFamily: "Montserrat-Bold",
    fontSize: 12,
    color: "#A78BFA",
    textAlign: "center",
  },
  showInfo: { flex: 1 },
  showTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: "#FFFFFF",
    marginBottom: 2,
  },
  showVenue: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: "#A0A0B8",
  },
  buyTicketBtn: {
    backgroundColor: "#6C5CE7",
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  buyTicketText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 10,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingVertical: 16,
    marginBottom: 8,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 20,
    color: "#A78BFA",
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: "Montserrat-Bold",
    fontSize: 9,
    color: "#555577",
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: 4,
  },
  stickyBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0D0D14",
    borderTopWidth: 1,
    borderTopColor: "#1A1040",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
  },
  followBtn: {
    backgroundColor: "#6C5CE7",
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  followBtnActive: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#A78BFA",
  },
  followBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  followBtnTextActive: { color: "#A78BFA" },
});
