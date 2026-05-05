import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert,
  ActivityIndicator, Image,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "@/navigation/Navigate";
import api from "@/http/api";

const DS = {
  bg: "#09090F", surface: "#161028", card: "#1E1635", border: "#2D2545",
  accent: "#7B61FF", accentLight: "rgba(123,97,255,0.15)", cyan: "#00CEC9",
  textPrimary: "#FFFFFF", textSecondary: "#8888AA",
};

function mapTipo(tipo: string): string {
  const map: Record<string, string> = { bar: "bar", pub: "bar", restaurante: "restaurante", casa_show: "casa_show", espaco_privado: "outro" };
  return map[tipo] || "bar";
}

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, "OnboardingEstApresentacao">;

export default function OnboardingEstApresentacao() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const params = route.params;

  const [bio, setBio] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAdicionarFotos = async () => {
    if (fotos.length >= 5) {
      Alert.alert("Limite", "Você pode adicionar no máximo 5 fotos.");
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Permita o acesso à galeria para adicionar fotos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - fotos.length,
    });

    if (!result.canceled && result.assets.length > 0) {
      const novasUris = result.assets.map(a => a.uri);
      setFotos(prev => [...prev, ...novasUris].slice(0, 5));
    }
  };

  const handleRemoverFoto = (uri: string) => {
    setFotos(prev => prev.filter(f => f !== uri));
  };

  const handleConcluir = async () => {
    if (!bio.trim()) { Alert.alert("Atenção", "Escreva uma descrição do seu espaço."); return; }

    setLoading(true);
    try {
      let enderecoId: number | undefined;
      try {
        const enderecoRes = await api.post("/enderecos", {
          rua: params.endereco || "Endereço não informado",
          numero: params.numero || "",
          bairro: "",
          cidade: params.cidade || "São Paulo",
          estado: params.estado || "SP",
          cep: "",
        });
        enderecoId = enderecoRes.data?.id;
      } catch (_) {
        // endereco_id é opcional no backend
      }

      const diasParsed = JSON.parse(params.diasHorarios || "{}") as Record<string, { ativo: boolean; inicio: string; fim: string }>;
      const ativos = Object.values(diasParsed).filter(d => d.ativo);
      const horarioAbertura = ativos.length > 0 ? ativos[0].inicio : "18:00";
      const horarioFechamento = ativos.length > 0 ? ativos[ativos.length - 1].fim : "02:00";

      const generosParsed: string[] = JSON.parse(params.generos || "[]");

      const payload: any = {
        nome_estabelecimento: params.nome,
        tipo_estabelecimento: mapTipo(params.tipo),
        descricao: bio,
        generos_musicais: generosParsed.join(", ") || "Diversos",
        horario_abertura: horarioAbertura,
        horario_fechamento: horarioFechamento,
        telefone_contato: params.telefone || "00000000000",
      };
      if (enderecoId) payload.endereco_id = enderecoId;

      const result = await api.post("/usuarios/perfil-estabelecimento", payload);
      const estId = result.data?.profile?.id;
      if (estId) {
        await AsyncStorage.setItem("estabelecimentoId", String(estId));

        // Upload das fotos se houver
        if (fotos.length > 0) {
          try {
            const formData = new FormData();
            fotos.forEach((uri, idx) => {
              const ext = uri.split(".").pop()?.toLowerCase() || "jpg";
              const mime = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
              formData.append("imagens", { uri, name: `foto_${idx}.${ext}`, type: mime } as any);
            });
            await api.patch(`/estabelecimentos/${estId}/fotos`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          } catch (_) {
            // Fotos são opcionais — não bloqueia o fluxo
          }
        }
      }

      navigation.reset({ index: 0, routes: [{ name: "EstablishmentNavigator" }] });
    } catch (err: any) {
      Alert.alert("Erro", err?.response?.data?.message || "Não foi possível concluir o cadastro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.root}>
      <View style={s.progressBar}>
        {[0,1,2,3].map(i => <View key={i} style={s.segOn} />)}
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={s.headerRow}>
          <Text style={s.stepLabel}>PASSO 4 DE 4</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <FontAwesome5 name="times" size={18} color={DS.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={s.title}>Apresentação</Text>
        <Text style={s.subtitle}>Conte a história por trás do som e mostre a alma do seu espaço.</Text>

        <Text style={s.sectionLabel}>SOBRE NOSSO ESPAÇO</Text>
        <View style={s.bioContainer}>
          <TextInput
            style={s.bioInput}
            placeholder="Descreva a acústica, a vibração e o que torna seu palco único..."
            placeholderTextColor={DS.border}
            value={bio}
            onChangeText={t => t.length <= 1000 && setBio(t)}
            multiline
            textAlignVertical="top"
          />
          <Text style={s.bioCounter}>{bio.length} / 1000</Text>
        </View>

        <Text style={[s.sectionLabel, { marginTop: 20 }]}>GALERIA DE FOTOS</Text>
        <Text style={s.galeriaNote}>
          {fotos.length > 0
            ? `${fotos.length} foto${fotos.length > 1 ? "s" : ""} selecionada${fotos.length > 1 ? "s" : ""} (máx. 5)`
            : "Mínimo de 3 fotos para melhor visibilidade dos artistas"}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.galeriaScroll} contentContainerStyle={s.galeriaContent}>
          {fotos.length < 5 && (
            <TouchableOpacity style={s.fotoAdd} onPress={handleAdicionarFotos} activeOpacity={0.75}>
              <FontAwesome5 name="plus" size={20} color={DS.accent} />
              <Text style={s.fotoAddLabel}>ADICIONAR{"\n"}FOTOS</Text>
            </TouchableOpacity>
          )}
          {fotos.map((uri) => (
            <View key={uri} style={s.fotoThumb}>
              <Image source={{ uri }} style={s.fotoImage} resizeMode="cover" />
              <TouchableOpacity style={s.fotoRemove} onPress={() => handleRemoverFoto(uri)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                <FontAwesome5 name="times-circle" size={18} color={DS.textPrimary} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View style={{ height: 24 }} />
        <TouchableOpacity style={[s.btnPrimary, loading && { opacity: 0.6 }]} onPress={handleConcluir} disabled={loading} activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color={DS.textPrimary} size="small" />
            : <Text style={s.btnPrimaryText}>CONCLUIR E IR PARA O APP</Text>
          }
        </TouchableOpacity>
        <TouchableOpacity style={s.btnRevisar} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={s.btnRevisarText}>REVISAR PASSOS ANTERIORES</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.bg },
  progressBar: { flexDirection: "row", paddingHorizontal: 24, paddingTop: 56, gap: 6 },
  segOn: { flex: 1, height: 3, borderRadius: 2, backgroundColor: DS.cyan },
  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  stepLabel: { fontFamily: "Montserrat-SemiBold", fontSize: 11, color: DS.textSecondary, letterSpacing: 2 },
  title: { fontFamily: "Montserrat-Bold", fontSize: 28, color: DS.textPrimary, marginBottom: 10 },
  subtitle: { fontFamily: "Montserrat-Regular", fontSize: 14, color: DS.textSecondary, lineHeight: 22, marginBottom: 24 },
  sectionLabel: { fontFamily: "Montserrat-SemiBold", fontSize: 11, color: DS.textSecondary, letterSpacing: 2, marginBottom: 8 },
  bioContainer: { backgroundColor: DS.card, borderRadius: 12, borderWidth: 1, borderColor: DS.border, overflow: "hidden" },
  bioInput: { color: DS.textPrimary, fontFamily: "Montserrat-Regular", fontSize: 14, lineHeight: 22, padding: 16, minHeight: 140 },
  bioCounter: { fontFamily: "Montserrat-Regular", fontSize: 11, color: DS.textSecondary, textAlign: "right", paddingHorizontal: 14, paddingBottom: 10 },
  galeriaNote: { fontFamily: "Montserrat-Regular", fontSize: 12, color: DS.textSecondary, marginBottom: 12 },
  galeriaScroll: { marginHorizontal: -24 },
  galeriaContent: { paddingHorizontal: 24, gap: 10, paddingBottom: 4 },
  fotoAdd: {
    width: 90, height: 90, borderRadius: 12, borderWidth: 1.5, borderColor: DS.accent,
    borderStyle: "dashed", backgroundColor: DS.accentLight, justifyContent: "center", alignItems: "center", gap: 6,
  },
  fotoAddLabel: { fontFamily: "Montserrat-SemiBold", fontSize: 9, color: DS.accent, letterSpacing: 1, textAlign: "center" },
  fotoThumb: { width: 90, height: 90, borderRadius: 12, overflow: "hidden", position: "relative" },
  fotoImage: { width: 90, height: 90 },
  fotoRemove: { position: "absolute", top: 4, right: 4, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 10 },
  btnPrimary: { backgroundColor: DS.accent, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginBottom: 12 },
  btnPrimaryText: { fontFamily: "AkiraExpanded-Superbold", fontSize: 12, color: DS.textPrimary, letterSpacing: 1.5 },
  btnRevisar: { paddingVertical: 14, alignItems: "center" },
  btnRevisarText: { fontFamily: "Montserrat-SemiBold", fontSize: 13, color: DS.textSecondary, textDecorationLine: "underline" },
});
