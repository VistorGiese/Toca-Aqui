import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  StatusBar,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import Modal from "react-native-modal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import { UserStackParamList } from "@/navigation/UserNavigator";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/http/userService";
import { preferenciaService } from "@/http/artistaPublicoService";

type Props = NativeStackScreenProps<UserStackParamList, "UserSettings">;

const GENRE_COLORS: Record<string, string> = {
  Samba: "#F39C12", Forró: "#E67E22", Rock: "#A67C7C", MPB: "#27AE60",
  Pop: "#8E44AD", Eletrônica: "#00CEC9", Sertanejo: "#D35400", Jazz: "#2980B9",
  Blues: "#1A252F", Funk: "#C0392B", Techno: "#6C5CE7",
};

export default function UserSettings({ navigation }: Props) {
  const { user, paginas, signOut } = useAuth();
  const [notifyShows, setNotifyShows] = useState(true);
  const [notifyReminders, setNotifyReminders] = useState(true);
  const [radius, setRadius] = useState(25);
  const [generosFavoritos, setGenerosFavoritos] = useState<string[]>([]);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [hasEstablishment, setHasEstablishment] = useState(false);
  const [hasArtistProfile, setHasArtistProfile] = useState(false);

  useEffect(() => {
    // Usa paginas do AuthContext como fonte primária; fallback para AsyncStorage
    if (paginas?.pagina_estabelecimento) {
      AsyncStorage.setItem("estabelecimentoId", String(paginas.pagina_estabelecimento.id));
      setHasEstablishment(true);
    } else {
      AsyncStorage.getItem("estabelecimentoId").then(id => {
        setHasEstablishment(!!id);
      });
    }
    preferenciaService.buscar().then(prefs => {
      if (prefs?.generos_favoritos) setGenerosFavoritos(prefs.generos_favoritos);
      if (prefs?.raio_busca_km) setRadius(prefs.raio_busca_km);
    }).catch(() => {});
    userService.getProfile().then(res => {
      setHasArtistProfile((res.user.artist_profiles?.length ?? 0) > 0);
    }).catch(() => {});
  }, [paginas]);

  async function handleSalvarPreferencias() {
    setSavingPrefs(true);
    try {
      await preferenciaService.salvar({
        generos_favoritos: generosFavoritos,
        raio_busca_km: radius,
        notif_novos_shows: notifyShows,
        notif_lembretes: notifyReminders,
      });
      Alert.alert("Salvo", "Preferências atualizadas com sucesso.");
    } catch {
      Alert.alert("Erro", "Não foi possível salvar as preferências.");
    } finally {
      setSavingPrefs(false);
    }
  }

  // Alterar email
  const [emailModal, setEmailModal] = useState(false);
  const [novoEmail, setNovoEmail] = useState("");
  const [senhaEmail, setSenhaEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Excluir conta
  const [deleteModal, setDeleteModal] = useState(false);
  const [senhaDelete, setSenhaDelete] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleAlterarEmail() {
    if (!novoEmail.trim() || !senhaEmail) {
      Alert.alert("Atenção", "Preencha o novo email e sua senha.");
      return;
    }
    setEmailLoading(true);
    try {
      await userService.alterarEmail(novoEmail.trim(), senhaEmail);
      setEmailModal(false);
      setNovoEmail("");
      setSenhaEmail("");
      Alert.alert("Sucesso", "Email alterado com sucesso.");
    } catch (e: any) {
      Alert.alert("Erro", e?.response?.data?.message || "Não foi possível alterar o email.");
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleRedefinirSenha() {
    Alert.alert(
      "Redefinir senha",
      `Enviaremos um link de redefinição para ${user?.email}. Deseja continuar?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Enviar",
          onPress: async () => {
            try {
              await userService.redefinirSenha(user!.email);
              Alert.alert("Email enviado", "Verifique sua caixa de entrada para redefinir a senha.");
            } catch {
              Alert.alert("Erro", "Não foi possível enviar o email.");
            }
          },
        },
      ]
    );
  }

  async function handleExcluirConta() {
    if (!senhaDelete) {
      Alert.alert("Atenção", "Digite sua senha para confirmar.");
      return;
    }
    setDeleteLoading(true);
    try {
      await userService.excluirConta(senhaDelete);
      setDeleteModal(false);
      await signOut();
    } catch (e: any) {
      Alert.alert("Erro", e?.response?.data?.message || "Não foi possível excluir a conta.");
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleSignOut() {
    Alert.alert(
      "Sair da conta",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
            } catch {
              Alert.alert("Erro", "Não foi possível sair da conta. Tente novamente.");
            }
          },
        },
      ]
    );
  }

  function goToArtistOnboarding() {
    (navigation as any).getParent()?.navigate("OnboardingArtistProfile");
  }

  function goToVenueRegister() {
    (navigation as any).getParent()?.navigate("OnboardingEstIdentidade");
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090F" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="chevron-left" size={14} color="#A78BFA" />
        </TouchableOpacity>
        <Text style={styles.headerBrand}>TOCA AQUI</Text>
        <FontAwesome5 name="cog" size={18} color="#A78BFA" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.pageTitle}>Configurações</Text>
        <Text style={styles.pageSubtitle}>
          Gerencie sua experiência e presença na cena musical.
        </Text>

        {/* CONTA */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionLabelRow}>
            <FontAwesome5 name="user-circle" size={15} color="#A78BFA" />
            <Text style={styles.sectionLabel}>CONTA</Text>
          </View>

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>E-mail</Text>
              <Text style={styles.settingValue}>{user?.email || "email@exemplo.com"}</Text>
            </View>
            <TouchableOpacity style={styles.smallBtn} onPress={() => setEmailModal(true)}>
              <Text style={styles.smallBtnText}>Alterar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>Senha</Text>
              <Text style={styles.settingValue}>••••••••</Text>
            </View>
            <TouchableOpacity style={styles.smallBtn} onPress={handleRedefinirSenha}>
              <Text style={styles.smallBtnText}>Redefinir</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.dangerLink}
            onPress={() => {
              Alert.alert(
                "Excluir conta",
                "Esta ação é irreversível. Todos os seus dados serão perdidos. Deseja continuar?",
                [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Continuar", style: "destructive", onPress: () => setDeleteModal(true) },
                ]
              );
            }}
          >
            <Text style={styles.dangerLinkText}>Excluir conta permanentemente</Text>
          </TouchableOpacity>
        </View>

        {/* PREFERÊNCIAS */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionLabelRow}>
            <FontAwesome5 name="sliders-h" size={15} color="#A78BFA" />
            <Text style={styles.sectionLabel}>PREFERÊNCIAS</Text>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingTitle}>GÊNEROS FAVORITOS</Text>
            <TouchableOpacity onPress={() => (navigation as any).getParent()?.navigate("UserOnboardingGenres")}>
              <Text style={styles.editLink}>Editar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.genreChips}>
            {generosFavoritos.length === 0 ? (
              <Text style={[styles.settingValue, { fontStyle: "italic" }]}>Nenhum gênero selecionado</Text>
            ) : (
              generosFavoritos.map((g) => {
                const color = GENRE_COLORS[g] ?? "#A78BFA";
                return (
                  <View key={g} style={[styles.genreChip, { backgroundColor: color + "22", borderColor: color + "55" }]}>
                    <Text style={[styles.genreChipText, { color }]}>{g.toUpperCase()}</Text>
                  </View>
                );
              })
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <Text style={styles.settingTitle}>RAIO DE DISTÂNCIA</Text>
            <Text style={[styles.settingValue, { color: "#A78BFA" }]}>{radius}km</Text>
          </View>

          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>1KM</Text>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${(radius / 100) * 100}%` }]} />
            </View>
            <Text style={styles.sliderLabel}>100KM</Text>
          </View>

          <View style={styles.radiusControls}>
            <TouchableOpacity
              style={styles.radiusBtn}
              onPress={() => setRadius((r) => Math.max(1, r - 5))}
            >
              <FontAwesome5 name="minus" size={12} color="#A78BFA" />
            </TouchableOpacity>
            <Text style={styles.radiusBtnLabel}>{radius} km</Text>
            <TouchableOpacity
              style={styles.radiusBtn}
              onPress={() => setRadius((r) => Math.min(100, r + 5))}
            >
              <FontAwesome5 name="plus" size={12} color="#A78BFA" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.smallBtn, { marginTop: 16, alignSelf: "center", paddingHorizontal: 28 }]}
            onPress={handleSalvarPreferencias}
            disabled={savingPrefs}
          >
            {savingPrefs
              ? <ActivityIndicator size="small" color="#A78BFA" />
              : <Text style={styles.smallBtnText}>SALVAR PREFERÊNCIAS</Text>
            }
          </TouchableOpacity>
        </View>

        {/* NOTIFICAÇÕES */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionLabelRow}>
            <FontAwesome5 name="bell" size={15} color="#A78BFA" />
            <Text style={styles.sectionLabel}>NOTIFICAÇÕES</Text>
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.settingTitle}>Novos Shows</Text>
              <Text style={styles.settingHint}>Alertas de artistas que você segue</Text>
            </View>
            <Switch
              value={notifyShows}
              onValueChange={setNotifyShows}
              trackColor={{ false: "#1A1040", true: "#6C5CE7" }}
              thumbColor={notifyShows ? "#A78BFA" : "#555577"}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.settingTitle}>Lembretes de Eventos</Text>
              <Text style={styles.settingHint}>Avisos 24h antes do show</Text>
            </View>
            <Switch
              value={notifyReminders}
              onValueChange={setNotifyReminders}
              trackColor={{ false: "#1A1040", true: "#6C5CE7" }}
              thumbColor={notifyReminders ? "#A78BFA" : "#555577"}
            />
          </View>
        </View>

        {/* GERENCIAR PERFIL */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionLabelRow}>
            <FontAwesome5 name="star" size={15} color="#A78BFA" />
            <Text style={styles.sectionLabel}>GERENCIAR PERFIL</Text>
          </View>

          {hasArtistProfile ? (
            <TouchableOpacity
              style={styles.profileActionCard}
              onPress={() => (navigation as any).getParent()?.navigate("ArtistNavigator")}
              activeOpacity={0.85}
            >
              <View style={[styles.profileActionIcon, { backgroundColor: "rgba(167,139,250,0.18)" }]}>
                <FontAwesome5 name="microphone" size={18} color="#A78BFA" />
              </View>
              <View style={styles.profileActionInfo}>
                <Text style={styles.profileActionTitle}>Acessar Perfil de Artista</Text>
                <Text style={styles.profileActionSubtitle}>
                  Gerencie seu perfil, shows e contratos
                </Text>
              </View>
              <FontAwesome5 name="chevron-right" size={12} color="#555577" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.profileActionCard}
              onPress={goToArtistOnboarding}
              activeOpacity={0.85}
            >
              <View style={styles.profileActionIcon}>
                <FontAwesome5 name="microphone" size={18} color="#A78BFA" />
              </View>
              <View style={styles.profileActionInfo}>
                <Text style={styles.profileActionTitle}>Criar Perfil de Artista</Text>
                <Text style={styles.profileActionSubtitle}>
                  Mostre seu talento e apareça nos shows
                </Text>
              </View>
              <FontAwesome5 name="chevron-right" size={12} color="#555577" />
            </TouchableOpacity>
          )}

          <View style={styles.divider} />

          {hasEstablishment ? (
            <TouchableOpacity
              style={styles.profileActionCard}
              onPress={() => (navigation as any).getParent()?.navigate("EstablishmentNavigator")}
              activeOpacity={0.85}
            >
              <View style={[styles.profileActionIcon, { backgroundColor: "rgba(0,206,201,0.12)" }]}>
                <FontAwesome5 name="building" size={18} color="#00CEC9" />
              </View>
              <View style={styles.profileActionInfo}>
                <Text style={styles.profileActionTitle}>Acessar Estabelecimento</Text>
                <Text style={styles.profileActionSubtitle}>
                  Gerencie vagas, contratos e agenda
                </Text>
              </View>
              <FontAwesome5 name="chevron-right" size={12} color="#555577" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.profileActionCard}
              onPress={goToVenueRegister}
              activeOpacity={0.85}
            >
              <View style={styles.profileActionIcon}>
                <FontAwesome5 name="building" size={18} color="#A78BFA" />
              </View>
              <View style={styles.profileActionInfo}>
                <Text style={styles.profileActionTitle}>Criar Perfil de Estabelecimento</Text>
                <Text style={styles.profileActionSubtitle}>
                  Cadastre seu espaço e organize eventos
                </Text>
              </View>
              <FontAwesome5 name="chevron-right" size={12} color="#555577" />
            </TouchableOpacity>
          )}
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.85}>
          <FontAwesome5 name="sign-out-alt" size={16} color="#FF6B6B" style={{ marginRight: 10 }} />
          <Text style={styles.signOutText}>SAIR DA CONTA</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>TOCA AQUI V1.0.0</Text>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Modal — Alterar Email */}
      <Modal
        isVisible={emailModal}
        onBackdropPress={() => setEmailModal(false)}
        onBackButtonPress={() => setEmailModal(false)}
        style={styles.modal}
        backdropOpacity={0.7}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Alterar e-mail</Text>
            <TouchableOpacity onPress={() => setEmailModal(false)}>
              <FontAwesome5 name="times" size={16} color="#A0A0B8" />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalLabel}>Novo e-mail</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="novo@email.com"
            placeholderTextColor="#555577"
            value={novoEmail}
            onChangeText={setNovoEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Text style={styles.modalLabel}>Confirme sua senha</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="••••••••"
            placeholderTextColor="#555577"
            value={senhaEmail}
            onChangeText={setSenhaEmail}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.modalBtn, emailLoading && { opacity: 0.7 }]}
            onPress={handleAlterarEmail}
            disabled={emailLoading}
          >
            {emailLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.modalBtnText}>SALVAR</Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal — Excluir Conta */}
      <Modal
        isVisible={deleteModal}
        onBackdropPress={() => setDeleteModal(false)}
        onBackButtonPress={() => setDeleteModal(false)}
        style={styles.modal}
        backdropOpacity={0.7}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: "#FF6B6B" }]}>Excluir conta</Text>
            <TouchableOpacity onPress={() => setDeleteModal(false)}>
              <FontAwesome5 name="times" size={16} color="#A0A0B8" />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalHint}>
            Esta ação não pode ser desfeita. Digite sua senha para confirmar.
          </Text>
          <Text style={styles.modalLabel}>Senha</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="••••••••"
            placeholderTextColor="#555577"
            value={senhaDelete}
            onChangeText={setSenhaDelete}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.modalBtn, styles.modalBtnDanger, deleteLoading && { opacity: 0.7 }]}
            onPress={handleExcluirConta}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.modalBtnText}>EXCLUIR PERMANENTEMENTE</Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
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
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(167,139,250,0.15)",
    borderWidth: 1,
    borderColor: "#A78BFA",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBrand: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#A78BFA",
    letterSpacing: 2,
  },
  scrollContent: { padding: 20, gap: 16 },
  pageTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 22,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  pageSubtitle: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: "#A0A0B8",
    marginBottom: 8,
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 16,
  },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionLabel: {
    fontFamily: "Montserrat-Bold",
    fontSize: 11,
    color: "#A78BFA",
    letterSpacing: 2,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  settingTitle: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: "#FFFFFF",
    marginBottom: 2,
  },
  settingValue: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: "#A0A0B8",
  },
  settingHint: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: "#555577",
  },
  smallBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.3)",
  },
  smallBtnText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: "#A78BFA",
  },
  dangerLink: { paddingVertical: 8 },
  dangerLinkText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: "#FF6B6B",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: 10,
  },
  editLink: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: "#A78BFA",
  },
  genreChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 10,
  },
  genreChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  genreChipText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 10,
  },
  sliderLabel: {
    fontFamily: "Montserrat-Regular",
    fontSize: 10,
    color: "#555577",
    width: 32,
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
  },
  sliderFill: {
    height: 4,
    backgroundColor: "#A78BFA",
    borderRadius: 2,
  },
  radiusControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  radiusBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#A78BFA",
    alignItems: "center",
    justifyContent: "center",
  },
  radiusBtnLabel: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#FFFFFF",
    minWidth: 55,
    textAlign: "center",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  toggleInfo: { flex: 1, marginRight: 16 },
  profileActionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  profileActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(167,139,250,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileActionInfo: { flex: 1 },
  profileActionTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 2,
  },
  profileActionSubtitle: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: "#A0A0B8",
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,107,107,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.3)",
    borderRadius: 12,
    paddingVertical: 15,
  },
  signOutText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#FF6B6B",
    letterSpacing: 1.5,
  },
  footer: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: "#333355",
    textAlign: "center",
    letterSpacing: 2,
  },
  modal: { justifyContent: "flex-end", margin: 0 },
  modalSheet: {
    backgroundColor: "#16163A",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  modalHint: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: "#A0A0B8",
    marginBottom: 16,
    lineHeight: 20,
  },
  modalLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: "#A0A0B8",
    marginBottom: 6,
    marginTop: 4,
  },
  modalInput: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    marginBottom: 12,
  },
  modalBtn: {
    backgroundColor: "#A78BFA",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  modalBtnDanger: { backgroundColor: "#E53E3E" },
  modalBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
});
