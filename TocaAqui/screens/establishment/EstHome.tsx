import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { establishmentService, Gig, ArtistPublicProfile } from "@/http/establishmentService";
import { useAuth } from "@/contexts/AuthContext";

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
  const [contracts, setContracts] = useState<any[]>([]);
  const [artists, setArtists] = useState<ArtistPublicProfile[]>([]);
  const [profile, setProfile] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const storedId = await AsyncStorage.getItem("estabelecimentoId");
      const estId = storedId ? Number(storedId) : undefined;
      const [g, c, a, p] = await Promise.allSettled([
        establishmentService.getMyGigs(estId),
        establishmentService.getMyContracts(),
        establishmentService.searchArtists(),
        establishmentService.getMyEstablishmentProfile(),
      ]);
      if (g.status === "fulfilled") setGigs(g.value);
      if (c.status === "fulfilled") setContracts(c.value);
      if (a.status === "fulfilled") setArtists(a.value.slice(0,5));
      if (p.status === "fulfilled") setProfile(p.value);
    } catch (e) {
      Alert.alert("Erro", "Não foi possível carregar os dados.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const abertas = gigs.filter(g => g.status === "aberta" || g.status === "pendente").length;
  const candidaturas = gigs.reduce((acc, g) => acc + (g.candidaturas_count || 0), 0);
  const showsMes = contracts.filter(c => c.status === "aceito").length;
  const nota = profile?.nota_media ?? 0;
  const proximos = contracts.filter(c => c.status === "aceito").slice(0,3);

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
          <TouchableOpacity><Text style={s.sectionLink}>VER TODOS</Text></TouchableOpacity>
        </View>
        {proximos.length === 0
          ? <Text style={s.emptyText}>Nenhum show confirmado.</Text>
          : proximos.map(c => {
              const { dia, mes } = formatDate(c.data_show || "");
              return (
                <TouchableOpacity key={c.id} style={s.showCard} onPress={() => navigation.navigate("EstShowDetail", { contractId: c.id })} activeOpacity={0.8}>
                  <View style={s.dateBadge}><Text style={s.dateDay}>{dia}</Text><Text style={s.dateMes}>{mes}</Text></View>
                  <View style={{flex:1}}>
                    <Text style={s.showTitle}>{c.nome_evento ?? "Show"}</Text>
                    <Text style={s.showSub}>{c.horario_inicio ?? "--:--"} · {c.nome_estabelecimento ?? "Local"}</Text>
                  </View>
                  <FontAwesome5 name="chevron-right" size={12} color={DS.textSecondary} />
                </TouchableOpacity>
              );
            })
        }

        {/* Artistas recomendados */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Artistas Recomendados</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:12,paddingBottom:8}}>
          {artists.map(a => (
            <TouchableOpacity key={a.id} style={s.artistCard} onPress={() => navigation.navigate("EstArtistProfile", { artistId: a.id })} activeOpacity={0.8}>
              <View style={s.artistAvatar}><FontAwesome5 name="user" size={22} color={DS.accent} /></View>
              {a.generos && a.generos[0] && <View style={s.genreTag}><Text style={s.genreTagText}>{a.generos[0].toUpperCase()}</Text></View>}
              <Text style={s.artistName}>{a.nome_artistico ?? a.nome ?? "Artista"}</Text>
              <Text style={s.artistRating}>★ {a.nota_media?.toFixed(1) ?? "—"}</Text>
              <View style={s.artistBtn}><Text style={s.artistBtnText}>VER PERFIL</Text></View>
            </TouchableOpacity>
          ))}
          {artists.length === 0 && <Text style={[s.emptyText,{paddingLeft:4}]}>Nenhum artista encontrado.</Text>}
        </ScrollView>
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
  showCard: { flexDirection:"row", alignItems:"center", backgroundColor:DS.card, borderRadius:12, borderWidth:1, borderColor:DS.border, padding:14, marginBottom:8, gap:12 },
  dateBadge: { width:44, height:44, backgroundColor:DS.surface, borderRadius:10, justifyContent:"center", alignItems:"center" },
  dateDay: { fontFamily:"Montserrat-Bold", fontSize:16, color:DS.textPrimary },
  dateMes: { fontFamily:"Montserrat-SemiBold", fontSize:10, color:DS.textSecondary },
  showTitle: { fontFamily:"Montserrat-SemiBold", fontSize:14, color:DS.textPrimary },
  showSub: { fontFamily:"Montserrat-Regular", fontSize:12, color:DS.textSecondary, marginTop:2 },
  emptyText: { fontFamily:"Montserrat-Regular", fontSize:13, color:DS.textSecondary, marginBottom:16 },
  artistCard: { width:150, backgroundColor:DS.card, borderRadius:14, borderWidth:1, borderColor:DS.border, padding:12, alignItems:"center" },
  artistAvatar: { width:64, height:64, borderRadius:32, backgroundColor:DS.surface, justifyContent:"center", alignItems:"center", marginBottom:8 },
  genreTag: { backgroundColor:"rgba(123,97,255,0.2)", paddingHorizontal:8, paddingVertical:3, borderRadius:8, marginBottom:6 },
  genreTagText: { fontFamily:"Montserrat-Bold", fontSize:9, color:DS.accent, letterSpacing:1 },
  artistName: { fontFamily:"Montserrat-Bold", fontSize:13, color:DS.textPrimary, textAlign:"center", marginBottom:4 },
  artistRating: { fontFamily:"Montserrat-SemiBold", fontSize:12, color:"#F39C12", marginBottom:8 },
  artistBtn: { backgroundColor:DS.accent, borderRadius:8, paddingHorizontal:12, paddingVertical:6 },
  artistBtnText: { fontFamily:"Montserrat-Bold", fontSize:10, color:DS.textPrimary, letterSpacing:1 },
});
