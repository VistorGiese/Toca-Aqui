import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import { UserStackParamList } from "@/navigation/UserNavigator";
import { getGenreColor } from "@/utils/colors";
import { parseGenres } from "@/utils/genres";
import {
  EstablishmentPublicProfile,
  establishmentService,
} from "@/http/establishmentService";
import { showService, Show } from "@/http/showService";
import { resolveImageUrl } from "@/utils/adapters";
import { favoriteService } from "@/http/favoriteService";
import { useAuth } from "@/contexts/AuthContext";

type Props = NativeStackScreenProps<UserStackParamList, "UserEstablishmentProfile">;

const TIPO_LABEL: Record<string, string> = {
  bar: "BAR & MUSIC VENUE",
  casa_show: "CASA DE SHOW",
  restaurante: "RESTAURANTE",
  club: "CLUB",
  outro: "ESPAÇO CULTURAL",
};

function formatShowDate(dataShow: string): string {
  try {
    const date = new Date(dataShow);
    const months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    return `${date.getUTCDate()} ${months[date.getUTCMonth()]}`;
  } catch {
    return dataShow;
  }
}

function parsePhotos(raw?: string | string[]): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildAddress(profile: EstablishmentPublicProfile): string {
  const addr = profile.Address;
  if (!addr) {
    return [profile.cidade, profile.estado].filter(Boolean).join(", ");
  }
  const street = [addr.rua, addr.numero].filter(Boolean).join(", ");
  const district = [addr.bairro, addr.cidade, addr.estado].filter(Boolean).join(" · ");
  return [street, district].filter(Boolean).join(" · ");
}

export default function UserEstablishmentProfile({ route, navigation }: Props) {
  const { establishmentId, canBuyTickets = true } = route.params;
  const { paginas } = useAuth();
  const isOwnEstablishment = paginas?.pagina_estabelecimento?.id === establishmentId;
  const showFavoriteHeart = !isOwnEstablishment;
  const [profile, setProfile] = useState<EstablishmentPublicProfile | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const [establishment, showsResponse, favorited] = await Promise.allSettled([
        establishmentService.getEstablishmentById(establishmentId),
        showService.getConfirmedShows({ limit: 50 }),
        showFavoriteHeart
          ? favoriteService.check("perfil_estabelecimento", establishmentId)
          : Promise.resolve(false),
      ]);

      if (establishment.status === "fulfilled") {
        setProfile(establishment.value);
      } else {
        setProfile(null);
      }

      if (showsResponse.status === "fulfilled") {
        const venueShows = showsResponse.value.shows.filter(
          (show) => show.EstablishmentProfile?.id === establishmentId
        );
        setShows(venueShows.slice(0, 5));
      } else {
        setShows([]);
      }

      if (favorited.status === "fulfilled") {
        setIsFavorite(favorited.value);
      }
    } finally {
      setLoading(false);
    }
  }, [establishmentId, showFavoriteHeart]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function toggleFavorite() {
    if (!showFavoriteHeart || favoriteLoading) return;
    setFavoriteLoading(true);
    try {
      const next = await favoriteService.toggleEstablishment(establishmentId, isFavorite);
      setIsFavorite(next);
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar seus favoritos. Faça login e tente novamente.");
    } finally {
      setFavoriteLoading(false);
    }
  }

  function goToShow(showId: number) {
    navigation.navigate("UserShowDetail", { showId });
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#09090F" />
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#09090F" />
        <Text style={styles.errorText}>Estabelecimento não encontrado.</Text>
        <TouchableOpacity style={styles.errorBackBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.errorBackBtnText}>VOLTAR</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const generos = parseGenres(profile.generos_musicais);
  const genreLabel = generos[0] ?? TIPO_LABEL[profile.tipo_estabelecimento ?? ""] ?? "LOCAL";
  const genreColor = getGenreColor(genreLabel);
  const photos = parsePhotos(profile.fotos)
    .map((path) => resolveImageUrl(path))
    .filter(Boolean) as string[];
  const coverUrl = photos[0] ?? resolveImageUrl(profile.foto_url);
  const addressLabel = buildAddress(profile) || "Endereço não informado";
  const abertura = profile.horario_abertura?.substring(0, 5) ?? "--:--";
  const fechamento = profile.horario_fechamento?.substring(0, 5) ?? "--:--";
  const rating = profile.nota_media ?? 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={[styles.headerImage, coverUrl ? undefined : { backgroundColor: genreColor + "88" }]}>
        {coverUrl ? <Image source={{ uri: coverUrl }} style={styles.coverImage} /> : null}
        <View style={styles.headerOverlay} />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={16} color="#FFFFFF" />
        </TouchableOpacity>

        {showFavoriteHeart ? (
          <TouchableOpacity
            style={styles.favoriteHeaderBtn}
            onPress={toggleFavorite}
            disabled={favoriteLoading}
            activeOpacity={0.85}
          >
            {favoriteLoading ? (
              <ActivityIndicator size="small" color="#A78BFA" />
            ) : (
              <FontAwesome5
                name="heart"
                size={18}
                color={isFavorite ? "#A78BFA" : "#FFFFFF"}
                solid={isFavorite}
              />
            )}
          </TouchableOpacity>
        ) : null}

        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: genreColor + "66" }]}>
            <FontAwesome5 name="store" size={28} color="rgba(255,255,255,0.85)" />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.typeBadge, { backgroundColor: genreColor + "22" }]}>
          <Text style={[styles.typeBadgeText, { color: genreColor }]}>{genreLabel}</Text>
        </View>

        <Text style={styles.name}>{profile.nome_estabelecimento}</Text>

        {rating > 0 ? (
          <Text style={styles.rating}>★ {rating.toFixed(1)}</Text>
        ) : null}

        <View style={styles.locationRow}>
          <FontAwesome5 name="map-marker-alt" size={12} color="#555577" />
          <Text style={styles.locationText}>{addressLabel}</Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <FontAwesome5 name="clock" size={14} color="#A78BFA" />
            <Text style={styles.infoLabel}>HORÁRIO</Text>
            <Text style={styles.infoValue}>
              {abertura} – {fechamento}
            </Text>
          </View>
          {profile.capacidade ? (
            <View style={styles.infoCard}>
              <FontAwesome5 name="users" size={14} color="#A78BFA" />
              <Text style={styles.infoLabel}>CAPACIDADE</Text>
              <Text style={styles.infoValue}>{profile.capacidade} pessoas</Text>
            </View>
          ) : null}
        </View>

        {photos.length > 1 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fotos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosRow}>
              {photos.map((uri) => (
                <Image key={uri} source={{ uri }} style={styles.photoThumb} />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {profile.descricao ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre</Text>
            <Text style={styles.description}>{profile.descricao}</Text>
          </View>
        ) : null}

        {generos.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gêneros musicais</Text>
            <View style={styles.genreRow}>
              {generos.map((genre) => {
                const color = getGenreColor(genre);
                return (
                  <View key={genre} style={[styles.genreChip, { borderColor: color }]}>
                    <Text style={[styles.genreChipText, { color }]}>{genre}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        {profile.telefone_contato ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contato</Text>
            <Text style={styles.description}>{profile.telefone_contato}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximos shows</Text>
          {shows.length === 0 ? (
            <Text style={styles.emptySection}>Nenhum show programado</Text>
          ) : (
            shows.map((show) => {
              const rowContent = (
                <>
                  <View style={styles.showDateBlock}>
                    <Text style={styles.showDate}>{formatShowDate(show.data_show)}</Text>
                  </View>
                  <View style={styles.showInfo}>
                    <Text style={styles.showTitle}>{show.titulo_evento}</Text>
                    <Text style={styles.showArtist}>
                      {show.nome_artista ?? show.Contract?.Band?.nome_banda ?? "Artista a confirmar"}
                    </Text>
                  </View>
                  {canBuyTickets ? (
                    <FontAwesome5 name="chevron-right" size={12} color="#555577" />
                  ) : null}
                </>
              );

              if (!canBuyTickets) {
                return (
                  <View key={show.id} style={styles.showRow}>
                    {rowContent}
                  </View>
                );
              }

              return (
                <TouchableOpacity
                  key={show.id}
                  style={styles.showRow}
                  onPress={() => goToShow(show.id)}
                  activeOpacity={0.85}
                >
                  {rowContent}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.stickyBottom}>
        <TouchableOpacity
          style={styles.backBottomBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <FontAwesome5 name="arrow-left" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.backBottomBtnText}>VOLTAR</Text>
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
  coverImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
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
  favoriteHeaderBtn: {
    position: "absolute",
    top: 52,
    right: 20,
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
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  typeBadgeText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 10,
    letterSpacing: 1,
  },
  name: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 22,
    color: "#FFFFFF",
    marginBottom: 6,
    lineHeight: 30,
  },
  rating: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#FFD700",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  locationText: {
    flex: 1,
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: "#A0A0B8",
  },
  infoGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 12,
    gap: 6,
  },
  infoLabel: {
    fontFamily: "Montserrat-Bold",
    fontSize: 9,
    color: "#555577",
    letterSpacing: 1,
  },
  infoValue: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: "#FFFFFF",
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 12,
  },
  photosRow: { gap: 10 },
  photoThumb: {
    width: 110,
    height: 110,
    borderRadius: 10,
    backgroundColor: "#161028",
  },
  description: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: "#A0A0B8",
    lineHeight: 22,
  },
  genreRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  genreChip: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  genreChipText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  emptySection: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: "#555577",
  },
  showRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  showDateBlock: { width: 44, alignItems: "center" },
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
  showArtist: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: "#A0A0B8",
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
  favoriteBtn: {
    backgroundColor: "#6C5CE7",
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteBtnActive: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#A78BFA",
  },
  favoriteBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  favoriteBtnTextActive: { color: "#A78BFA" },
  backBottomBtn: {
    backgroundColor: "#6C5CE7",
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backBottomBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
});
