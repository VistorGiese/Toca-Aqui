import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { establishmentService, ArtistPublicProfile } from "@/http/establishmentService";
import { getGenreColor } from "@/utils/colors";

const DS = { bg:"#09090F", surface:"#161028", card:"#1E1635", border:"#2D2545", accent:"#7B61FF", cyan:"#00CEC9", textPrimary:"#FFFFFF", textSecondary:"#8888AA" };
const GENEROS_FILTRO = ["Tudo","Sertanejo","Rock","Eletrônica","MPB","Jazz","Pop"];
type NavProp = NativeStackNavigationProp<EstStackParamList>;

export default function EstSearch() {
  const navigation = useNavigation<NavProp>();
  const [query, setQuery] = useState("");
  const [genero, setGenero] = useState("Tudo");
  const [artists, setArtists] = useState<ArtistPublicProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async () => {
    setLoading(true);
    try {
      const data = await establishmentService.searchArtists({
        q: query || undefined,
        genero: genero !== "Tudo" ? genero : undefined,
      });
      setArtists(data);
    } catch { Alert.alert("Erro","Não foi possível buscar artistas."); }
    finally { setLoading(false); }
  }, [query, genero]);

  useEffect(() => {
    const t = setTimeout(() => { search(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const renderItem = ({ item }: { item: ArtistPublicProfile }) => {
    const g = item.generos?.[0] ?? "";
    const color = getGenreColor(g.toUpperCase());
    return (
      <View style={s.card}>
        <View style={s.cardTop}>
          <View style={s.artistImg}><FontAwesome5 name="user" size={28} color={DS.accent} /></View>
          {g && <View style={[s.genreBadge,{backgroundColor:color+"22",borderColor:color}]}><Text style={[s.genreBadgeText,{color}]}>{g.toUpperCase()}</Text></View>}
        </View>
        <Text style={s.artistName}>{item.nome_artistico ?? item.nome ?? "Artista"}</Text>
        <Text style={s.artistType}>{item.tipo ?? "Solo Artist"}</Text>
        <View style={s.cacheRow}>
          <Text style={s.cacheLabel}>CACHÊ MÉDIO</Text>
          <Text style={s.cacheValue}>{item.cache_medio ? `R$ ${item.cache_medio.toFixed(2).replace(".",",")}` : "—"}</Text>
        </View>
        <View style={s.ratingRow}>
          <FontAwesome5 name="star" size={12} color="#F39C12" solid />
          <Text style={s.ratingText}>{item.nota_media?.toFixed(1) ?? "—"}</Text>
        </View>
        <TouchableOpacity style={s.inviteBtn} onPress={() => navigation.navigate("EstArtistProfile",{artistId:item.id})} activeOpacity={0.85}>
          <Text style={s.inviteBtnText}>CONVIDAR PARA SHOW</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={s.root}>
      <View style={s.header}>
        <View style={s.avatarSmall}><FontAwesome5 name="store" size={14} color={DS.accent} /></View>
        <Text style={s.headerName}>Sonic Editorial</Text>
        <FontAwesome5 name="bell" size={20} color={DS.textSecondary} />
      </View>

      <View style={s.searchBox}>
        <FontAwesome5 name="search" size={14} color={DS.textSecondary} style={{marginRight:10}} />
        <TextInput
          style={s.searchInput} placeholder="Buscar bandas, DJs ou solistas…"
          placeholderTextColor={DS.textSecondary} value={query} onChangeText={setQuery}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")} hitSlop={{top:8,bottom:8,left:8,right:8}}>
            <FontAwesome5 name="times" size={14} color={DS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={s.filtrosRow}>
        {GENEROS_FILTRO.map(g => (
          <TouchableOpacity key={g} style={[s.filtroChip, genero===g && s.filtroChipOn]} onPress={() => setGenero(g)} activeOpacity={0.7}>
            <Text style={[s.filtroText, genero===g && s.filtroTextOn]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading
        ? <View style={{flex:1,justifyContent:"center",alignItems:"center"}}><ActivityIndicator size="large" color={DS.accent} /></View>
        : <FlatList
            data={artists}
            keyExtractor={i => String(i.id)}
            renderItem={renderItem}
            contentContainerStyle={s.list}
            ListEmptyComponent={<Text style={s.empty}>Nenhum artista encontrado.</Text>}
          />
      }
    </View>
  );
}

const s = StyleSheet.create({
  root:{flex:1,backgroundColor:DS.bg},
  header:{flexDirection:"row",alignItems:"center",paddingHorizontal:20,paddingTop:52,marginBottom:16},
  avatarSmall:{width:32,height:32,borderRadius:16,backgroundColor:DS.card,justifyContent:"center",alignItems:"center",marginRight:8},
  headerName:{flex:1,fontFamily:"Montserrat-SemiBold",fontSize:15,color:DS.accent},
  searchBox:{flexDirection:"row",alignItems:"center",backgroundColor:DS.surface,borderRadius:12,borderWidth:1,borderColor:DS.border,paddingHorizontal:14,paddingVertical:12,marginHorizontal:20,marginBottom:12},
  searchInput:{flex:1,color:DS.textPrimary,fontFamily:"Montserrat-Regular",fontSize:14},
  filtrosRow:{flexDirection:"row",paddingHorizontal:20,gap:8,marginBottom:16},
  filtroChip:{paddingHorizontal:14,paddingVertical:7,borderRadius:16,borderWidth:1,borderColor:DS.border,backgroundColor:DS.card},
  filtroChipOn:{backgroundColor:DS.accent,borderColor:DS.accent},
  filtroText:{fontFamily:"Montserrat-SemiBold",fontSize:12,color:DS.textSecondary},
  filtroTextOn:{color:DS.textPrimary},
  list:{paddingHorizontal:20,paddingBottom:40},
  card:{backgroundColor:DS.card,borderRadius:14,borderWidth:1,borderColor:DS.border,padding:16,marginBottom:12},
  cardTop:{flexDirection:"row",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10},
  artistImg:{width:72,height:72,borderRadius:36,backgroundColor:DS.surface,justifyContent:"center",alignItems:"center"},
  genreBadge:{borderWidth:1,borderRadius:8,paddingHorizontal:10,paddingVertical:4},
  genreBadgeText:{fontFamily:"Montserrat-Bold",fontSize:10,letterSpacing:1},
  artistName:{fontFamily:"Montserrat-Bold",fontSize:17,color:DS.textPrimary,marginBottom:2},
  artistType:{fontFamily:"Montserrat-Regular",fontSize:12,color:DS.textSecondary,marginBottom:10},
  cacheRow:{flexDirection:"row",justifyContent:"space-between",marginBottom:6},
  cacheLabel:{fontFamily:"Montserrat-SemiBold",fontSize:11,color:DS.textSecondary,letterSpacing:1},
  cacheValue:{fontFamily:"Montserrat-Bold",fontSize:14,color:DS.cyan},
  ratingRow:{flexDirection:"row",alignItems:"center",gap:5,marginBottom:12},
  ratingText:{fontFamily:"Montserrat-SemiBold",fontSize:13,color:"#F39C12"},
  inviteBtn:{backgroundColor:DS.accent,borderRadius:10,paddingVertical:12,alignItems:"center"},
  inviteBtnText:{fontFamily:"Montserrat-Bold",fontSize:12,color:DS.textPrimary,letterSpacing:1},
  empty:{fontFamily:"Montserrat-Regular",fontSize:14,color:DS.textSecondary,textAlign:"center",paddingTop:40},
});
