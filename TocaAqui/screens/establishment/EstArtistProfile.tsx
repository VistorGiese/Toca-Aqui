import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, Image, Linking, Alert,
} from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { establishmentService, BandPublicProfile } from "@/http/establishmentService";
import { favoriteService } from "@/http/favoriteService";
import { getGenreColor } from "@/utils/colors";
import { resolveImageUrl, parsePressKit } from "@/utils/adapters";
import {
  ArtistProfileSnapshot,
  formatCacheRange,
  formatRating,
  TIPO_ATUACAO_LABEL,
} from "@/utils/artistProfile";

const DS = {
  bg: "#09090F", card: "#13101F", surface: "#0F0B1E",
  border: "#1E1A30", accent: "#7B61FF", cyan: "#00CEC9",
  success: "#00C853", amber: "#F59E0B",
  textPrimary: "#FFFFFF", textSecondary: "#8888AA", textMuted: "#555577",
};

type NavProp = NativeStackNavigationProp<EstStackParamList>;
type RouteType = RouteProp<EstStackParamList, "EstArtistProfile">;

type BandView = {
  id: number;
  nome: string;
  descricao?: string;
  generos: string[];
  foto?: string;
  esta_ativo?: boolean;
  data_criacao?: string;
};

function mapBand(band: BandPublicProfile): BandView {
  const generos = Array.isArray(band.generos_musicais)
    ? band.generos_musicais
    : [];
  return {
    id: band.id,
    nome: band.nome_banda ?? "Banda",
    descricao: band.descricao,
    generos,
    foto: band.imagem,
    esta_ativo: (band as { esta_ativo?: boolean }).esta_ativo,
    data_criacao: (band as { data_criacao?: string }).data_criacao,
  };
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

function ChipList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <View style={s.chipsWrap}>
      {items.map((item) => {
        const color = getGenreColor(item);
        return (
          <View key={item} style={[s.chip, { backgroundColor: color + "22", borderColor: color + "55" }]}>
            <Text style={[s.chipText, { color }]}>{item}</Text>
          </View>
        );
      })}
    </View>
  );
}

function InstrumentChipList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <Text style={s.emptyHint}>Nenhum instrumento informado</Text>;
  }
  return (
    <View style={s.chipsWrap}>
      {items.map((item) => {
        const color = getGenreColor(item.toUpperCase());
        return (
          <View key={item} style={[s.instrumentChip, { borderColor: color + "88", backgroundColor: color + "18" }]}>
            <FontAwesome5 name="music" size={10} color={color} style={{ marginRight: 6 }} />
            <Text style={[s.instrumentChipText, { color }]}>{item}</Text>
          </View>
        );
      })}
    </View>
  );
}

function ArtistProfileContent({
  profile,
  navigation,
}: {
  profile: ArtistProfileSnapshot;
  navigation: NavProp;
}) {
  const nome = profile.nome_artistico ?? "Artista";
  const tipo =
    TIPO_ATUACAO_LABEL[profile.tipo_atuacao ?? ""] ?? profile.tipo_atuacao?.toUpperCase() ?? "ARTISTA";
  const localizacao = [profile.cidade, profile.estado].filter(Boolean).join(" ┬À ");
  const fotoUrl = profile.foto_perfil ? resolveImageUrl(profile.foto_perfil) : null;
  const pressKit = parsePressKit(profile.press_kit)
    .map((path) => resolveImageUrl(path))
    .filter(Boolean) as string[];
  const instrumentos = profile.instrumentos ?? [];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <View style={s.heroSection}>
        {fotoUrl ? (
          <Image source={{ uri: fotoUrl }} style={s.avatarCircle} />
        ) : (
          <View style={s.avatarCircle}>
            <FontAwesome5 name="user" size={44} color={DS.accent} />
          </View>
        )}
        <Text style={s.artistName}>{nome.toUpperCase()}</Text>
        <Text style={s.tipoLabel}>{tipo}</Text>
        {localizacao ? (
          <View style={s.locationRow}>
            <Ionicons name="location-outline" size={13} color={DS.textSecondary} />
            <Text style={s.locationText}>{localizacao}</Text>
          </View>
        ) : null}
      </View>

      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Text style={[s.statValue, { color: DS.amber }]}>{formatRating(profile.nota_media)}</Text>
          <Text style={s.statLabel}>AVALIA├ç├âO</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statValue}>{profile.shows_realizados ?? 0}</Text>
          <Text style={s.statLabel}>SHOWS</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={[s.statValue, { color: DS.success, fontSize: 14 }]}>
            {formatCacheRange(profile.cache_minimo, profile.cache_maximo)}
          </Text>
          <Text style={s.statLabel}>CACH├è</Text>
        </View>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Instrumentos</Text>
        <InstrumentChipList items={instrumentos} />
      </View>

      {profile.biografia ? (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Biografia</Text>
          <Text style={s.bodyText}>{profile.biografia}</Text>
        </View>
      ) : null}

      {profile.generos && profile.generos.length > 0 ? (
        <View style={s.section}>
          <Text style={s.sectionTitle}>G├¬neros musicais</Text>
          <ChipList items={profile.generos} />
        </View>
      ) : null}

      <View style={s.section}>
        <Text style={s.sectionTitle}>Equipamentos / estrutura de som</Text>
        {profile.tem_estrutura_som === false ? (
          <Text style={s.emptyHint}>Artista informou que n├úo possui estrutura pr├│pria</Text>
        ) : profile.estrutura_som && profile.estrutura_som.length > 0 ? (
          <ChipList items={profile.estrutura_som} />
        ) : (
          <Text style={s.emptyHint}>
            {profile.tem_estrutura_som
              ? "Possui estrutura, mas ainda n├úo detalhou os equipamentos"
              : "N├úo informado pelo artista"}
          </Text>
        )}
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Informa├º├Áes</Text>
        <View style={s.infoCard}>
          {profile.anos_experiencia != null && (
            <InfoRow label="Anos de experi├¬ncia" value={String(profile.anos_experiencia)} />
          )}
          {profile.esta_disponivel != null && (
            <InfoRow
              label="Dispon├¡vel para shows"
              value={profile.esta_disponivel ? "Sim" : "N├úo"}
            />
          )}
          {profile.tem_estrutura_som != null && (
            <InfoRow
              label="Possui estrutura de som"
              value={profile.tem_estrutura_som ? "Sim" : "N├úo"}
            />
          )}
          {profile.url_portfolio ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(profile.url_portfolio!).catch(() => {})}
              activeOpacity={0.8}
            >
              <InfoRow label="Portf├│lio" value={profile.url_portfolio} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {profile.links_sociais && profile.links_sociais.length > 0 ? (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Links sociais</Text>
          {profile.links_sociais.map((link) => (
            <TouchableOpacity
              key={link}
              onPress={() => Linking.openURL(link).catch(() => {})}
              activeOpacity={0.8}
            >
              <Text style={s.linkText}>{link}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {pressKit.length > 0 ? (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Galeria</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pressKitRow}>
            {pressKit.map((uri) => (
              <Image key={uri} source={{ uri }} style={s.pressKitImage} />
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={s.section}>
        <TouchableOpacity
          style={s.ctaCard}
          onPress={() => navigation.navigate("EstNewGig", { artistaConvidadoId: profile.id })}
          activeOpacity={0.85}
        >
          <FontAwesome5 name="paper-plane" size={16} color={DS.cyan} />
          <View style={{ flex: 1 }}>
            <Text style={s.ctaTitle}>Convidar para show</Text>
            <Text style={s.ctaText}>Crie uma vaga direcionada a este artista.</Text>
          </View>
          <FontAwesome5 name="chevron-right" size={12} color={DS.cyan} />
        </TouchableOpacity>
      </View>

      <View style={{ height: 88 }} />
    </ScrollView>
  );
}

function BandProfileContent({ band }: { band: BandView }) {
  const fotoUrl = band.foto ? resolveImageUrl(band.foto) : null;
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <View style={s.heroSection}>
        {fotoUrl ? (
          <Image source={{ uri: fotoUrl }} style={s.avatarCircle} />
        ) : (
          <View style={s.avatarCircle}>
            <FontAwesome5 name="users" size={44} color={DS.accent} />
          </View>
        )}
        <Text style={s.artistName}>{band.nome.toUpperCase()}</Text>
        <Text style={s.tipoLabel}>BANDA</Text>
      </View>

      {band.descricao ? (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Descri├º├úo</Text>
          <Text style={s.bodyText}>{band.descricao}</Text>
        </View>
      ) : null}

      {band.generos.length > 0 ? (
        <View style={s.section}>
          <Text style={s.sectionTitle}>G├¬neros musicais</Text>
          <ChipList items={band.generos} />
        </View>
      ) : null}

      <View style={s.section}>
        <Text style={s.sectionTitle}>Informa├º├Áes</Text>
        <View style={s.infoCard}>
          {band.esta_ativo != null && (
            <InfoRow label="Banda ativa" value={band.esta_ativo ? "Sim" : "N├úo"} />
          )}
          {band.data_criacao ? (
            <InfoRow
              label="Data de cria├º├úo"
              value={new Date(band.data_criacao).toLocaleDateString("pt-BR")}
            />
          ) : null}
        </View>
      </View>
      <View style={{ height: 88 }} />
    </ScrollView>
  );
}

export default function EstArtistProfile() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { artistId, bandaId, profile: profileHint } = route.params;

  const [artistProfile, setArtistProfile] = useState<ArtistProfileSnapshot | null>(null);
  const [bandProfile, setBandProfile] = useState<BandView | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      if (bandaId) {
        const data = await establishmentService.getBandById(bandaId);
        setBandProfile(mapBand(data));
        setArtistProfile(null);
        return;
      }
      if (artistId) {
        const data = await establishmentService.findArtistById(artistId, profileHint);
        setArtistProfile(data);
        setBandProfile(null);
        return;
      }
      throw new Error("Identificador de perfil ausente");
    } catch {
      setArtistProfile(null);
      setBandProfile(null);
      setErrorMessage("N├úo foi poss├¡vel carregar os dados do perfil.");
    } finally {
      setLoading(false);
    }
  }, [artistId, bandaId, profileHint]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!artistProfile?.id) {
      setIsFavorite(false);
      return;
    }
    favoriteService.check("perfil_artista", artistProfile.id).then(setIsFavorite);
  }, [artistProfile?.id]);

  async function toggleFavorite() {
    if (!artistProfile?.id || favoriteLoading) return;
    setFavoriteLoading(true);
    try {
      const next = await favoriteService.toggleArtist(artistProfile.id, isFavorite);
      setIsFavorite(next);
    } catch {
      Alert.alert("Erro", "N├úo foi poss├¡vel atualizar seus favoritos.");
    } finally {
      setFavoriteLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={[s.root, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={DS.accent} />
      </View>
    );
  }

  if (!artistProfile && !bandProfile) {
    return (
      <View style={[s.root, { justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }]}>
        <StatusBar barStyle="light-content" backgroundColor={DS.bg} />
        <FontAwesome5 name="user-slash" size={36} color={DS.textSecondary} style={{ marginBottom: 16 }} />
        <Text style={[s.headerTitle, { textAlign: "center", marginBottom: 8 }]}>Perfil indispon├¡vel</Text>
        <Text style={[s.bodyText, { textAlign: "center", marginBottom: 24 }]}>
          {errorMessage ?? "Artista ou banda n├úo encontrado(a)."}
        </Text>
        <TouchableOpacity style={s.errorBackBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Text style={s.errorBackBtnText}>VOLTAR</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <FontAwesome5 name="arrow-left" size={18} color={DS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>
          {bandProfile ? "Perfil da Banda" : "Perfil do Artista"}
        </Text>
        {artistProfile ? (
          <TouchableOpacity
            onPress={toggleFavorite}
            disabled={favoriteLoading}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {favoriteLoading ? (
              <ActivityIndicator size="small" color={DS.accent} />
            ) : (
              <FontAwesome5
                name="heart"
                size={18}
                color={isFavorite ? DS.accent : DS.textSecondary}
                solid={isFavorite}
              />
            )}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 18 }} />
        )}
      </View>

      {artistProfile ? (
        <ArtistProfileContent
          profile={artistProfile}
          navigation={navigation}
        />
      ) : bandProfile ? (
        <BandProfileContent band={bandProfile} />
      ) : null}

      {artistProfile || bandProfile ? (
        <View style={s.stickyBottom}>
          <TouchableOpacity
            style={s.backBottomBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <FontAwesome5 name="arrow-left" size={14} color={DS.textPrimary} style={{ marginRight: 8 }} />
            <Text style={s.backBottomBtnText}>VOLTAR</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.bg },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: DS.border,
  },
  headerTitle: { fontFamily: "Montserrat-Bold", fontSize: 17, color: DS.textPrimary },
  scroll: { paddingBottom: 40 },
  heroSection: { alignItems: "center", paddingTop: 32, paddingBottom: 24, paddingHorizontal: 20 },
  avatarCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: DS.accent + "22", borderWidth: 2, borderColor: DS.accent + "55",
    justifyContent: "center", alignItems: "center", marginBottom: 16,
  },
  artistName: { fontFamily: "AkiraExpanded-Superbold", fontSize: 18, color: DS.textPrimary, textAlign: "center", marginBottom: 6 },
  tipoLabel: { fontFamily: "Montserrat-SemiBold", fontSize: 12, color: DS.accent, letterSpacing: 1.5, marginBottom: 8 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { fontFamily: "Montserrat-Regular", fontSize: 12, color: DS.textSecondary },
  statsRow: {
    flexDirection: "row", marginHorizontal: 20, marginBottom: 24,
    backgroundColor: DS.card, borderRadius: 14, borderWidth: 1, borderColor: DS.border, paddingVertical: 16,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontFamily: "Montserrat-Bold", fontSize: 18, color: DS.textPrimary, textAlign: "center" },
  statLabel: { fontFamily: "Montserrat-SemiBold", fontSize: 9, color: DS.textSecondary, letterSpacing: 1.2, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: DS.border },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontFamily: "Montserrat-Bold", fontSize: 16, color: DS.textPrimary, marginBottom: 10 },
  bodyText: { fontFamily: "Montserrat-Regular", fontSize: 13, color: DS.textSecondary, lineHeight: 21 },
  emptyHint: { fontFamily: "Montserrat-Regular", fontSize: 13, color: DS.textMuted, fontStyle: "italic" },
  infoCard: {
    backgroundColor: DS.card, borderRadius: 12, borderWidth: 1, borderColor: DS.border, padding: 14, gap: 10,
  },
  infoRow: { gap: 2 },
  infoLabel: { fontFamily: "Montserrat-SemiBold", fontSize: 10, color: DS.textMuted, letterSpacing: 1 },
  infoValue: { fontFamily: "Montserrat-Regular", fontSize: 14, color: DS.textPrimary },
  linkText: { fontFamily: "Montserrat-Regular", fontSize: 13, color: DS.cyan, marginBottom: 8 },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText: { fontFamily: "Montserrat-SemiBold", fontSize: 12 },
  instrumentChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  instrumentChipText: { fontFamily: "Montserrat-SemiBold", fontSize: 12 },
  pressKitRow: { gap: 10 },
  pressKitImage: { width: 110, height: 110, borderRadius: 10, backgroundColor: DS.surface },
  ctaCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: DS.cyan + "11", borderRadius: 12, borderWidth: 1, borderColor: DS.cyan + "33", padding: 14,
  },
  ctaTitle: { fontFamily: "Montserrat-Bold", fontSize: 14, color: DS.textPrimary, marginBottom: 4 },
  ctaText: { fontFamily: "Montserrat-Regular", fontSize: 12, color: DS.textSecondary },
  errorBackBtn: { backgroundColor: DS.accent, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  errorBackBtnText: { fontFamily: "Montserrat-Bold", fontSize: 13, color: DS.textPrimary, letterSpacing: 1 },
  stickyBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0D0D14",
    borderTopWidth: 1,
    borderTopColor: DS.border,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
  },
  backBottomBtn: {
    backgroundColor: DS.accent,
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backBottomBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: DS.textPrimary,
    letterSpacing: 1,
  },
});
