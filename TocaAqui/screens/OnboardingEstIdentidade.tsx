import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "@/navigation/Navigate";

const DS = {
  bg: "#09090F", surface: "#161028", card: "#1E1635", border: "#2D2545",
  accent: "#7B61FF", cyan: "#00CEC9", textPrimary: "#FFFFFF", textSecondary: "#8888AA",
};

const TIPOS = [
  { id: "bar", label: "bar" },
  { id: "pub", label: "pub" },
  { id: "restaurante", label: "restaurante" },
  { id: "casa_show", label: "casa de show" },
  { id: "espaco_privado", label: "espaço privado" },
];

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function OnboardingEstIdentidade() {
  const navigation = useNavigation<NavProp>();
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [telefone, setTelefone] = useState("");
  const [fotoUri, setFotoUri] = useState<string | null>(null);

  const handleSelecionarFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Permita o acesso à galeria para adicionar a foto.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setFotoUri(result.assets[0].uri);
      await AsyncStorage.setItem("tempEstFotoUri", result.assets[0].uri);
    }
  };

  const handleProximo = () => {
    if (!nome.trim()) { Alert.alert("Atenção", "Informe o nome do estabelecimento."); return; }
    if (!tipo) { Alert.alert("Atenção", "Selecione o tipo do estabelecimento."); return; }
    navigation.navigate("OnboardingEstFuncionamento", { nome, tipo, telefone });
  };

  const handlePular = () => {
    navigation.navigate("OnboardingEstFuncionamento", { nome: nome || "Meu Espaço", tipo: tipo || "bar", telefone });
  };

  return (
    <View style={s.root}>
      <View style={s.progressBar}>
        {[0,1,2,3].map(i => (
          <View key={i} style={[s.seg, i === 0 ? s.segOn : s.segOff]} />
        ))}
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation.navigate("Login")} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <FontAwesome5 name="arrow-left" size={16} color={DS.textSecondary} />
          </TouchableOpacity>
          <Text style={s.stepLabel}>PASSO 1 DE 4</Text>
          <Text style={s.stepName}>Identidade</Text>
        </View>
        <Text style={s.title}>Conte sobre o seu <Text style={s.titleAccent}>Espaço</Text></Text>
        <Text style={s.subtitle}>Vamos começar personalizando a presença digital do seu estabelecimento.</Text>

        <TouchableOpacity style={s.uploadBox} activeOpacity={0.75} onPress={handleSelecionarFoto}>
          {fotoUri ? (
            <Image source={{ uri: fotoUri }} style={s.uploadPreview} />
          ) : (
            <>
              <FontAwesome5 name="camera" size={26} color={DS.cyan} />
              <Text style={s.uploadLabel}>ADICIONAR FOTO DO LOCAL</Text>
              <Text style={s.uploadSub}>Logo ou fachada (Recomendado: 1080x1080px)</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={s.fieldLabel}>NOME DO ESTABELECIMENTO</Text>
        <TextInput
          style={s.input} placeholder="Ex: The Sonic Lounge"
          placeholderTextColor={DS.border} value={nome} onChangeText={setNome}
        />

        <Text style={[s.fieldLabel, { marginTop: 20 }]}>CELULAR DO RESPONSÁVEL</Text>
        <TextInput
          style={s.input} placeholder="Ex: (11) 99999-9999"
          placeholderTextColor={DS.border} value={telefone} onChangeText={setTelefone}
          keyboardType="phone-pad"
        />

        <Text style={[s.fieldLabel, { marginTop: 20 }]}>TIPO DO LOCAL</Text>
        <View style={s.chipRow}>
          {TIPOS.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[s.chip, tipo === t.id && s.chipOn]}
              onPress={() => setTipo(t.id)}
              activeOpacity={0.7}
            >
              <Text style={[s.chipText, tipo === t.id && s.chipTextOn]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 32 }} />
        <TouchableOpacity style={s.btnPrimary} onPress={handleProximo} activeOpacity={0.85}>
          <Text style={s.btnPrimaryText}>PRÓXIMO PASSO →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnGhost} onPress={handlePular} activeOpacity={0.7}>
          <Text style={s.btnGhostText}>PULAR POR AGORA</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.bg },
  progressBar: { flexDirection: "row", paddingHorizontal: 24, paddingTop: 56, gap: 6 },
  seg: { flex: 1, height: 3, borderRadius: 2 },
  segOn: { backgroundColor: DS.cyan },
  segOff: { backgroundColor: DS.border },
  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 28 },
  stepLabel: { fontFamily: "Montserrat-SemiBold", fontSize: 11, color: DS.textSecondary, letterSpacing: 2 },
  stepName: { fontFamily: "Montserrat-SemiBold", fontSize: 11, color: DS.accent, letterSpacing: 2 },
  title: { fontFamily: "Montserrat-Bold", fontSize: 26, color: DS.textPrimary, lineHeight: 34, marginBottom: 10 },
  titleAccent: { color: DS.accent },
  subtitle: { fontFamily: "Montserrat-Regular", fontSize: 14, color: DS.textSecondary, lineHeight: 22, marginBottom: 28 },
  uploadBox: {
    backgroundColor: DS.card, borderRadius: 14, borderWidth: 1.5, borderColor: DS.border,
    borderStyle: "dashed", paddingVertical: 32, alignItems: "center", marginBottom: 24, gap: 8,
  },
  uploadLabel: { fontFamily: "Montserrat-SemiBold", fontSize: 12, color: DS.cyan, letterSpacing: 2, marginTop: 4 },
  uploadSub: { fontFamily: "Montserrat-Regular", fontSize: 11, color: DS.textSecondary, textAlign: "center" },
  uploadPreview: { width: "100%", height: 120, borderRadius: 12 },
  fieldLabel: { fontFamily: "Montserrat-SemiBold", fontSize: 11, color: DS.textSecondary, letterSpacing: 2, marginBottom: 8 },
  input: {
    backgroundColor: DS.surface, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14,
    color: DS.textPrimary, fontFamily: "Montserrat-Regular", fontSize: 14, borderWidth: 1, borderColor: DS.border,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5, borderColor: DS.border, backgroundColor: DS.card },
  chipOn: { borderColor: DS.cyan, backgroundColor: "rgba(0,206,201,0.12)" },
  chipText: { fontFamily: "Montserrat-SemiBold", fontSize: 13, color: DS.textSecondary },
  chipTextOn: { color: DS.cyan },
  btnPrimary: { backgroundColor: DS.accent, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginBottom: 12 },
  btnPrimaryText: { fontFamily: "AkiraExpanded-Superbold", fontSize: 13, color: DS.textPrimary, letterSpacing: 1.5 },
  btnGhost: { borderRadius: 12, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: DS.border },
  btnGhostText: { fontFamily: "Montserrat-SemiBold", fontSize: 13, color: DS.textSecondary, letterSpacing: 1 },
});
