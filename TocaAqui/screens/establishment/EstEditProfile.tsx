import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { establishmentService } from "@/http/establishmentService";

type NavProp = NativeStackNavigationProp<EstStackParamList>;

const TIPOS = [
  { value: "bar", label: "Bar & Music Venue" },
  { value: "casa_show", label: "Casa de Show" },
  { value: "restaurante", label: "Restaurante" },
  { value: "club", label: "Club / Balada" },
  { value: "outro", label: "Espaço Cultural" },
];

export default function EstEditProfile() {
  const navigation = useNavigation<NavProp>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("");
  const [telefone, setTelefone] = useState("");

  useEffect(() => {
    establishmentService.getMyEstablishmentProfile()
      .then(p => {
        setProfileId(p.id);
        setNome(p.nome_estabelecimento ?? "");
        setDescricao(p.descricao ?? "");
        setTipo(p.tipo_estabelecimento ?? "");
        setTelefone(p.telefone_contato ?? "");
      })
      .catch(() => Alert.alert("Erro", "Não foi possível carregar o perfil."))
      .finally(() => setLoading(false));
  }, []);

  const handleSalvar = async () => {
    if (!profileId) return;
    if (!nome.trim()) {
      Alert.alert("Atenção", "Informe o nome do estabelecimento.");
      return;
    }
    setSaving(true);
    try {
      await establishmentService.updateMyEstablishmentProfile(profileId, {
        nome_estabelecimento: nome.trim(),
        descricao: descricao.trim() || undefined,
        tipo_estabelecimento: tipo || undefined,
        telefone_contato: telefone.trim() || undefined,
      });
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Erro", e?.response?.data?.message || "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#09090F", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#7B61FF" />
      </View>
    );
  }

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <FontAwesome5 name="chevron-left" size={14} color="#7B61FF" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Nome */}
        <Text style={s.label}>NOME DO ESTABELECIMENTO</Text>
        <TextInput
          style={s.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Nome do seu espaço"
          placeholderTextColor="#555577"
        />

        {/* Descrição */}
        <Text style={s.label}>DESCRIÇÃO</Text>
        <TextInput
          style={[s.input, { minHeight: 100, textAlignVertical: "top", paddingTop: 12 }]}
          value={descricao}
          onChangeText={setDescricao}
          multiline
          placeholder="Fale sobre o seu espaço, ambiente e público"
          placeholderTextColor="#555577"
        />

        {/* Tipo */}
        <Text style={s.label}>TIPO DE ESTABELECIMENTO</Text>
        <View style={s.chipRow}>
          {TIPOS.map(t => (
            <TouchableOpacity
              key={t.value}
              style={[s.chip, tipo === t.value && s.chipActive]}
              onPress={() => setTipo(t.value)}
              activeOpacity={0.7}
            >
              <Text style={[s.chipText, tipo === t.value && s.chipTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Telefone */}
        <Text style={s.label}>TELEFONE DE CONTATO</Text>
        <TextInput
          style={s.input}
          value={telefone}
          onChangeText={setTelefone}
          placeholder="(11) 99999-9999"
          placeholderTextColor="#555577"
          keyboardType="phone-pad"
        />

        {/* Botão salvar */}
        <TouchableOpacity
          style={[s.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSalvar}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color="#FFFFFF" size="small" />
            : <Text style={s.saveBtnText}>SALVAR ALTERAÇÕES</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#09090F" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(123,97,255,0.12)",
    borderWidth: 1,
    borderColor: "#7B61FF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontFamily: "Montserrat-Bold", fontSize: 18, color: "#FFFFFF" },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  label: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: "#8888AA",
    letterSpacing: 2,
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    backgroundColor: "#13101F",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1E1A30",
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#FFFFFF",
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#1E1A30",
  },
  chipActive: { backgroundColor: "rgba(123,97,255,0.2)", borderColor: "#7B61FF" },
  chipText: { fontFamily: "Montserrat-SemiBold", fontSize: 12, color: "#8888AA" },
  chipTextActive: { color: "#7B61FF" },
  saveBtn: {
    backgroundColor: "#7B61FF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 32,
  },
  saveBtnText: { fontFamily: "Montserrat-Bold", fontSize: 14, color: "#FFFFFF", letterSpacing: 1 },
});
