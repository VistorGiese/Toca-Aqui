import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { RootStackParamList } from "@/navigation/Navigate";
import { maskCurrencyBRL } from "@/screens/artist/edit-profile/utils";
import {
  OnboardingArtistProfileFieldErrors,
  OnboardingArtistProfileFieldKey,
  TipoAtuacao,
} from "./types";
import { toggleListItem, validateOnboardingArtistProfile } from "./utils";

type NavProp = NativeStackNavigationProp<RootStackParamList, "OnboardingArtistProfile">;

export function useOnboardingArtistProfile() {
  const navigation = useNavigation<NavProp>();

  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [nomeArtistico, setNomeArtistico] = useState("");
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoAtuacao | null>(null);
  const [generosSelecionados, setGenerosSelecionados] = useState<string[]>([]);
  const [cacheMin, setCacheMin] = useState("");
  const [cacheMax, setCacheMax] = useState("");
  const [temEstrutura, setTemEstrutura] = useState(false);
  const [estrutura, setEstrutura] = useState<string[]>([]);
  const [errors, setErrors] = useState<OnboardingArtistProfileFieldErrors>({});

  const clearError = useCallback((field: OnboardingArtistProfileFieldKey) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const pickPhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos de acesso à galeria para adicionar sua foto.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      clearError("foto");
      setFotoUri(result.assets[0].uri);
    }
  }, [clearError]);

  const updateNomeArtistico = useCallback(
    (value: string) => {
      clearError("nomeArtistico");
      setNomeArtistico(value);
    },
    [clearError]
  );

  const selectTipo = useCallback(
    (tipo: TipoAtuacao) => {
      clearError("tipo");
      setTipoSelecionado(tipo);
    },
    [clearError]
  );

  const toggleGenero = useCallback(
    (label: string) => {
      clearError("generos");
      setGenerosSelecionados((prev) => toggleListItem(prev, label));
    },
    [clearError]
  );

  const updateCacheMin = useCallback(
    (value: string) => {
      clearError("cacheMin");
      clearError("cacheMax");
      setCacheMin(maskCurrencyBRL(value));
    },
    [clearError]
  );

  const updateCacheMax = useCallback(
    (value: string) => {
      clearError("cacheMax");
      setCacheMax(maskCurrencyBRL(value));
    },
    [clearError]
  );

  const updateTemEstrutura = useCallback(
    (value: boolean) => {
      if (!value) {
        clearError("estrutura");
        setEstrutura([]);
      }
      setTemEstrutura(value);
    },
    [clearError]
  );

  const toggleEquipamento = useCallback(
    (item: string) => {
      clearError("estrutura");
      setEstrutura((prev) => toggleListItem(prev, item));
    },
    [clearError]
  );

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleContinuar = useCallback(() => {
    const nextErrors = validateOnboardingArtistProfile({
      fotoUri,
      nomeArtistico,
      tipoSelecionado,
      generosSelecionados,
      cacheMin,
      cacheMax,
      temEstrutura,
      estrutura,
    });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      Alert.alert("Campos obrigatórios", "Corrija os campos destacados antes de continuar.");
      return;
    }

    setErrors({});
    navigation.navigate("OnboardingArtistBio", {
      nome: nomeArtistico.trim(),
      tipo: tipoSelecionado!,
      generos: generosSelecionados,
      cacheMin,
      cacheMax,
      temEstrutura,
      estrutura,
      fotoUri: fotoUri!,
    });
  }, [
    fotoUri,
    nomeArtistico,
    tipoSelecionado,
    generosSelecionados,
    cacheMin,
    cacheMax,
    temEstrutura,
    estrutura,
    navigation,
  ]);

  return {
    fotoUri,
    nomeArtistico,
    tipoSelecionado,
    generosSelecionados,
    cacheMin,
    cacheMax,
    temEstrutura,
    estrutura,
    errors,
    pickPhoto,
    updateNomeArtistico,
    selectTipo,
    toggleGenero,
    updateCacheMin,
    updateCacheMax,
    updateTemEstrutura,
    toggleEquipamento,
    goBack,
    handleContinuar,
  };
}
