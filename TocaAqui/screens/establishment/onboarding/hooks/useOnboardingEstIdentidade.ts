import { useCallback, useEffect } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { EstablishmentOnboardingStackParamList } from "../EstablishmentOnboardingNavigator";
import { useEstablishmentOnboarding } from "../context/EstablishmentOnboardingContext";
import { EstablishmentTipo } from "../context/types";
import { sanitizePhone } from "../utils";

type NavProp = NativeStackNavigationProp<EstablishmentOnboardingStackParamList, "OnboardingEstIdentidade">;

export function useOnboardingEstIdentidade() {
  const navigation = useNavigation<NavProp>();
  const { draft, updateDraft } = useEstablishmentOnboarding();

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
        if (!draft.nome.trim()) {
          Alert.alert("Atenção", "Informe o nome do estabelecimento.");
          return;
        }
        if (!draft.tipo) {
          Alert.alert("Atenção", "Selecione o tipo do estabelecimento.");
          return;
        }
        const tel = sanitizePhone(draft.telefone);
        if (tel.length < 8) {
          Alert.alert("Atenção", "Informe um telefone válido (mínimo 8 dígitos).");
          return;
        }
        updateDraft({ telefone: tel });
        navigation.navigate("OnboardingEstFuncionamento");
        return;
      } else {
        const tel = sanitizePhone(draft.telefone) || "00000000000";
        updateDraft({
          nome: draft.nome.trim() || "Meu Espaço",
          tipo: (draft.tipo || "bar") as EstablishmentTipo,
          telefone: tel,
        });
      }
      navigation.navigate("OnboardingEstFuncionamento");
    },
    [draft, navigation, updateDraft]
  );

  const setNome = useCallback((nome: string) => updateDraft({ nome }), [updateDraft]);
  const setTelefone = useCallback((telefone: string) => updateDraft({ telefone }), [updateDraft]);
  const setTipo = useCallback(
    (tipo: EstablishmentTipo) => updateDraft({ tipo }),
    [updateDraft]
  );

  return {
    nome: draft.nome,
    telefone: draft.telefone,
    tipo: draft.tipo,
    fotoUri: draft.fotoUri,
    setNome,
    setTelefone,
    setTipo,
    selectPhoto,
    goNext,
    skip: () => goNext(true),
    goBackLogin: () => navigation.getParent()?.navigate("Login"),
  };
}
