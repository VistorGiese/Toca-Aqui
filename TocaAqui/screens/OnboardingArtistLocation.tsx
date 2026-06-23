import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/Navigate";
import FieldError from "@/components/ui/FieldError";

const DS = {
  bg: "#09090F",
  bgCard: "#16163A",
  bgInput: "#1E1250",
  accent: "#6C5CE7",
  white: "#FFFFFF",
  textSec: "#A0A0B8",
  textDis: "#555577",
  danger: "#E53E3E",
  bgSurface: "#1A1040",
  cyan: "#4ECDC4",
};

interface Estado { sigla: string; nome: string; }
interface Cidade { id: number; nome: string; }
type PickerMode = "estado" | "cidade" | null;

type NavProp = NativeStackNavigationProp<RootStackParamList, "OnboardingArtistLocation">;
type RouteType = RouteProp<RootStackParamList, "OnboardingArtistLocation">;

export default function OnboardingArtistLocation() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const params = route.params;

  const [estado, setEstado] = useState<Estado | null>(null);
  const [cidade, setCidade] = useState<Cidade | null>(null);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(false);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [searchText, setSearchText] = useState("");
  const [errors, setErrors] = useState<{ estado?: string; cidade?: string }>({});

  const clearError = (field: keyof typeof errors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  useEffect(() => {
    setLoadingEstados(true);
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then((r) => r.json())
      .then((data: Array<{ sigla: string; nome: string }>) => {
        setEstados(data.map((e) => ({ sigla: e.sigla, nome: e.nome })));
      })
      .catch(() => Alert.alert("Erro", "Não foi possível carregar os estados."))
      .finally(() => setLoadingEstados(false));
  }, []);

  useEffect(() => {
    if (!estado) { setCidades([]); setCidade(null); return; }
    setLoadingCidades(true);
    setCidade(null);
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado.sigla}/municipios?orderBy=nome`)
      .then((r) => r.json())
      .then((data: Array<{ id: number; nome: string }>) => {
        setCidades(data.map((c) => ({ id: c.id, nome: c.nome })));
      })
      .catch(() => Alert.alert("Erro", "Não foi possível carregar as cidades."))
      .finally(() => setLoadingCidades(false));
  }, [estado]);

  const openPicker = (mode: PickerMode) => {
    setSearchText("");
    setPickerMode(mode);
  };

  const filteredEstados = estados.filter(
    (e) =>
      e.nome.toLowerCase().includes(searchText.toLowerCase()) ||
      e.sigla.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredCidades = cidades.filter((c) =>
    c.nome.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleContinuar = () => {
    const nextErrors: typeof errors = {};
    if (!estado) nextErrors.estado = "Estado é obrigatório";
    if (!cidade) nextErrors.cidade = "Cidade é obrigatória";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    navigation.navigate("OnboardingArtistBio", {
      ...params,
      cidade: cidade!.nome,
      estado: estado!.sigla,
    });
  };

  return (
    <View style={styles.root}>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: "75%" }]} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.etapaLabel, { color: DS.cyan }]}>ETAPA 3 DE 4</Text>
        <Text style={styles.titleLarge}>Onde a mágica acontece?</Text>
        <Text style={styles.subtitle}>
          Informe sua cidade base para aparecer nos resultados de busca da sua região.
        </Text>

        <Text style={styles.fieldLabel}>ESTADO</Text>
        <TouchableOpacity
          style={[styles.selector, !estado && styles.selectorEmpty, errors.estado && styles.selectorError]}
          onPress={() => openPicker("estado")}
          activeOpacity={0.75}
        >
          <Text style={estado ? styles.selectorText : styles.selectorPlaceholder}>
            {estado ? `${estado.nome} (${estado.sigla})` : "Selecione o estado"}
          </Text>
          {loadingEstados ? (
            <ActivityIndicator size="small" color={DS.accent} />
          ) : (
            <FontAwesome5 name="chevron-down" size={12} color={DS.textSec} />
          )}
        </TouchableOpacity>
        <FieldError message={errors.estado} />

        <Text style={[styles.fieldLabel, { marginTop: 12 }]}>CIDADE</Text>
        <TouchableOpacity
          style={[
            styles.selector,
            (!estado || !cidade) && styles.selectorEmpty,
            !estado && styles.selectorDisabled,
            errors.cidade && styles.selectorError,
          ]}
          onPress={() => estado && openPicker("cidade")}
          activeOpacity={estado ? 0.75 : 1}
        >
          <Text style={cidade ? styles.selectorText : styles.selectorPlaceholder}>
            {!estado
              ? "Selecione o estado primeiro"
              : cidade
              ? cidade.nome
              : "Selecione a cidade"}
          </Text>
          {loadingCidades ? (
            <ActivityIndicator size="small" color={DS.accent} />
          ) : (
            <FontAwesome5 name="chevron-down" size={12} color={DS.textSec} />
          )}
        </TouchableOpacity>
        <FieldError message={errors.cidade} />

        <View style={styles.mapCard}>
          <MaterialCommunityIcons name="map-marker" size={32} color={DS.accent} />
          <Text style={styles.mapLabel}>LOCALIZAÇÃO BASE</Text>
          <Text style={styles.mapSub}>
            {cidade && estado ? `${cidade.nome}, ${estado.sigla}` : "Preencha os campos acima"}
          </Text>
        </View>

        <TouchableOpacity style={styles.btnPrimary} onPress={handleContinuar} activeOpacity={0.85}>
          <Text style={styles.btnPrimaryText}>CONTINUAR</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnBack} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <FontAwesome5 name="arrow-left" size={12} color={DS.textSec} />
          <Text style={styles.btnBackText}>VOLTAR</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={pickerMode !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerMode(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {pickerMode === "estado" ? "Selecione o Estado" : "Selecione a Cidade"}
              </Text>
              <TouchableOpacity
                onPress={() => setPickerMode(null)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <FontAwesome5 name="times" size={18} color={DS.textSec} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <FontAwesome5 name="search" size={13} color={DS.textSec} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder={pickerMode === "estado" ? "Buscar estado..." : "Buscar cidade..."}
                placeholderTextColor={DS.textSec}
                value={searchText}
                onChangeText={setSearchText}
                autoFocus
              />
            </View>

            {pickerMode === "estado" ? (
              <FlatList
                data={filteredEstados}
                keyExtractor={(item) => item.sigla}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.pickerItem, estado?.sigla === item.sigla && styles.pickerItemActive]}
                    onPress={() => { clearError("estado"); setEstado(item); setPickerMode(null); }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.pickerItemSigla}>{item.sigla}</Text>
                    <Text style={[styles.pickerItemNome, estado?.sigla === item.sigla && { color: DS.accent }]}>
                      {item.nome}
                    </Text>
                  </TouchableOpacity>
                )}
                keyboardShouldPersistTaps="handled"
              />
            ) : (
              <FlatList
                data={filteredCidades}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.pickerItem, cidade?.id === item.id && styles.pickerItemActive]}
                    onPress={() => { clearError("cidade"); setCidade(item); setPickerMode(null); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pickerItemNome, cidade?.id === item.id && { color: DS.accent }]}>
                      {item.nome}
                    </Text>
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.bg },
  progressBg: { width: "100%", height: 4, backgroundColor: DS.bgCard },
  progressFill: { height: 4, backgroundColor: DS.accent, borderRadius: 2 },
  scrollView: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  etapaLabel: { fontFamily: "Montserrat-Bold", fontSize: 12, letterSpacing: 2, marginBottom: 8 },
  titleLarge: { fontFamily: "AkiraExpanded-Superbold", fontSize: 20, color: DS.white, marginBottom: 8, lineHeight: 28 },
  subtitle: { fontFamily: "Montserrat-Regular", fontSize: 13, color: DS.textSec, marginBottom: 20, lineHeight: 20 },
  fieldLabel: { fontFamily: "Montserrat-SemiBold", fontSize: 11, color: DS.textSec, letterSpacing: 2, marginBottom: 8, marginTop: 16 },
  selector: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: DS.bgInput, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: DS.bgSurface,
  },
  selectorEmpty: { borderColor: DS.bgSurface },
  selectorError: { borderColor: DS.danger },
  selectorDisabled: { opacity: 0.5 },
  selectorText: { fontFamily: "Montserrat-Regular", fontSize: 14, color: DS.white, flex: 1 },
  selectorPlaceholder: { fontFamily: "Montserrat-Regular", fontSize: 14, color: DS.textSec, flex: 1 },
  mapCard: {
    backgroundColor: DS.bgCard, borderRadius: 12, alignItems: "center", justifyContent: "center",
    height: 110, marginTop: 16, borderWidth: 1, borderColor: DS.bgSurface,
  },
  mapLabel: { fontFamily: "Montserrat-SemiBold", fontSize: 12, color: DS.textSec, letterSpacing: 2, marginTop: 8 },
  mapSub: { fontFamily: "Montserrat-Regular", fontSize: 12, color: DS.textDis, marginTop: 4 },
  btnPrimary: { backgroundColor: DS.accent, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: 32 },
  btnPrimaryText: { fontFamily: "AkiraExpanded-Superbold", fontSize: 12, color: DS.white, letterSpacing: 1.5 },
  btnBack: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16, paddingVertical: 10 },
  btnBackText: { fontFamily: "Montserrat-SemiBold", fontSize: 13, color: DS.textSec },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalContainer: { backgroundColor: DS.bgInput, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "80%", paddingBottom: 32 },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 20, borderBottomWidth: 1, borderBottomColor: DS.bgSurface,
  },
  modalTitle: { fontFamily: "Montserrat-SemiBold", fontSize: 16, color: DS.white },
  searchBox: {
    flexDirection: "row", alignItems: "center", backgroundColor: DS.bgCard, borderRadius: 10,
    marginHorizontal: 16, marginVertical: 12, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: DS.bgSurface,
  },
  searchInput: { flex: 1, fontFamily: "Montserrat-Regular", fontSize: 14, color: DS.white },
  pickerItem: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: DS.bgSurface, gap: 12,
  },
  pickerItemActive: { backgroundColor: DS.accent + "22" },
  pickerItemSigla: { fontFamily: "Montserrat-SemiBold", fontSize: 12, color: DS.accent, width: 30 },
  pickerItemNome: { fontFamily: "Montserrat-Regular", fontSize: 14, color: DS.white, flex: 1 },
});
