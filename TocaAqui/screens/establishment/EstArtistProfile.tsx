import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, Image,
} from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { establishmentService, ArtistPublicProfile, BandPublicProfile } from "@/http/establishmentService";
import { getGenreColor } from "@/utils/colors";
import { resolveImageUrl } from "@/utils/adapters";

const DS = {
  bg: "#09090F", card: "#13101F", surface: "#0F0B1E",
  border: "#1E1A30", accent: "#7B61FF", cyan: "#00CEC9",
  success: "#00C853", amber: "#F59E0B",
  textPrimary: "#FFFFFF", textSecondary: "#8888AA", textMuted: "#555577",
};

const TIPO_LABEL: Record<string, string> = {
  solo: "ARTISTA SOLO",
  banda: "BANDA",
  duo: "DUO",
  trio: "TRIO",
};

type NavProp = NativeStackNavigationProp<EstStackParamList>;
type RouteType = RouteProp<EstStackParamList, "EstArtistProfile">;

type ProfileView = {
  id: number;
  nome: string;
  tipo: string;
  generos: string[];
  nota_media?: number;
  shows_realizados?: number;
  cache_minimo?: number;
  cache_maximo?: number;
  biografia?: string;
  cidade?: string;
  estado?: string;
  foto?: string;
  isBanda: boolean;
};

function mapArtistProfile(artist: ArtistPublicProfile): ProfileView {
  return {
    id: artist.id,
    nome: artist.nome_artistico ?? artist.nome ?? "Artista",
    tipo: TIPO_LABEL[artist.tipo_atuacao ?? artist.tipo ?? ""] ?? "ARTISTA",
    generos: Array.isArray(artist.generos) ? artist.generos : [],
    nota_media: artist.nota_media,
    shows_realizados: artist.shows_realizados,
    cache_minimo: artist.cache_minimo,
    cache_maximo: artist.cache_maximo ?? artist.cache_medio,
    biografia: artist.biografia,
    cidade: artist.cidade,
    estado: artist.estado,
    foto: artist.foto_perfil ?? artist.foto_url,
    isBanda: false,
  };
}

function mapBandProfile(band: BandPublicProfile): ProfileView {
  const generos = Array.isArray(band.generos_musicais) ? band.generos_musicais : [];
  return {
    id: band.id,
    nome: band.nome_banda ?? "Banda",
    tipo: "BANDA",
    generos,
    nota_media: band.nota_media,
    shows_realizados: band.shows_realizados,
    cache_minimo: band.cache_minimo,
    cache_maximo: band.cache_maximo,
    biografia: band.descricao,
    cidade: band.cidade,
    estado: band.estado,
    foto: band.imagem,
    isBanda: true,
  };
}

export default function EstArtistProfile() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { artistId, bandaId } = route.params;

  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      if (bandaId) {
        const data = await establishmentService.getBandById(bandaId);
        setProfile(mapBandProfile(data));
        return;
      }
      if (artistId) {
        const data = await establishmentService.getArtistPublicProfile(artistId);
        setProfile(mapArtistProfile(data));
        return;
      }
      throw new Error("Identificador de perfil ausente");
    } catch {
      // silenciado temporariamente
    } finally {
      setLoading(false);
    }
  }, [artistId, bandaId, navigation]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={[s.root, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={DS.accent} />
      </View>
    );
  }

  if (!profile) return null;

  const cacheMin = profile.cache_minimo;
  const cacheMax = profile.cache_maximo;
  const cacheFormatted = cacheMin
    ? cacheMax && cacheMax !== cacheMin
      ? `R$ ${Number(cacheMin).toLocaleString("pt-BR")} – R$ ${Number(cacheMax).toLocaleString("pt-BR")}`
      : `R$ ${Number(cacheMin).toLocaleString("pt-BR")}`
    : "A negociar";
  const localizacao = [profile.cidade, profile.estado].filter(Boolean).join(" · ");

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <FontAwesome5 name="arrow-left" size={18} color={DS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{profile.isBanda ? "Perfil da Banda" : "Perfil do Artista"}</Text>
        <View style={{ width: 18 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.heroSection}>
          {profile.foto ? (
            <Image source={{ uri: resolveImageUrl(profile.foto) }} style={s.avatarCircle} />
          ) : (
            <View style={s.avatarCircle}>
              <FontAwesome5 name={profile.isBanda ? "users" : "user"} size={44} color={DS.accent} />
            </View>
          )}
          <Text style={s.artistName}>{profile.nome.toUpperCase()}</Text>
          <Text style={s.tipoLabel}>{profile.tipo}</Text>
          {localizacao ? (
            <View style={s.locationRow}>
              <Ionicons name="location-outline" size={13} color={DS.textSecondary} />
              <Text style={s.locationText}>{localizacao}</Text>
            </View>
          ) : null}
        </View>

        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Text style={[s.statValue, { color: DS.amber }]}>
              {profile.nota_media != null ? `${profile.nota_media.toFixed(1)} ★` : "— ★"}
            </Text>
            <Text style={s.statLabel}>AVALIAÇÃO</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statValue}>{profile.shows_realizados ?? 0}</Text>
            <Text style={s.statLabel}>SHOWS</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={[s.statValue, { color: DS.success, fontSize: 15 }]}>{cacheFormatted}</Text>
            <Text style={s.statLabel}>CACHÊ MÉDIO</Text>
          </View>
        </View>

        {profile.biografia ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Sobre</Text>
            <Text style={s.bioText}>{profile.biografia}</Text>
          </View>
        ) : null}

        {profile.generos.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Gêneros</Text>
            <View style={s.chipsWrap}>
              {profile.generos.map((g) => {
                const color = getGenreColor(g);
                return (
                  <View key={g} style={[s.chip, { backgroundColor: color + "22", borderColor: color + "55" }]}>
                    <Text style={[s.chipText, { color }]}>{g}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {!profile.isBanda && (
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
        )}
      </ScrollView>
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
  statValue: { fontFamily: "Montserrat-Bold", fontSize: 20, color: DS.textPrimary },
  statLabel: { fontFamily: "Montserrat-SemiBold", fontSize: 9, color: DS.textSecondary, letterSpacing: 1.2, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: DS.border },

  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontFamily: "Montserrat-Bold", fontSize: 16, color: DS.textPrimary, marginBottom: 10 },
  bioText: { fontFamily: "Montserrat-Regular", fontSize: 13, color: DS.textSecondary, lineHeight: 21 },

  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText: { fontFamily: "Montserrat-SemiBold", fontSize: 12 },

  ctaCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: DS.cyan + "11", borderRadius: 12, borderWidth: 1, borderColor: DS.cyan + "33", padding: 14,
  },
  ctaTitle: { fontFamily: "Montserrat-Bold", fontSize: 14, color: DS.textPrimary, marginBottom: 4 },
  ctaText: { fontFamily: "Montserrat-Regular", fontSize: 12, color: DS.textSecondary },
});
