import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import api from "@/http/api";
import { userService } from "@/http/userService";
import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from "@/utils/errorHandler";
import { EstablishmentOnboardingStackParamList } from "../EstablishmentOnboardingNavigator";
import { useEstablishmentOnboarding } from "../context/EstablishmentOnboardingContext";
import { mapTipoToBackend, resolveOpeningHours, sanitizeCnpj, sanitizePhone } from "../utils";

type NavProp = NativeStackNavigationProp<EstablishmentOnboardingStackParamList, "OnboardingEstApresentacao">;

export function useOnboardingEstApresentacao() {
  const navigation = useNavigation<NavProp>();
  const { draft, updateDraft, resetDraft } = useEstablishmentOnboarding();
  const { refreshPaginas, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [bioError, setBioError] = useState("");

  const setBio = useCallback(
    (bio: string) => {
      if (bio.length <= 1000) {
        setBioError("");
        updateDraft({ bio });
      }
    },
    [updateDraft]
  );

  const addPhotos = useCallback(async () => {
    if (draft.fotosUris.length >= 5) {
      Alert.alert("Limite", "Você pode adicionar no máximo 5 fotos.");
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Permita o acesso à galeria para adicionar fotos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - draft.fotosUris.length,
    });
    if (!result.canceled && result.assets.length > 0) {
      const novas = result.assets.map((a) => a.uri);
      updateDraft({ fotosUris: [...draft.fotosUris, ...novas].slice(0, 5) });
    }
  }, [draft.fotosUris, updateDraft]);

  const removePhoto = useCallback(
    (uri: string) => {
      updateDraft({ fotosUris: draft.fotosUris.filter((f) => f !== uri) });
    },
    [draft.fotosUris, updateDraft]
  );

  const submit = useCallback(async () => {
    if (!draft.bio.trim()) {
      setBioError("Descrição é obrigatória");
      return;
    }
    setBioError("");

    const storedToken = token ?? (await AsyncStorage.getItem("token"));
    if (!storedToken) {
      Alert.alert("Sessão expirada", "Faça login para cadastrar seu estabelecimento.", [
        { text: "Ir para login", onPress: () => navigation.getParent()?.navigate("Login") },
      ]);
      return;
    }

    const telefone = sanitizePhone(draft.telefone);
    const cnpj = sanitizeCnpj(draft.cnpj);
    if (telefone.length < 8) {
      setSubmitError("Telefone inválido no passo Identidade (mínimo 8 dígitos)");
      return;
    }
    if (cnpj && cnpj.length !== 14) {
      setSubmitError("CNPJ inválido no passo Identidade");
      return;
    }
    setSubmitError("");

    setLoading(true);
    try {
      const { horarioAbertura, horarioFechamento } = resolveOpeningHours(draft.diasHorarios);

      const result = await userService.createEstablishmentProfile({
        nome_estabelecimento: draft.nome,
        tipo_estabelecimento: mapTipoToBackend(draft.tipo),
        descricao: draft.bio,
        generos_musicais: draft.generos.join(", ") || "Diversos",
        horario_abertura: horarioAbertura,
        horario_fechamento: horarioFechamento,
        telefone_contato: telefone,
        cnpj: draft.cnpj || undefined,
        endereco: {
          rua: draft.endereco.trim() || "Endereço não informado",
          numero: draft.numero.trim() || "S/N",
          bairro: "Centro",
          cidade: draft.cidade.trim() || "São Paulo",
          estado: (draft.estado.trim() || "SP").toUpperCase().slice(0, 2),
          cep: "00000000",
        },
      });

      const estId = result.profile?.id;
      if (estId) {
        await AsyncStorage.setItem("estabelecimentoId", String(estId));
        const fotosParaUpload = [
          ...(draft.fotoUri ? [draft.fotoUri] : []),
          ...draft.fotosUris,
        ].slice(0, 5);
        if (fotosParaUpload.length > 0) {
          try {
            const formData = new FormData();
            fotosParaUpload.forEach((uri, idx) => {
              const ext = uri.split(".").pop()?.toLowerCase() || "jpg";
              const mime = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
              formData.append("imagens", { uri, name: `foto_${idx}.${ext}`, type: mime } as any);
            });
            await api.patch(`/estabelecimentos/${estId}/fotos`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          } catch {
            // Fotos opcionais
          }
        }
      }

      await refreshPaginas();
      resetDraft();
      navigation.getParent()?.reset({ index: 0, routes: [{ name: "EstablishmentNavigator" }] });
    } catch (err: unknown) {
      Alert.alert("Erro", getApiErrorMessage(err, "Não foi possível concluir o cadastro. Tente novamente."));
    } finally {
      setLoading(false);
    }
  }, [draft, navigation, refreshPaginas, resetDraft, token]);

  return {
    bio: draft.bio,
    bioError,
    submitError,
    fotos: draft.fotosUris,
    loading,
    setBio,
    addPhotos,
    removePhoto,
    submit,
    goBack: () => navigation.goBack(),
    close: () => navigation.getParent()?.navigate("Login"),
  };
}
