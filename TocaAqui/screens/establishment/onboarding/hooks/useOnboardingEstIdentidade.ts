import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { EstablishmentOnboardingStackParamList } from "../EstablishmentOnboardingNavigator";
import { useEstablishmentOnboarding } from "../context/EstablishmentOnboardingContext";
import { EstablishmentTipo } from "../context/types";
import { validateCnpjField } from "@/utils/documentValidation";
import { maskCnpj, sanitizeCnpj, sanitizePhone } from "../utils";

type NavProp = NativeStackNavigationProp<EstablishmentOnboardingStackParamList, "OnboardingEstIdentidade">;

export type OnboardingEstIdentidadeErrors = Partial<
  Record<"nome" | "tipo" | "telefone" | "cnpj", string>
>;

export function useOnboardingEstIdentidade() {
  const navigation = useNavigation<NavProp>();
  const { draft, updateDraft } = useEstablishmentOnboarding();
  const [errors, setErrors] = useState<OnboardingEstIdentidadeErrors>({});

  const clearError = useCallback((field: keyof OnboardingEstIdentidadeErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  useEffect(() => {
    AsyncStorage.getItem("token").then((stored) => {
      if (!stored) {
        Alert.alert(
          "Login necessário",
          "Faça login para cadastrar seu estabelecimento.",
          [{ text: "Ir para login", onPress: () => navigation.getParent()?.navigate("Login") }]
        );
      }
    });
  }, [navigation]);

  const selectPhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Permita o acesso à galeria para adicionar a foto.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      updateDraft({ fotoUri: uri });
      await AsyncStorage.setItem("tempEstFotoUri", uri);
    }
  }, [updateDraft]);

  const goNext = useCallback(
    (skipValidation = false) => {
      if (!skipValidation) {
        const nextErrors: OnboardingEstIdentidadeErrors = {};
        if (!draft.nome.trim()) {
          nextErrors.nome = "Nome do estabelecimento é obrigatório";
        }
        if (!draft.tipo) {
          nextErrors.tipo = "Tipo do estabelecimento é obrigatório";
        }
        const tel = sanitizePhone(draft.telefone);
        if (tel.length < 8) {
          nextErrors.telefone = "Telefone é obrigatório (mínimo 8 dígitos)";
        }
        const cnpjError = validateCnpjField(draft.cnpj, true);
        if (cnpjError) {
          nextErrors.cnpj = cnpjError;
        }
        if (Object.keys(nextErrors).length > 0) {
          setErrors(nextErrors);
          return;
        }
        setErrors({});
        updateDraft({ telefone: tel });
        navigation.navigate("OnboardingEstFuncionamento");
        return;
      } else {
        const tel = sanitizePhone(draft.telefone) || "00000000000";
        updateDraft({
          nome: draft.nome.trim() || "Meu Espaço",
          tipo: (draft.tipo || "bar") as EstablishmentTipo,
          telefone: tel,
          cnpj: maskCnpj(draft.cnpj),
        });
      }
      navigation.navigate("OnboardingEstFuncionamento");
    },
    [draft, navigation, updateDraft]
  );

  const setNome = useCallback(
    (nome: string) => {
      clearError("nome");
      updateDraft({ nome });
    },
    [clearError, updateDraft]
  );
  const setTelefone = useCallback(
    (telefone: string) => {
      clearError("telefone");
      updateDraft({ telefone });
    },
    [clearError, updateDraft]
  );
  const setCnpj = useCallback(
    (cnpj: string) => {
      clearError("cnpj");
      updateDraft({ cnpj: maskCnpj(cnpj) });
    },
    [clearError, updateDraft]
  );
  const setTipo = useCallback(
    (tipo: EstablishmentTipo) => {
      clearError("tipo");
      updateDraft({ tipo });
    },
    [clearError, updateDraft]
  );

  return {
    nome: draft.nome,
    telefone: draft.telefone,
    cnpj: draft.cnpj,
    tipo: draft.tipo,
    fotoUri: draft.fotoUri,
    errors,
    setNome,
    setTelefone,
    setCnpj,
    setTipo,
    selectPhoto,
    goNext,
    skip: () => goNext(true),
    goBackLogin: () => navigation.getParent()?.navigate("Login"),
  };
}
