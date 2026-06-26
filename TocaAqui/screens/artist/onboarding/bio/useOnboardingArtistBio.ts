import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { RootStackParamList } from "@/navigation/Navigate";
import api from "@/http/api";
import { buildImageFormFile } from "@/utils/adapters";
import {
  IbgeCidade,
  IbgeEstado,
  LocationPickerMode,
  OnboardingArtistBioFieldErrors,
  OnboardingArtistBioFieldKey,
  OnboardingArtistBioRoute,
} from "./types";
import { PRESS_KIT_MAX } from "./constants";
import { buildProfilePayload, getApiErrorMessage, validateOnboardingArtistBio } from "./utils";

type NavProp = NativeStackNavigationProp<RootStackParamList, "OnboardingArtistBio">;

export function useOnboardingArtistBio() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<OnboardingArtistBioRoute>();
  const params = route.params;

  const [estado, setEstado] = useState<IbgeEstado | null>(null);
  const [cidade, setCidade] = useState<IbgeCidade | null>(null);
  const [estados, setEstados] = useState<IbgeEstado[]>([]);
  const [cidades, setCidades] = useState<IbgeCidade[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(false);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [pickerMode, setPickerMode] = useState<LocationPickerMode>(null);
  const [searchText, setSearchText] = useState("");

  const [biografia, setBiografia] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [novoLink, setNovoLink] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [pressKit, setPressKit] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<OnboardingArtistBioFieldErrors>({});

  const clearError = useCallback((field: OnboardingArtistBioFieldKey) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  useEffect(() => {
    setLoadingEstados(true);
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then((r) => r.json())
      .then((data: Array<{ sigla: string; nome: string }>) => {
        setEstados(data.map((e) => ({ sigla: e.sigla, nome: e.nome })));
      })
      .catch(() => Alert.alert("Erro", "Não foi possível carregar os estados."))
      .finally(() => setLoadingEstados(false));
  }, []);

  useEffect(() => {
    if (!estado) {
      setCidades([]);
      setCidade(null);
      return;
    }
    setLoadingCidades(true);
    setCidade(null);
    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado.sigla}/municipios?orderBy=nome`
    )
      .then((r) => r.json())
      .then((data: Array<{ id: number; nome: string }>) => {
        setCidades(data.map((c) => ({ id: c.id, nome: c.nome })));
      })
      .catch(() => Alert.alert("Erro", "Não foi possível carregar as cidades."))
      .finally(() => setLoadingCidades(false));
  }, [estado]);

  const filteredEstados = useMemo(
    () =>
      estados.filter(
        (e) =>
          e.nome.toLowerCase().includes(searchText.toLowerCase()) ||
          e.sigla.toLowerCase().includes(searchText.toLowerCase())
      ),
    [estados, searchText]
  );

  const filteredCidades = useMemo(
    () => cidades.filter((c) => c.nome.toLowerCase().includes(searchText.toLowerCase())),
    [cidades, searchText]
  );

  const locationLabel = useMemo(() => {
    if (!cidade || !estado) return "Preencha os campos acima";
    return `${cidade.nome}, ${estado.sigla}`;
  }, [cidade, estado]);

  const openPicker = useCallback((mode: LocationPickerMode) => {
    setSearchText("");
    setPickerMode(mode);
  }, []);

  const closePicker = useCallback(() => {
    setPickerMode(null);
  }, []);

  const selectEstado = useCallback(
    (item: IbgeEstado) => {
      clearError("estado");
      setEstado(item);
      setPickerMode(null);
    },
    [clearError]
  );

  const selectCidade = useCallback(
    (item: IbgeCidade) => {
      clearError("cidade");
      setCidade(item);
      setPickerMode(null);
    },
    [clearError]
  );

  const updateBiografia = useCallback(
    (value: string) => {
      clearError("biografia");
      setBiografia(value);
    },
    [clearError]
  );

  const addLink = useCallback(() => {
    if (!novoLink.trim()) return;
    clearError("links");
    setLinks((prev) => [...prev, novoLink.trim()]);
    setNovoLink("");
    setShowLinkInput(false);
  }, [clearError, novoLink]);

  const removeLink = useCallback((index: number) => {
    setLinks((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const toggleLinkInput = useCallback(() => {
    setShowLinkInput((prev) => !prev);
  }, []);

  const addPressKit = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos de acesso à galeria para adicionar fotos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: PRESS_KIT_MAX - pressKit.length,
    });
    if (!result.canceled) {
      clearError("pressKit");
      const novas = result.assets.map((a) => a.uri);
      setPressKit((prev) => [...prev, ...novas].slice(0, PRESS_KIT_MAX));
    }
  }, [clearError, pressKit.length]);

  const removePressKit = useCallback((index: number) => {
    setPressKit((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const uploadProfilePhoto = useCallback(async (profileId: number, fotoUri: string) => {
    const formData = new FormData();
    const file = buildImageFormFile(fotoUri, "photo.jpg");
    if (Platform.OS === "web") {
      const blob = await fetch(fotoUri).then((r) => r.blob());
      formData.append("imagem", blob, file.name);
    } else {
      formData.append("imagem", file as unknown as Blob);
    }
    await api.patch(`/usuarios/perfil-artista/${profileId}/foto`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }, []);

  const uploadPressKit = useCallback(async (profileId: number, uris: string[]) => {
    const formData = new FormData();
    for (let i = 0; i < uris.length; i++) {
      const uri = uris[i];
      const file = buildImageFormFile(uri, `press_kit_${i}.jpg`);
      if (Platform.OS === "web") {
        const blob = await fetch(uri).then((r) => r.blob());
        formData.append("imagens", blob, file.name);
      } else {
        formData.append("imagens", file as unknown as Blob);
      }
    }
    await api.patch(`/usuarios/perfil-artista/${profileId}/press-kit`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }, []);

  const handleConcluir = useCallback(async () => {
    const nextErrors = validateOnboardingArtistBio({
      estado,
      cidade,
      biografia,
      links,
      pressKit,
    });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      Alert.alert("Campos obrigatórios", "Corrija os campos destacados antes de continuar.");
      return;
    }

    if (!estado || !cidade) return;

    setErrors({});
    setLoading(true);
    try {
      const response = await api.post(
        "/usuarios/perfil-artista",
        buildProfilePayload(params, cidade.nome, estado.sigla, biografia, links)
      );

      const profileId = response.data?.profile?.id as number | undefined;

      if (params.fotoUri && profileId) {
        await uploadProfilePhoto(profileId, params.fotoUri);
      }

      if (pressKit.length > 0 && profileId) {
        await uploadPressKit(profileId, pressKit);
      }

      navigation.reset({ index: 0, routes: [{ name: "ArtistNavigator" }] });
    } catch (err) {
      if (__DEV__) {
        console.error("[OnboardingArtistBio] Erro:", JSON.stringify(err, null, 2));
      }
      const { title, message } = getApiErrorMessage(err);
      Alert.alert(title, message);
    } finally {
      setLoading(false);
    }
  }, [
    estado,
    cidade,
    biografia,
    links,
    pressKit,
    params,
    navigation,
    uploadProfilePhoto,
    uploadPressKit,
  ]);

  return {
    estado,
    cidade,
    loadingEstados,
    loadingCidades,
    pickerMode,
    searchText,
    setSearchText,
    filteredEstados,
    filteredCidades,
    locationLabel,
    biografia,
    links,
    novoLink,
    setNovoLink,
    showLinkInput,
    pressKit,
    loading,
    errors,
    openPicker,
    closePicker,
    selectEstado,
    selectCidade,
    updateBiografia,
    addLink,
    removeLink,
    toggleLinkInput,
    addPressKit,
    removePressKit,
    goBack,
    handleConcluir,
  };
}
