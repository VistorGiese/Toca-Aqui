import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { establishmentService } from "@/http/establishmentService";
import { resolveImageUrl } from "@/utils/adapters";
import { getGenreColor } from "@/utils/colors";

const { width } = Dimensions.get("window");
const COVER_HEIGHT = 240;

const DS = {
  bg: "#09090F",
  surface: "#0F0B1E",
  card: "#13101F",
  border: "#1E1A30",
  accent: "#7B61FF",
  cyan: "#00CEC9",
  green: "#00C853",
  yellow: "#F39C12",
  textPrimary: "#FFFFFF",
  textSecondary: "#8888AA",
  textMuted: "#555577",
};

const TIPO_LABEL: Record<string, string> = {
  bar: "BAR & MUSIC VENUE",
  casa_show: "CASA DE SHOW",
  restaurante: "RESTAURANTE",
  club: "CLUB",
  outro: "ESPAÇO CULTURAL",
};

type NavProp = NativeStackNavigationProp<EstStackParamList>;

export default function EstProfile() {
  const navigation = useNavigation<NavProp>();
  const [profile, setProfile] = useState<any>(null);
  const [gigs, setGigs] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [p, g, c] = await Promise.allSettled([
        establishmentService.getMyEstablishmentProfile(),
        establishmentService.getMyGigs(),
        establishmentService.getMyContracts(),
      ]);
      if (p.status === "fulfilled") setProfile(p.value);
      if (g.status === "fulfilled") setGigs(g.value);
      if (c.status === "fulfilled") setContracts(c.value);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function goToSettings() {
    navigation.navigate("EstSettings");
  }

  function goToUserProfile() {
    // Sobe dois níveis: EstTabs → EstStack → Root
    const rootNav = (navigation as any).getParent()?.getParent();
    rootNav?.navigate("UserNavigator");
  }

  if (loading) {
    return (
      <View style={[s.root, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={DS.accent} />
      </View>
    );
  }

  // --- dados derivados ---
  const nome = profile?.nome_estabelecimento ?? "Meu Estabelecimento";
  const tipo = TIPO_LABEL[profile?.tipo_estabelecimento ?? ""] ?? "ESPAÇO CULTURAL";
  const cidade = profile?.cidade ?? profile?.Address?.cidade ?? "";
  const estado = profile?.estado ?? profile?.Address?.estado ?? "";
  const rua = profile?.Address?.rua ?? "";
  const localizacao = [rua, cidade, estado].filter(Boolean).join(" · ");
  const descricao = profile?.descricao ?? "";
  const telefone = profile?.telefone_contato ?? "";

  const generos: string[] = profile?.generos_musicais
    ? profile.generos_musicais.split(",").map((g: string) => g.trim()).filter(Boolean)
    : [];

  const fotos: string[] = (() => {
    try {
      const raw = profile?.fotos;
      if (!raw) return [];
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  })();

  const fotosUrls = fotos.map((f) => resolveImageUrl(f)).filter(Boolean) as string[];
  const coverUrl = fotosUrls[0] ?? null;

  const totalEventos = gigs.length;
  const totalContratacoes = contracts.filter((c) => c.status === "aceito" || c.status === "realizado").length;

  // Horários
  const abertura = profile?.horario_abertura?.substring(0, 5) ?? "--:--";
  const fechamento = profile?.horario_fechamento?.substring(0, 5) ?? "--:--";

  const notaMedia: number | null = profile?.nota_media ?? null;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Cover Hero ── */}
        <View style={s.heroContainer}>
          {coverUrl ? (
            <Image source={{ uri: coverUrl }} style={s.heroImage} resizeMode="cover" />
          ) : (
            <View style={[s.heroImage, s.heroPlaceholder]}>
              <FontAwesome5 name="store" size={40} color={DS.textMuted} />
            </View>
          )}
          <View style={s.heroGradient} />
          {/* Botões do topo */}
          <View style={s.heroActions}>
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={[s.iconBtn, { marginRight: 8 }]} onPress={() => navigation.navigate("EstEditProfile")}>
              <FontAwesome5 name="edit" size={16} color={DS.accent} />
            </TouchableOpacity>
            <TouchableOpacity style={s.iconBtn} onPress={goToSettings}>
              <Ionicons name="settings-outline" size={20} color={DS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Identidade ── */}
        <View style={s.section}>
          <View style={s.nameRow}>
            <Text style={s.name}>{nome.toUpperCase()}</Text>
            <View style={[s.dot, profile?.esta_ativo ? s.dotGreen : s.dotRed]} />
          </View>
          <Text style={s.tipoLabel}>{tipo}</Text>
          {localizacao ? (
            <View style={s.row}>
              <Ionicons name="location-outline" size={13} color={DS.textSecondary} />
              <Text style={s.locationText}>{localizacao}</Text>
            </View>
          ) : null}
          {telefone ? (
            <View style={s.row}>
              <Ionicons name="call-outline" size={13} color={DS.textSecondary} />
              <Text style={s.locationText}>{telefone}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Stats ── */}
        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Text style={s.statValue}>{totalContratacoes}</Text>
            <Text style={s.statLabel}>CONTRATAÇÕES</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={[s.statValue, { color: DS.yellow }]}>
              {notaMedia !== null ? `${notaMedia.toFixed(1)} ★` : "-- ★"}
            </Text>
            <Text style={s.statLabel}>AVALIAÇÕES</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statValue}>{totalEventos}</Text>
            <Text style={s.statLabel}>EVENTOS</Text>
          </View>
        </View>

        {/* ── Descrição ── */}
        {descricao ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Sobre o espaço</Text>
            <Text style={s.bioText}>{descricao}</Text>
          </View>
        ) : null}

        {/* ── Gêneros preferidos ── */}
        {generos.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Gêneros preferidos</Text>
            <View style={s.chipsWrap}>
              {generos.map((g) => {
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

        {/* ── Fotos do espaço ── */}
        {fotosUrls.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Fotos do espaço</Text>
            <View style={s.photosGrid}>
              {fotosUrls.slice(0, 6).map((url, i) => (
                <Image
                  key={i}
                  source={{ uri: url }}
                  style={s.photoThumb}
                  resizeMode="cover"
                />
              ))}
            </View>
          </View>
        )}

        {/* ── Horários de Shows ── */}
        {(abertura !== "--:--" || fechamento !== "--:--") && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Horários de Shows</Text>
            <View style={s.horariosCard}>
              <View style={s.horarioRow}>
                <Text style={s.horarioDia}>Abertura</Text>
                <Text style={s.horarioHora}>{abertura}</Text>
              </View>
              <View style={[s.horarioRow, s.horarioRowBorder]}>
                <Text style={s.horarioDia}>Fechamento</Text>
                <Text style={s.horarioHora}>{fechamento}</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Botão voltar para perfil comum ── */}
        <View style={s.section}>
          <TouchableOpacity style={s.switchProfileBtn} onPress={goToUserProfile} activeOpacity={0.8}>
            <Ionicons name="person-outline" size={18} color={DS.cyan} />
            <Text style={s.switchProfileText}>Voltar para Perfil Comum</Text>
            <Ionicons name="chevron-forward" size={16} color={DS.cyan} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const PHOTO_SIZE = (width - 20 * 2 - 8 * 2) / 3;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.bg },
  scroll: { paddingBottom: 40 },

  // Hero
  heroContainer: { width, height: COVER_HEIGHT, position: "relative" },
  heroImage: { width, height: COVER_HEIGHT },
  heroPlaceholder: { backgroundColor: DS.surface, justifyContent: "center", alignItems: "center" },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: COVER_HEIGHT / 2,
    backgroundColor: "rgba(9,9,15,0.65)",
  },
  heroActions: {
    position: "absolute",
    top: 52,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Identidade
  section: { paddingHorizontal: 20, marginTop: 24 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  name: { fontFamily: "AkiraExpanded-SuperBold", fontSize: 20, color: DS.textPrimary, flexShrink: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 2 },
  dotGreen: { backgroundColor: DS.green },
  dotRed: { backgroundColor: "#EF4444" },
  tipoLabel: { fontFamily: "Montserrat-SemiBold", fontSize: 12, color: DS.accent, letterSpacing: 1.5, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  locationText: { fontFamily: "Montserrat-Regular", fontSize: 12, color: DS.textSecondary, flex: 1 },

  // Stats
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: DS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DS.border,
    paddingVertical: 16,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontFamily: "Montserrat-Bold", fontSize: 22, color: DS.textPrimary },
  statLabel: { fontFamily: "Montserrat-SemiBold", fontSize: 9, color: DS.textSecondary, letterSpacing: 1.2, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: DS.border },

  // Bio
  bioText: { fontFamily: "Montserrat-Regular", fontSize: 13, color: DS.textSecondary, lineHeight: 20 },

  // Section header
  sectionTitle: { fontFamily: "Montserrat-Bold", fontSize: 16, color: DS.textPrimary, marginBottom: 12 },


  // Chips
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontFamily: "Montserrat-SemiBold", fontSize: 12 },

  // Photos
  photosGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  photoThumb: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 10,
    backgroundColor: DS.surface,
  },

  // Horários
  horariosCard: {
    backgroundColor: DS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DS.border,
    overflow: "hidden",
  },
  horarioRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  horarioRowBorder: { borderTopWidth: 1, borderTopColor: DS.border },
  horarioRowDestaque: { backgroundColor: DS.accent + "18" },
  horarioDia: { fontFamily: "Montserrat-SemiBold", fontSize: 13, color: DS.textSecondary },
  horarioHora: { fontFamily: "Montserrat-Bold", fontSize: 13, color: DS.textPrimary },
  horarioFechado: { fontFamily: "Montserrat-Regular", fontSize: 13, color: DS.textMuted },
  horarioDestaqueText: { color: DS.textPrimary },

  // Switch profile
  switchProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: DS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DS.cyan + "40",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  switchProfileText: {
    flex: 1,
    fontFamily: "Montserrat-SemiBold",
    fontSize: 14,
    color: DS.cyan,
  },
});
