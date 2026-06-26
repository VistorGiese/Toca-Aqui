import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { UserStackParamList } from "@/navigation/UserNavigator";
import { useAuth } from "@/contexts/AuthContext";
import { preferenciaService } from "@/http/artistaPublicoService";
import { userService } from "@/http/userService";
import { resolveImageUrl } from "@/utils/adapters";
import { getApiErrorMessage, showApiError } from "@/utils/errorHandler";
import { LocationPickerMode } from "@/screens/establishment/onboarding/components/LocationPickerModal";
import { IbgeCidade, IbgeEstado } from "@/screens/establishment/onboarding/context/types";
import {
  USER_EDIT_PROFILE_DEFAULT_RADIUS,
  USER_EDIT_PROFILE_MIN_GENRES,
} from "./constants";
import { UserEditProfileFieldErrors } from "./types";
import { parseCidadePref, resolveCidadeToSave } from "./utils";

type NavProp = NativeStackNavigationProp<UserStackParamList, "UserEditProfile">;

export function useUserEditProfile() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  const [generos, setGeneros] = useState<string[]>([]);
  const [cidadeTexto, setCidadeTexto] = useState("");
  const [estado, setEstado] = useState("");
  const [estadoNome, setEstadoNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [raio, setRaio] = useState(USER_EDIT_PROFILE_DEFAULT_RADIUS);
  const [tiposLocal, setTiposLocal] = useState<string[]>([]);
  const [notifNovosShows, setNotifNovosShows] = useState(true);
  const [notifLembretes, setNotifLembretes] = useState(true);

  const [errors, setErrors] = useState<UserEditProfileFieldErrors>({});

  const [estados, setEstados] = useState<IbgeEstado[]>([]);
  const [cidades, setCidades] = useState<IbgeCidade[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(false);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [pickerMode, setPickerMode] = useState<LocationPickerMode>(null);
  const [searchText, setSearchText] = useState("");

  const clearError = useCallback((field: keyof UserEditProfileFieldErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const applyPrefs = useCallback((prefs: Awaited<ReturnType<typeof preferenciaService.buscar>>) => {
    setGeneros(prefs?.generos_favoritos ?? []);
    setRaio(prefs?.raio_busca_km ?? USER_EDIT_PROFILE_DEFAULT_RADIUS);
    setTiposLocal(prefs?.tipos_local ?? []);
    setNotifNovosShows(prefs?.notif_novos_shows ?? true);
    setNotifLembretes(prefs?.notif_lembretes ?? true);

    const parsed = parseCidadePref(prefs?.cidade);
    setEstado(parsed.estadoSigla);
    setCidade(parsed.cidadeNome);
    setCidadeTexto(parsed.estadoSigla ? "" : parsed.cidadeNome);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    setErrors({});
    try {
      const [perfil, prefs] = await Promise.all([
        userService.getProfile(),
        preferenciaService.buscar(),
      ]);
      setFotoPerfil(resolveImageUrl(perfil.user.foto_perfil));
      applyPrefs(prefs);
    } catch (err) {
      const msg = getApiErrorMessage(err, "Não foi possível carregar o perfil.");
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  }, [applyPrefs]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const toggleGenero = useCallback(
    (key: string) => {
      clearError("generos");
      setGeneros((prev) =>
        prev.includes(key) ? prev.filter((g) => g !== key) : [...prev, key]
      );
    },
    [clearError]
  );

  const toggleTipoLocal = useCallback((tipo: string) => {
    setTiposLocal((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
    );
  }, []);

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
      setCidadeTexto("");
      setPickerMode(null);
    },
    [clearError]
  );

  const selectCidade = useCallback(
    (item: IbgeCidade) => {
      clearError("cidade");
      setCidade(item.nome);
      setCidadeTexto("");
      setPickerMode(null);
    },
    [clearError]
  );

  const handleSelecionarFoto = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de acesso à sua galeria para alterar a foto."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    setUploadingFoto(true);
    try {
      const data = await userService.uploadFoto(result.assets[0].uri);
      setFotoPerfil(resolveImageUrl(data.foto_perfil));
    } catch (err) {
      showApiError(err, "Não foi possível enviar a foto. Tente novamente.");
    } finally {
      setUploadingFoto(false);
    }
  }, []);

  const validate = useCallback((): boolean => {
    const next: UserEditProfileFieldErrors = {};

    if (generos.length < USER_EDIT_PROFILE_MIN_GENRES) {
      next.generos = `Selecione pelo menos ${USER_EDIT_PROFILE_MIN_GENRES} gêneros`;
    }

    const cidadeSalvar = resolveCidadeToSave(cidadeTexto, cidade, estado);
    if (!cidadeSalvar.trim()) {
      next.cidade = "Cidade é obrigatória";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) {
      Alert.alert("Campos obrigatórios", "Preencha os campos destacados antes de salvar.");
      return false;
    }
    return true;
  }, [generos, cidadeTexto, cidade, estado]);

  const handleSalvar = useCallback(async () => {
    if (!validate()) return;

    const cidadeSalvar = resolveCidadeToSave(cidadeTexto, cidade, estado);

    setSaving(true);
    try {
      await preferenciaService.salvar({
        generos_favoritos: generos,
        cidade: cidadeSalvar,
        raio_busca_km: raio,
        tipos_local: tiposLocal.length > 0 ? tiposLocal : undefined,
        notif_novos_shows: notifNovosShows,
        notif_lembretes: notifLembretes,
      });

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      showApiError(err, "Não foi possível salvar o perfil. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }, [
    validate,
    generos,
    cidadeTexto,
    cidade,
    estado,
    raio,
    tiposLocal,
    notifNovosShows,
    notifLembretes,
    navigation,
  ]);

  return {
    loading,
    loadError,
    saving,
    reload: loadData,
    nome: user?.nome_completo ?? "",
    email: user?.email ?? "",
    fotoPerfil,
    uploadingFoto,
    handleSelecionarFoto,
    generos,
    toggleGenero,
    estado,
    cidade,
    cidadeTexto,
    setCidadeTexto: (v: string) => {
      clearError("cidade");
      setCidadeTexto(v);
      if (v.trim()) {
        setCidade("");
        setEstado("");
        setEstadoNome("");
      }
    },
    selectedEstado,
    loadingEstados,
    loadingCidades,
    openPicker,
    closePicker,
    pickerMode,
    searchText,
    setSearchText,
    estados,
    cidades,
    selectEstado,
    selectCidade,
    raio,
    decreaseRaio: () => setRaio((r) => Math.max(1, r - 10)),
    increaseRaio: () => setRaio((r) => Math.min(200, r + 10)),
    tiposLocal,
    toggleTipoLocal,
    notifNovosShows,
    setNotifNovosShows,
    notifLembretes,
    setNotifLembretes,
    errors,
    handleSalvar,
    goBack: () => navigation.goBack(),
  };
}
