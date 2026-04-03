import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { establishmentService, Gig } from "@/http/establishmentService";
import { getGenreColor } from "@/utils/colors";

const DS = { bg:"#09090F", surface:"#161028", card:"#1E1635", border:"#2D2545", accent:"#7B61FF", cyan:"#00CEC9", textPrimary:"#FFFFFF", textSecondary:"#8888AA", error:"#E74C3C" };
type NavProp = NativeStackNavigationProp<EstStackParamList>;
type Tab = "abertas" | "encerradas" | "rascunhos";

function formatBRL(v?: number | string) {
  if (v == null) return "—";
  const n = Number(v);
  if (isNaN(n)) return "—";
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}
function formatDate(d: string) {
  try { return new Date(d).toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric"}); }
  catch { return d; }
}

export default function EstGigs() {
  const navigation = useNavigation<NavProp>();
  const [tab, setTab] = useState<Tab>("abertas");
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const estIdStr = await AsyncStorage.getItem("estabelecimentoId");
      const estId = estIdStr ? Number(estIdStr) : undefined;
      const data = await establishmentService.getMyGigs(estId);
      setGigs(data);
    } catch { Alert.alert("Erro", "Não foi possível carregar as vagas."); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = gigs.filter(g => {
    if (tab === "abertas") return g.status === "aberta" || g.status === "pendente";
    if (tab === "encerradas") return g.status === "encerrada" || g.status === "realizado" || g.status === "cancelado";
    return g.status === "rascunho";
  });

  const handleDelete = (id: number) => {
    Alert.alert("Excluir vaga", "Tem certeza?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: async () => {
        try { await establishmentService.deleteGig(id); load(); }
        catch { Alert.alert("Erro", "Não foi possível excluir."); }
      }},
    ]);
  };

  const renderGig = ({ item }: { item: Gig }) => {
    const generoRaw = item.generos_musicais ?? item.genero_musical ?? "";
    const genero = generoRaw.split(",")[0]?.trim().toUpperCase() || "SHOW";
    const color = getGenreColor(genero);
    return (
      <TouchableOpacity style={s.card} onPress={() => navigation.navigate("EstGigApplications", { gigId: item.id, gigTitle: item.titulo_evento })} activeOpacity={0.8}>
        <View style={s.cardTop}>
          <View style={[s.genreBadge, { borderColor: color }]}><Text style={[s.genreBadgeText, { color }]}>{genero}</Text></View>
          <TouchableOpacity onPress={() => Alert.alert("Opções", "O que deseja fazer?", [
            { text: "Editar", onPress: () => navigation.navigate("EstNewGig", { gigId: item.id }) },
            { text: "Excluir", style: "destructive", onPress: () => handleDelete(item.id) },
            { text: "Cancelar", style: "cancel" },
          ])} hitSlop={{top:8,bottom:8,left:8,right:8}}>
            <FontAwesome5 name="ellipsis-v" size={16} color={DS.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text style={s.cardTitle}>{item.titulo_evento}</Text>
        <View style={s.cardMeta}>
          <FontAwesome5 name="calendar" size={11} color={DS.textSecondary} />
          <Text style={s.cardMetaText}>{formatDate(item.data_show)}</Text>
        </View>
        <View style={s.cardMeta}>
          <FontAwesome5 name="dollar-sign" size={11} color={DS.cyan} />
          <Text style={[s.cardMetaText,{color:DS.cyan}]}>{formatBRL(item.cache_minimo ?? item.preco_ingresso_inteira)}{item.cache_maximo ? ` - ${formatBRL(item.cache_maximo)}` : ""}</Text>
        </View>
        {(item.candidaturas_count ?? 0) > 0 && (
          <View style={s.badge}><FontAwesome5 name="users" size={10} color={DS.textSecondary} style={{marginRight:6}} /><Text style={s.badgeText}>{item.candidaturas_count} candidaturas</Text></View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.root}>
      <View style={s.header}>
        <View style={s.avatarSmall}><FontAwesome5 name="store" size={14} color={DS.accent} /></View>
        <Text style={s.headerName}>Sonic Editorial</Text>
        <TouchableOpacity hitSlop={{top:10,bottom:10,left:10,right:10}}><FontAwesome5 name="bell" size={20} color={DS.textSecondary} /></TouchableOpacity>
      </View>
      <Text style={s.title}>Minhas Vagas</Text>

      <View style={s.tabs}>
        {(["abertas","encerradas","rascunhos"] as Tab[]).map(t => (
          <TouchableOpacity key={t} style={[s.tabBtn, tab===t && s.tabBtnOn]} onPress={() => setTab(t)} activeOpacity={0.7}>
            <Text style={[s.tabBtnText, tab===t && s.tabBtnTextOn]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading
        ? <View style={{flex:1,justifyContent:"center",alignItems:"center"}}><ActivityIndicator size="large" color={DS.accent} /></View>
        : <FlatList
            data={filtered}
            keyExtractor={i => String(i.id)}
            renderItem={renderGig}
            contentContainerStyle={s.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={DS.accent} />}
            ListEmptyComponent={<View style={s.empty}><FontAwesome5 name="inbox" size={32} color={DS.border} /><Text style={s.emptyText}>Criar nova oportunidade</Text></View>}
          />
      }

      <TouchableOpacity style={s.fab} onPress={() => navigation.navigate("EstNewGig", {})} activeOpacity={0.85}>
        <FontAwesome5 name="plus" size={20} color={DS.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root:{flex:1,backgroundColor:DS.bg},
  header:{flexDirection:"row",alignItems:"center",paddingHorizontal:20,paddingTop:52,marginBottom:16},
  avatarSmall:{width:32,height:32,borderRadius:16,backgroundColor:DS.card,justifyContent:"center",alignItems:"center",marginRight:8},
  headerName:{flex:1,fontFamily:"Montserrat-SemiBold",fontSize:15,color:DS.accent},
  title:{fontFamily:"Montserrat-Bold",fontSize:26,color:DS.textPrimary,paddingHorizontal:20,marginBottom:16},
  tabs:{flexDirection:"row",paddingHorizontal:20,gap:8,marginBottom:16},
  tabBtn:{paddingHorizontal:16,paddingVertical:8,borderRadius:20,borderWidth:1,borderColor:DS.border},
  tabBtnOn:{backgroundColor:DS.accent,borderColor:DS.accent},
  tabBtnText:{fontFamily:"Montserrat-Bold",fontSize:11,color:DS.textSecondary,letterSpacing:1},
  tabBtnTextOn:{color:DS.textPrimary},
  list:{paddingHorizontal:20,paddingBottom:100},
  card:{backgroundColor:DS.card,borderRadius:14,borderWidth:1,borderColor:DS.border,padding:16,marginBottom:12},
  cardTop:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:10},
  genreBadge:{borderWidth:1,borderRadius:8,paddingHorizontal:10,paddingVertical:3},
  genreBadgeText:{fontFamily:"Montserrat-Bold",fontSize:10,letterSpacing:1},
  cardTitle:{fontFamily:"Montserrat-Bold",fontSize:16,color:DS.textPrimary,marginBottom:8},
  cardMeta:{flexDirection:"row",alignItems:"center",gap:6,marginBottom:4},
  cardMetaText:{fontFamily:"Montserrat-Regular",fontSize:13,color:DS.textSecondary},
  badge:{flexDirection:"row",alignItems:"center",backgroundColor:DS.surface,borderRadius:20,paddingHorizontal:12,paddingVertical:5,alignSelf:"flex-start",marginTop:6},
  badgeText:{fontFamily:"Montserrat-Regular",fontSize:12,color:DS.textSecondary},
  empty:{alignItems:"center",paddingTop:60,gap:12},
  emptyText:{fontFamily:"Montserrat-Regular",fontSize:14,color:DS.textSecondary},
  fab:{position:"absolute",bottom:88,right:20,width:56,height:56,borderRadius:28,backgroundColor:DS.accent,justifyContent:"center",alignItems:"center",elevation:4},
});
