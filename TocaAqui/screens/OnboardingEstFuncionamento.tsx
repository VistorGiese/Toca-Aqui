import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Switch,
  Modal, FlatList, ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
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

interface Estado { sigla: string; nome: string; }
interface Cidade { id: number; nome: string; }

type PickerMode = "estado" | "cidade" | null;

export default function OnboardingEstFuncionamento() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { nome, tipo, telefone } = route.params;

  const [estado, setEstado] = useState<Estado | null>(null);
  const [cidade, setCidade] = useState<Cidade | null>(null);
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");

  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(false);
  const [loadingCidades, setLoadingCidades] = useState(false);

  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [searchText, setSearchText] = useState("");

  const [dias, setDias] = useState<DiasState>(() => {
    const init: DiasState = {};
    DIAS.forEach(d => { init[d.id] = { ativo: false, inicio: "18:00", fim: "02:00" }; });
    return init;
  });

  useEffect(() => {
    setLoadingEstados(true);
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then(r => r.json())
      .then((data: Array<{ sigla: string; nome: string }>) => {
        setEstados(data.map(e => ({ sigla: e.sigla, nome: e.nome })));
      })
      .catch(() => Alert.alert("Erro", "Não foi possível carregar os estados."))
      .finally(() => setLoadingEstados(false));
  }, []);

  useEffect(() => {
    if (!estado) { setCidades([]); setCidade(null); return; }
    setLoadingCidades(true);
    setCidade(null);
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado.sigla}/municipios?orderBy=nome`)
      .then(r => r.json())
      .then((data: Array<{ id: number; nome: string }>) => {
        setCidades(data.map(c => ({ id: c.id, nome: c.nome })));
      })
      .catch(() => Alert.alert("Erro", "Não foi possível carregar as cidades."))
      .finally(() => setLoadingCidades(false));
  }, [estado]);

  const toggleDia = (id: string) =>
    setDias(prev => ({ ...prev, [id]: { ...prev[id], ativo: !prev[id].ativo } }));

  const updateHorario = (id: string, campo: "inicio" | "fim", valor: string) =>
    setDias(prev => ({ ...prev, [id]: { ...prev[id], [campo]: valor } }));

  const handleProximo = () => {
    if (!estado) { Alert.alert("Atenção", "Selecione o estado."); return; }
    if (!cidade) { Alert.alert("Atenção", "Selecione a cidade."); return; }
    if (!rua.trim()) { Alert.alert("Atenção", "Informe o nome da rua."); return; }
    if (!numero.trim()) { Alert.alert("Atenção", "Informe o número do estabelecimento."); return; }
    navigation.navigate("OnboardingEstPerfil", {
      nome, tipo, telefone,
      endereco: rua.trim(),
      numero: numero.trim(),
      cidade: cidade.nome,
      estado: estado.sigla,
      diasHorarios: JSON.stringify(dias),
    });
  };

  const openPicker = (mode: PickerMode) => {
    setSearchText("");
    setPickerMode(mode);
  };

  const filteredEstados = estados.filter(e =>
    e.nome.toLowerCase().includes(searchText.toLowerCase()) ||
    e.sigla.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredCidades = cidades.filter(c =>
    c.nome.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={s.root}>
      <View style={s.progressBar}>
        {[0,1,2,3].map(i => <View key={i} style={[s.seg, i < 2 ? s.segOn : s.segOff]} />)}
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={s.stepLabel}>PASSO 2 DE 4</Text>
        <Text style={s.title}>Localização e Funcionamento</Text>
        <Text style={s.subtitle}>Defina onde você está localizado e quais são os momentos de maior vibração na sua agenda semanal.</Text>

        <Text style={s.sectionLabel}>ENDEREÇO</Text>

        {/* Estado */}
        <Text style={s.fieldLabel}>ESTADO</Text>
        <TouchableOpacity
          style={[s.selector, !estado && s.selectorEmpty]}
          onPress={() => openPicker("estado")}
          activeOpacity={0.75}
        >
          <Text style={estado ? s.selectorText : s.selectorPlaceholder}>
            {estado ? `${estado.nome} (${estado.sigla})` : "Selecione o estado"}
          </Text>
          {loadingEstados
            ? <ActivityIndicator size="small" color={DS.accent} />
            : <FontAwesome5 name="chevron-down" size={12} color={DS.textSecondary} />
          }
        </TouchableOpacity>

        {/* Cidade */}
        <Text style={[s.fieldLabel, { marginTop: 12 }]}>CIDADE</Text>
        <TouchableOpacity
          style={[s.selector, (!estado || !cidade) && s.selectorEmpty, !estado && s.selectorDisabled]}
          onPress={() => estado && openPicker("cidade")}
          activeOpacity={estado ? 0.75 : 1}
        >
          <Text style={cidade ? s.selectorText : s.selectorPlaceholder}>
            {!estado ? "Selecione o estado primeiro" : cidade ? cidade.nome : "Selecione a cidade"}
          </Text>
          {loadingCidades
            ? <ActivityIndicator size="small" color={DS.accent} />
            : <FontAwesome5 name="chevron-down" size={12} color={DS.textSecondary} />
          }
        </TouchableOpacity>

        {/* Rua e Número */}
        <View style={[s.rowRua, { marginTop: 12 }]}>
          <View style={{ flex: 1 }}>
            <Text style={s.fieldLabel}>RUA / AVENIDA</Text>
            <TextInput
              style={s.input}
              placeholder="Ex: Av. Paulista"
              placeholderTextColor={DS.border}
              value={rua}
              onChangeText={setRua}
            />
          </View>
          <View style={{ width: 90 }}>
            <Text style={s.fieldLabel}>NÚMERO</Text>
            <TextInput
              style={s.input}
              placeholder="Ex: 1578"
              placeholderTextColor={DS.border}
              value={numero}
              onChangeText={setNumero}
              keyboardType="numeric"
            />
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

      {/* Modal picker de estado/cidade */}
      <Modal visible={pickerMode !== null} animationType="slide" transparent onRequestClose={() => setPickerMode(null)}>
        <View style={s.modalOverlay}>
          <View style={s.modalContainer}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{pickerMode === "estado" ? "Selecione o Estado" : "Selecione a Cidade"}</Text>
              <TouchableOpacity onPress={() => setPickerMode(null)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <FontAwesome5 name="times" size={18} color={DS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={s.searchBox}>
              <FontAwesome5 name="search" size={13} color={DS.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={s.searchInput}
                placeholder={pickerMode === "estado" ? "Buscar estado..." : "Buscar cidade..."}
                placeholderTextColor={DS.textSecondary}
                value={searchText}
                onChangeText={setSearchText}
                autoFocus
              />
            </View>

            {pickerMode === "estado" ? (
              <FlatList
                data={filteredEstados}
                keyExtractor={item => item.sigla}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[s.pickerItem, estado?.sigla === item.sigla && s.pickerItemActive]}
                    onPress={() => { setEstado(item); setPickerMode(null); }}
                    activeOpacity={0.7}
                  >
                    <Text style={s.pickerItemSigla}>{item.sigla}</Text>
                    <Text style={[s.pickerItemNome, estado?.sigla === item.sigla && { color: DS.accent }]}>{item.nome}</Text>
                  </TouchableOpacity>
                )}
                keyboardShouldPersistTaps="handled"
              />
            ) : (
              <FlatList
                data={filteredCidades}
                keyExtractor={item => String(item.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[s.pickerItem, cidade?.id === item.id && s.pickerItemActive]}
                    onPress={() => { setCidade(item); setPickerMode(null); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.pickerItemNome, cidade?.id === item.id && { color: DS.accent }]}>{item.nome}</Text>
                  </TouchableOpacity>
                )}
                keyboardShouldPersistTaps="handled"
              />
            )}
          </View>
        </View>
      </Modal>
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
  selector: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: DS.surface, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: DS.border,
  },
  selectorEmpty: { borderColor: DS.border },
  selectorDisabled: { opacity: 0.5 },
  selectorText: { fontFamily: "Montserrat-Regular", fontSize: 14, color: DS.textPrimary, flex: 1 },
  selectorPlaceholder: { fontFamily: "Montserrat-Regular", fontSize: 14, color: DS.textSecondary, flex: 1 },
  rowRua: { flexDirection: "row", gap: 12 },
  input: {
    backgroundColor: DS.surface, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14,
    color: DS.textPrimary, fontFamily: "Montserrat-Regular", fontSize: 14, borderWidth: 1, borderColor: DS.border,
  },
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
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalContainer: { backgroundColor: DS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "80%", paddingBottom: 32 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: DS.border },
  modalTitle: { fontFamily: "Montserrat-SemiBold", fontSize: 16, color: DS.textPrimary },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: DS.card, borderRadius: 10, marginHorizontal: 16, marginVertical: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: DS.border },
  searchInput: { flex: 1, fontFamily: "Montserrat-Regular", fontSize: 14, color: DS.textPrimary },
  pickerItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: DS.border, gap: 12 },
  pickerItemActive: { backgroundColor: "rgba(123,97,255,0.1)" },
  pickerItemSigla: { fontFamily: "Montserrat-SemiBold", fontSize: 12, color: DS.accent, width: 30 },
  pickerItemNome: { fontFamily: "Montserrat-Regular", fontSize: 14, color: DS.textPrimary, flex: 1 },
});
