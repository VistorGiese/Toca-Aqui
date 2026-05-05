import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  StyleSheet,
  StatusBar,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import { RootStackParamList } from "@/navigation/Navigate";
import { preferenciaService } from "@/http/artistaPublicoService";

type Props = NativeStackScreenProps<RootStackParamList, "UserOnboardingLocation">;

const VENUE_TYPES = [
  "Bar",
  "Pub",
  "Casa de Shows",
  "Restaurante",
  "Evento Privado",
  "Ao Ar Livre",
];

export default function UserOnboardingLocation({ route, navigation }: Props) {
  const [city, setCity] = useState("");
  const [useLocation, setUseLocation] = useState(false);
  const [radius, setRadius] = useState(50);
  const [selectedVenues, setSelectedVenues] = useState<string[]>([]);

  function toggleVenue(v: string) {
    setSelectedVenues((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  }

  async function handleStart() {
    try {
      await preferenciaService.salvar({
        cidade: city || undefined,
        raio_busca_km: radius,
        tipos_local: selectedVenues.length > 0 ? selectedVenues : undefined,
      });
    } catch {}
    navigation.reset({ index: 0, routes: [{ name: "UserNavigator" as any }] });
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
        <View style={[styles.progressSegment, styles.progressActive]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.titleWhite}>DEFINA SEU</Text>
          <Text style={styles.titleAccent}>RITMO.</Text>
        </View>

        <Text style={styles.subtitle}>Onde vamos buscar a próxima vibe?</Text>

        {/* City Search */}
        <View style={styles.searchBox}>
          <FontAwesome5 name="map-marker-alt" size={16} color="#A78BFA" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Busque sua cidade..."
            placeholderTextColor="#555577"
            value={city}
            onChangeText={setCity}
          />
        </View>

        {/* Location Toggle */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Usar minha localização atual</Text>
          <Switch
            value={useLocation}
            onValueChange={setUseLocation}
            trackColor={{ false: "#1A1040", true: "#6C5CE7" }}
            thumbColor={useLocation ? "#A78BFA" : "#555577"}
          />
        </View>

        {/* Radius Card */}
        <View style={styles.radiusCard}>
          <Text style={styles.radiusCardTitle}>RAIO DE BUSCA</Text>
          <Text style={styles.radiusValue}>{radius} KM</Text>

          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>LOCAL{"\n"}1KM</Text>
            <View style={styles.sliderTrack}>
              <View
                style={[
                  styles.sliderFill,
                  { width: `${((radius - 1) / 199) * 100}%` },
                ]}
              />
              <View style={styles.sliderThumb} />
            </View>
            <Text style={[styles.sliderLabel, { textAlign: "right" }]}>
              ESTENDIDO{"\n"}200KM
            </Text>
          </View>

          <View style={styles.radiusControls}>
            <TouchableOpacity
              style={styles.radiusBtn}
              onPress={() => setRadius((r) => Math.max(1, r - 10))}
            >
              <FontAwesome5 name="minus" size={14} color="#A78BFA" />
            </TouchableOpacity>
            <Text style={styles.radiusBtnLabel}>{radius} km</Text>
            <TouchableOpacity
              style={styles.radiusBtn}
              onPress={() => setRadius((r) => Math.min(200, r + 10))}
            >
              <FontAwesome5 name="plus" size={14} color="#A78BFA" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Venue type section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleWhite}>ESCOLHA SEU</Text>
          <Text style={styles.sectionTitleAccent}>CENÁRIO.</Text>
        </View>

        <View style={styles.venueGrid}>
          {VENUE_TYPES.map((v) => {
            const isSelected = selectedVenues.includes(v);
            return (
              <TouchableOpacity
                key={v}
                style={[styles.venueChip, isSelected && styles.venueChipSelected]}
                onPress={() => toggleVenue(v)}
                activeOpacity={0.7}
              >
                <Text style={[styles.venueChipText, isSelected && styles.venueChipTextSelected]}>
                  {v}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* CTA Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.8}>
          <Text style={styles.startBtnText}>COMEÇAR A DESCOBRIR →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090F" },
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
  skipText: { fontFamily: "Montserrat-SemiBold", fontSize: 12, color: "#A78BFA" },
  progressRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 6,
    marginBottom: 24,
  },
  progressSegment: { flex: 1, height: 3, borderRadius: 2 },
  progressActive: { backgroundColor: "#A78BFA" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  titleBlock: { marginBottom: 8 },
  titleWhite: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 26,
    color: "#FFFFFF",
    lineHeight: 34,
  },
  titleAccent: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 26,
    color: "#00C896",
    lineHeight: 34,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: "#A0A0B8",
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 52,
  },
  searchIcon: { marginRight: 12 },
  searchInput: {
    flex: 1,
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: "#FFFFFF",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  toggleLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: "#FFFFFF",
  },
  radiusCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.2)",
    padding: 16,
    marginBottom: 24,
  },
  radiusCardTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 11,
    color: "#A78BFA",
    letterSpacing: 2,
    marginBottom: 8,
  },
  radiusValue: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 32,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sliderLabel: {
    fontFamily: "Montserrat-Regular",
    fontSize: 10,
    color: "#555577",
    width: 52,
    lineHeight: 14,
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  sliderFill: {
    height: 4,
    backgroundColor: "#A78BFA",
    borderRadius: 2,
  },
  sliderThumb: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#A78BFA",
    right: -7,
  },
  radiusControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  radiusBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#A78BFA",
    alignItems: "center",
    justifyContent: "center",
  },
  radiusBtnLabel: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: "#FFFFFF",
    minWidth: 60,
    textAlign: "center",
  },
  sectionHeader: { marginBottom: 16 },
  sectionTitleWhite: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 20,
    color: "#FFFFFF",
  },
  sectionTitleAccent: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 20,
    color: "#A78BFA",
  },
  venueGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  venueChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  venueChipSelected: {
    backgroundColor: "rgba(167,139,250,0.15)",
    borderColor: "#A78BFA",
  },
  venueChipText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: "#888",
  },
  venueChipTextSelected: { color: "#A78BFA" },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    backgroundColor: "#09090F",
  },
  startBtn: {
    backgroundColor: "#6C5CE7",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  startBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: 1.5,
  },
});
