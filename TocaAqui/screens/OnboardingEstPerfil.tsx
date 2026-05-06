import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Switch,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import { RootStackParamList } from "@/navigation/Navigate";

const DS = {
  bg: "#09090F", surface: "#161028", card: "#1E1635", border: "#2D2545",
  accent: "#7B61FF", cyan: "#00CEC9", textPrimary: "#FFFFFF", textSecondary: "#8888AA",
};

const GENEROS = [
  { label: "Rock", color: "#A67C7C" }, { label: "Eletrônica", color: "#00CEC9" },
  { label: "Sertanejo", color: "#C9A96E" }, { label: "Jazz & Blues", color: "#6C3483" },
  { label: "MPB", color: "#27AE60" }, { label: "Hip Hop", color: "#F39C12" },
  { label: "Pop", color: "#FF69B4" }, { label: "Samba & Pagode", color: "#E67E22" },
];

const ESTRUTURA = ["Microfones", "Caixas", "Iluminação", "Mesa de Som", "Retornos", "Cabos/DI"];

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, "OnboardingEstPerfil">;

export default function OnboardingEstPerfil() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const params = route.params;

  const [generos, setGeneros] = useState<string[]>([]);
  const [temEstrutura, setTemEstrutura] = useState(false);
  const [estrutura, setEstrutura] = useState<string[]>([]);
  const [capacidade, setCapacidade] = useState("");

  const toggleGenero = (label: string) =>
    setGeneros(prev => prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]);

  const toggleEstrutura = (item: string) =>
    setEstrutura(prev => prev.includes(item) ? prev.filter(e => e !== item) : [...prev, item]);

  const handleContinuar = () => {
    if (generos.length === 0) { Alert.alert("Atenção", "Selecione pelo menos um gênero."); return; }
    navigation.navigate("OnboardingEstApresentacao", {
      ...params,
      numero: params.numero,
      generos: JSON.stringify(generos),
      temEstrutura,
      estrutura: JSON.stringify(estrutura),
      capacidade,
    });
  };

  return (
    <View style={s.root}>
      <View style={s.progressBar}>
        {[0,1,2,3].map(i => <View key={i} style={[s.seg, i < 3 ? s.segOn : s.segOff]} />)}
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={s.headerRow}>
          <Text style={s.stepLabel}>PASSO 3 DE 4</Text>
          <Text style={s.stepName}>Perfil & Estrutura</Text>
        </View>
        <Text style={s.title}>Qual o som da casa?</Text>
        <Text style={s.subtitle}>Selecione os gêneros musicais predominantes no seu estabelecimento.</Text>

        <View style={s.generoGrid}>
          {GENEROS.map(g => {
            const active = generos.includes(g.label);
            return (
              <TouchableOpacity
                key={g.label}
                style={[s.generoPill, { borderColor: g.color }, active && { backgroundColor: g.color + "33" }]}
                onPress={() => toggleGenero(g.label)} activeOpacity={0.7}
              >
                <Text style={[s.generoText, { color: g.color }]}>{g.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={s.estruturaCard}>
          <View style={s.estruturaHeader}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={s.estruturaTitulo}>Estrutura de Som</Text>
              <Text style={s.estruturaSub}>O local já possui equipamentos básicos?</Text>
            </View>
            <Switch value={temEstrutura} onValueChange={setTemEstrutura} trackColor={{ false: DS.border, true: DS.accent }} thumbColor={DS.textPrimary} />
          </View>
          {temEstrutura && (
            <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: DS.border }}>
              <Text style={s.fieldLabel}>ESTRUTURA DISPONÍVEL</Text>
              <View style={s.checkGrid}>
                {ESTRUTURA.map(item => {
                  const checked = estrutura.includes(item);
                  return (
                    <TouchableOpacity key={item} style={s.checkItem} onPress={() => toggleEstrutura(item)} activeOpacity={0.7}>
                      <View style={[s.checkbox, checked && s.checkboxOn]}>
                        {checked && <FontAwesome5 name="check" size={9} color={DS.textPrimary} />}
                      </View>
                      <Text style={s.checkLabel}>{item}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        <Text style={[s.fieldLabel, { marginTop: 20 }]}>CAPACIDADE DO PÚBLICO (APROX.)</Text>
        <TextInput
          style={s.input} placeholder="Ex: 200" placeholderTextColor={DS.border}
          keyboardType="numeric" value={capacidade} onChangeText={setCapacidade}
        />

        <View style={{ height: 24 }} />
        <TouchableOpacity style={s.btnPrimary} onPress={handleContinuar} activeOpacity={0.85}>
          <Text style={s.btnPrimaryText}>CONTINUAR →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnGhost} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={s.btnGhostText}>VOLTAR</Text>
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
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  stepLabel: { fontFamily: "Montserrat-SemiBold", fontSize: 11, color: DS.textSecondary, letterSpacing: 2 },
  stepName: { fontFamily: "Montserrat-SemiBold", fontSize: 11, color: DS.accent, letterSpacing: 2 },
  title: { fontFamily: "Montserrat-Bold", fontSize: 26, color: DS.textPrimary, marginBottom: 10 },
  subtitle: { fontFamily: "Montserrat-Regular", fontSize: 14, color: DS.textSecondary, lineHeight: 22, marginBottom: 20 },
  generoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  generoPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1.5 },
  generoText: { fontFamily: "Montserrat-Bold", fontSize: 12, letterSpacing: 0.5 },
  estruturaCard: { backgroundColor: DS.card, borderRadius: 12, borderWidth: 1, borderColor: DS.border, padding: 16 },
  estruturaHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  estruturaTitulo: { fontFamily: "Montserrat-SemiBold", fontSize: 15, color: DS.textPrimary },
  estruturaSub: { fontFamily: "Montserrat-Regular", fontSize: 12, color: DS.textSecondary, marginTop: 2 },
  fieldLabel: { fontFamily: "Montserrat-SemiBold", fontSize: 11, color: DS.textSecondary, letterSpacing: 2, marginBottom: 8 },
  checkGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  checkItem: { flexDirection: "row", alignItems: "center", gap: 8, width: "46%", paddingVertical: 6 },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: DS.border, backgroundColor: DS.surface, justifyContent: "center", alignItems: "center" },
  checkboxOn: { borderColor: DS.accent, backgroundColor: DS.accent },
  checkLabel: { fontFamily: "Montserrat-Regular", fontSize: 13, color: DS.textPrimary },
  input: {
    backgroundColor: DS.surface, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14,
    color: DS.textPrimary, fontFamily: "Montserrat-Regular", fontSize: 14, borderWidth: 1, borderColor: DS.border,
  },
  btnPrimary: { backgroundColor: DS.accent, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginBottom: 12 },
  btnPrimaryText: { fontFamily: "AkiraExpanded-Superbold", fontSize: 13, color: DS.textPrimary, letterSpacing: 1.5 },
  btnGhost: { borderRadius: 12, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: DS.border },
  btnGhostText: { fontFamily: "Montserrat-SemiBold", fontSize: 13, color: DS.textSecondary, letterSpacing: 1 },
});
