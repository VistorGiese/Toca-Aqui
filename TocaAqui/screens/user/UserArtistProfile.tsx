import React, { useState, useEffect, useCallback } from "react";
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
import { artistaPublicoService, ArtistaPublico } from "@/http/artistaPublicoService";
import { establishmentService } from "@/http/establishmentService";
import { favoriteService } from "@/http/favoriteService";
import { artistProfileService } from "@/http/artistProfileService";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArtistProfileSnapshot,
  mergeArtistSnapshots,
  snapshotToArtistaPublico,
} from "@/utils/artistProfile";
import { resolveImageUrl, parsePressKit } from "@/utils/adapters";

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

function InstrumentChipList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <Text style={styles.emptySection}>Nenhum instrumento informado</Text>;
  }
  return (
    <View style={styles.chipsWrap}>
      {items.map((item) => {
        const color = getGenreColor(item.toUpperCase());
        return (
          <View key={item} style={[styles.chip, { borderColor: color + "88", backgroundColor: color + "18" }]}>
            <FontAwesome5 name="music" size={10} color={color} style={{ marginRight: 6 }} />
            <Text style={[styles.chipText, { color }]}>{item}</Text>
          </View>
        );
      })}
    </View>
  );
}

function SoundStructureSection({
  temEstrutura,
  equipamentos,
}: {
  temEstrutura?: boolean;
  equipamentos: string[];
}) {
  if (temEstrutura === false) {
    return <Text style={styles.emptySection}>Não possui estrutura de som própria</Text>;
  }
  if (equipamentos.length > 0) {
    return (
      <View style={styles.chipsWrap}>
        {equipamentos.map((item) => (
          <View
            key={item}
            style={[styles.chip, { borderColor: "#6DB88588", backgroundColor: "#6DB88518" }]}
          >
            <FontAwesome5 name="volume-up" size={10} color="#6DB885" style={{ marginRight: 6 }} />
            <Text style={[styles.chipText, { color: "#6DB885" }]}>{item}</Text>
          </View>
        ))}
      </View>
    );
  }
  return (
    <Text style={styles.emptySection}>
      {temEstrutura ? "Possui estrutura, mas nenhum equipamento listado" : "Nenhum equipamento informado"}
    </Text>
  );
}

export default function UserArtistProfile({ route, navigation }: Props) {
  const { artistId, profile: profileHint, canBuyTickets = true } = route.params;
  const { user } = useAuth();
  const [artista, setArtista] = useState<ArtistaPublico | null>(null);
  const [profileSnapshot, setProfileSnapshot] = useState<ArtistProfileSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const isOwnProfile = user?.perfilArtistaId === artistId;

  const loadArtista = useCallback(async () => {
    setLoading(true);
    try {
      const ownProfilePromise =
        user?.perfilArtistaId === artistId
          ? artistProfileService.getMyProfile()
          : Promise.resolve(null);

      const [snapshotResult, publicoResult, ownProfileResult] = await Promise.allSettled([
        establishmentService.findArtistById(artistId, profileHint),
        artistaPublicoService.getPerfilPublico(artistId),
        ownProfilePromise,
      ]);

      let snapshot: ArtistProfileSnapshot | null = null;

      if (snapshotResult.status === "fulfilled") {
        snapshot = snapshotResult.value;
      } else if (profileHint) {
        snapshot = mergeArtistSnapshots({ id: artistId, ...profileHint }, profileHint);
      }

      if (ownProfileResult.status === "fulfilled" && ownProfileResult.value) {
        const own = ownProfileResult.value;
        snapshot = mergeArtistSnapshots(snapshot ?? { id: artistId }, {
          instrumentos: own.instrumentos,
          estrutura_som: own.estrutura_som,
          tem_estrutura_som: own.tem_estrutura_som,
          generos: own.generos,
          biografia: own.biografia,
          foto_perfil: own.foto_perfil,
          press_kit: own.press_kit,
          cache_minimo: own.cache_minimo,
          cache_maximo: own.cache_maximo,
          cidade: own.cidade,
          estado: own.estado,
          links_sociais: own.links_sociais,
        });
      }

      setProfileSnapshot(snapshot);

      let base: ArtistaPublico | null = snapshot ? snapshotToArtistaPublico(snapshot) : null;

      if (publicoResult.status === "fulfilled") {
        const pub = publicoResult.value;
        base = base
          ? {
              ...base,
              ...pub,
              id: artistId,
              nome_artistico: pub.nome_artistico ?? base.nome_artistico,
              generos: pub.generos?.length ? pub.generos : base.generos,
              instrumentos: snapshot?.instrumentos?.length
                ? snapshot.instrumentos
                : pub.instrumentos?.length
                  ? pub.instrumentos
                  : base.instrumentos,
              press_kit: snapshot?.press_kit?.length ? snapshot.press_kit : pub.press_kit ?? base.press_kit,
              foto_perfil: snapshot?.foto_perfil ?? pub.foto_perfil ?? base.foto_perfil,
              biografia: pub.biografia ?? base.biografia,
              ProximosShows: pub.ProximosShows?.length ? pub.ProximosShows : base.ProximosShows,
            }
          : pub;
      }

      setArtista(base);
    } catch {
      setArtista(null);
      setProfileSnapshot(null);
    } finally {
      setLoading(false);
    }
  }, [artistId, profileHint, user?.perfilArtistaId]);

  const loadFavoriteStatus = useCallback(async () => {
    if (isOwnProfile) {
      setIsFavorite(false);
      return;
    }
    const favorited = await favoriteService.check("perfil_artista", artistId);
    setIsFavorite(favorited);
  }, [artistId, isOwnProfile]);

  useEffect(() => {
    loadArtista();
  }, [loadArtista]);

  useEffect(() => {
    if (!loading && artista) {
      loadFavoriteStatus();
    }
  }, [loading, artista, loadFavoriteStatus]);

  async function toggleFavorite() {
    if (isOwnProfile || favoriteLoading) return;
    setFavoriteLoading(true);
    try {
      const next = await favoriteService.toggleArtist(artistId, isFavorite);
      setIsFavorite(next);
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar seus favoritos. Faça login e tente novamente.");
    } finally {
      setFavoriteLoading(false);
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
  const rating = artista.media_nota ?? profileSnapshot?.nota_media ?? 0;
  const shows = artista.ProximosShows ?? [];
  const avatarUrl = resolveImageUrl(profileSnapshot?.foto_perfil ?? artista.foto_perfil);
  const pressKitRaw = profileSnapshot?.press_kit ?? artista.press_kit;
  const galleryPhotos = parsePressKit(pressKitRaw)
    .map((path) => resolveImageUrl(path))
    .filter(Boolean) as string[];
  const instrumentos = profileSnapshot?.instrumentos?.length
    ? profileSnapshot.instrumentos
    : artista.instrumentos ?? [];
  const estruturaSom = profileSnapshot?.estrutura_som ?? [];
  const temEstruturaSom = profileSnapshot?.tem_estrutura_som;
  const locationLabel =
    [profileSnapshot?.cidade ?? artista.cidade, profileSnapshot?.estado ?? artista.estado]
      .filter(Boolean)
      .join(", ") || "Cidade não informada";
  const coverUrl = avatarUrl ?? galleryPhotos[0] ?? null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={[styles.headerImage, !coverUrl && { backgroundColor: genreColor + "88" }]}>
        {coverUrl ? <Image source={{ uri: coverUrl }} style={styles.coverImage} /> : null}
        <View style={styles.headerOverlay} />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={16} color="#FFFFFF" />
        </TouchableOpacity>

        {!isOwnProfile ? (
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
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: genreColor + "66" }]}>
              <FontAwesome5 name="microphone" size={28} color="rgba(255,255,255,0.85)" />
            </View>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.artistHeader}>
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

        <Text style={styles.artistName}>{artista.nome_artistico}</Text>
        <View style={styles.locationRow}>
          <FontAwesome5 name="map-marker-alt" size={12} color="#555577" />
          <Text style={styles.locationText}>{locationLabel}</Text>
        </View>

        {artista.biografia ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre</Text>
            <Text style={styles.bioText}>{artista.biografia}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instrumentos</Text>
          <InstrumentChipList items={instrumentos} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estrutura de som</Text>
          <SoundStructureSection temEstrutura={temEstruturaSom} equipamentos={estruturaSom} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Galeria</Text>
          {galleryPhotos.length === 0 ? (
            <Text style={styles.emptySection}>Nenhuma foto adicionada no cadastro</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryRow}
            >
              {galleryPhotos.map((uri) => (
                <Image key={uri} source={{ uri }} style={styles.galleryImage} />
              ))}
            </ScrollView>
          )}
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
                {canBuyTickets ? (
                  <TouchableOpacity
                    style={styles.buyTicketBtn}
                    onPress={() => goToCheckout(show)}
                  >
                    <Text style={styles.buyTicketText}>COMPRAR</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ))
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
    height: 220,
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
    zIndex: 2,
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
    zIndex: 2,
  },
  avatarContainer: {
    position: "absolute",
    bottom: -44,
    alignSelf: "center",
    zIndex: 2,
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
  galleryRow: { gap: 10 },
  galleryImage: {
    width: 140,
    height: 140,
    borderRadius: 12,
    backgroundColor: "#161028",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
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
