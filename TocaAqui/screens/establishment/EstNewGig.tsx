import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { establishmentService } from "@/http/establishmentService";
import { getGenreColor } from "@/utils/colors";

const DS = { bg:"#09090F", surface:"#161028", card:"#1E1635", border:"#2D2545", accent:"#7B61FF", cyan:"#00CEC9", textPrimary:"#FFFFFF", textSecondary:"#8888AA" };
const GENEROS = ["Eletrônica","Rock","Pop","Sertanejo","Indie","Jazz","MPB","Blues"];
type NavProp = NativeStackNavigationProp<EstStackParamList>;
type RoutePropType = RouteProp<EstStackParamList, "EstNewGig">;

export default function EstNewGig() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const gigId = route.params?.gigId;

  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [cacheMin, setCacheMin] = useState("");
  const [cacheMax, setCacheMax] = useState("");
  const [generos, setGeneros] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadGig = useCallback(async () => {
    if (!gigId) return;
    setLoading(true);
    try {
      const g = await establishmentService.getGigById(gigId);
      setTitulo(g.titulo_evento); setData(g.data_show);
      setInicio(g.horario_inicio); setFim(g.horario_fim);
      if (g.cache_minimo) setCacheMin(String(g.cache_minimo));
      if (g.cache_maximo) setCacheMax(String(g.cache_maximo));
      if (g.generos_musicais) setGeneros(g.generos_musicais.split(",").map(s => s.trim()));
    } catch { Alert.alert("Erro","Não foi possível carregar a vaga."); }
    finally { setLoading(false); }
  }, [gigId]);

  useEffect(() => { loadGig(); }, [loadGig]);

  const toggleGenero = (g: string) => setGeneros(prev => prev.includes(g) ? prev.filter(x => x!==g) : [...prev,g]);

  const handlePublicar = async () => {
    if (!titulo.trim()) { Alert.alert("Atenção","Informe o título do evento."); return; }
    if (!data.trim() || !inicio.trim() || !fim.trim()) { Alert.alert("Atenção","Preencha data e horários."); return; }
    setSaving(true);
    try {
      const payload = {
        titulo_evento: titulo, data_show: data,
        horario_inicio: inicio, horario_fim: fim,
        cache_minimo: cacheMin ? Number(cacheMin) : undefined,
        cache_maximo: cacheMax ? Number(cacheMax) : undefined,
        generos_musicais: generos.join(", ") || undefined,
      };
      if (gigId) await establishmentService.updateGig(gigId, payload);
      else await establishmentService.createGig(payload);
      Alert.alert("Sucesso", gigId ? "Vaga atualizada!" : "Vaga publicada!");
      navigation.goBack();
    } catch (e:any) {
      Alert.alert("Erro", e?.response?.data?.message || "Não foi possível salvar a vaga.");
    } finally { setSaving(false); }
  };

  if (loading) return <View style={[s.root,{justifyContent:"center",alignItems:"center"}]}><ActivityIndicator size="large" color={DS.accent} /></View>;

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View>
            <Text style={s.title}>Nova Vaga</Text>
            <Text style={s.subtitle}>Crie uma nova oportunidade para artistas</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.cancelBtn}>CANCELAR</Text></TouchableOpacity>
        </View>

        <Text style={s.fieldLabel}>TÍTULO DO EVENTO</Text>
        <TextInput style={s.input} placeholder="Ex: Festival de Inverno 2024" placeholderTextColor={DS.border} value={titulo} onChangeText={setTitulo} />

        <Text style={s.fieldLabel}>DATA</Text>
        <TextInput style={s.input} placeholder="dd/mm/aaaa" placeholderTextColor={DS.border} value={data} onChangeText={setData} />

        <View style={s.row}>
          <View style={{flex:1}}>
            <Text style={s.fieldLabel}>INÍCIO</Text>
            <TextInput style={s.input} placeholder="--:--" placeholderTextColor={DS.border} value={inicio} onChangeText={setInicio} />
          </View>
          <View style={{flex:1}}>
            <Text style={s.fieldLabel}>FIM</Text>
            <TextInput style={s.input} placeholder="--:--" placeholderTextColor={DS.border} value={fim} onChangeText={setFim} />
          </View>
        </View>

        <View style={s.cacheCard}>
          <Text style={s.cacheLabel}>RANGE DE CACHÊ</Text>
          <View style={s.row}>
            <View style={{flex:1}}>
              <Text style={s.fieldLabel}>MÍN (R$)</Text>
              <TextInput style={s.input} placeholder="500" placeholderTextColor={DS.border} value={cacheMin} onChangeText={setCacheMin} keyboardType="numeric" />
            </View>
            <View style={{flex:1}}>
              <Text style={s.fieldLabel}>MÁX (R$)</Text>
              <TextInput style={s.input} placeholder="2500" placeholderTextColor={DS.border} value={cacheMax} onChangeText={setCacheMax} keyboardType="numeric" />
            </View>
          </View>
          {(cacheMin || cacheMax) && (
            <Text style={s.cacheRange}>R$ {cacheMin||"0"} — R$ {cacheMax||"0"}</Text>
          )}
        </View>

        <Text style={s.fieldLabel}>GÊNEROS MUSICAIS</Text>
        <View style={s.chipRow}>
          {GENEROS.map(g => {
            const active = generos.includes(g);
            const color = getGenreColor(g.toUpperCase());
            return (
              <TouchableOpacity key={g} style={[s.chip,{borderColor:color},active&&{backgroundColor:color+"33"}]} onPress={() => toggleGenero(g)} activeOpacity={0.7}>
                <Text style={[s.chipText,{color}]}>{g}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={s.infoCard}>
          <FontAwesome5 name="rocket" size={16} color={DS.accent} style={{marginRight:12}} />
          <Text style={s.infoText}>Com base no seu perfil e filtros selecionados, esta vaga será notificada para artistas qualificados na sua região.</Text>
        </View>

        <TouchableOpacity style={[s.publishBtn, saving && {opacity:0.6}]} onPress={handlePublicar} disabled={saving} activeOpacity={0.85}>
          {saving ? <ActivityIndicator color={DS.textPrimary} size="small" /> : <Text style={s.publishBtnText}>{gigId ? "SALVAR ALTERAÇÕES" : "PUBLICAR VAGA ▶"}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{flex:1,backgroundColor:DS.bg},
  scroll:{paddingHorizontal:20,paddingTop:52,paddingBottom:40},
  header:{flexDirection:"row",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28},
  title:{fontFamily:"Montserrat-Bold",fontSize:26,color:DS.textPrimary},
  subtitle:{fontFamily:"Montserrat-Regular",fontSize:13,color:DS.textSecondary,marginTop:4},
  cancelBtn:{fontFamily:"Montserrat-SemiBold",fontSize:13,color:DS.textSecondary,paddingTop:6},
  fieldLabel:{fontFamily:"Montserrat-SemiBold",fontSize:11,color:DS.textSecondary,letterSpacing:2,marginBottom:8,marginTop:16},
  input:{backgroundColor:DS.surface,borderRadius:10,paddingHorizontal:16,paddingVertical:14,color:DS.textPrimary,fontFamily:"Montserrat-Regular",fontSize:14,borderWidth:1,borderColor:DS.border},
  row:{flexDirection:"row",gap:12},
  cacheCard:{backgroundColor:DS.card,borderRadius:12,borderWidth:1,borderColor:DS.border,padding:16,marginTop:16},
  cacheLabel:{fontFamily:"Montserrat-SemiBold",fontSize:11,color:DS.cyan,letterSpacing:2,marginBottom:12},
  cacheRange:{fontFamily:"Montserrat-Bold",fontSize:18,color:DS.cyan,textAlign:"center",marginTop:8},
  chipRow:{flexDirection:"row",flexWrap:"wrap",gap:8,marginTop:4},
  chip:{paddingHorizontal:14,paddingVertical:8,borderRadius:16,borderWidth:1.5},
  chipText:{fontFamily:"Montserrat-Bold",fontSize:12},
  infoCard:{flexDirection:"row",alignItems:"flex-start",backgroundColor:"rgba(123,97,255,0.1)",borderRadius:12,borderWidth:1,borderColor:"rgba(123,97,255,0.3)",padding:16,marginTop:24,marginBottom:8},
  infoText:{flex:1,fontFamily:"Montserrat-Regular",fontSize:13,color:DS.textSecondary,lineHeight:20},
  publishBtn:{backgroundColor:DS.accent,borderRadius:12,paddingVertical:16,alignItems:"center",marginTop:16},
  publishBtnText:{fontFamily:"Montserrat-Bold",fontSize:14,color:DS.textPrimary,letterSpacing:1},
});
