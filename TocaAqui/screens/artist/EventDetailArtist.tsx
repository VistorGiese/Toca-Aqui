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
import { FontAwesome5, FontAwesome } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { bookingService, Booking } from "@/http/bookingService";
import { avaliacaoService, Avaliacao } from "@/http/avaliacaoService";
import { ArtistStackParamList } from "@/navigation/ArtistNavigator";
import api from "@/http/api";

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
  gold: "#F6C90E",
  bgSurface: "#1A1040",
};

type NavProp = NativeStackNavigationProp<ArtistStackParamList>;
type RouteType = RouteProp<ArtistStackParamList, "EventDetailArtist">;

export default function EventDetailArtist() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { eventId } = route.params;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [estabelecimento, setEstabelecimento] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchBooking = useCallback(async () => {
    try {
      const [data, reviewsData] = await Promise.all([
        bookingService.getBookingById(eventId),
        avaliacaoService.getAvaliacoesByShow(eventId).catch(() => ({ avaliacoes: [] })),
      ]);
      setBooking(data);
      setAvaliacoes(reviewsData.avaliacoes);
      if (data.perfil_estabelecimento_id) {
        api.get(`/estabelecimentos/${data.perfil_estabelecimento_id}`)
          .then(r => setEstabelecimento(r.data.estabelecimento || r.data))
          .catch(() => {});
      }
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os detalhes da vaga.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [eventId, navigation]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const handleCandidatar = () => {
    if (!booking) return;

    const formattedDate = booking.data_show
      ? new Date(booking.data_show).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "Data não informada";

    const timeStr = `${booking.horario_inicio || ""} — ${booking.horario_fim || ""}`;

    navigation.navigate("ApplyConfirmation", {
      eventId: booking.id,
      eventName: booking.titulo_evento || `Vaga #${booking.id}`,
      date: formattedDate,
      time: timeStr,
      cache: booking.preco_ingresso_inteira
        ? `R$ ${Number(booking.preco_ingresso_inteira).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
        : "A combinar",
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DS.accent} />
      </View>
    );
  }

  if (!booking) return null;

  const formattedDate = booking.data_show
    ? new Date(booking.data_show).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      })
    : "Data não informada";

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <FontAwesome5 name="arrow-left" size={14} color={DS.white} />
            <Text style={styles.backText}>Gigs & Beats</Text>
          </TouchableOpacity>
          <View style={styles.headerIcons}>
            <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <FontAwesome5 name="share-alt" size={16} color={DS.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginLeft: 16 }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <FontAwesome5 name="ellipsis-v" size={16} color={DS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Image */}
        <View style={styles.heroImage}>
          <FontAwesome5 name="music" size={40} color={DS.textDis} />
          <View style={styles.heroBadgeRow}>
            <View style={styles.genreBadge}>
              <Text style={styles.genreBadgeText}>JAZZ & BLUES</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>LIVE NOW</Text>
            </View>
          </View>
        </View>

        <View style={styles.contentPad}>
          {/* Nome e Localização */}
          <Text style={styles.eventTitle}>{booking.titulo_evento || `Vaga #${booking.id}`}</Text>
          <View style={styles.locationRow}>
            <FontAwesome5 name="map-marker-alt" size={13} color={DS.textSec} />
            <Text style={styles.locationText}>
              {estabelecimento?.nome_estabelecimento
                ? `${estabelecimento.nome_estabelecimento}${estabelecimento.cidade ? ` · ${estabelecimento.cidade}` : ""}`
                : booking.estabelecimento_id
                  ? `Estabelecimento #${booking.estabelecimento_id}`
                  : "Local não informado"}
            </Text>
          </View>

          {/* Cachê Card */}
          <View style={styles.cacheCard}>
            <View>
              <Text style={styles.cacheLabel}>CACHÊ OFERECIDO</Text>
              <Text style={styles.cacheValue}>
                {booking.preco_ingresso_inteira
                  ? `R$ ${Number(booking.preco_ingresso_inteira).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                  : "A combinar"}
              </Text>
            </View>
            <FontAwesome5 name="dollar-sign" size={22} color={DS.success} />
          </View>

          {/* Data e Horário Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoGridCard}>
              <FontAwesome5 name="calendar-alt" size={16} color={DS.accent} />
              <Text style={styles.infoGridLabel}>DATA</Text>
              <Text style={styles.infoGridValue}>{formattedDate}</Text>
            </View>
            <View style={styles.infoGridCard}>
              <FontAwesome5 name="clock" size={16} color={DS.accent} />
              <Text style={styles.infoGridLabel}>HORÁRIO</Text>
              <Text style={styles.infoGridValue}>
                {booking.horario_inicio} — {booking.horario_fim}
              </Text>
            </View>
          </View>

          {/* Detalhes da vaga */}
          <Text style={styles.sectionTitle}>Detalhes da vaga</Text>

          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Som Próprio</Text>
              <View style={styles.toggleVisual}>
                <View style={styles.toggleThumb} />
              </View>
            </View>
            <View style={styles.separator} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Gêneros Aceitos</Text>
            </View>
            <View style={styles.genrePillsRow}>
              {["JAZZ", "BLUES", "MPB"].map((g) => (
                <View key={g} style={styles.genrePill}>
                  <Text style={styles.genrePillText}>{g}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Descrição */}
          {booking.descricao_evento ? (
            <>
              <Text style={styles.sectionTitle}>Descrição</Text>
              <Text style={styles.descriptionText}>{booking.descricao_evento}</Text>
            </>
          ) : null}

          {/* Sobre o local */}
          <Text style={styles.sectionTitle}>Sobre o local</Text>
          <View style={styles.localCard}>
            <Text style={styles.localText}>
              {estabelecimento?.descricao || estabelecimento?.nome_estabelecimento
                ? `${estabelecimento.nome_estabelecimento}${estabelecimento.descricao ? ` — ${estabelecimento.descricao}` : ""}`
                : "Local do evento."}
            </Text>
            <View style={styles.localImagePlaceholder}>
              <FontAwesome5 name="building" size={28} color={DS.textDis} />
            </View>
          </View>

          {/* Reviews */}
          {avaliacoes.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>REVIEWS DE ARTISTAS</Text>
              {avaliacoes.map((r) => (
                <View key={r.id} style={styles.reviewCard}>
                  <View style={styles.reviewAvatar}>
                    <FontAwesome5 name="user" size={14} color={DS.accent} />
                  </View>
                  <View style={styles.reviewContent}>
                    <Text style={styles.reviewName}>{r.Usuario?.nome_completo || "Artista"}</Text>
                    <View style={styles.starsRow}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FontAwesome
                          key={i}
                          name={i < r.nota_local ? "star" : "star-o"}
                          size={12}
                          color={i < r.nota_local ? DS.gold : DS.textDis}
                        />
                      ))}
                    </View>
                    {r.comentario ? (
                      <Text style={styles.reviewText}>{r.comentario}</Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* Botão fixo */}
      <View style={styles.fixedBottom}>
        <TouchableOpacity style={styles.btnCandidatar} onPress={handleCandidatar} activeOpacity={0.85}>
          <Text style={styles.btnCandidatarText}>CANDIDATAR-SE PARA A VAGA</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 12,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 14,
    color: DS.white,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroImage: {
    height: 220,
    backgroundColor: DS.bgSurface,
    justifyContent: "center",
    alignItems: "center",
  },
  heroBadgeRow: {
    position: "absolute",
    bottom: 12,
    left: 16,
    flexDirection: "row",
    gap: 8,
  },
  genreBadge: {
    backgroundColor: DS.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  genreBadgeText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 10,
    color: DS.white,
    letterSpacing: 1,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS.danger + "CC",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DS.white,
  },
  liveBadgeText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 10,
    color: DS.white,
    letterSpacing: 1,
  },
  contentPad: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  eventTitle: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 20,
    color: DS.white,
    marginBottom: 8,
    lineHeight: 28,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  locationText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: DS.textSec,
  },
  cacheCard: {
    backgroundColor: DS.bgCard,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: DS.success + "44",
  },
  cacheLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: DS.textSec,
    letterSpacing: 2,
    marginBottom: 4,
  },
  cacheValue: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 18,
    color: DS.success,
  },
  infoGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  infoGridCard: {
    flex: 1,
    backgroundColor: DS.bgCard,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  infoGridLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 10,
    color: DS.textSec,
    letterSpacing: 2,
  },
  infoGridValue: {
    fontFamily: "Montserrat-Bold",
    fontSize: 12,
    color: DS.white,
    textAlign: "center",
    lineHeight: 18,
  },
  sectionTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 15,
    color: DS.white,
    marginBottom: 12,
    marginTop: 8,
  },
  detailCard: {
    backgroundColor: DS.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  detailLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 14,
    color: DS.white,
  },
  toggleVisual: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: DS.accent,
    justifyContent: "center",
    paddingHorizontal: 3,
    alignItems: "flex-end",
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: DS.white,
  },
  separator: {
    height: 1,
    backgroundColor: DS.bgSurface,
    marginVertical: 4,
  },
  genrePillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  genrePill: {
    backgroundColor: DS.bgSurface,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  genrePillText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 11,
    color: DS.textSec,
    letterSpacing: 1,
  },
  descriptionText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: DS.textSec,
    lineHeight: 22,
    marginBottom: 20,
  },
  localCard: {
    backgroundColor: DS.bgCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 12,
  },
  localText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: DS.textSec,
    lineHeight: 20,
  },
  localImagePlaceholder: {
    height: 100,
    backgroundColor: DS.bgSurface,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  reviewCard: {
    flexDirection: "row",
    backgroundColor: DS.bgCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  reviewAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: DS.bgSurface,
    justifyContent: "center",
    alignItems: "center",
  },
  reviewContent: {
    flex: 1,
    gap: 4,
  },
  reviewName: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: DS.white,
  },
  starsRow: {
    flexDirection: "row",
    gap: 3,
  },
  reviewText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: DS.textSec,
    lineHeight: 18,
  },
  fixedBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: DS.bg,
    padding: 20,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: DS.bgSurface,
  },
  btnCandidatar: {
    backgroundColor: DS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  btnCandidatarText: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 12,
    color: DS.white,
    letterSpacing: 1.5,
  },
});
