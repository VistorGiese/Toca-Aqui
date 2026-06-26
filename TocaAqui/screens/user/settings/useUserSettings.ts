import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/http/userService";
import { UserSettingsProps, EmailErrors } from "./types";
import { confirmDeleteAccount } from "./utils";

export function useUserSettings({ navigation }: UserSettingsProps) {
  const { user, paginas, signOut } = useAuth();
  const [hasEstablishment, setHasEstablishment] = useState(false);
  const [hasArtistProfile, setHasArtistProfile] = useState(false);

  const [emailModal, setEmailModal] = useState(false);
  const [novoEmail, setNovoEmail] = useState("");
  const [senhaEmail, setSenhaEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailErrors, setEmailErrors] = useState<EmailErrors>({});

  const [deleteModal, setDeleteModal] = useState(false);
  const [senhaDelete, setSenhaDelete] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [senhaDeleteError, setSenhaDeleteError] = useState("");

  useEffect(() => {
    if (paginas?.pagina_estabelecimento) {
      AsyncStorage.setItem("estabelecimentoId", String(paginas.pagina_estabelecimento.id));
      setHasEstablishment(true);
    } else {
      AsyncStorage.getItem("estabelecimentoId").then((id) => {
        setHasEstablishment(!!id);
      });
    }
    userService
      .getProfile()
      .then((res) => {
        setHasArtistProfile((res.user.artist_profiles?.length ?? 0) > 0);
        if (!paginas?.pagina_estabelecimento) {
          setHasEstablishment((res.user.establishment_profiles?.length ?? 0) > 0);
        }
      })
      .catch(() => {});
  }, [paginas]);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  const openEmailModal = useCallback(() => setEmailModal(true), []);
  const closeEmailModal = useCallback(() => setEmailModal(false), []);

  const openDeleteModal = useCallback(() => setDeleteModal(true), []);
  const closeDeleteModal = useCallback(() => setDeleteModal(false), []);

  const handleAlterarEmail = useCallback(async () => {
    const nextErrors: EmailErrors = {};
    if (!novoEmail.trim()) nextErrors.novoEmail = "Novo e-mail é obrigatório";
    if (!senhaEmail) nextErrors.senhaEmail = "Senha é obrigatória";
    if (Object.keys(nextErrors).length > 0) {
      setEmailErrors(nextErrors);
      return;
    }
    setEmailErrors({});
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
  }, [novoEmail, senhaEmail]);

  const handleRedefinirSenha = useCallback(() => {
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
  }, [user?.email]);

  const handleExcluirConta = useCallback(async () => {
    if (!senhaDelete) {
      setSenhaDeleteError("Senha é obrigatória");
      return;
    }
    setSenhaDeleteError("");
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
  }, [senhaDelete, signOut]);

  const handleSignOut = useCallback(() => {
    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
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
    ]);
  }, [signOut]);

  const handleConfirmDeleteAccount = useCallback(() => {
    confirmDeleteAccount(openDeleteModal);
  }, [openDeleteModal]);

  const goToEditProfile = useCallback(
    () => navigation.navigate("UserEditProfile"),
    [navigation]
  );

  const goToArtistOnboarding = useCallback(() => {
    (navigation as any).getParent()?.navigate("OnboardingArtistProfile");
  }, [navigation]);

  const goToArtistNavigator = useCallback(() => {
    (navigation as any).getParent()?.navigate("ArtistNavigator");
  }, [navigation]);

  const goToVenueRegister = useCallback(() => {
    (navigation as any).getParent()?.navigate("EstablishmentOnboarding");
  }, [navigation]);

  const goToEstablishmentNavigator = useCallback(() => {
    (navigation as any).getParent()?.navigate("EstablishmentNavigator");
  }, [navigation]);

  const clearNovoEmailError = useCallback(
    () => setEmailErrors((e) => ({ ...e, novoEmail: undefined })),
    []
  );

  const clearSenhaEmailError = useCallback(
    () => setEmailErrors((e) => ({ ...e, senhaEmail: undefined })),
    []
  );

  const clearSenhaDeleteError = useCallback(() => setSenhaDeleteError(""), []);

  return {
    user,
    hasEstablishment,
    hasArtistProfile,
    goBack,
    emailModal,
    openEmailModal,
    closeEmailModal,
    novoEmail,
    setNovoEmail,
    senhaEmail,
    setSenhaEmail,
    emailLoading,
    emailErrors,
    clearNovoEmailError,
    clearSenhaEmailError,
    handleAlterarEmail,
    handleRedefinirSenha,
    deleteModal,
    closeDeleteModal,
    senhaDelete,
    setSenhaDelete,
    deleteLoading,
    senhaDeleteError,
    clearSenhaDeleteError,
    handleExcluirConta,
    handleConfirmDeleteAccount,
    handleSignOut,
    goToEditProfile,
    goToArtistOnboarding,
    goToArtistNavigator,
    goToVenueRegister,
    goToEstablishmentNavigator,
  };
}
