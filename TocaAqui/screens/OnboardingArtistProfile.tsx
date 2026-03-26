import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Dimensions,
  Alert,
} from "react-native";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/Navigate";

const { width } = Dimensions.get("window");

const DS = {
  bg: "#09090F",
  bgCard: "#16163A",
  bgInput: "#1E1250",
  accent: "#6C5CE7",
  accentLight: "#8B7CF8",
  cyan: "#4ECDC4",
  white: "#FFFFFF",
  textSec: "#A0A0B8",
  textDis: "#555577",
  danger: "#E53E3E",
  gold: "#F6C90E",
  success: "#10B981",
  amber: "#F59E0B",
  bgSurface: "#1A1040",
};

const TIPOS = ["Solo", "Duo", "Banda", "DJ"] as const;
type TipoAtuacao = typeof TIPOS[number];

const GENEROS: { label: string; color: string }[] = [
  { label: "ROCK", color: "#A67C7C" },
  { label: "SERTANEJO", color: "#C9A96E" },
  { label: "ELETRÔNICA", color: "#00CEC9" },
  { label: "MPB", color: "#27AE60" },
  { label: "POP", color: "#FF69B4" },
  { label: "JAZZ", color: "#6C3483" },
  { label: "INDIE", color: "#A29BFE" },
];

type NavProp = NativeStackNavigationProp<RootStackParamList, "OnboardingArtistProfile">;

export default function OnboardingArtistProfile() {
  const navigation = useNavigation<NavProp>();

  const [nomeArtistico, setNomeArtistico] = useState("");
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoAtuacao | null>(null);
  const [generosSelecionados, setGenerosSelecionados] = useState<string[]>([]);
  const [cacheMin, setCacheMin] = useState("");
  const [cacheMax, setCacheMax] = useState("");
  const [estruturaSom, setEstruturaSom] = useState(false);

  const toggleGenero = (label: string) => {
    setGenerosSelecionados((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const handleContinuar = () => {
    if (!nomeArtistico.trim()) {
      Alert.alert("Atenção", "Informe seu nome artístico para continuar.");
      return;
    }
    if (!tipoSelecionado) {
      Alert.alert("Atenção", "Selecione o tipo de atuação.");
      return;
    }
    if (generosSelecionados.length === 0) {
      Alert.alert("Atenção", "Selecione pelo menos um gênero musical.");
      return;
    }

    navigation.navigate("OnboardingArtistBio", {
      nome: nomeArtistico,
      tipo: tipoSelecionado,
      generos: generosSelecionados,
      cacheMin,
      cacheMax,
      estruturaSom,
    });
  };

  return (
    <View style={styles.root}>
      {/* Progress Bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: "25%" }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.headerLabel}>ARTIST ONBOARDING</Text>
        <Text style={styles.title}>Crie seu Perfil</Text>
        <Text style={styles.stepLabel}>01 / 04</Text>

        {/* Foto */}
        <TouchableOpacity style={styles.avatarArea} activeOpacity={0.7}>
          <FontAwesome5 name="camera" size={28} color={DS.accent} />
          <Text style={styles.avatarLabel}>ADICIONAR FOTO</Text>
        </TouchableOpacity>

        {/* Nome Artístico */}
        <Text style={styles.fieldLabel}>NOME ARTÍSTICO</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Lunar Echoes"
          placeholderTextColor={DS.textDis}
          value={nomeArtistico}
          onChangeText={setNomeArtistico}
        />

        {/* Tipo de Atuação */}
        <Text style={styles.fieldLabel}>TIPO DE ATUAÇÃO</Text>
        <View style={styles.pillRow}>
          {TIPOS.map((tipo) => {
            const active = tipoSelecionado === tipo;
            return (
              <TouchableOpacity
                key={tipo}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => setTipoSelecionado(tipo)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>
                  {tipo}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.separator} />

        {/* Gêneros Musicais */}
        <View style={styles.rowBetween}>
          <Text style={styles.fieldLabel}>GÊNEROS MUSICAIS</Text>
          <Text style={styles.multiLabel}>MÚLTIPLA ESCOLHA</Text>
        </View>
        <View style={styles.generoGrid}>
          {GENEROS.map((g) => {
            const active = generosSelecionados.includes(g.label);
            return (
              <TouchableOpacity
                key={g.label}
                style={[
                  styles.generoPill,
                  { borderColor: g.color },
                  active && { backgroundColor: g.color + "33" },
                ]}
                onPress={() => toggleGenero(g.label)}
                activeOpacity={0.7}
              >
                <Text style={[styles.generoText, { color: g.color }]}>
                  {g.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Cachê */}
        <View style={styles.cacheRow}>
          <View style={styles.cacheHalf}>
            <Text style={styles.fieldLabel}>CACHÊ MÍNIMO (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="0,00"
              placeholderTextColor={DS.textDis}
              keyboardType="numeric"
              value={cacheMin}
              onChangeText={setCacheMin}
            />
          </View>
          <View style={styles.cacheHalf}>
            <Text style={styles.fieldLabel}>CACHÊ MÁXIMO (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="0,00"
              placeholderTextColor={DS.textDis}
              keyboardType="numeric"
              value={cacheMax}
              onChangeText={setCacheMax}
            />
          </View>
        </View>

        {/* Toggle Estrutura de Som */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Estrutura de Som</Text>
            <Text style={styles.toggleSub}>
              Eu possuo P.A. e equipamentos próprios
            </Text>
          </View>
          <Switch
            value={estruturaSom}
            onValueChange={setEstruturaSom}
            trackColor={{ false: DS.textDis, true: DS.accent }}
            thumbColor={DS.white}
          />
        </View>

        {/* Botão Continuar */}
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={handleContinuar}
          activeOpacity={0.85}
        >
          <Text style={styles.btnPrimaryText}>CONTINUAR</Text>
        </TouchableOpacity>

        {/* Voltar */}
        <TouchableOpacity
          style={styles.btnBack}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <FontAwesome5 name="arrow-left" size={12} color={DS.textSec} />
          <Text style={styles.btnBackText}>VOLTAR</Text>
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
  progressBg: {
    width: "100%",
    height: 4,
    backgroundColor: DS.bgCard,
  },
  progressFill: {
    height: 4,
    backgroundColor: DS.accent,
    borderRadius: 2,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 60,
  },
  headerLabel: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 10,
    color: DS.accent,
    letterSpacing: 3,
    marginBottom: 8,
  },
  title: {
    fontFamily: "Montserrat-Bold",
    fontSize: 26,
    color: DS.white,
    marginBottom: 4,
  },
  stepLabel: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: DS.textSec,
    marginBottom: 28,
  },
  avatarArea: {
    alignSelf: "center",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: DS.accent,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
    backgroundColor: DS.bgCard,
  },
  avatarLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 10,
    color: DS.accent,
    marginTop: 6,
    letterSpacing: 1.5,
  },
  fieldLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: DS.textSec,
    letterSpacing: 2,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: DS.bgInput,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: DS.white,
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    borderWidth: 1,
    borderColor: DS.bgSurface,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DS.textDis,
    backgroundColor: DS.bgCard,
  },
  pillActive: {
    borderColor: DS.accent,
    backgroundColor: DS.accent + "22",
  },
  pillText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: DS.textSec,
  },
  pillTextActive: {
    color: DS.accentLight,
  },
  separator: {
    height: 1,
    backgroundColor: DS.bgSurface,
    marginVertical: 20,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  multiLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 10,
    color: DS.cyan,
    letterSpacing: 1.5,
  },
  generoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  generoPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: "transparent",
  },
  generoText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 11,
    letterSpacing: 1,
  },
  cacheRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  cacheHalf: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: DS.bgCard,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitle: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 14,
    color: DS.white,
  },
  toggleSub: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: DS.textSec,
    marginTop: 2,
  },
  btnPrimary: {
    backgroundColor: DS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 28,
  },
  btnPrimaryText: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 13,
    color: DS.white,
    letterSpacing: 2,
  },
  btnBack: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
    paddingVertical: 10,
  },
  btnBackText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: DS.textSec,
  },
});
