import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { establishmentService } from "@/http/establishmentService";
import { parsePressKit, resolveImageUrl } from "@/utils/adapters";
import { getApiErrorMessage, showApiError } from "@/utils/errorHandler";
import { IbgeCidade, IbgeEstado, WeekSchedule } from "../onboarding/context/types";
import { LocationPickerMode } from "../onboarding/components/LocationPickerModal";
import { createDefaultWeekSchedule } from "../onboarding/constants";
import {
  isValidTime,
  maskCep,
  maskCnpj,
  maskNumeroEndereco,
  maskPhone,
  maskTime,
  resolveOpeningHours,
  sanitizeCnpj,
  sanitizePhone,
  scheduleFromOpeningHours,
  toBackendTime,
} from "../onboarding/utils";
import { EstEditProfileFieldErrors } from "./types";

type NavProp = NativeStackNavigationProp<EstStackParamList, "EstEditProfile">;

function parseGeneros(raw?: string): string[] {
  if (!raw) return [];
  return raw.split(",").map((g) => g.trim()).filter(Boolean);
}

function applyProfileToForm(
  p: Awaited<ReturnType<typeof establishmentService.getMyEstablishmentProfile>>,
  setters: {
    setProfileId: (id: number) => void;
    setEnderecoId: (id: number | null) => void;
    setNome: (v: string) => void;
    setDescricao: (v: string) => void;
    setTipo: (v: string) => void;
    setTelefone: (v: string) => void;
    setCnpj: (v: string) => void;
    setGeneros: (v: string[]) => void;
    setDiasHorarios: (v: WeekSchedule) => void;
    setEstado: (v: string) => void;
    setEstadoNome: (v: string) => void;
    setCidade: (v: string) => void;
    setEndereco: (v: string) => void;
    setNumero: (v: string) => void;
    setBairro: (v: string) => void;
    setCep: (v: string) => void;
    setExistingPhotos: (v: string[]) => void;
  }
) {
  const addr = p.Address;
  const enderecoIdResolved = addr?.id ?? p.endereco_id ?? null;

  setters.setProfileId(p.id);
  setters.setEnderecoId(enderecoIdResolved != null ? Number(enderecoIdResolved) : null);
  setters.setNome(p.nome_estabelecimento ?? "");
  setters.setDescricao(p.descricao ?? "");
  setters.setTipo(p.tipo_estabelecimento ?? "");
  setters.setTelefone(maskPhone(p.telefone_contato ?? ""));
  setters.setCnpj(maskCnpj(p.cnpj ?? ""));
  setters.setGeneros(parseGeneros(p.generos_musicais));
  setters.setDiasHorarios(
    scheduleFromOpeningHours(p.horario_abertura, p.horario_fechamento)
  );
  setters.setEstado(addr?.estado ?? p.estado ?? "");
  setters.setEstadoNome(addr?.estado ?? p.estado ?? "");
  setters.setCidade(addr?.cidade ?? p.cidade ?? "");
  setters.setEndereco(addr?.rua ?? "");
  setters.setNumero(addr?.numero ?? "");
  setters.setBairro(addr?.bairro ?? "");
  setters.setCep(maskCep(addr?.cep ?? ""));
  setters.setExistingPhotos(parsePressKit(p.fotos));
}

export function useEstEditProfile() {
  const navigation = useNavigation<NavProp>();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [enderecoId, setEnderecoId] = useState<number | null>(null);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [generos, setGeneros] = useState<string[]>([]);
  const [diasHorarios, setDiasHorarios] = useState<WeekSchedule>(createDefaultWeekSchedule());

  const [estado, setEstado] = useState("");
  const [estadoNome, setEstadoNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cep, setCep] = useState("");

  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [photosToRemove, setPhotosToRemove] = useState<string[]>([]);
  const [newPhotoUris, setNewPhotoUris] = useState<string[]>([]);

  const [errors, setErrors] = useState<EstEditProfileFieldErrors>({});

  const [estados, setEstados] = useState<IbgeEstado[]>([]);
  const [cidades, setCidades] = useState<IbgeCidade[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(false);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [pickerMode, setPickerMode] = useState<LocationPickerMode>(null);
  const [searchText, setSearchText] = useState("");

  const clearError = useCallback((field: keyof EstEditProfileFieldErrors) => {
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
      const p = await establishmentService.getMyEstablishmentProfile();
      applyProfileToForm(p, {
        setProfileId,
        setEnderecoId,
        setNome,
        setDescricao,
        setTipo,
        setTelefone,
        setCnpj,
        setGeneros,
        setDiasHorarios,
        setEstado,
        setEstadoNome,
        setCidade,
        setEndereco,
        setNumero,
        setBairro,
        setCep,
        setExistingPhotos,
      });
      setPhotosToRemove([]);
      setNewPhotoUris([]);
    } catch (err) {
      const msg = getApiErrorMessage(err, "Não foi possível carregar o perfil.");
      setLoadError(msg);
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

  const selectedEstado = useMemo(
    () => (estado ? { sigla: estado, nome: estadoNome || estado } : null),
    [estado, estadoNome]
  );

  const galleryPhotos = useMemo(() => {
    const kept = existingPhotos.filter((p) => !photosToRemove.includes(p));
    const remoteDisplay = kept
      .map((p) => resolveImageUrl(p))
      .filter((u): u is string => Boolean(u));
    return [...remoteDisplay, ...newPhotoUris];
  }, [existingPhotos, photosToRemove, newPhotoUris]);

  const toggleGenero = useCallback(
    (label: string) => {
      clearError("generos");
      setGeneros((prev) =>
        prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
      );
    },
    [clearError]
  );

  const toggleDay = useCallback(
    (id: string) => {
      setDiasHorarios((prev) => {
        const current = prev[id];
        if (!current) return prev;
        return { ...prev, [id]: { ...current, ativo: !current.ativo } };
      });
      clearError("horarios");
    },
    [clearError]
  );

  const updateTime = useCallback(
    (id: string, field: "inicio" | "fim", value: string) => {
      clearError("horarios");
      const masked = maskTime(value);
      setDiasHorarios((prev) => {
        const current = prev[id];
        if (!current) return prev;
        return { ...prev, [id]: { ...current, [field]: masked } };
      });
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

  const addPhotos = useCallback(async () => {
    const total =
      existingPhotos.filter((p) => !photosToRemove.includes(p)).length + newPhotoUris.length;
    if (total >= 5) {
      Alert.alert("Limite", "Você pode ter no máximo 5 fotos.");
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
      selectionLimit: 5 - total,
    });
    if (!result.canceled && result.assets.length > 0) {
      const keptCount = existingPhotos.filter((p) => !photosToRemove.includes(p)).length;
      const novas = result.assets.map((a) => a.uri);
      setNewPhotoUris((prev) => {
        const combined = [...prev, ...novas];
        return combined.slice(0, Math.max(0, 5 - keptCount));
      });
    }
  }, [existingPhotos, newPhotoUris, photosToRemove]);

  const removePhoto = useCallback(
    (displayUri: string) => {
      if (newPhotoUris.includes(displayUri)) {
        setNewPhotoUris((prev) => prev.filter((u) => u !== displayUri));
        return;
      }
      const path = existingPhotos.find((p) => resolveImageUrl(p) === displayUri);
      if (path) {
        setPhotosToRemove((prev) => (prev.includes(path) ? prev : [...prev, path]));
      }
    },
    [existingPhotos, newPhotoUris]
  );

  const validate = useCallback((): boolean => {
    const next: EstEditProfileFieldErrors = {};

    if (!nome.trim()) {
      next.nome = "Nome do estabelecimento é obrigatório";
    }
    if (!descricao.trim()) {
      next.descricao = "Descrição é obrigatória";
    }
    if (!tipo) {
      next.tipo = "Selecione o tipo de estabelecimento";
    }

    const telefoneDigits = sanitizePhone(telefone);
    if (!telefoneDigits) {
      next.telefone = "Telefone é obrigatório";
    } else if (telefoneDigits.length < 10) {
      next.telefone = "Telefone incompleto (mínimo 10 dígitos)";
    }

    const cnpjDigits = sanitizeCnpj(cnpj);
    if (!cnpjDigits) {
      next.cnpj = "CNPJ é obrigatório";
    } else if (cnpjDigits.length !== 14) {
      next.cnpj = "CNPJ incompleto (14 dígitos)";
    }

    if (generos.length === 0) {
      next.generos = "Selecione ao menos um gênero musical";
    }

    if (!estado) {
      next.estado = "Estado é obrigatório";
    }
    if (!cidade.trim()) {
      next.cidade = "Cidade é obrigatória";
    }
    if (!endereco.trim()) {
      next.endereco = "Rua é obrigatória";
    }
    if (!numero.trim()) {
      next.numero = "Número é obrigatório";
    }
    if (!bairro.trim()) {
      next.bairro = "Bairro é obrigatório";
    }

    const cepDigits = cep.replace(/\D/g, "");
    if (!cepDigits) {
      next.cep = "CEP é obrigatório";
    } else if (cepDigits.length !== 8) {
      next.cep = "CEP incompleto (8 dígitos)";
    }

    const diasAtivos = Object.values(diasHorarios).filter((d) => d.ativo);
    if (diasAtivos.length === 0) {
      next.horarios = "Selecione ao menos um dia de funcionamento";
    } else {
      const horarioInvalido = diasAtivos.some(
        (d) => !isValidTime(d.inicio) || !isValidTime(d.fim)
      );
      if (horarioInvalido) {
        next.horarios = "Informe horários válidos (HH:MM) nos dias selecionados";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [
    nome,
    descricao,
    tipo,
    telefone,
    cnpj,
    generos,
    estado,
    cidade,
    endereco,
    numero,
    bairro,
    cep,
    diasHorarios,
  ]);

  const handleSalvar = useCallback(async () => {
    if (!profileId) return;
    if (!validate()) return;

    const telefoneDigits = sanitizePhone(telefone);
    const cnpjDigits = sanitizeCnpj(cnpj);

    setSaving(true);
    try {
      const { horarioAbertura, horarioFechamento } = resolveOpeningHours(diasHorarios);
      const addressPayload = {
        rua: endereco.trim(),
        numero: numero.trim(),
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        estado: estado.toUpperCase().slice(0, 2),
        cep: cep.replace(/\D/g, ""),
      };

      let resolvedEnderecoId = enderecoId;
      if (!resolvedEnderecoId && profileId) {
        const fresh = await establishmentService.getMyEstablishmentProfile();
        resolvedEnderecoId = fresh.Address?.id ?? fresh.endereco_id ?? null;
      }

      if (resolvedEnderecoId) {
        await establishmentService.updateAddress(resolvedEnderecoId, addressPayload);
      } else {
        const created = await establishmentService.createEndereco(addressPayload);
        resolvedEnderecoId = created.id;
        setEnderecoId(created.id);
      }

      await establishmentService.updateMyEstablishmentProfile(profileId, {
        nome_estabelecimento: nome.trim(),
        descricao: descricao.trim(),
        tipo_estabelecimento: tipo,
        telefone_contato: telefoneDigits,
        cnpj: cnpjDigits,
        generos_musicais: generos.join(", "),
        horario_abertura: toBackendTime(horarioAbertura),
        horario_fechamento: toBackendTime(horarioFechamento),
        endereco_id: resolvedEnderecoId,
      });

      for (const path of photosToRemove) {
        await establishmentService.removeEstablishmentPhoto(profileId, path);
      }
      if (newPhotoUris.length > 0) {
        await establishmentService.uploadEstablishmentPhotos(profileId, newPhotoUris);
      }

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
    telefone,
    cnpj,
    diasHorarios,
    endereco,
    numero,
    bairro,
    cidade,
    estado,
    cep,
    enderecoId,
    nome,
    descricao,
    tipo,
    generos,
    photosToRemove,
    newPhotoUris,
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
    descricao,
    setDescricao: (v: string) => {
      if (v.length <= 1000) {
        clearError("descricao");
        setDescricao(v);
      }
    },
    tipo,
    setTipo: (v: string) => {
      clearError("tipo");
      setTipo(v);
    },
    telefone,
    setTelefone: (v: string) => {
      clearError("telefone");
      setTelefone(maskPhone(v));
    },
    cnpj,
    setCnpj: (v: string) => {
      clearError("cnpj");
      setCnpj(maskCnpj(v));
    },
    generos,
    toggleGenero,
    diasHorarios,
    toggleDay,
    updateTime,
    estado,
    cidade,
    endereco,
    setEndereco: (v: string) => {
      clearError("endereco");
      setEndereco(v);
    },
    numero,
    setNumero: (v: string) => {
      clearError("numero");
      setNumero(maskNumeroEndereco(v));
    },
    bairro,
    setBairro: (v: string) => {
      clearError("bairro");
      setBairro(v);
    },
    cep,
    setCep: (v: string) => {
      clearError("cep");
      setCep(maskCep(v));
    },
    errors,
    estados,
    cidades,
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
    galleryPhotos,
    addPhotos,
    removePhoto,
    handleSalvar,
    goBack: () => navigation.goBack(),
  };
}
