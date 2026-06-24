import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { establishmentService, Gig, isGigAberta, confirmedGigToShow } from "@/http/establishmentService";
import { Show, showToDetailParams } from "@/http/showService";
import { getGenreColor } from "@/utils/colors";
import { parseGenres } from "@/utils/genres";
import { useAuth } from "@/contexts/AuthContext";
import { useRecommendedHome } from "@/hooks/useRecommendedHome";
import {
  RecommendedArtistsSection,
  RecommendedEstablishmentsSection,
} from "@/components/home";

const DS = { bg:"#09090F", surface:"#161028", card:"#1E1635", border:"#2D2545", accent:"#7B61FF", cyan:"#00CEC9", textPrimary:"#FFFFFF", textSecondary:"#8888AA", error:"#E74C3C", success:"#00C853" };

type NavProp = NativeStackNavigationProp<EstStackParamList>;

function formatDate(d: string) {
  try { const dt = new Date(d); return { dia: String(dt.getDate()).padStart(2,"0"), mes: dt.toLocaleString("pt-BR",{month:"short"}).toUpperCase() }; }
  catch { return { dia: "--", mes: "---" }; }
}

export default function EstHome() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [upcomingShows, setUpcomingShows] = useState<Show[]>([]);
  const [confirmedShowsCount, setConfirmedShowsCount] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const { artists, establishments, loading: loadingRecommended } = useRecommendedHome();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const storedId = await AsyncStorage.getItem("estabelecimentoId");
      const estId = storedId ? Number(storedId) : undefined;
      const [g, upcoming, p] = await Promise.allSettled([
        establishmentService.getMyGigs(estId),
        establishmentService.getUpcomingPublishedGigs(estId, 3),
        establishmentService.getMyEstablishmentProfile(),
      ]);
      if (g.status === "fulfilled") {
        setGigs(g.value);
        setConfirmedShowsCount(g.value.filter((item) => item.status === "aceito").length);
      }
      if (upcoming.status === "fulfilled" && p.status === "fulfilled") {
        setUpcomingShows(upcoming.value.map((gig) => confirmedGigToShow(gig, p.value)));
      } else if (upcoming.status === "fulfilled") {
        setUpcomingShows(upcoming.value.map((gig) => confirmedGigToShow(gig, null)));
      }
      if (p.status === "fulfilled") setProfile(p.value);
    } catch (e) {
      Alert.alert("Erro", "Não foi possível carregar os dados.");
    } finally { setLoading(false); }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const abertas = gigs.filter((g) => isGigAberta(g.status)).length;
  const candidaturas = gigs.reduce((acc, g) => acc + (g.candidaturas_count || 0), 0);
  const showsMes = confirmedShowsCount;
  const nota = profile?.nota_media ?? 0;

  const goToAllConfirmed = () => {
    navigation.navigate("EstAllConfirmedShows");
  };

  if (loading) return <View style={[s.root,{justifyContent:"center",alignItems:"center"}]}><ActivityIndicator size="large" color={DS.accent} /></View>;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.avatarSmall}><FontAwesome5 name="store" size={14} color={DS.accent} /></View>
          <Text style={s.headerName}>{profile?.nome_estabelecimento ?? "Toca Aqui"}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("EstNotifications")} hitSlop={{top:10,bottom:10,left:10,right:10}}>
            <FontAwesome5 name="bell" size={20} color={DS.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={s.greeting}>Olá, {user?.nome_completo?.split(" ")[0] ?? "Gestor"}!</Text>
        <Text style={s.greetingSub}>Sua agenda está movimentada esta semana.</Text>

        {/* Métricas */}
        <View style={s.metricsGrid}>
          {[
            { label:"VAGAS ABERTAS", value: abertas, color: DS.cyan },
            { label:"CANDIDATURAS", value: candidaturas, color: DS.accent },
            { label:"SHOWS/MÊS", value: showsMes, color: DS.error },
            { label:"NOTA GERAL", value: nota > 0 ? `${nota.toFixed(1)} ★` : "--", color: "#F39C12" },
          ].map(m => (
            <View key={m.label} style={s.metricCard}>
              <Text style={s.metricLabel}>{m.label}</Text>
              <Text style={[s.metricValue, { color: m.color }]}>{m.value}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={s.publishBtn} onPress={() => navigation.navigate("EstNewGig", {})} activeOpacity={0.85}>
          <FontAwesome5 name="plus" size={14} color={DS.textPrimary} style={{marginRight:8}} />
          <Text style={s.publishBtnText}>PUBLICAR NOVA VAGA</Text>
        </TouchableOpacity>

        {/* Próximos shows */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Próximos Shows</Text>
          <TouchableOpacity onPress={goToAllConfirmed} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={s.sectionLink}>VER TODOS</Text>
          </TouchableOpacity>
        </View>
        {upcomingShows.length === 0
          ? <Text style={s.emptyText}>Nenhum show confirmado.</Text>
          : upcomingShows.map((show) => {
              const { dia, mes } = formatDate(show.data_show);
              const generos = parseGenres(show.genero_musical);
              const genero = generos[0] ?? "SHOW";
              const genreColor = getGenreColor(genero);
              const horario = show.horario_inicio?.substring(0, 5) ?? "--:--";
              const detail = showToDetailParams(show);
              return (
                <TouchableOpacity
                  key={show.id}
                  style={[s.showCard, { borderLeftColor: genreColor }]}
                  onPress={() => navigation.navigate("EstUpcomingShowDetail", detail)}
                  activeOpacity={0.8}
                >
                  <View style={[s.dateBadge, { borderColor: genreColor + "55" }]}>
                    <Text style={s.dateDay}>{dia}</Text>
                    <Text style={[s.dateMes, { color: genreColor }]}>{mes}</Text>
                  </View>
                  <View style={s.showCardBody}>
                    <Text style={s.showTitle} numberOfLines={1}>{show.titulo_evento}</Text>
                    <Text style={s.showSub} numberOfLines={1}>
                      {show.EstablishmentProfile?.nome_estabelecimento
                        ? `${show.EstablishmentProfile.nome_estabelecimento} · `
                        : show.nome_artista
                          ? `${show.nome_artista} · `
                          : ""}
                      {horario}
                    </Text>
                    <View style={s.confirmedBadge}>
                      <FontAwesome5 name="check-circle" size={9} color={DS.success} />
                      <Text style={s.confirmedBadgeText}>Artista contratado</Text>
                    </View>
                    {generos.length > 0 && (
                      <View style={s.genreRow}>
                        {generos.map((genre) => {
                          const color = getGenreColor(genre);
                          return (
                            <View key={`${show.id}-${genre}`} style={[s.genreBadge, { borderColor: color }]}>
                              <Text style={[s.genreBadgeText, { color }]}>{genre}</Text>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                  <FontAwesome5 name="chevron-right" size={12} color={DS.textSecondary} />
                </TouchableOpacity>
              );
            })
        }

        <RecommendedArtistsSection
          artists={artists}
          loading={loadingRecommended}
          onPressArtist={(artist) =>
            navigation.navigate("EstArtistProfile", { artistId: artist.id, profile: artist })
          }
        />

        <RecommendedEstablishmentsSection
          establishments={establishments.filter((item) => item.id !== profile?.id)}
          loading={loadingRecommended}
          onPressEstablishment={(establishment) =>
            navigation.navigate("UserEstablishmentProfile", {
              establishmentId: establishment.id,
              canBuyTickets: false,
              viewerContext: "establishment",
            })
          }
        />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex:1, backgroundColor:DS.bg },
  scroll: { paddingTop:52, paddingHorizontal:20, paddingBottom:24 },
  header: { flexDirection:"row", alignItems:"center", marginBottom:20 },
  avatarSmall: { width:32, height:32, borderRadius:16, backgroundColor:DS.card, justifyContent:"center", alignItems:"center", marginRight:8 },
  headerName: { flex:1, fontFamily:"Montserrat-SemiBold", fontSize:15, color:DS.accent },
  greeting: { fontFamily:"Montserrat-Bold", fontSize:26, color:DS.textPrimary, marginBottom:4 },
  greetingSub: { fontFamily:"Montserrat-Regular", fontSize:13, color:DS.textSecondary, marginBottom:24 },
  metricsGrid: { flexDirection:"row", flexWrap:"wrap", gap:12, marginBottom:20 },
  metricCard: { flex:1, minWidth:"45%", backgroundColor:DS.card, borderRadius:12, borderWidth:1, borderColor:DS.border, padding:16 },
  metricLabel: { fontFamily:"Montserrat-SemiBold", fontSize:10, color:DS.textSecondary, letterSpacing:1.5, marginBottom:8 },
  metricValue: { fontFamily:"Montserrat-Bold", fontSize:28 },
  publishBtn: { backgroundColor:DS.accent, borderRadius:12, paddingVertical:14, flexDirection:"row", justifyContent:"center", alignItems:"center", marginBottom:28 },
  publishBtnText: { fontFamily:"Montserrat-Bold", fontSize:13, color:DS.textPrimary, letterSpacing:1 },
  sectionHeader: { flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:12 },
  sectionTitle: { fontFamily:"Montserrat-Bold", fontSize:17, color:DS.textPrimary },
  sectionLink: { fontFamily:"Montserrat-SemiBold", fontSize:12, color:DS.accent },
  showCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DS.border,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  showCardBody: { flex: 1 },
  dateBadge: {
    width: 48,
    height: 52,
    backgroundColor: DS.surface,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dateDay: { fontFamily: "Montserrat-Bold", fontSize: 18, color: DS.textPrimary, lineHeight: 20 },
  dateMes: { fontFamily: "Montserrat-SemiBold", fontSize: 10, marginTop: 2 },
  showTitle: { fontFamily: "Montserrat-Bold", fontSize: 15, color: DS.textPrimary },
  showSub: { fontFamily: "Montserrat-Regular", fontSize: 12, color: DS.textSecondary, marginTop: 3 },
  confirmedBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: "rgba(0,200,83,0.12)",
    borderWidth: 1,
    borderColor: "rgba(0,200,83,0.25)",
  },
  confirmedBadgeText: { fontFamily: "Montserrat-SemiBold", fontSize: 10, color: DS.success },
  genreRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  genreBadge: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  genreBadgeText: { fontFamily: "Montserrat-Bold", fontSize: 9, letterSpacing: 0.5 },
  emptyText: { fontFamily:"Montserrat-Regular", fontSize:13, color:DS.textSecondary, marginBottom:16 },
});
