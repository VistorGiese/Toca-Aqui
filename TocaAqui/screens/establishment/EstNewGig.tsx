import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, Modal, Image,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { establishmentService } from "@/http/establishmentService";
import { getGenreColor } from "@/utils/colors";
import { isValidHHMM, normalizeDateToISO, normalizeTimeToHHMM } from "@/utils/datetime";
import { resolveImageUrl } from "@/utils/adapters";
import FieldError from "@/components/ui/FieldError";

const DS = {
  bg: "#09090F", surface: "#161028", card: "#1E1635", border: "#2D2545",
  accent: "#7B61FF", cyan: "#00CEC9", textPrimary: "#FFFFFF", textSecondary: "#8888AA",
  danger: "#E53E3E",
};
const GENEROS = ["Eletrônica", "Rock", "Pop", "Sertanejo", "Indie", "Jazz", "MPB", "Blues"];

type NavProp = NativeStackNavigationProp<EstStackParamList>;
type RoutePropType = RouteProp<EstStackParamList, "EstNewGig">;

function maskTime(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function isoToDisplay(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function EstNewGig() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const gigId = route.params?.gigId;

  const [titulo, setTitulo] = useState("");
  const [dataISO, setDataISO] = useState("");       // YYYY-MM-DD
  const [showCalendar, setShowCalendar] = useState(false);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [valorShow, setValorShow] = useState("");
  const [valorIngresso, setValorIngresso] = useState("");
  const [modoVendaIngresso, setModoVendaIngresso] = useState<"antecipada" | "na_porta">("antecipada");
  const [capacidade, setCapacidade] = useState("");
  const [capaUri, setCapaUri] = useState<string | null>(null);
  const [generos, setGeneros] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{
    titulo?: string;
    data?: string;
    inicio?: string;
    fim?: string;
  }>({});

  const clearError = (field: keyof typeof errors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const loadGig = useCallback(async () => {
    if (!gigId) return;
    setLoading(true);
    try {
      const g = await establishmentService.getGigById(gigId);
      setTitulo(g.titulo_evento);
      setDataISO(normalizeDateToISO(g.data_show));
      setInicio(normalizeTimeToHHMM(g.horario_inicio));
      setFim(normalizeTimeToHHMM(g.horario_fim));
      if (g.cache_minimo != null) {
        setValorShow(String(g.cache_minimo));
      }
      if (g.preco_ingresso_inteira != null) {
        setValorIngresso(String(g.preco_ingresso_inteira));
      }
      setModoVendaIngresso(g.modo_venda_ingresso ?? "antecipada");
      setCapaUri(g.imagem_capa ?? null);
      if (g.capacidade_maxima != null) {
        setCapacidade(String(g.capacidade_maxima));
      }
      const generosRaw = g.genero_musical ?? g.generos_musicais;
      if (generosRaw) setGeneros(generosRaw.split(",").map(s => s.trim()).filter(Boolean));
    } catch {
      Alert.alert("Erro", "Não foi possível carregar a data.");
    } finally {
      setLoading(false);
    }
  }, [gigId]);

  useEffect(() => { loadGig(); }, [loadGig]);

  const toggleGenero = (g: string) =>
    setGeneros(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const handlePublicar = async () => {
    const dataNormalizada = normalizeDateToISO(dataISO);
    const inicioNormalizado = normalizeTimeToHHMM(inicio);
    const fimNormalizado = normalizeTimeToHHMM(fim);

    const nextErrors: typeof errors = {};
    if (!titulo.trim()) nextErrors.titulo = "Título do evento é obrigatório";
    if (!dataNormalizada) nextErrors.data = "Data do evento é obrigatória";
    if (!isValidHHMM(inicioNormalizado)) nextErrors.inicio = "Horário de início inválido (HH:MM)";
    if (!isValidHHMM(fimNormalizado)) nextErrors.fim = "Horário de fim inválido (HH:MM)";
    if (
      isValidHHMM(inicioNormalizado) &&
      isValidHHMM(fimNormalizado) &&
      inicioNormalizado === fimNormalizado
    ) {
      nextErrors.inicio = "Início e fim devem ser diferentes";
      nextErrors.fim = "Início e fim devem ser diferentes";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    setSaving(true);
    try {
      const payload = {
        titulo_evento: titulo,
        data_show: dataNormalizada,
        horario_inicio: inicioNormalizado,
        horario_fim: fimNormalizado,
        cache_minimo: valorShow ? Number(valorShow) : undefined,
        preco_ingresso_inteira: valorIngresso ? Number(valorIngresso) : undefined,
        modo_venda_ingresso: modoVendaIngresso,
        capacidade_maxima: capacidade ? Number(capacidade) : undefined,
        genero_musical: generos.join(", ") || undefined,
        esta_publico: false,
      };
      let savedGigId = gigId;
      if (gigId) {
        await establishmentService.updateGig(gigId, payload);
      } else {
        const created = await establishmentService.createGig(payload);
        savedGigId = created.id;
      }
      if (savedGigId && capaUri && !capaUri.startsWith("uploads/")) {
        await establishmentService.uploadGigCover(savedGigId, capaUri);
      }
      Alert.alert("Sucesso", gigId ? "Data atualizada!" : "Data publicada!");
      navigation.goBack();
    } catch (e: any) {
      const data = e?.response?.data;
      const detalhes = data?.detalhes?.map((d: any) => d.mensagem).join("\n");
      const rawMsg = detalhes || data?.message || data?.error || "Não foi possível salvar.";
      const msg = /já existem candidaturas/i.test(String(rawMsg))
        ? "Não é possível editar este evento porque já existem candidaturas vinculadas."
        : rawMsg;
      Alert.alert("Erro", msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[s.root, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={DS.accent} />
      </View>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  const handleSelectCover = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Permita o acesso à galeria para adicionar a capa do evento.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setCapaUri(result.assets[0].uri);
    }
  };

  return (
    <View style={s.root}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>{gigId ? "Editar Data" : "Nova Data"}</Text>
            <Text style={s.subtitle}>Crie uma nova oportunidade para artistas</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.cancelBtn}>CANCELAR</Text>
          </TouchableOpacity>
        </View>

        {/* Título */}
        <Text style={s.fieldLabel}>TÍTULO DO EVENTO</Text>
        <TextInput
          style={[s.input, errors.titulo && s.inputError]}
          placeholder="Ex: Festival de Inverno 2024"
          placeholderTextColor={DS.border}
          value={titulo}
          onChangeText={(v) => {
            clearError("titulo");
            setTitulo(v);
          }}
        />
        <FieldError message={errors.titulo} />

        <Text style={s.fieldLabel}>CAPA DO EVENTO</Text>
        <TouchableOpacity style={s.coverPicker} onPress={handleSelectCover} activeOpacity={0.85}>
          {capaUri ? (
            <Image source={{ uri: resolveImageUrl(capaUri) }} style={s.coverPreview} />
          ) : (
            <View style={s.coverPlaceholder}>
              <FontAwesome5 name="image" size={18} color={DS.accent} />
              <Text style={s.coverPlaceholderText}>Adicionar capa</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Data — picker */}
        <Text style={s.fieldLabel}>DATA DO EVENTO</Text>
        <TouchableOpacity
          style={[s.dateBtn, errors.data && s.inputError]}
          onPress={() => {
            clearError("data");
            setShowCalendar(true);
          }}
          activeOpacity={0.8}
        >
          <FontAwesome5 name="calendar-alt" size={15} color={DS.accent} />
          <Text style={[s.dateBtnText, !dataISO && { color: DS.border }]}>
            {dataISO ? isoToDisplay(dataISO) : "Selecionar data"}
          </Text>
          <FontAwesome5 name="chevron-down" size={12} color={DS.textSecondary} />
        </TouchableOpacity>
        <FieldError message={errors.data} />

        {/* Horários */}
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.fieldLabel}>INÍCIO</Text>
            <TextInput
              style={[s.input, errors.inicio && s.inputError]}
              placeholder="19:00"
              placeholderTextColor={DS.border}
              value={inicio}
              onChangeText={(v) => {
                clearError("inicio");
                setInicio(maskTime(v));
              }}
              keyboardType="numeric"
              maxLength={5}
            />
            <FieldError message={errors.inicio} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.fieldLabel}>FIM</Text>
            <TextInput
              style={[s.input, errors.fim && s.inputError]}
              placeholder="23:00"
              placeholderTextColor={DS.border}
              value={fim}
              onChangeText={(v) => {
                clearError("fim");
                setFim(maskTime(v));
              }}
              keyboardType="numeric"
              maxLength={5}
            />
            <FieldError message={errors.fim} />
          </View>
        </View>

        {/* Valor do show (cachê oferecido ao artista) */}
        <Text style={s.fieldLabel}>VALOR DO SHOW (R$)</Text>
        <TextInput
          style={s.input}
          placeholder="Ex: 800"
          placeholderTextColor={DS.border}
          value={valorShow}
          onChangeText={setValorShow}
          keyboardType="numeric"
        />
        <Text style={s.fieldHint}>
          Valor que o estabelecimento oferece ao artista contratado. Independente do ingresso.
        </Text>

        <Text style={s.fieldLabel}>MODO DE VENDA DO INGRESSO</Text>
        <View style={s.saleModeRow}>
          <TouchableOpacity
            style={[s.saleModeBtn, modoVendaIngresso === "antecipada" && s.saleModeBtnActive]}
            onPress={() => setModoVendaIngresso("antecipada")}
            activeOpacity={0.8}
          >
            <Text style={[s.saleModeBtnText, modoVendaIngresso === "antecipada" && s.saleModeBtnTextActive]}>
              Venda antecipada
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.saleModeBtn, modoVendaIngresso === "na_porta" && s.saleModeBtnActive]}
            onPress={() => setModoVendaIngresso("na_porta")}
            activeOpacity={0.8}
          >
            <Text style={[s.saleModeBtnText, modoVendaIngresso === "na_porta" && s.saleModeBtnTextActive]}>
              Venda na hora
            </Text>
          </TouchableOpacity>
        </View>

        {/* Valor do ingresso */}
        <Text style={s.fieldLabel}>VALOR DO INGRESSO (R$)</Text>
        <TextInput
          style={s.input}
          placeholder={modoVendaIngresso === "na_porta" ? "Ex: 30 (referência na porta)" : "Ex: 50"}
          placeholderTextColor={DS.border}
          value={valorIngresso}
          onChangeText={setValorIngresso}
          keyboardType="numeric"
        />
        {modoVendaIngresso === "na_porta" ? (
          <Text style={s.fieldHint}>
            Ingresso pago na entrada. Esse valor é só referência para o público e não interfere no cachê do artista.
          </Text>
        ) : (
          <Text style={s.fieldHint}>
            Preço de venda antecipada pelo app. Separado do valor pago ao artista.
          </Text>
        )}

        {/* Capacidade */}
        <Text style={s.fieldLabel}>CAPACIDADE MÁXIMA (PESSOAS)</Text>
        <TextInput
          style={s.input}
          placeholder="Ex: 150"
          placeholderTextColor={DS.border}
          value={capacidade}
          onChangeText={(v) => setCapacidade(v.replace(/\D/g, ""))}
          keyboardType="numeric"
        />
        <Text style={s.fieldHint}>
          Usada para limitar vendas de ingressos. Deixe vazio se não souber.
        </Text>

        {/* Gêneros */}
        <Text style={s.fieldLabel}>GÊNEROS MUSICAIS</Text>
        <View style={s.chipRow}>
          {GENEROS.map(g => {
            const active = generos.includes(g);
            const color = getGenreColor(g.toUpperCase());
            return (
              <TouchableOpacity
                key={g}
                style={[s.chip, { borderColor: color }, active && { backgroundColor: color + "33" }]}
                onPress={() => toggleGenero(g)}
                activeOpacity={0.7}
              >
                <Text style={[s.chipText, { color }]}>{g}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Info */}
        <View style={s.infoCard}>
          <FontAwesome5 name="rocket" size={16} color={DS.accent} style={{ marginRight: 12 }} />
          <Text style={s.infoText}>
            Com base no seu perfil e filtros selecionados, esta data será notificada para artistas qualificados na sua região.
          </Text>
        </View>

        {/* Publicar */}
        <TouchableOpacity
          style={[s.publishBtn, saving && { opacity: 0.6 }]}
          onPress={handlePublicar}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color={DS.textPrimary} size="small" />
            : <Text style={s.publishBtnText}>{gigId ? "SALVAR ALTERAÇÕES" : "PUBLICAR DATA ▶"}</Text>
          }
        </TouchableOpacity>
      </ScrollView>

      {/* Modal calendário */}
      <Modal visible={showCalendar} transparent animationType="slide">
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setShowCalendar(false)}>
          <View style={s.calendarSheet}>
            <Text style={s.calendarTitle}>SELECIONAR DATA</Text>
            <Calendar
              minDate={today}
              onDayPress={day => {
                clearError("data");
                setDataISO(day.dateString);
                setShowCalendar(false);
              }}
              markedDates={dataISO ? { [dataISO]: { selected: true, selectedColor: DS.accent } } : {}}
              theme={{
                backgroundColor: DS.card,
                calendarBackground: DS.card,
                dayTextColor: DS.textPrimary,
                textDisabledColor: DS.border,
                monthTextColor: DS.textPrimary,
                arrowColor: DS.accent,
                selectedDayBackgroundColor: DS.accent,
                selectedDayTextColor: DS.textPrimary,
                todayTextColor: DS.cyan,
                textSectionTitleColor: DS.textSecondary,
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 40 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  title: { fontFamily: "Montserrat-Bold", fontSize: 26, color: DS.textPrimary },
  subtitle: { fontFamily: "Montserrat-Regular", fontSize: 13, color: DS.textSecondary, marginTop: 4 },
  cancelBtn: { fontFamily: "Montserrat-SemiBold", fontSize: 13, color: DS.textSecondary, paddingTop: 6 },
  fieldLabel: { fontFamily: "Montserrat-SemiBold", fontSize: 11, color: DS.textSecondary, letterSpacing: 2, marginBottom: 8, marginTop: 16 },
  fieldHint: { fontFamily: "Montserrat-Regular", fontSize: 11, color: DS.textSecondary, marginTop: 6, lineHeight: 16 },
  input: { backgroundColor: DS.surface, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, color: DS.textPrimary, fontFamily: "Montserrat-Regular", fontSize: 14, borderWidth: 1, borderColor: DS.border },
  inputError: { borderColor: DS.danger },
  dateBtn: { flexDirection: "row", alignItems: "center", backgroundColor: DS.surface, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: DS.border, gap: 10 },
  dateBtnText: { flex: 1, fontFamily: "Montserrat-Regular", fontSize: 14, color: DS.textPrimary },
  row: { flexDirection: "row", gap: 12 },
  saleModeRow: { flexDirection: "row", gap: 8 },
  saleModeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: DS.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: DS.surface,
  },
  saleModeBtnActive: { borderColor: DS.accent, backgroundColor: "rgba(123,97,255,0.2)" },
  saleModeBtnText: { fontFamily: "Montserrat-SemiBold", fontSize: 12, color: DS.textSecondary },
  saleModeBtnTextActive: { color: DS.textPrimary },
  coverPicker: { marginTop: 4, borderWidth: 1, borderColor: DS.border, borderRadius: 12, overflow: "hidden" },
  coverPreview: { width: "100%", height: 140 },
  coverPlaceholder: { width: "100%", height: 110, justifyContent: "center", alignItems: "center", gap: 8, backgroundColor: DS.surface },
  coverPlaceholderText: { fontFamily: "Montserrat-SemiBold", fontSize: 12, color: DS.textSecondary },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1.5 },
  chipText: { fontFamily: "Montserrat-Bold", fontSize: 12 },
  infoCard: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "rgba(123,97,255,0.1)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(123,97,255,0.3)", padding: 16, marginTop: 24, marginBottom: 8 },
  infoText: { flex: 1, fontFamily: "Montserrat-Regular", fontSize: 13, color: DS.textSecondary, lineHeight: 20 },
  publishBtn: { backgroundColor: DS.accent, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: 16 },
  publishBtnText: { fontFamily: "Montserrat-Bold", fontSize: 14, color: DS.textPrimary, letterSpacing: 1 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  calendarSheet: { backgroundColor: DS.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  calendarTitle: { fontFamily: "Montserrat-Bold", fontSize: 13, color: DS.textSecondary, letterSpacing: 2, textAlign: "center", marginBottom: 16 },
});
