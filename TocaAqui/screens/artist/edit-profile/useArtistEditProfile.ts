import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { ArtistStackParamList } from "@/navigation/ArtistNavigator";
import { artistProfileService, ArtistProfileData } from "@/http/artistProfileService";
import { resolveImageUrl } from "@/utils/adapters";
import { getApiErrorMessage, showApiError } from "@/utils/errorHandler";
import { IbgeCidade, IbgeEstado } from "@/screens/establishment/onboarding/context/types";
import { LocationPickerMode } from "@/screens/establishment/onboarding/components/LocationPickerModal";
import { ArtistEditProfileFieldErrors } from "./types";
import {
  currencyFromNumber,
  isValidDateIso,
  maskCurrencyBRL,
  maskDateIso,
  maskExperienceYears,
  parseCacheInput,
  toggleListItem,
} from "./utils";

type NavProp = NativeStackNavigationProp<ArtistStackParamList, "ArtistProfileManage">;

function applyProfileToForm(
  profile: ArtistProfileData,
  setters: {
    setProfileId: (id: number) => void;
    setNome: (v: string) => void;
    setBio: (v: string) => void;
    setTipo: (v: string) => void;
    setGeneros: (v: string[]) => void;
    setInstrumentos: (v: string[]) => void;
    setExperiencia: (v: string) => void;
    setCacheMin: (v: string) => void;
    setCacheMax: (v: string) => void;
    setTemEstrutura: (v: boolean) => void;
    setEstruturaSom: (v: string[]) => void;
    setEstado: (v: string) => void;
    setEstadoNome: (v: string) => void;
    setCidade: (v: string) => void;
    setPortfolio: (v: string) => void;
    setLinks: (v: string[]) => void;
    setDatasIndisponiveis: (v: string[]) => void;
    setEstaDisponivel: (v: boolean) => void;
    setShowsRealizados: (v: number) => void;
    setNotaMedia: (v: number | undefined) => void;
    setExistingPressKit: (v: string[]) => void;
    setExistingPhoto: (v: string | undefined) => void;
  }
) {
  setters.setProfileId(profile.id);
  setters.setNome(profile.nome_artistico ?? "");
  setters.setBio(profile.biografia ?? "");
  setters.setTipo(profile.tipo_atuacao ?? "");
  setters.setGeneros(profile.generos ?? []);
  setters.setInstrumentos(profile.instrumentos ?? []);
  setters.setExperiencia(profile.anos_experiencia > 0 ? String(profile.anos_experiencia) : "");
  setters.setCacheMin(
    profile.cache_minimo != null ? currencyFromNumber(profile.cache_minimo) : ""
  );
  setters.setCacheMax(
    profile.cache_maximo != null ? currencyFromNumber(profile.cache_maximo) : ""
  );
  setters.setTemEstrutura(profile.tem_estrutura_som);
  setters.setEstruturaSom(profile.estrutura_som ?? []);
  setters.setEstado(profile.estado ?? "");
  setters.setEstadoNome(profile.estado ?? "");
  setters.setCidade(profile.cidade ?? "");
  setters.setPortfolio(profile.url_portfolio ?? "");
  setters.setLinks(profile.links_sociais ?? []);
  setters.setDatasIndisponiveis(profile.datas_indisponiveis ?? []);
  setters.setEstaDisponivel(profile.esta_disponivel);
  setters.setShowsRealizados(profile.shows_realizados ?? 0);
  setters.setNotaMedia(profile.nota_media);
  setters.setExistingPressKit(profile.press_kit ?? []);
  setters.setExistingPhoto(profile.foto_perfil);
}

export function useArtistEditProfile() {
  const navigation = useNavigation<NavProp>();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState<number | null>(null);

  const [nome, setNome] = useState("");
  const [bio, setBio] = useState("");
  const [tipo, setTipo] = useState("");
  const [generos, setGeneros] = useState<string[]>([]);
  const [instrumentos, setInstrumentos] = useState<string[]>([]);
  const [experiencia, setExperiencia] = useState("");
  const [cacheMin, setCacheMin] = useState("");
  const [cacheMax, setCacheMax] = useState("");
  const [temEstrutura, setTemEstrutura] = useState(false);
  const [estruturaSom, setEstruturaSom] = useState<string[]>([]);
  const [estado, setEstado] = useState("");
  const [estadoNome, setEstadoNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [novoLink, setNovoLink] = useState("");
  const [datasIndisponiveis, setDatasIndisponiveis] = useState<string[]>([]);
  const [novaData, setNovaData] = useState("");
  const [estaDisponivel, setEstaDisponivel] = useState(true);
  const [showsRealizados, setShowsRealizados] = useState(0);
  const [notaMedia, setNotaMedia] = useState<number | undefined>();

  const [existingPhoto, setExistingPhoto] = useState<string | undefined>();
  const [newPhotoUri, setNewPhotoUri] = useState<string | null>(null);
  const [existingPressKit, setExistingPressKit] = useState<string[]>([]);
  const [pressKitToRemove, setPressKitToRemove] = useState<string[]>([]);
  const [newPressKitUris, setNewPressKitUris] = useState<string[]>([]);

  const [errors, setErrors] = useState<ArtistEditProfileFieldErrors>({});

  const [estados, setEstados] = useState<IbgeEstado[]>([]);
  const [cidades, setCidades] = useState<IbgeCidade[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(false);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [pickerMode, setPickerMode] = useState<LocationPickerMode>(null);
  const [searchText, setSearchText] = useState("");

  const clearError = useCallback((field: keyof ArtistEditProfileFieldErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    setErrors({});
    try {
      const profile = await artistProfileService.getMyProfile();
      if (!profile) {
        setLoadError("Perfil de artista não encontrado. Conclua o cadastro nas configurações.");
        return;
      }
      applyProfileToForm(profile, {
        setProfileId,
        setNome,
        setBio,
        setTipo,
        setGeneros,
        setInstrumentos,
        setExperiencia,
        setCacheMin,
        setCacheMax,
        setTemEstrutura,
        setEstruturaSom,
        setEstado,
        setEstadoNome,
        setCidade,
        setPortfolio,
        setLinks,
        setDatasIndisponiveis,
        setEstaDisponivel,
        setShowsRealizados,
        setNotaMedia,
        setExistingPressKit,
        setExistingPhoto,
      });
      setNewPhotoUri(null);
      setPressKitToRemove([]);
      setNewPressKitUris([]);
      setNovoLink("");
      setNovaData("");
    } catch (err) {
      setLoadError(getApiErrorMessage(err, "Não foi possível carregar o perfil."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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
      return;
    }
    setLoadingCidades(true);
    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios?orderBy=nome`
    )
      .then((r) => r.json())
      .then((data: Array<{ id: number; nome: string }>) => {
        setCidades(data.map((c) => ({ id: c.id, nome: c.nome })));
      })
      .catch(() => Alert.alert("Erro", "Não foi possível carregar as cidades."))
      .finally(() => setLoadingCidades(false));
  }, [estado]);

  useEffect(() => {
    if (!estado || !estados.length) return;
    const found = estados.find((e) => e.sigla === estado);
    if (found) setEstadoNome(found.nome);
  }, [estado, estados]);

  const selectedEstado = useMemo(
    () => (estado ? { sigla: estado, nome: estadoNome || estado } : null),
    [estado, estadoNome]
  );

  const avatarUrl = useMemo(() => {
    if (newPhotoUri) return newPhotoUri;
    return resolveImageUrl(existingPhoto);
  }, [existingPhoto, newPhotoUri]);

  const pressKitPhotos = useMemo(() => {
    const kept = existingPressKit.filter((p) => !pressKitToRemove.includes(p));
    const remoteDisplay = kept
      .map((p) => resolveImageUrl(p))
      .filter((u): u is string => Boolean(u));
    return [...remoteDisplay, ...newPressKitUris];
  }, [existingPressKit, pressKitToRemove, newPressKitUris]);

  const toggleGenero = useCallback(
    (label: string) => {
      clearError("generos");
      setGeneros((prev) => toggleListItem(prev, label));
    },
    [clearError]
  );

  const toggleInstrumento = useCallback(
    (item: string) => {
      clearError("instrumentos");
      setInstrumentos((prev) => toggleListItem(prev, item));
    },
    [clearError]
  );

  const toggleEquipamento = useCallback(
    (item: string) => {
      clearError("estruturaSom");
      setEstruturaSom((prev) => toggleListItem(prev, item));
    },
    [clearError]
  );

  const openPicker = useCallback((mode: LocationPickerMode) => {
    setSearchText("");
    setPickerMode(mode);
  }, []);

  const closePicker = useCallback(() => setPickerMode(null), []);

  const selectEstado = useCallback(
    (item: IbgeEstado) => {
      clearError("estado");
      clearError("cidade");
      setEstado(item.sigla);
      setEstadoNome(item.nome);
      setCidade("");
      setPickerMode(null);
    },
    [clearError]
  );

  const selectCidade = useCallback(
    (item: IbgeCidade) => {
      clearError("cidade");
      setCidade(item.nome);
      setPickerMode(null);
    },
    [clearError]
  );

  const addLink = useCallback(() => {
    const trimmed = novoLink.trim();
    if (!trimmed) return;
    clearError("links");
    setLinks((prev) => [...prev, trimmed]);
    setNovoLink("");
  }, [novoLink, clearError]);

  const removeLink = useCallback((index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addUnavailableDate = useCallback(() => {
    const trimmed = novaData.trim();
    if (!trimmed) return;
    if (!isValidDateIso(trimmed)) {
      Alert.alert("Data inválida", "Use o formato AAAA-MM-DD (ex: 2026-07-15).");
      return;
    }
    if (datasIndisponiveis.includes(trimmed)) return;
    setDatasIndisponiveis((prev) => [...prev, trimmed].sort());
    setNovaData("");
  }, [novaData, datasIndisponiveis]);

  const removeUnavailableDate = useCallback((date: string) => {
    setDatasIndisponiveis((prev) => prev.filter((d) => d !== date));
  }, []);

  const pickPhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Permita acesso à galeria para alterar a foto.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setNewPhotoUri(result.assets[0].uri);
    }
  }, []);

  const addPressKitPhotos = useCallback(async () => {
    const total =
      existingPressKit.filter((p) => !pressKitToRemove.includes(p)).length + newPressKitUris.length;
    if (total >= 5) {
      Alert.alert("Limite", "Você pode ter no máximo 5 fotos no press kit.");
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Permita acesso à galeria para adicionar fotos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: 5 - total,
    });
    if (!result.canceled && result.assets.length > 0) {
      const keptCount = existingPressKit.filter((p) => !pressKitToRemove.includes(p)).length;
      setNewPressKitUris((prev) => {
        const combined = [...prev, ...result.assets.map((a) => a.uri)];
        return combined.slice(0, Math.max(0, 5 - keptCount));
      });
    }
  }, [existingPressKit, newPressKitUris, pressKitToRemove]);

  const removePressKitPhoto = useCallback(
    (displayUri: string) => {
      if (newPressKitUris.includes(displayUri)) {
        setNewPressKitUris((prev) => prev.filter((u) => u !== displayUri));
        return;
      }
      const path = existingPressKit.find((p) => resolveImageUrl(p) === displayUri);
      if (path) {
        setPressKitToRemove((prev) => (prev.includes(path) ? prev : [...prev, path]));
      }
    },
    [existingPressKit, newPressKitUris]
  );

  const validate = useCallback((): boolean => {
    const next: ArtistEditProfileFieldErrors = {};

    const nomeTrim = nome.trim();
    if (!nomeTrim) {
      next.nome = "Nome artístico é obrigatório";
    } else if (nomeTrim.length < 2) {
      next.nome = "Nome artístico deve ter ao menos 2 caracteres";
    }

    if (!bio.trim()) {
      next.bio = "Biografia é obrigatória";
    } else if (bio.trim().length < 10) {
      next.bio = "Biografia deve ter ao menos 10 caracteres";
    }

    if (!tipo) next.tipo = "Selecione o tipo de atuação";

    if (generos.length === 0) {
      next.generos = "Selecione ao menos um gênero musical";
    }

    if (instrumentos.length === 0) {
      next.instrumentos = "Selecione ao menos um instrumento";
    }

    if (!experiencia.trim()) {
      next.experiencia = "Informe os anos de experiência";
    }

    const min = parseCacheInput(cacheMin);
    const max = parseCacheInput(cacheMax);
    if (min == null) {
      next.cacheMin = "Informe o cachê mínimo";
    } else if (min <= 0) {
      next.cacheMin = "O cachê mínimo deve ser maior que zero";
    }
    if (max == null) {
      next.cacheMax = "Informe o cachê máximo";
    } else if (max <= 0) {
      next.cacheMax = "O cachê máximo deve ser maior que zero";
    }
    if (min != null && max != null && min > max) {
      next.cacheMax = "O cachê máximo deve ser maior ou igual ao mínimo";
    }

    if (!estado) next.estado = "Estado é obrigatório";
    if (!cidade.trim()) next.cidade = "Cidade é obrigatória";

    if (temEstrutura && estruturaSom.length === 0) {
      next.estruturaSom = "Selecione ao menos um equipamento";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) {
      Alert.alert("Campos obrigatórios", "Corrija os campos destacados antes de salvar.");
    }
    return Object.keys(next).length === 0;
  }, [
    nome,
    bio,
    tipo,
    generos,
    instrumentos,
    experiencia,
    cacheMin,
    cacheMax,
    estado,
    cidade,
    temEstrutura,
    estruturaSom,
  ]);

  const handleSalvar = useCallback(async () => {
    if (!profileId) return;
    if (!validate()) return;

    setSaving(true);
    try {
      const current = await artistProfileService.getMyProfile();
      if (!current) throw new Error("Perfil não encontrado");

      const remainingPressKit = existingPressKit.filter((p) => !pressKitToRemove.includes(p));

      await artistProfileService.updateProfile(
        profileId,
        {
          nome_artistico: nome.trim(),
          biografia: bio.trim() || undefined,
          generos,
          instrumentos,
          anos_experiencia: experiencia ? parseInt(experiencia, 10) : 0,
          cache_minimo: parseCacheInput(cacheMin),
          cache_maximo: parseCacheInput(cacheMax),
          tem_estrutura_som: temEstrutura,
          estrutura_som: estruturaSom,
          url_portfolio: portfolio.trim() || undefined,
          links_sociais: links,
          tipo_atuacao: tipo,
          cidade: cidade.trim(),
          estado: estado.toUpperCase().slice(0, 2),
          esta_disponivel: estaDisponivel,
          press_kit: remainingPressKit,
        },
        current
      );

      await artistProfileService.updateIndisponibilidades(profileId, datasIndisponiveis);

      if (newPhotoUri) {
        const path = await artistProfileService.uploadPhoto(profileId, newPhotoUri);
        setExistingPhoto(path);
        setNewPhotoUri(null);
      }

      if (newPressKitUris.length > 0) {
        await artistProfileService.uploadPressKit(profileId, newPressKitUris);
        setNewPressKitUris([]);
      }

      setPressKitToRemove([]);
      await loadProfile();

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      showApiError(err, "Não foi possível salvar o perfil. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }, [
    profileId,
    validate,
    nome,
    bio,
    generos,
    instrumentos,
    experiencia,
    cacheMin,
    cacheMax,
    temEstrutura,
    estruturaSom,
    portfolio,
    links,
    tipo,
    cidade,
    estado,
    estaDisponivel,
    existingPressKit,
    pressKitToRemove,
    datasIndisponiveis,
    newPhotoUri,
    newPressKitUris,
    loadProfile,
    navigation,
  ]);

  return {
    loading,
    loadError,
    saving,
    reload: loadProfile,
    nome,
    setNome: (v: string) => {
      clearError("nome");
      setNome(v);
    },
    bio,
    setBio: (v: string) => {
      clearError("bio");
      if (v.length <= 500) setBio(v);
    },
    tipo,
    setTipo: (v: string) => {
      clearError("tipo");
      setTipo(v);
    },
    generos,
    toggleGenero,
    instrumentos,
    toggleInstrumento,
    experiencia,
    setExperiencia: (v: string) => {
      clearError("experiencia");
      setExperiencia(maskExperienceYears(v));
    },
    cacheMin,
    setCacheMin: (v: string) => {
      clearError("cacheMin");
      setCacheMin(maskCurrencyBRL(v));
    },
    cacheMax,
    setCacheMax: (v: string) => {
      clearError("cacheMax");
      setCacheMax(maskCurrencyBRL(v));
    },
    temEstrutura,
    setTemEstrutura: (v: boolean) => {
      if (!v) clearError("estruturaSom");
      setTemEstrutura(v);
    },
    estruturaSom,
    toggleEquipamento,
    estado,
    cidade,
    selectedEstado,
    loadingEstados,
    loadingCidades,
    pickerMode,
    searchText,
    setSearchText,
    openPicker,
    closePicker,
    selectEstado,
    selectCidade,
    portfolio,
    setPortfolio,
    links,
    novoLink,
    setNovoLink,
    addLink,
    removeLink,
    datasIndisponiveis,
    novaData,
    setNovaData: (v: string) => setNovaData(maskDateIso(v)),
    addUnavailableDate,
    removeUnavailableDate,
    estaDisponivel,
    setEstaDisponivel,
    showsRealizados,
    notaMedia,
    avatarUrl,
    pickPhoto,
    pressKitPhotos,
    addPressKitPhotos,
    removePressKitPhoto,
    errors,
    estados,
    cidades,
    handleSalvar,
    goBack: () => navigation.goBack(),
  };
}
