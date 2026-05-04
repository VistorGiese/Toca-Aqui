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
import { showService, Show } from "@/http/showService";
import { avaliacaoService, AvaliacoesResponse } from "@/http/avaliacaoService";

type Props = NativeStackScreenProps<UserStackParamList, "UserShowDetail">;

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatShowDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = MONTH_NAMES[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${day} de ${month}, ${year}`;
}

function formatTime(timeString: string): string {
  return timeString.substring(0, 5);
}

function buildAddress(show: Show): string {
  const addr = show.EstablishmentProfile?.Address;
  if (!addr) return "";
  const parts = [
    addr.rua,
    addr.numero,
    addr.bairro,
    addr.cidade,
    addr.estado,
  ].filter(Boolean);
  return parts.join(", ");
}

export default function UserShowDetail({ route, navigation }: Props) {
  const { showId } = route.params;
  const [show, setShow] = useState<Show | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacoesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadShow = useCallback(async () => {
    setLoading(true);
    try {
      const data = await showService.getShowById(showId);
      setShow(data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os detalhes do show.");
    } finally {
      setLoading(false);
    }
  }, [showId]);

  const loadAvaliacoes = useCallback(async () => {
    try {
      const data = await avaliacaoService.getAvaliacoesByShow(showId);
      setAvaliacoes(data);
    } catch {
      setAvaliacoes(null);
    }
  }, [showId]);

  useEffect(() => {
    loadShow();
    loadAvaliacoes();
  }, [loadShow, loadAvaliacoes]);

  if (loading || !show) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#09090F" />
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  }

  const price = show.preco_ingresso_inteira ?? 0;
  const isFree = price === 0;
  const genreColor = getGenreColor(show.genero_musical ?? "");
  const imageColor = show.genero_musical
    ? getGenreColor(show.genero_musical) + "55"
    : "#2D1B4E";
  const confirmedBand = show.Contract?.Band ?? null;
  const artistId = confirmedBand?.id ?? null; // null quando sem artista confirmado
  const venue = show.EstablishmentProfile?.nome_estabelecimento || "";
  const address = buildAddress(show);
  const attendees = show.ingressos_vendidos ?? 0;
  const rating =
    avaliacoes && avaliacoes.total > 0 ? avaliacoes.media_artista : null;

  function goToCheckout() {
    navigation.navigate("UserCheckout", {
      showId,
      showTitle: show!.titulo_evento,
      showDate: formatShowDate(show!.data_show),
      venue,
    });
  }

  function goToArtist() {
    if (!artistId) return; // guard: nunca navegar sem artista real
    navigation.navigate("UserArtistProfile", { artistId });
  }

  function goToComments() {
    navigation.navigate("UserComments", { showId, showTitle: show!.titulo_evento });
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={[styles.coverImage, { backgroundColor: imageColor }]}>
        <View style={styles.coverOverlay} />
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.goBack()}>
            <FontAwesome5 name="arrow-left" size={16} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.actionBtn}>
            <FontAwesome5 name="share-alt" size={16} color="#FFFFFF" />
          </View>
        </View>
        <View style={styles.coverInfo}>
          <View style={[styles.genreBadge, { backgroundColor: genreColor + "33" }]}>
            <Text style={[styles.genreBadgeText, { color: genreColor }]}>
              {(show.genero_musical ?? "").toUpperCase()}
            </Text>
          </View>
          <Text style={styles.coverTitle}>{show.titulo_evento}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <FontAwesome5 name="calendar-alt" size={14} color="#A78BFA" />
            <View>
              <Text style={styles.infoLabel}>Data</Text>
              <Text style={styles.infoValue}>{formatShowDate(show.data_show)}</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <FontAwesome5 name="clock" size={14} color="#A78BFA" />
            <View>
              <Text style={styles.infoLabel}>Horário</Text>
              <Text style={styles.infoValue}>{formatTime(show.horario_inicio)}</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <FontAwesome5 name="users" size={14} color="#A78BFA" />
            <View>
              <Text style={styles.infoLabel}>Capacidade</Text>
              <Text style={styles.infoValue}>
                {show.capacidade_maxima ? `${show.capacidade_maxima} pessoas` : "—"}
              </Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <FontAwesome5 name="exclamation-circle" size={14} color="#A78BFA" />
            <View>
              <Text style={styles.infoLabel}>Classificação</Text>
              <Text style={styles.infoValue}>{show.classificacao_etaria ?? "Livre"}</Text>
            </View>
          </View>
        </View>

        {show.descricao_evento ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre o show</Text>
            <Text style={styles.aboutText}>{show.descricao_evento}</Text>
          </View>
        ) : null}

        {rating !== null && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Avaliações</Text>
            <View style={styles.ratingRow}>
              <FontAwesome5 name="star" size={16} color="#F39C12" solid />
              <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
              <Text style={styles.ratingCount}>
                ({avaliacoes!.total} avaliações)
              </Text>
            </View>
          </View>
        )}

        {attendees > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quem vai</Text>
            <View style={styles.attendeesRow}>
              {[...Array(Math.min(5, attendees))].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.attendeeAvatar,
                    {
                      marginLeft: i === 0 ? 0 : -8,
                      backgroundColor: ["#6C5CE7", "#A78BFA", "#00C896", "#FF6B6B", "#F39C12"][i],
                    },
                  ]}
                >
                  <FontAwesome5 name="user" size={10} color="rgba(255,255,255,0.7)" />
                </View>
              ))}
              {attendees > 5 && (
                <Text style={styles.attendeesMore}>
                  {" "}e mais {attendees - 5} pessoas
                </Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O Artista</Text>
          {confirmedBand ? (
            <TouchableOpacity style={styles.artistCard} onPress={goToArtist} activeOpacity={0.85}>
              <View style={styles.artistAvatar}>
                <FontAwesome5 name="microphone" size={20} color="#A78BFA" />
              </View>
              <View style={styles.artistInfo}>
                <Text style={styles.artistName}>{confirmedBand.nome_banda}</Text>
                {confirmedBand.generos_musicais?.length ? (
                  <Text style={styles.artistBio} numberOfLines={2}>
                    {confirmedBand.generos_musicais.join(", ")}
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity style={styles.viewProfileBtn} onPress={goToArtist}>
                <Text style={styles.viewProfileText}>ver perfil completo</Text>
                <FontAwesome5 name="chevron-right" size={10} color="#A78BFA" />
              </TouchableOpacity>
            </TouchableOpacity>
          ) : (
            <View style={styles.artistCard}>
              <View style={styles.artistAvatar}>
                <FontAwesome5 name="microphone" size={20} color="#555577" />
              </View>
              <View style={styles.artistInfo}>
                <Text style={[styles.artistName, { color: "#555577" }]}>
                  Artista a ser confirmado
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O Local</Text>
          <View style={styles.venueCard}>
            <Text style={styles.venueName}>{venue}</Text>
            {address ? (
              <View style={styles.venueAddress}>
                <FontAwesome5 name="map-marker-alt" size={12} color="#555577" />
                <Text style={styles.venueAddressText}>{address}</Text>
              </View>
            ) : null}
            <View style={styles.venueActions}>
              <View style={styles.venueBtn}>
                <FontAwesome5 name="directions" size={12} color="#A78BFA" />
                <Text style={styles.venueBtnText}>Como chegar</Text>
              </View>
              {show.EstablishmentProfile?.telefone_contato ? (
                <View style={styles.venueBtn}>
                  <FontAwesome5 name="phone" size={12} color="#A78BFA" />
                  <Text style={styles.venueBtnText}>Contato</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.commentsLink} onPress={goToComments}>
          <FontAwesome5 name="comment-alt" size={14} color="#A78BFA" />
          <Text style={styles.commentsLinkText}>Ver comentários do show</Text>
          <FontAwesome5 name="chevron-right" size={12} color="#555577" />
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.stickyBottom}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>A partir de</Text>
          <Text style={styles.priceValue}>
            {isFree ? "GRATUITO" : `R$ ${price}`}
          </Text>
        </View>
        <TouchableOpacity
          style={isFree ? styles.confirmBtn : styles.buyBtn}
          onPress={goToCheckout}
          activeOpacity={0.85}
        >
          <Text style={styles.buyBtnText}>
            {isFree ? "CONFIRMAR PRESENÇA" : "COMPRAR INGRESSO"}
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
  coverImage: {
    height: 280,
    justifyContent: "space-between",
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  topActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingHorizontal: 20,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  coverInfo: {
    padding: 20,
  },
  genreBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  genreBadgeText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 10,
    letterSpacing: 1,
  },
  coverTitle: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 26,
    color: "#FFFFFF",
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    width: "46%",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 12,
  },
  infoLabel: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: "#555577",
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: "#FFFFFF",
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 12,
  },
  aboutText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: "#A0A0B8",
    lineHeight: 22,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingValue: {
    fontFamily: "Montserrat-Bold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  ratingCount: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: "#A0A0B8",
  },
  attendeesRow: { flexDirection: "row", alignItems: "center" },
  attendeeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#09090F",
  },
  attendeesMore: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: "#A0A0B8",
    marginLeft: 12,
  },
  artistCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  artistAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(167,139,250,0.15)",
    borderWidth: 1,
    borderColor: "#A78BFA",
    alignItems: "center",
    justifyContent: "center",
  },
  artistInfo: { flex: 1 },
  artistName: {
    fontFamily: "Montserrat-Bold",
    fontSize: 15,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  artistBio: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: "#A0A0B8",
  },
  viewProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewProfileText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: "#A78BFA",
  },
  venueCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 14,
  },
  venueName: {
    fontFamily: "Montserrat-Bold",
    fontSize: 15,
    color: "#FFFFFF",
    marginBottom: 6,
  },
  venueAddress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  venueAddressText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: "#A0A0B8",
    flex: 1,
  },
  venueActions: { flexDirection: "row", gap: 10 },
  venueBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.3)",
  },
  venueBtnText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: "#A78BFA",
  },
  commentsLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 8,
  },
  commentsLinkText: {
    flex: 1,
    fontFamily: "Montserrat-SemiBold",
    fontSize: 14,
    color: "#FFFFFF",
  },
  stickyBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D0D14",
    borderTopWidth: 1,
    borderTopColor: "#1A1040",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
    gap: 16,
  },
  priceRow: {},
  priceLabel: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: "#888",
  },
  priceValue: {
    fontFamily: "Montserrat-Bold",
    fontSize: 18,
    color: "#00C896",
  },
  buyBtn: {
    flex: 1,
    backgroundColor: "#6C5CE7",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  confirmBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#A78BFA",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  buyBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
});
