import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import { RootStackParamList } from "@/navigation/Navigate";
import { preferenciaService } from "@/http/artistaPublicoService";

type Props = NativeStackScreenProps<RootStackParamList, "UserOnboardingGenres">;

const GENRES = [
  { key: "Samba", icon: "music" },
  { key: "Forró", icon: "music" },
  { key: "Rock", icon: "guitar" },
  { key: "MPB", icon: "microphone" },
  { key: "Pop", icon: "star" },
  { key: "Eletrônica", icon: "bolt" },
  { key: "Sertanejo", icon: "hat-cowboy" },
  { key: "Jazz", icon: "music" },
  { key: "Blues", icon: "guitar" },
  { key: "Funk", icon: "headphones" },
];

export default function UserOnboardingGenres({ navigation }: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggleGenre(key: string) {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((g) => g !== key) : [...prev, key]
    );
  }

  async function handleNext() {
    if (selected.length < 2) return;
    try {
      await preferenciaService.salvar({ generos_favoritos: selected });
    } catch {}
    (navigation as any).navigate("UserOnboardingLocation", { generos: selected });
  }

  function handleSkip() {
    navigation.reset({ index: 0, routes: [{ name: "UserNavigator" as any }] });
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090F" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.headerBrand}>TOCA AQUI</Text>
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>PULAR</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressRow}>
        <View style={[styles.progressSegment, styles.progressActive]} />
        <View style={[styles.progressSegment, styles.progressInactive]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.titleWhite}>O que você</Text>
          <Text style={styles.titleAccent}>curte?</Text>
        </View>

        <Text style={styles.subtitle}>
          Vamos personalizar sua experiência baseada nos ritmos que fazem seu
          coração bater mais forte.
        </Text>

        {/* Counter label */}
        <View style={styles.counterRow}>
          <Text style={styles.counterLabel}>Selecione pelo menos 2</Text>
          <Text style={styles.counterValue}>
            {selected.length} selecionado{selected.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Genre Grid */}
        <View style={styles.grid}>
          {GENRES.map((genre) => {
            const isSelected = selected.includes(genre.key);
            return (
              <TouchableOpacity
                key={genre.key}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => toggleGenre(genre.key)}
                activeOpacity={0.7}
              >
                <FontAwesome5
                  name={genre.icon as any}
                  size={18}
                  color={isSelected ? "#A78BFA" : "#888"}
                  style={styles.chipIcon}
                />
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {genre.key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, selected.length < 2 && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={selected.length < 2}
          activeOpacity={0.8}
        >
          <Text style={styles.nextBtnText}>PRÓXIMO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090F",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerLeft: { width: 60 },
  headerBrand: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: "#A78BFA",
    letterSpacing: 2,
  },
  skipBtn: { width: 60, alignItems: "flex-end" },
  skipText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: "#A78BFA",
  },
  progressRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 6,
    marginBottom: 24,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  progressActive: { backgroundColor: "#A78BFA" },
  progressInactive: { backgroundColor: "rgba(167,139,250,0.2)" },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  titleBlock: { marginBottom: 12 },
  titleWhite: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 28,
    color: "#FFFFFF",
    lineHeight: 36,
  },
  titleAccent: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 28,
    color: "#A78BFA",
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: "#A0A0B8",
    lineHeight: 22,
    marginBottom: 24,
  },
  counterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  counterLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: "#888",
  },
  counterValue: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: "#A78BFA",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  chipSelected: {
    backgroundColor: "rgba(167,139,250,0.15)",
    borderColor: "#A78BFA",
  },
  chipIcon: { marginBottom: 8 },
  chipText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: "#888",
    textAlign: "center",
  },
  chipTextSelected: { color: "#A78BFA" },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    backgroundColor: "#09090F",
  },
  nextBtn: {
    backgroundColor: "#6C5CE7",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: 2,
  },
});
