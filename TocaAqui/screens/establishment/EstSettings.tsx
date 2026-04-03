import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import {
  establishmentService,
  EstablishmentMember,
  EstablishmentMembersResponse,
} from "@/http/establishmentService";
import { useAuth } from "@/contexts/AuthContext";

const ACCENT = "#A78BFA";
const BG = "#09090F";
const CARD = "#13131A";
const BORDER = "#1E1E2E";
const TEXT = "#E2E8F0";
const MUTED = "#6B7280";

export default function EstSettings() {
  const { signOut } = useAuth();
  const [estabelecimentoId, setEstabelecimentoId] = useState<number | null>(null);
  const [data, setData] = useState<EstablishmentMembersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("estabelecimentoId").then((id) => {
      if (id) setEstabelecimentoId(Number(id));
    });
  }, []);

  const fetchMembers = useCallback(async () => {
    if (!estabelecimentoId) return;
    try {
      setLoading(true);
      const result = await establishmentService.listMembers(estabelecimentoId);
      setData(result);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os gerenciadores.");
    } finally {
      setLoading(false);
    }
  }, [estabelecimentoId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleAdd = async () => {
    if (!email.trim() || !estabelecimentoId) return;
    try {
      setAdding(true);
      await establishmentService.addMember(estabelecimentoId, email.trim());
      setEmail("");
      setModalVisible(false);
      fetchMembers();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Não foi possível adicionar o gerenciador.";
      Alert.alert("Erro", msg);
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = (member: EstablishmentMember) => {
    Alert.alert(
      "Remover gerenciador",
      `Deseja remover ${member.nome_completo} como gerenciador?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              await establishmentService.removeMember(estabelecimentoId!, member.id);
              fetchMembers();
            } catch {
              Alert.alert("Erro", "Não foi possível remover o gerenciador.");
            }
          },
        },
      ]
    );
  };

  function handleSignOut() {
    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: async () => { await signOut(); } },
    ]);
  }

  const renderMember = ({ item }: { item: EstablishmentMember }) => {
    const isOwner = item.role === "owner";
    return (
      <View style={s.card}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>
            {item.nome_completo?.charAt(0)?.toUpperCase() ?? "?"}
          </Text>
        </View>
        <View style={s.info}>
          <Text style={s.name}>{item.nome_completo}</Text>
          <Text style={s.email}>{item.email}</Text>
        </View>
        <View style={s.rightCol}>
          <View style={[s.badge, isOwner ? s.badgeOwner : s.badgeAdmin]}>
            <Text style={s.badgeText}>{isOwner ? "Dono" : "Admin"}</Text>
          </View>
          {!isOwner && (
            <TouchableOpacity onPress={() => handleRemove(item)} style={s.removeBtn}>
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const allMembers: EstablishmentMember[] = data
    ? [
        ...(data.owner ? [data.owner] : []),
        ...data.members,
      ]
    : [];

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Gerenciadores</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="person-add-outline" size={18} color={ACCENT} />
          <Text style={s.addBtnText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.subtitle}>
        Gerencie quem tem acesso para administrar este estabelecimento.
      </Text>

      {loading ? (
        <ActivityIndicator color={ACCENT} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={allMembers}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMember}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <Text style={s.empty}>Nenhum gerenciador adicionado.</Text>
          }
        />
      )}

      {/* Logout */}
      <TouchableOpacity
        style={s.signOutBtn}
        onPress={handleSignOut}
        activeOpacity={0.85}
      >
        <FontAwesome5 name="sign-out-alt" size={16} color="#FF6B6B" style={{ marginRight: 10 }} />
        <Text style={s.signOutText}>SAIR DA CONTA</Text>
      </TouchableOpacity>

      {/* Modal de adicionar */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={s.modalOverlay}
        >
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Adicionar gerenciador</Text>
            <Text style={s.modalSub}>
              O usuário precisa ter uma conta no Toca Aqui.
            </Text>
            <TextInput
              style={s.input}
              placeholder="Email do usuário"
              placeholderTextColor={MUTED}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={s.modalActions}>
              <TouchableOpacity
                style={s.cancelBtn}
                onPress={() => {
                  setEmail("");
                  setModalVisible(false);
                }}
              >
                <Text style={s.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.confirmBtn, (!email.trim() || adding) && s.disabled]}
                onPress={handleAdd}
                disabled={!email.trim() || adding}
              >
                {adding ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={s.confirmText}>Adicionar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG, paddingHorizontal: 20, paddingTop: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  title: { color: TEXT, fontFamily: "Montserrat-Bold", fontSize: 20 },
  subtitle: { color: MUTED, fontFamily: "Montserrat-Regular", fontSize: 13, marginBottom: 24 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#1E1B4B", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: ACCENT, fontFamily: "Montserrat-SemiBold", fontSize: 13 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: CARD, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: BORDER },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#1E1B4B", justifyContent: "center", alignItems: "center", marginRight: 12 },
  avatarText: { color: ACCENT, fontFamily: "Montserrat-Bold", fontSize: 18 },
  info: { flex: 1 },
  name: { color: TEXT, fontFamily: "Montserrat-SemiBold", fontSize: 14 },
  email: { color: MUTED, fontFamily: "Montserrat-Regular", fontSize: 12, marginTop: 2 },
  rightCol: { alignItems: "flex-end", gap: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeOwner: { backgroundColor: "#7C3AED22" },
  badgeAdmin: { backgroundColor: "#059669" + "33" },
  badgeText: { color: TEXT, fontFamily: "Montserrat-SemiBold", fontSize: 11 },
  removeBtn: { padding: 4 },
  empty: { color: MUTED, textAlign: "center", marginTop: 40, fontFamily: "Montserrat-Regular" },
  // Modal
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" },
  modalBox: { backgroundColor: CARD, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { color: TEXT, fontFamily: "Montserrat-Bold", fontSize: 18, marginBottom: 6 },
  modalSub: { color: MUTED, fontFamily: "Montserrat-Regular", fontSize: 13, marginBottom: 20 },
  input: { backgroundColor: BG, borderWidth: 1, borderColor: BORDER, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: TEXT, fontFamily: "Montserrat-Regular", fontSize: 14, marginBottom: 20 },
  modalActions: { flexDirection: "row", gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: BORDER, alignItems: "center" },
  cancelText: { color: MUTED, fontFamily: "Montserrat-SemiBold" },
  confirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: ACCENT, alignItems: "center" },
  confirmText: { color: "#fff", fontFamily: "Montserrat-SemiBold" },
  disabled: { opacity: 0.5 },
  signOutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,107,107,0.08)", borderWidth: 1, borderColor: "rgba(255,107,107,0.3)", borderRadius: 12, paddingVertical: 15, marginTop: 24, marginBottom: 32 },
  signOutText: { fontFamily: "Montserrat-Bold", fontSize: 14, color: "#FF6B6B", letterSpacing: 1.5 },
});
