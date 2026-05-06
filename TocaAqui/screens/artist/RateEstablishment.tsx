import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/Navigate";
import { contractService } from "@/http/contractService";

const DS = {
  bg: "#09090F",
  bgCard: "#16163A",
  bgInput: "#1E1250",
  accent: "#6C5CE7",
  accentLight: "#8B7CF8",
  white: "#FFFFFF",
  textSec: "#A0A0B8",
  textDis: "#555577",
  danger: "#E53E3E",
  gold: "#F6C90E",
  success: "#10B981",
  bgSurface: "#1A1040",
};

const RATING_LABELS: Record<number, string> = {
  1: "EXPERIÊNCIA RUIM",
  2: "ABAIXO DA MÉDIA",
  3: "BOA EXPERIÊNCIA",
  4: "MUITO BOA EXPERIÊNCIA",
  5: "EXCELENTE EXPERIÊNCIA",
};

interface Chip {
  label: string;
  positive: boolean;
}

const CHIPS: Chip[] = [
  { label: "Pagamento no prazo", positive: true },
  { label: "Ambiente profissional", positive: true },
  { label: "Equipamento ok", positive: true },
  { label: "Cancelou sem aviso", positive: false },
  { label: "Pagamento atrasado", positive: false },
];

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, "RateEstablishment">;

export default function RateEstablishment() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { contractId, venueName } = route.params;

  const [rating, setRating] = useState(0);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [comentario, setComentario] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleChip = (label: string) => {
    setSelectedChips((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  };

  const handleEnviar = async () => {
    if (rating === 0) {
      Alert.alert("Atenção", "Selecione uma avaliação em estrelas.");
      return;
    }

    setSubmitting(true);
    try {
      await contractService.avaliarEstabelecimento(contractId, {
        nota: rating,
        comentario: comentario.trim() || undefined,
        tags: selectedChips,
      });
      Alert.alert(
        "Avaliação enviada!",
        "Obrigado pelo seu feedback. Isso ajuda a melhorar a experiência para todos os artistas.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch {
      Alert.alert("Erro", "Não foi possível enviar a avaliação. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Background visual */}
      <View style={styles.backgroundOverlay} />

      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <FontAwesome5 name="times" size={18} color={DS.white} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Título */}
        <Text style={styles.title}>
          Como foi o show em{"\n"}
          <Text style={styles.titleAccent}>{venueName}</Text>?
        </Text>

        {/* Estrelas */}
        <View style={styles.starsRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setRating(i + 1)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <FontAwesome5
                name="star"
                size={40}
                color={i < rating ? DS.gold : DS.textDis}
                solid={i < rating}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Rating Label */}
        {rating > 0 && (
          <Text style={styles.ratingLabel}>{RATING_LABELS[rating]}</Text>
        )}

        {/* Destaques da noite */}
        <Text style={styles.sectionTitle}>Destaques da noite</Text>
        <View style={styles.chipsGrid}>
          {CHIPS.map((chip) => {
            const selected = selectedChips.includes(chip.label);
            const activeColor = chip.positive ? DS.success : DS.danger;
            return (
              <TouchableOpacity
                key={chip.label}
                style={[
                  styles.chip,
                  selected && { borderColor: activeColor, backgroundColor: activeColor + "22" },
                ]}
                onPress={() => toggleChip(chip.label)}
                activeOpacity={0.7}
              >
                <FontAwesome5
                  name={chip.positive ? "check" : "times"}
                  size={11}
                  color={selected ? activeColor : DS.textDis}
                />
                <Text
                  style={[styles.chipText, selected && { color: activeColor }]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Comentário */}
        <Text style={styles.sectionTitle}>Deixe um comentário</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="Descreva sua experiência com este estabelecimento..."
          placeholderTextColor={DS.textDis}
          multiline
          numberOfLines={5}
          value={comentario}
          onChangeText={setComentario}
          textAlignVertical="top"
        />

        {/* Botão Enviar */}
        <TouchableOpacity
          style={[styles.btnEnviar, submitting && { opacity: 0.7 }]}
          onPress={handleEnviar}
          activeOpacity={0.85}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.btnEnviarText}>ENVIAR AVALIAÇÃO</Text>
          )}
        </TouchableOpacity>

        {/* Pular */}
        <TouchableOpacity
          style={styles.btnPular}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.btnPularText}>PULAR</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS.bg,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(9,9,15,0.92)",
  },
  closeBtn: {
    position: "absolute",
    top: 52,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DS.bgCard,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 110,
    paddingBottom: 40,
  },
  title: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 20,
    color: DS.white,
    textAlign: "center",
    lineHeight: 30,
    marginBottom: 28,
  },
  titleAccent: {
    color: DS.accent,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    marginBottom: 16,
  },
  ratingLabel: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: DS.gold,
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: DS.textSec,
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 8,
  },
  chipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: DS.textDis,
    backgroundColor: DS.bgCard,
  },
  chipText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: DS.textDis,
  },
  commentInput: {
    backgroundColor: DS.bgInput,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: DS.white,
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    minHeight: 110,
    borderWidth: 1,
    borderColor: DS.bgSurface,
    marginBottom: 24,
  },
  btnEnviar: {
    backgroundColor: DS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  btnEnviarText: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 12,
    color: DS.white,
    letterSpacing: 1.5,
  },
  btnPular: {
    alignItems: "center",
    paddingVertical: 12,
  },
  btnPularText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 14,
    color: DS.textDis,
    letterSpacing: 2,
  },
});
