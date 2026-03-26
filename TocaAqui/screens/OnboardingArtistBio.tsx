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
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/Navigate";
import api from "@/http/api";

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
  pink: "#E91E8C",
};

const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC",
  "SP","SE","TO",
];

type NavProp = NativeStackNavigationProp<RootStackParamList, "OnboardingArtistBio">;
type RouteType = RouteProp<RootStackParamList, "OnboardingArtistBio">;

export default function OnboardingArtistBio() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const params = route.params;

  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("SP");
  const [showUfPicker, setShowUfPicker] = useState(false);
  const [bio, setBio] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [novoLink, setNovoLink] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const bioChars = bio.length;

  const addLink = () => {
    if (novoLink.trim()) {
      setLinks((prev) => [...prev, novoLink.trim()]);
      setNovoLink("");
      setShowLinkInput(false);
    }
  };

  const handleConcluir = async () => {
    if (!cidade.trim()) {
      Alert.alert("Atenção", "Informe sua cidade.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/usuarios/perfil-artista", {
        nome_artistico: params.nome,
        tipo_atuacao: params.tipo,
        generos: params.generos,
        cache_minimo: params.cacheMin ? parseFloat(params.cacheMin) : undefined,
        cache_maximo: params.cacheMax ? parseFloat(params.cacheMax) : undefined,
        estrutura_som_propria: params.estruturaSom,
        cidade,
        estado,
        bio,
        links_sociais: links,
      });

      navigation.reset({ index: 0, routes: [{ name: "ArtistNavigator" }] });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Não foi possível salvar o perfil.";
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Progress Bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: "75%" }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* -------- ETAPA 3 -------- */}
        <Text style={[styles.etapaLabel, { color: DS.cyan }]}>ETAPA 3 DE 4</Text>
        <Text style={styles.titleLarge}>Onde a mágica acontece?</Text>
        <Text style={styles.subtitle}>
          Informe sua cidade base para aparecer nos resultados de busca da sua região.
        </Text>

        <Text style={styles.fieldLabel}>CIDADE</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: São Paulo"
          placeholderTextColor={DS.textDis}
          value={cidade}
          onChangeText={setCidade}
        />

        <Text style={styles.fieldLabel}>ESTADO</Text>
        <TouchableOpacity
          style={[styles.input, styles.selectRow]}
          onPress={() => setShowUfPicker(!showUfPicker)}
          activeOpacity={0.8}
        >
          <Text style={styles.selectText}>{estado}</Text>
          <FontAwesome5
            name={showUfPicker ? "chevron-up" : "chevron-down"}
            size={12}
            color={DS.textSec}
          />
        </TouchableOpacity>
        {showUfPicker && (
          <View style={styles.ufList}>
            <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
              {UFS.map((uf) => (
                <TouchableOpacity
                  key={uf}
                  style={[styles.ufItem, estado === uf && styles.ufItemActive]}
                  onPress={() => {
                    setEstado(uf);
                    setShowUfPicker(false);
                  }}
                >
                  <Text style={[styles.ufText, estado === uf && { color: DS.accent }]}>
                    {uf}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Card Mapa visual */}
        <View style={styles.mapCard}>
          <MaterialCommunityIcons name="map-marker" size={32} color={DS.accent} />
          <Text style={styles.mapLabel}>VISUALIZAÇÃO DO MAPA</Text>
          <Text style={styles.mapSub}>
            {cidade ? `${cidade}, ${estado}` : "Preencha a cidade acima"}
          </Text>
        </View>

        <View style={styles.separator} />

        {/* -------- ETAPA 4 -------- */}
        {/* Atualiza progress para 100% visualmente neste bloco */}
        <View style={styles.progressBgInline}>
          <View style={[styles.progressFill, { width: "100%" }]} />
        </View>
        <Text style={[styles.etapaLabel, { color: DS.pink, marginTop: 16 }]}>ETAPA 4 DE 4</Text>
        <Text style={styles.titleLarge}>Sua vitrine editorial.</Text>
        <Text style={styles.subtitle}>
          Apresente-se para os estabelecimentos. Seja autêntico e direto.
        </Text>

        <View style={styles.rowBetween}>
          <Text style={styles.fieldLabel}>SOBRE MIM / NÓS</Text>
          <Text style={styles.charCount}>{bioChars} / 1000</Text>
        </View>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Conte sua história, estilo musical, experiências..."
          placeholderTextColor={DS.textDis}
          multiline
          numberOfLines={6}
          maxLength={1000}
          value={bio}
          onChangeText={setBio}
          textAlignVertical="top"
        />

        <Text style={styles.fieldLabel}>LINKS & MÍDIA</Text>

        {links.map((l, i) => (
          <View key={i} style={styles.linkChip}>
            <FontAwesome5 name="link" size={12} color={DS.accentLight} />
            <Text style={styles.linkText} numberOfLines={1}>{l}</Text>
            <TouchableOpacity onPress={() => setLinks((prev) => prev.filter((_, idx) => idx !== i))}>
              <FontAwesome5 name="times" size={12} color={DS.danger} />
            </TouchableOpacity>
          </View>
        ))}

        {showLinkInput && (
          <View style={styles.linkInputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="https://..."
              placeholderTextColor={DS.textDis}
              value={novoLink}
              onChangeText={setNovoLink}
              autoCapitalize="none"
              keyboardType="url"
            />
            <TouchableOpacity style={styles.btnAddSmall} onPress={addLink}>
              <Text style={styles.btnAddSmallText}>ADD</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => setShowLinkInput(!showLinkInput)}
          activeOpacity={0.8}
        >
          <FontAwesome5 name="link" size={13} color={DS.accentLight} />
          <Text style={styles.btnOutlineText}>ADD SOCIAL LINK</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnOutline} activeOpacity={0.8}>
          <FontAwesome5 name="play-circle" size={13} color={DS.accentLight} />
          <Text style={styles.btnOutlineText}>ADICIONAR VÍDEO</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadArea} activeOpacity={0.8}>
          <FontAwesome5 name="cloud-upload-alt" size={24} color={DS.textSec} />
          <Text style={styles.uploadLabel}>ARRASTE SEU PRESS KIT OU FOTOS</Text>
          <Text style={styles.uploadSub}>PNG, JPG, PDF — máx 10MB</Text>
        </TouchableOpacity>

        {/* Botão Concluir */}
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={handleConcluir}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={DS.white} />
          ) : (
            <Text style={styles.btnPrimaryText}>CONCLUIR E IR PARA O APP</Text>
          )}
        </TouchableOpacity>

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
  progressBgInline: {
    width: "100%",
    height: 4,
    backgroundColor: DS.bgCard,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    backgroundColor: DS.accent,
    borderRadius: 2,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 60,
  },
  etapaLabel: {
    fontFamily: "Montserrat-Bold",
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 8,
  },
  titleLarge: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 20,
    color: DS.white,
    marginBottom: 8,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: DS.textSec,
    marginBottom: 20,
    lineHeight: 20,
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
  selectRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: DS.white,
  },
  ufList: {
    backgroundColor: DS.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: DS.bgSurface,
    marginTop: 4,
  },
  ufItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DS.bgSurface,
  },
  ufItemActive: {
    backgroundColor: DS.accent + "22",
  },
  ufText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: DS.white,
  },
  mapCard: {
    backgroundColor: DS.bgCard,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    height: 120,
    marginTop: 16,
    borderWidth: 1,
    borderColor: DS.bgSurface,
  },
  mapLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: DS.textSec,
    letterSpacing: 2,
    marginTop: 8,
  },
  mapSub: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: DS.textDis,
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: DS.bgSurface,
    marginVertical: 28,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  charCount: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: DS.textDis,
    marginTop: 16,
  },
  textarea: {
    minHeight: 120,
    paddingTop: 12,
  },
  linkChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS.bgCard,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
    gap: 8,
  },
  linkText: {
    flex: 1,
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: DS.textSec,
  },
  linkInputRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  btnAddSmall: {
    backgroundColor: DS.accent,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  btnAddSmallText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 12,
    color: DS.white,
  },
  btnOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: DS.accentLight,
    borderRadius: 10,
    paddingVertical: 13,
    marginTop: 10,
    gap: 8,
  },
  btnOutlineText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: DS.accentLight,
    letterSpacing: 1,
  },
  uploadArea: {
    borderWidth: 1,
    borderColor: DS.bgSurface,
    borderStyle: "dashed",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
    marginTop: 10,
    gap: 8,
    backgroundColor: DS.bgCard,
  },
  uploadLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: DS.textSec,
    letterSpacing: 1,
  },
  uploadSub: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: DS.textDis,
  },
  btnPrimary: {
    backgroundColor: DS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 32,
  },
  btnPrimaryText: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 12,
    color: DS.white,
    letterSpacing: 1.5,
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
