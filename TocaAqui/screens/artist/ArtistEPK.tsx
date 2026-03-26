import React, { useState, useEffect, useCallback } from "react";
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
import { avaliacaoService, Avaliacao } from "@/http/avaliacaoService";
import { artistaPublicoService } from "@/http/artistaPublicoService";
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
  bgSurface: "#1A1040",
};

const GENRE_COLORS = ["#A67C7C", "#27AE60", "#A29BFE", "#F59E0B", "#4ECDC4", "#E53E3E"];

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function ArtistEPK() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [generos, setGeneros] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Avaliacao[]>([]);
  const [mediaArtista, setMediaArtista] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [contractsData] = await Promise.all([
        contractService.getMyContracts(),
      ]);
      setContracts(contractsData);

      // Buscar gêneros do perfil público
      if (user?.perfilArtistaId) {
        artistaPublicoService.getPerfilPublico(user.perfilArtistaId)
          .then((perfil) => setGeneros(perfil.generos || []))
          .catch(() => {});
      }

      // Buscar avaliações dos shows concluídos (máx 3)
      const concluidos = contractsData
        .filter((c) => c.status === "concluido")
        .slice(0, 3);

      if (concluidos.length > 0) {
        const reviewResults = await Promise.allSettled(
          concluidos.map((c) => avaliacaoService.getAvaliacoesByShow(c.evento_id))
        );
        const allReviews: Avaliacao[] = [];
        let totalNota = 0;
        let totalCount = 0;
        for (const result of reviewResults) {
          if (result.status === "fulfilled") {
            allReviews.push(...result.value.avaliacoes);
            totalNota += result.value.media_artista * result.value.total;
            totalCount += result.value.total;
          }
        }
        setReviews(allReviews.slice(0, 5));
        if (totalCount > 0) setMediaArtista(parseFloat((totalNota / totalCount).toFixed(1)));
      }
    } catch {
      Alert.alert("Erro", "Não foi possível carregar o perfil.");
    } finally {
      setLoading(false);
    }
  }, [user?.perfilArtistaId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const completedShows = contracts.filter((c) => c.status === "concluido").length;
  const acceptedShows = contracts.filter((c) => c.status === "aceito").length;
  const totalShows = completedShows + acceptedShows;

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
          <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <FontAwesome5 name="bars" size={18} color={DS.white} />
          </TouchableOpacity>
          <Text style={styles.brandName}>TOCA AQUI</Text>
          <View style={styles.avatarSmall}>
            <FontAwesome5 name="user" size={14} color={DS.accent} />
          </View>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
          <FontAwesome5 name="edit" size={12} color={DS.accentLight} />
          <Text style={styles.editBtnText}>EDIT PROFILE</Text>
        </TouchableOpacity>

        {/* Cover + Avatar */}
        <View style={styles.coverArea}>
          <View style={styles.coverGradient} />
          <FontAwesome5 name="music" size={40} color={DS.textDis} />
        </View>

        <View style={styles.avatarContainer}>
          <View style={styles.avatarLarge}>
            <FontAwesome5 name="user" size={36} color={DS.accent} />
          </View>
        </View>

        <Text style={styles.artistName}>{user?.nome_completo || "Artista"}</Text>
        <View style={styles.locationRow}>
          <FontAwesome5 name="map-marker-alt" size={12} color={DS.textDis} />
          <Text style={styles.locationText}>Brasil</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalShows}</Text>
            <Text style={styles.statLabel}>SHOWS{"\n"}PERFORMED</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{mediaArtista > 0 ? mediaArtista : "—"}</Text>
            <Text style={styles.statLabel}>AVERAGE{"\n"}RATING</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{acceptedShows}</Text>
            <Text style={styles.statLabel}>APP{"\n"}BOOKINGS</Text>
          </View>
        </View>

        {/* Genre Styles */}
        {generos.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>GENRE STYLES</Text>
            <View style={styles.genreRow}>
              {generos.map((g, i) => {
                const color = GENRE_COLORS[i % GENRE_COLORS.length];
                return (
                  <View key={g} style={[styles.genrePill, { borderColor: color }]}>
                    <Text style={[styles.genrePillText, { color }]}>{g.toUpperCase()}</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Performance Range */}
        <Text style={styles.sectionTitle}>PERFORMANCE RANGE • CACHÊ</Text>
        <View style={styles.rangeRow}>
          <View style={styles.rangeCard}>
            <Text style={styles.rangeLabel}>MÍNIMO</Text>
            <Text style={styles.rangeValue}>A combinar</Text>
          </View>
          <FontAwesome5 name="long-arrow-alt-right" size={16} color={DS.textDis} />
          <View style={styles.rangeCard}>
            <Text style={styles.rangeLabel}>MÁXIMO</Text>
            <Text style={styles.rangeValue}>A combinar</Text>
          </View>
        </View>

        {/* Bio */}
        <Text style={styles.sectionTitle}>THE TOCA AQUI JOURNEY</Text>
        <Text style={styles.bioText}>
          Artista independente apaixonado por música ao vivo. Cada show é uma experiência
          única, construída com dedicação e energia. Nossa missão é conectar pessoas
          através da arte e criar memórias inesquecíveis.
        </Text>

        {/* Visual Reel */}
        <Text style={styles.sectionTitle}>VISUAL REEL</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reelScroll}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={styles.reelCard}>
              <FontAwesome5 name="play-circle" size={28} color={DS.textDis} />
              <Text style={styles.reelLabel}>Vídeo {i + 1}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Venue Testimonials */}
        {reviews.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>AVALIAÇÕES</Text>
            {reviews.map((r) => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <FontAwesome5 name="user" size={14} color={DS.accent} />
                  </View>
                  <View style={styles.reviewMeta}>
                    <Text style={styles.reviewVenue}>{r.Usuario?.nome_completo || "Usuário"}</Text>
                    <Text style={styles.reviewDate}>
                      {new Date(r.createdAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                    </Text>
                  </View>
                  <View style={styles.starsRow}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FontAwesome5
                        key={i}
                        name="star"
                        size={11}
                        color={i < r.nota_artista ? DS.gold : DS.textDis}
                        solid={i < r.nota_artista}
                      />
                    ))}
                  </View>
                </View>
                {r.comentario ? <Text style={styles.reviewText}>{r.comentario}</Text> : null}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

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
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 12,
  },
  brandName: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 14,
    color: DS.accent,
    letterSpacing: 2,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DS.bgCard,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: DS.accent,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginRight: 20,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DS.accentLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
    marginBottom: 12,
  },
  editBtnText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: DS.accentLight,
    letterSpacing: 1.5,
  },
  coverArea: {
    height: 160,
    backgroundColor: DS.bgSurface,
    justifyContent: "center",
    alignItems: "center",
  },
  coverGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "rgba(9,9,15,0.7)",
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: -40,
    marginBottom: 12,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: DS.bgCard,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: DS.accent,
  },
  artistName: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 20,
    color: DS.white,
    textAlign: "center",
    marginBottom: 6,
    paddingHorizontal: 20,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginBottom: 20,
  },
  locationText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: DS.textDis,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: DS.bgCard,
    borderRadius: 14,
    marginHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 20,
    color: DS.white,
  },
  statLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 9,
    color: DS.textSec,
    letterSpacing: 1.5,
    textAlign: "center",
    lineHeight: 14,
  },
  statDivider: {
    width: 1,
    backgroundColor: DS.bgSurface,
    marginVertical: 4,
  },
  sectionTitle: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 10,
    color: DS.white,
    letterSpacing: 2,
    marginBottom: 12,
    marginTop: 8,
    paddingHorizontal: 20,
  },
  genreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  genrePill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  genrePillText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 11,
    letterSpacing: 1,
  },
  rangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  rangeCard: {
    flex: 1,
    backgroundColor: DS.bgCard,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  rangeLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 9,
    color: DS.textDis,
    letterSpacing: 2,
    marginBottom: 4,
  },
  rangeValue: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: DS.white,
  },
  bioText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: DS.textSec,
    lineHeight: 23,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  reelScroll: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  reelCard: {
    width: 130,
    height: 90,
    backgroundColor: DS.bgCard,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    gap: 6,
  },
  reelLabel: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: DS.textDis,
  },
  reviewCard: {
    backgroundColor: DS.bgCard,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    gap: 10,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reviewAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: DS.bgSurface,
    justifyContent: "center",
    alignItems: "center",
  },
  reviewMeta: {
    flex: 1,
  },
  reviewVenue: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: DS.white,
  },
  reviewDate: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: DS.textDis,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
  },
  reviewText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: DS.textSec,
    lineHeight: 19,
  },
});
