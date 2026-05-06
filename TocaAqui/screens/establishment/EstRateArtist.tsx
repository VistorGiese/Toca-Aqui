import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, StatusBar,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { establishmentService } from "@/http/establishmentService";

const DS = {
  bg: "#09090F", card: "#13101F", surface: "#0F0B1E",
  border: "#1E1A30", accent: "#7B61FF",
  success: "#00C853", danger: "#EF4444", gold: "#F6C90E",
  textPrimary: "#FFFFFF", textSecondary: "#8888AA", textMuted: "#555577",
};

const RATING_LABELS: Record<number, string> = {
  1: "EXPERIÊNCIA RUIM",
  2: "ABAIXO DA MÉDIA",
  3: "BOA PERFORMANCE",
  4: "MUITO BOA PERFORMANCE",
  5: "EXCELENTE PERFORMANCE",
};

interface Chip { label: string; positive: boolean; }
const CHIPS: Chip[] = [
  { label: "Pontual no sound check", positive: true },
  { label: "Profissional", positive: true },
  { label: "Ótima performance", positive: true },
  { label: "Público adorou", positive: true },
  { label: "Atrasou no show", positive: false },
  { label: "Não apareceu", positive: false },
];

type NavProp = NativeStackNavigationProp<EstStackParamList>;
type RouteType = RouteProp<EstStackParamList, "EstRateArtist">;

export default function EstRateArtist() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { contractId, artistName, showDate } = route.params;

  const [rating, setRating] = useState(0);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [comentario, setComentario] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleChip = (label: string) => {
    setSelectedChips((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  };

  const formattedDate = showDate
    ? new Date(showDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : "";

  const handleEnviar = async () => {
    if (rating === 0) {
      Alert.alert("Atenção", "Selecione uma avaliação em estrelas.");
      return;
    }
    setSubmitting(true);
    try {
      await establishmentService.rateArtist(contractId, {
        nota: rating,
        comentario: comentario.trim() || undefined,
        tags: selectedChips,
      });
      Alert.alert(
        "Avaliação enviada!",
        "Obrigado pelo feedback. Isso ajuda artistas a melhorarem.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Não foi possível enviar a avaliação.";
      Alert.alert("Erro", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      {/* Close */}
      <TouchableOpacity style={s.closeBtn} onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <FontAwesome5 name="times" size={18} color={DS.textPrimary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>
          Como foi a performance de{"\n"}
          <Text style={s.titleAccent}>{artistName}</Text>?
        </Text>

        {formattedDate ? (
          <Text style={s.dateText}>{formattedDate}</Text>
        ) : null}

        {/* Estrelas */}
        <View style={s.starsRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <TouchableOpacity key={i} onPress={() => setRating(i + 1)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <FontAwesome5
                name="star"
                size={40}
                color={i < rating ? DS.gold : DS.textMuted}
                solid={i < rating}
              />
            </TouchableOpacity>
          ))}
        </View>

        {rating > 0 && (
          <Text style={s.ratingLabel}>{RATING_LABELS[rating]}</Text>
        )}

        {/* Chips */}
        <Text style={s.sectionTitle}>Destaques do show</Text>
        <View style={s.chipsGrid}>
          {CHIPS.map((chip) => {
            const selected = selectedChips.includes(chip.label);
            const activeColor = chip.positive ? DS.success : DS.danger;
            return (
              <TouchableOpacity
                key={chip.label}
                style={[s.chip, selected && { borderColor: activeColor, backgroundColor: activeColor + "22" }]}
                onPress={() => toggleChip(chip.label)}
                activeOpacity={0.7}
              >
                <FontAwesome5
                  name={chip.positive ? "check" : "times"}
                  size={11}
                  color={selected ? activeColor : DS.textMuted}
                />
                <Text style={[s.chipText, selected && { color: activeColor }]}>{chip.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Comentário */}
        <Text style={s.sectionTitle}>Deixe um comentário</Text>
        <TextInput
          style={s.input}
          placeholder="Descreva a experiência com este artista..."
          placeholderTextColor={DS.textMuted}
          multiline
          numberOfLines={5}
          value={comentario}
          onChangeText={setComentario}
          textAlignVertical="top"
        />

        {/* Enviar */}
        <TouchableOpacity
          style={[s.btnEnviar, submitting && s.disabled]}
          onPress={handleEnviar}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={s.btnEnviarText}>ENVIAR AVALIAÇÃO</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={s.btnPular} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={s.btnPularText}>PULAR</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.bg },
  closeBtn: {
    position: "absolute", top: 52, left: 20, zIndex: 10,
    width: 40, height: 40, borderRadius: 20, backgroundColor: DS.card,
    justifyContent: "center", alignItems: "center",
  },
  scroll: { paddingHorizontal: 24, paddingTop: 110, paddingBottom: 40 },

  title: {
    fontFamily: "AkiraExpanded-Superbold", fontSize: 18, color: DS.textPrimary,
    textAlign: "center", lineHeight: 28, marginBottom: 8,
  },
  titleAccent: { color: DS.accent },
  dateText: {
    fontFamily: "Montserrat-Regular", fontSize: 13, color: DS.textSecondary,
    textAlign: "center", marginBottom: 28,
  },

  starsRow: { flexDirection: "row", justifyContent: "center", gap: 14, marginBottom: 16 },
  ratingLabel: {
    fontFamily: "Montserrat-Bold", fontSize: 13, color: DS.gold,
    textAlign: "center", letterSpacing: 2, marginBottom: 28,
  },

  sectionTitle: {
    fontFamily: "Montserrat-SemiBold", fontSize: 13, color: DS.textSecondary,
    letterSpacing: 1.5, marginBottom: 12, marginTop: 8,
  },
  chipsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
    borderWidth: 1.5, borderColor: DS.textMuted, backgroundColor: DS.card,
  },
  chipText: { fontFamily: "Montserrat-SemiBold", fontSize: 12, color: DS.textMuted },

  input: {
    backgroundColor: DS.surface, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    color: DS.textPrimary, fontFamily: "Montserrat-Regular", fontSize: 14,
    minHeight: 110, borderWidth: 1, borderColor: DS.border, marginBottom: 24,
  },

  btnEnviar: {
    backgroundColor: DS.accent, borderRadius: 12, paddingVertical: 16,
    alignItems: "center", marginBottom: 12,
  },
  btnEnviarText: { fontFamily: "Montserrat-Bold", fontSize: 13, color: "#fff", letterSpacing: 1 },

  btnPular: { alignItems: "center", paddingVertical: 12 },
  btnPularText: { fontFamily: "Montserrat-SemiBold", fontSize: 14, color: DS.textMuted, letterSpacing: 2 },

  disabled: { opacity: 0.5 },
});
