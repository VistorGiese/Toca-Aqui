import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
  StatusBar,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/Navigate";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/http/api";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DS = {
  bg: "#09090F",
  card: "#16163A",
  surface: "#1E1250",
  accent: "#7B61FF",
  border: "#2A2560",
  textPrimary: "#FFFFFF",
  textSecondary: "#8888AA",
  textMuted: "#555577",
  danger: "#EF4444",
  success: "#22C55E",
};

const GENEROS_OPCOES = [
  "Rock", "Pop", "Samba", "Forró", "Pagode", "MPB", "Jazz",
  "Blues", "Funk", "Eletrônico", "Reggae", "Hip Hop", "Gospel",
  "Clássico", "Sertanejo", "Metal", "Indie",
];

export default function ArtistProfileEdit() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nomeArtistico, setNomeArtistico] = useState("");
  const [bio, setBio] = useState("");
  const [generosSelecionados, setGenerosSelecionados] = useState<string[]>([]);
  const [cacheMin, setCacheMin] = useState("");

  useEffect(() => {
    const perfilId = (user as any)?.perfilArtistaId;
    if (!perfilId) {
      setLoading(false);
      return;
    }
    api
      .get(`/artistas/${perfilId}/publico`)
      .then((r) => {
        const p = r.data?.perfil ?? r.data?.artista ?? r.data;
        if (!p) return;
        setNomeArtistico(p.nome_artistico ?? "");
        setBio(p.biografia ?? "");
        const g = p.generos;
        if (Array.isArray(g)) setGenerosSelecionados(g);
        else if (typeof g === "string" && g.length > 0)
          setGenerosSelecionados(g.split(",").map((s: string) => s.trim()).filter(Boolean));
        setCacheMin(p.cache_minimo ? String(p.cache_minimo) : "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [(user as any)?.perfilArtistaId]);

  function toggleGenero(g: string) {
    setGenerosSelecionados((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }

  async function handleSalvar() {
    const perfilId = (user as any)?.perfilArtistaId;
    if (!perfilId) {
      Alert.alert("Erro", "Perfil de artista não encontrado.");
      return;
    }
    if (!nomeArtistico.trim()) {
      Alert.alert("Atenção", "Nome artístico é obrigatório.");
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/usuarios/perfil-artista/${perfilId}`, {
        nome_artistico: nomeArtistico.trim(),
        biografia: bio.trim() || undefined,
        generos: generosSelecionados.length > 0 ? generosSelecionados : undefined,
        cache_minimo: cacheMin ? Number(cacheMin) : undefined,
      });
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert("Erro", e?.response?.data?.message || "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={[s.root, { justifyContent: "center", alignItems: "center" }]}>
        <StatusBar barStyle="light-content" backgroundColor={DS.bg} />
        <ActivityIndicator size="large" color={DS.accent} />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={16} color={DS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Nome artístico */}
          <Text style={s.label}>Nome Artístico *</Text>
          <TextInput
            style={s.input}
            value={nomeArtistico}
            onChangeText={setNomeArtistico}
            placeholder="Seu nome artístico ou da banda"
            placeholderTextColor={DS.textMuted}
            maxLength={80}
          />

          {/* Bio */}
          <Text style={s.label}>Biografia</Text>
          <TextInput
            style={[s.input, s.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Conte um pouco sobre você e sua música..."
            placeholderTextColor={DS.textMuted}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />

          {/* Gêneros */}
          <Text style={s.label}>Gêneros Musicais</Text>
          <View style={s.chipsWrap}>
            {GENEROS_OPCOES.map((g) => {
              const sel = generosSelecionados.includes(g);
              return (
                <TouchableOpacity
                  key={g}
                  style={[s.chip, sel && s.chipOn]}
                  onPress={() => toggleGenero(g)}
                  activeOpacity={0.75}
                >
                  <Text style={[s.chipText, sel && s.chipTextOn]}>{g}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Cachê mínimo */}
          <Text style={s.label}>Cachê Mínimo (R$)</Text>
          <TextInput
            style={s.input}
            value={cacheMin}
            onChangeText={(v) => setCacheMin(v.replace(/[^0-9]/g, ""))}
            placeholder="Ex: 500"
            placeholderTextColor={DS.textMuted}
            keyboardType="numeric"
          />

          {/* Botão salvar */}
          <TouchableOpacity
            style={[s.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSalvar}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={s.saveBtnText}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: DS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DS.card,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 18,
    color: DS.textPrimary,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  label: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: DS.textSecondary,
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: DS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: DS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: "Montserrat-Regular",
    fontSize: 15,
    color: DS.textPrimary,
    marginBottom: 20,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DS.border,
    backgroundColor: DS.card,
  },
  chipOn: {
    backgroundColor: DS.accent,
    borderColor: DS.accent,
  },
  chipText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: DS.textSecondary,
  },
  chipTextOn: {
    color: "#FFFFFF",
  },
  saveBtn: {
    backgroundColor: DS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  saveBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
});
