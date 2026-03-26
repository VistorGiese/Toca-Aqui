import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Switch,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/Navigate";

const DS = {
  bg: "#09090F", surface: "#161028", card: "#1E1635", border: "#2D2545",
  accent: "#7B61FF", cyan: "#00CEC9", textPrimary: "#FFFFFF", textSecondary: "#8888AA",
};

const DIAS = [
  { id: "seg", label: "SEGUNDA" }, { id: "ter", label: "TERÇA" },
  { id: "qua", label: "QUARTA" }, { id: "qui", label: "QUINTA" },
  { id: "sex", label: "SEXTA" }, { id: "sab", label: "SÁBADO" },
  { id: "dom", label: "DOMINGO" },
];

type DiasState = { [key: string]: { ativo: boolean; inicio: string; fim: string } };
type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, "OnboardingEstFuncionamento">;

export default function OnboardingEstFuncionamento() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { nome, tipo } = route.params;

  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [dias, setDias] = useState<DiasState>(() => {
    const init: DiasState = {};
    DIAS.forEach(d => { init[d.id] = { ativo: false, inicio: "18:00", fim: "02:00" }; });
    return init;
  });

  const toggleDia = (id: string) =>
    setDias(prev => ({ ...prev, [id]: { ...prev[id], ativo: !prev[id].ativo } }));

  const updateHorario = (id: string, campo: "inicio" | "fim", valor: string) =>
    setDias(prev => ({ ...prev, [id]: { ...prev[id], [campo]: valor } }));

  const handleProximo = () => {
    if (!endereco.trim()) { Alert.alert("Atenção", "Informe o endereço."); return; }
    if (!cidade.trim() || !estado.trim()) { Alert.alert("Atenção", "Informe cidade e estado."); return; }
    navigation.navigate("OnboardingEstPerfil", {
      nome, tipo, endereco, cidade, estado, diasHorarios: JSON.stringify(dias),
    });
  };

  return (
    <View style={s.root}>
      <View style={s.progressBar}>
        {[0,1,2,3].map(i => <View key={i} style={[s.seg, i < 2 ? s.segOn : s.segOff]} />)}
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={s.stepLabel}>PASSO 2 DE 4</Text>
        <Text style={s.title}>Localização e Funcionamento</Text>
        <Text style={s.subtitle}>Defina onde você está localizado e quais são os momentos de maior vibração na sua agenda semanal.</Text>

        <Text style={s.sectionLabel}>ENDEREÇO COMPLETO</Text>
        <TextInput style={s.input} placeholder="Rua, número e complemento" placeholderTextColor={DS.border} value={endereco} onChangeText={setEndereco} />

        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.fieldLabel}>CIDADE</Text>
            <TextInput style={s.input} placeholder="São Paulo" placeholderTextColor={DS.border} value={cidade} onChangeText={setCidade} />
          </View>
          <View style={{ width: 80 }}>
            <Text style={s.fieldLabel}>ESTADO</Text>
            <TextInput style={s.input} placeholder="SP" placeholderTextColor={DS.border} value={estado} onChangeText={setEstado} maxLength={2} autoCapitalize="characters" />
          </View>
        </View>

        <Text style={[s.sectionLabel, { marginTop: 24 }]}>Dias e horários de shows 🎵</Text>
        {DIAS.map(dia => {
          const d = dias[dia.id];
          return (
            <View key={dia.id} style={s.diaCard}>
              <View style={s.diaRow}>
                <Text style={s.diaLabel}>{dia.label}</Text>
                <Switch value={d.ativo} onValueChange={() => toggleDia(dia.id)} trackColor={{ false: DS.border, true: DS.accent }} thumbColor={DS.textPrimary} />
              </View>
              {d.ativo && (
                <View style={s.horarioRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.fieldLabel}>INÍCIO</Text>
                    <TextInput style={s.horarioInput} value={d.inicio} onChangeText={v => updateHorario(dia.id, "inicio", v)} placeholder="18:00" placeholderTextColor={DS.border} textAlign="center" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.fieldLabel}>FIM</Text>
                    <TextInput style={s.horarioInput} value={d.fim} onChangeText={v => updateHorario(dia.id, "fim", v)} placeholder="02:00" placeholderTextColor={DS.border} textAlign="center" />
                  </View>
                </View>
              )}
            </View>
          );
        })}

        <View style={{ height: 24 }} />
        <TouchableOpacity style={s.btnPrimary} onPress={handleProximo} activeOpacity={0.85}>
          <Text style={s.btnPrimaryText}>PRÓXIMO PASSO →</Text>
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
  stepLabel: { fontFamily: "Montserrat-SemiBold", fontSize: 11, color: DS.textSecondary, letterSpacing: 2, marginBottom: 16 },
  title: { fontFamily: "Montserrat-Bold", fontSize: 24, color: DS.textPrimary, lineHeight: 32, marginBottom: 10 },
  subtitle: { fontFamily: "Montserrat-Regular", fontSize: 14, color: DS.textSecondary, lineHeight: 22, marginBottom: 24 },
  sectionLabel: { fontFamily: "Montserrat-SemiBold", fontSize: 11, color: DS.textSecondary, letterSpacing: 2, marginBottom: 10 },
  fieldLabel: { fontFamily: "Montserrat-SemiBold", fontSize: 10, color: DS.textSecondary, letterSpacing: 2, marginBottom: 6 },
  input: {
    backgroundColor: DS.surface, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14,
    color: DS.textPrimary, fontFamily: "Montserrat-Regular", fontSize: 14, borderWidth: 1, borderColor: DS.border, marginBottom: 10,
  },
  row: { flexDirection: "row", gap: 12 },
  diaCard: { backgroundColor: DS.card, borderRadius: 10, borderWidth: 1, borderColor: DS.border, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8 },
  diaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  diaLabel: { fontFamily: "Montserrat-SemiBold", fontSize: 12, color: DS.textPrimary, letterSpacing: 1.5 },
  horarioRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  horarioInput: {
    backgroundColor: DS.surface, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
    color: DS.textPrimary, fontFamily: "Montserrat-Regular", fontSize: 14, borderWidth: 1, borderColor: DS.border,
  },
  btnPrimary: { backgroundColor: DS.accent, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginBottom: 12 },
  btnPrimaryText: { fontFamily: "AkiraExpanded-Superbold", fontSize: 13, color: DS.textPrimary, letterSpacing: 1.5 },
  btnGhost: { borderRadius: 12, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: DS.border },
  btnGhostText: { fontFamily: "Montserrat-SemiBold", fontSize: 13, color: DS.textSecondary, letterSpacing: 1 },
});
