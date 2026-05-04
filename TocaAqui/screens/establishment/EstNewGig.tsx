import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, Modal,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { establishmentService } from "@/http/establishmentService";
import { getGenreColor } from "@/utils/colors";

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
  const [cache, setCache] = useState("");
  const [generos, setGeneros] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadGig = useCallback(async () => {
    if (!gigId) return;
    setLoading(true);
    try {
      const g = await establishmentService.getGigById(gigId);
      setTitulo(g.titulo_evento);
      setDataISO(g.data_show);
      setInicio(g.horario_inicio);
      setFim(g.horario_fim);
      if (g.cache_minimo) setCache(String(g.cache_minimo));
      if (g.generos_musicais) setGeneros(g.generos_musicais.split(",").map(s => s.trim()));
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
    if (!titulo.trim()) { Alert.alert("Atenção", "Informe o título do evento."); return; }
    if (!dataISO) { Alert.alert("Atenção", "Selecione a data do evento."); return; }
    if (!inicio || inicio.length < 5) { Alert.alert("Atenção", "Informe o horário de início (HH:MM)."); return; }
    if (!fim || fim.length < 5) { Alert.alert("Atenção", "Informe o horário de fim (HH:MM)."); return; }
    setSaving(true);
    try {
      const payload = {
        titulo_evento: titulo,
        data_show: dataISO,
        horario_inicio: inicio,
        horario_fim: fim,
        cache_minimo: cache ? Number(cache) : undefined,
        generos_musicais: generos.join(", ") || undefined,
      };
      if (gigId) await establishmentService.updateGig(gigId, payload);
      else await establishmentService.createGig(payload);
      Alert.alert("Sucesso", gigId ? "Data atualizada!" : "Data publicada!");
      navigation.goBack();
    } catch (e: any) {
      const data = e?.response?.data;
      const detalhes = data?.detalhes?.map((d: any) => d.mensagem).join("\n");
      const msg = detalhes || data?.message || data?.error || "Não foi possível salvar.";
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
          style={s.input}
          placeholder="Ex: Festival de Inverno 2024"
          placeholderTextColor={DS.border}
          value={titulo}
          onChangeText={setTitulo}
        />

        {/* Data — picker */}
        <Text style={s.fieldLabel}>DATA DO EVENTO</Text>
        <TouchableOpacity style={s.dateBtn} onPress={() => setShowCalendar(true)} activeOpacity={0.8}>
          <FontAwesome5 name="calendar-alt" size={15} color={DS.accent} />
          <Text style={[s.dateBtnText, !dataISO && { color: DS.border }]}>
            {dataISO ? isoToDisplay(dataISO) : "Selecionar data"}
          </Text>
          <FontAwesome5 name="chevron-down" size={12} color={DS.textSecondary} />
        </TouchableOpacity>

        {/* Horários */}
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.fieldLabel}>INÍCIO</Text>
            <TextInput
              style={s.input}
              placeholder="19:00"
              placeholderTextColor={DS.border}
              value={inicio}
              onChangeText={v => setInicio(maskTime(v))}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.fieldLabel}>FIM</Text>
            <TextInput
              style={s.input}
              placeholder="23:00"
              placeholderTextColor={DS.border}
              value={fim}
              onChangeText={v => setFim(maskTime(v))}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
        </View>

        {/* Cachê — valor único */}
        <Text style={s.fieldLabel}>CACHÊ OFERECIDO (R$)</Text>
        <TextInput
          style={s.input}
          placeholder="Ex: 800"
          placeholderTextColor={DS.border}
          value={cache}
          onChangeText={setCache}
          keyboardType="numeric"
        />

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
  input: { backgroundColor: DS.surface, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, color: DS.textPrimary, fontFamily: "Montserrat-Regular", fontSize: 14, borderWidth: 1, borderColor: DS.border },
  dateBtn: { flexDirection: "row", alignItems: "center", backgroundColor: DS.surface, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: DS.border, gap: 10 },
  dateBtnText: { flex: 1, fontFamily: "Montserrat-Regular", fontSize: 14, color: DS.textPrimary },
  row: { flexDirection: "row", gap: 12 },
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
