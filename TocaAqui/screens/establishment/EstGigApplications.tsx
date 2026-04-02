import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { establishmentService, Candidatura } from "@/http/establishmentService";

const DS = { bg:"#09090F", surface:"#161028", card:"#1E1635", border:"#2D2545", accent:"#7B61FF", cyan:"#00CEC9", textPrimary:"#FFFFFF", textSecondary:"#8888AA" };
type NavProp = NativeStackNavigationProp<EstStackParamList>;
type RoutePropType = RouteProp<EstStackParamList, "EstGigApplications">;
type TabType = "todas" | "pendente" | "favoritas";

export default function EstGigApplications() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { gigId, gigTitle } = route.params;

  const [tab, setTab] = useState<TabType>("todas");
  const [candidates, setCandidates] = useState<Candidatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await establishmentService.getGigApplications(gigId);
      setCandidates(data);
    } catch { Alert.alert("Erro", "Não foi possível carregar as candidaturas."); }
    finally { setLoading(false); setRefreshing(false); }
  }, [gigId]);

  useEffect(() => { load(); }, [load]);

  const filtered = candidates.filter(c => {
    if (tab === "pendente") return c.status === "pendente";
    if (tab === "favoritas") return c.favorited;
    return true;
  });

  const renderItem = ({ item }: { item: Candidatura }) => (
    <View style={s.card}>
      <View style={s.cardTop}>
        <View style={s.avatar}><FontAwesome5 name="user" size={20} color={DS.accent} /></View>
        <View style={{flex:1,marginLeft:12}}>
          <Text style={s.name}>{item.nome_artista ?? `Artista #${item.artista_id ?? item.banda_id}`}</Text>
          {item.genero && <View style={s.genreBadge}><Text style={s.genreBadgeText}>{item.genero.toUpperCase()}</Text></View>}
          <View style={s.meta}>
            {item.nota_media != null && <Text style={s.rating}>★ {item.nota_media.toFixed(1)}</Text>}
            {item.shows_realizados != null && <Text style={s.metaText}>· {item.shows_realizados} shows</Text>}
          </View>
        </View>
        <View>
          <FontAwesome5 name="heart" size={16} color={item.favorited ? DS.accent : DS.border} />
        </View>
      </View>
      {item.mensagem && <Text style={s.message} numberOfLines={2}>{item.mensagem}</Text>}
      <Text style={s.valorLine}>
        Proposta: {item.valor_proposto != null
          ? `R$ ${Number(item.valor_proposto).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
          : "A combinar"}
      </Text>
      <View style={s.actions}>
        <TouchableOpacity style={s.viewBtn} onPress={() => navigation.navigate("EstArtistProfile", { artistId: item.artista_id ?? item.banda_id ?? 0 })} activeOpacity={0.8}>
          <Text style={s.viewBtnText}>VER PERFIL</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.acceptBtn} onPress={() => navigation.navigate("EstAcceptContract", { applicationId: item.id, artistId: item.artista_id ?? item.banda_id, artistName: item.nome_artista ?? "Artista", gigTitle, valorProposto: item.valor_proposto })} activeOpacity={0.8}>
          <Text style={s.acceptBtnText}>ACEITAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{top:10,bottom:10,left:10,right:10}}>
          <FontAwesome5 name="arrow-left" size={18} color={DS.textPrimary} />
        </TouchableOpacity>
        <View style={{flex:1,marginLeft:12}}>
          <Text style={s.title} numberOfLines={1}>{gigTitle}</Text>
        </View>
        <FontAwesome5 name="bell" size={18} color={DS.textSecondary} />
      </View>

      <View style={s.tabs}>
        {(["todas","pendente","favoritas"] as TabType[]).map(t => (
          <TouchableOpacity key={t} style={[s.tabBtn, tab===t && s.tabBtnOn]} onPress={() => setTab(t)} activeOpacity={0.7}>
            <Text style={[s.tabText, tab===t && s.tabTextOn]}>{t === "pendente" ? "Não avaliadas" : t.charAt(0).toUpperCase()+t.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading
        ? <View style={{flex:1,justifyContent:"center",alignItems:"center"}}><ActivityIndicator size="large" color="#A78BFA" /></View>
        : <FlatList
            data={filtered}
            keyExtractor={i => String(i.id)}
            renderItem={renderItem}
            contentContainerStyle={s.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={DS.accent} />}
            ListEmptyComponent={<Text style={s.empty}>Nenhuma candidatura encontrada.</Text>}
          />
      }
    </View>
  );
}

const s = StyleSheet.create({
  root:{flex:1,backgroundColor:DS.bg},
  header:{flexDirection:"row",alignItems:"center",paddingHorizontal:20,paddingTop:52,paddingBottom:16},
  title:{fontFamily:"Montserrat-Bold",fontSize:18,color:DS.textPrimary},
  tabs:{flexDirection:"row",paddingHorizontal:20,gap:8,marginBottom:16},
  tabBtn:{paddingHorizontal:14,paddingVertical:8,borderRadius:20,borderWidth:1,borderColor:DS.border},
  tabBtnOn:{backgroundColor:DS.accent,borderColor:DS.accent},
  tabText:{fontFamily:"Montserrat-SemiBold",fontSize:12,color:DS.textSecondary},
  tabTextOn:{color:DS.textPrimary},
  list:{paddingHorizontal:20,paddingBottom:40},
  card:{backgroundColor:DS.card,borderRadius:14,borderWidth:1,borderColor:DS.border,padding:16,marginBottom:12},
  cardTop:{flexDirection:"row",alignItems:"center"},
  avatar:{width:52,height:52,borderRadius:26,backgroundColor:DS.surface,justifyContent:"center",alignItems:"center"},
  name:{fontFamily:"Montserrat-Bold",fontSize:15,color:DS.textPrimary,marginBottom:4},
  genreBadge:{backgroundColor:"rgba(123,97,255,0.2)",paddingHorizontal:8,paddingVertical:2,borderRadius:6,alignSelf:"flex-start",marginBottom:4},
  genreBadgeText:{fontFamily:"Montserrat-Bold",fontSize:9,color:DS.accent,letterSpacing:1},
  meta:{flexDirection:"row",alignItems:"center",gap:4},
  rating:{fontFamily:"Montserrat-SemiBold",fontSize:12,color:"#F39C12"},
  metaText:{fontFamily:"Montserrat-Regular",fontSize:12,color:DS.textSecondary},
  message:{fontFamily:"Montserrat-Regular",fontSize:13,color:DS.textSecondary,marginTop:10,lineHeight:20,borderTopWidth:1,borderTopColor:DS.border,paddingTop:10},
  valorLine:{fontFamily:"Montserrat-SemiBold",fontSize:13,color:DS.cyan,marginTop:8,paddingTop:8,borderTopWidth:1,borderTopColor:DS.border},
  actions:{flexDirection:"row",gap:10,marginTop:12},
  viewBtn:{flex:1,borderWidth:1,borderColor:DS.accent,borderRadius:10,paddingVertical:10,alignItems:"center"},
  viewBtnText:{fontFamily:"Montserrat-Bold",fontSize:12,color:DS.accent},
  acceptBtn:{flex:1,backgroundColor:DS.accent,borderRadius:10,paddingVertical:10,alignItems:"center"},
  acceptBtnText:{fontFamily:"Montserrat-Bold",fontSize:12,color:DS.textPrimary},
  empty:{fontFamily:"Montserrat-Regular",fontSize:14,color:DS.textSecondary,textAlign:"center",paddingTop:40},
});
