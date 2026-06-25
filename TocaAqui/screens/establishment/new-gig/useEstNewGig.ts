import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { establishmentService } from "@/http/establishmentService";
import { isValidHHMM, normalizeDateToISO, normalizeTimeToHHMM } from "@/utils/datetime";
import { maskTime } from "../onboarding/utils";
import { ZERO_CURRENCY_DISPLAY } from "./constants";
import { EstNewGigFieldErrors, EstNewGigSaleMode } from "./types";
import {
  currencyFromNumber,
  maskCurrencyBRL,
  maskDigits,
  normalizeCurrencyDisplay,
  parseCurrencyBRL,
} from "./utils";

type NavProp = NativeStackNavigationProp<EstStackParamList, "EstNewGig">;
type RoutePropType = RouteProp<EstStackParamList, "EstNewGig">;

export function useEstNewGig() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const gigId = route.params?.gigId;

  const [titulo, setTitulo] = useState("");
  const [dataISO, setDataISO] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [valorShow, setValorShow] = useState(ZERO_CURRENCY_DISPLAY);
  const [valorIngresso, setValorIngresso] = useState(ZERO_CURRENCY_DISPLAY);
  const [modoVendaIngresso, setModoVendaIngresso] = useState<EstNewGigSaleMode>("antecipada");
  const [capacidade, setCapacidade] = useState("");
  const [capaUri, setCapaUri] = useState<string | null>(null);
  const [generos, setGeneros] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<EstNewGigFieldErrors>({});

  const isEditing = Boolean(gigId);
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const clearError = useCallback((field: keyof EstNewGigFieldErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const loadGig = useCallback(async () => {
    if (!gigId) return;
    setLoading(true);
    try {
      const g = await establishmentService.getGigById(gigId);
      setTitulo(g.titulo_evento);
      setDataISO(normalizeDateToISO(g.data_show));
      setInicio(normalizeTimeToHHMM(g.horario_inicio));
      setFim(normalizeTimeToHHMM(g.horario_fim));
      setValorShow(currencyFromNumber(g.cache_minimo));
      setValorIngresso(currencyFromNumber(g.preco_ingresso_inteira));
      setModoVendaIngresso(g.modo_venda_ingresso ?? "antecipada");
      setCapaUri(g.imagem_capa ?? null);
      if (g.capacidade_maxima != null) {
        setCapacidade(String(g.capacidade_maxima));
      }
      const generosRaw = g.genero_musical ?? g.generos_musicais;
      if (generosRaw) {
        setGeneros(generosRaw.split(",").map((s) => s.trim()).filter(Boolean));
      }
    } catch {
      Alert.alert("Erro", "Não foi possível carregar a data.");
    } finally {
      setLoading(false);
    }
  }, [gigId]);

  useEffect(() => {
    loadGig();
  }, [loadGig]);

  const toggleGenero = useCallback(
    (genre: string) => {
      clearError("generos");
      setGeneros((prev) =>
        prev.includes(genre) ? prev.filter((x) => x !== genre) : [...prev, genre]
      );
    },
    [clearError]
  );

  const validate = useCallback((): boolean => {
    const dataNormalizada = normalizeDateToISO(dataISO);
    const inicioNormalizado = normalizeTimeToHHMM(inicio);
    const fimNormalizado = normalizeTimeToHHMM(fim);
    const next: EstNewGigFieldErrors = {};

    if (!titulo.trim()) {
      next.titulo = "Título do evento é obrigatório";
    }
    if (!dataNormalizada) {
      next.data = "Data do evento é obrigatória";
    }
    if (!inicio.trim()) {
      next.inicio = "Horário de início é obrigatório";
    } else if (!isValidHHMM(inicioNormalizado)) {
      next.inicio = "Horário de início inválido (HH:MM)";
    }
    if (!fim.trim()) {
      next.fim = "Horário de fim é obrigatório";
    } else if (!isValidHHMM(fimNormalizado)) {
      next.fim = "Horário de fim inválido (HH:MM)";
    }
    if (
      isValidHHMM(inicioNormalizado) &&
      isValidHHMM(fimNormalizado) &&
      inicioNormalizado === fimNormalizado
    ) {
      next.inicio = "Início e fim devem ser diferentes";
      next.fim = "Início e fim devem ser diferentes";
    }
    if (generos.length === 0) {
      next.generos = "Selecione ao menos um gênero musical";
    }
    const capacidadeNum = Number(capacidade);
    if (!capacidade.trim()) {
      next.capacidade = "Capacidade máxima é obrigatória";
    } else if (!Number.isFinite(capacidadeNum) || capacidadeNum < 1) {
      next.capacidade = "Informe uma capacidade válida (mínimo 1 pessoa)";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [titulo, dataISO, inicio, fim, generos, capacidade]);

  const handlePublicar = useCallback(async () => {
    if (!validate()) return;

    const valorShowFinal = normalizeCurrencyDisplay(valorShow);
    const valorIngressoFinal = normalizeCurrencyDisplay(valorIngresso);
    setValorShow(valorShowFinal);
    setValorIngresso(valorIngressoFinal);

    const dataNormalizada = normalizeDateToISO(dataISO);
    const inicioNormalizado = normalizeTimeToHHMM(inicio);
    const fimNormalizado = normalizeTimeToHHMM(fim);

    const cacheMinimo = parseCurrencyBRL(valorShowFinal);
    const precoIngresso = parseCurrencyBRL(valorIngressoFinal);

    setSaving(true);
    try {
      const payload = {
        titulo_evento: titulo.trim(),
        data_show: dataNormalizada,
        horario_inicio: inicioNormalizado,
        horario_fim: fimNormalizado,
        cache_minimo: cacheMinimo,
        preco_ingresso_inteira: precoIngresso,
        modo_venda_ingresso: modoVendaIngresso,
        capacidade_maxima: Number(capacidade),
        genero_musical: generos.join(", ") || undefined,
        esta_publico: false,
      };

      let savedGigId = gigId;
      if (gigId) {
        await establishmentService.updateGig(gigId, payload);
      } else {
        const created = await establishmentService.createGig(payload);
        savedGigId = created.id;
      }

      if (savedGigId && capaUri && !capaUri.startsWith("uploads/")) {
        await establishmentService.uploadGigCover(savedGigId, capaUri);
      }

      Alert.alert("Sucesso", gigId ? "Data atualizada!" : "Data publicada!");
      navigation.goBack();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detalhes?: Array<{ mensagem: string }>; message?: string; error?: string } } };
      const data = err?.response?.data;
      const detalhes = data?.detalhes?.map((d) => d.mensagem).join("\n");
      const rawMsg = detalhes || data?.message || data?.error || "Não foi possível salvar.";
      const msg = /já existem candidaturas/i.test(String(rawMsg))
        ? "Não é possível editar este evento porque já existem candidaturas vinculadas."
        : rawMsg;
      Alert.alert("Erro", msg);
    } finally {
      setSaving(false);
    }
  }, [
    validate,
    dataISO,
    inicio,
    fim,
    titulo,
    valorShow,
    valorIngresso,
    modoVendaIngresso,
    capacidade,
    generos,
    gigId,
    capaUri,
    navigation,
  ]);

  const handleSelectCover = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Permita o acesso à galeria para adicionar a capa do evento.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setCapaUri(result.assets[0].uri);
    }
  }, []);

  const selectDate = useCallback(
    (dateString: string) => {
      clearError("data");
      setDataISO(dateString);
      setShowCalendar(false);
    },
    [clearError]
  );

  const openCalendar = useCallback(() => {
    clearError("data");
    setShowCalendar(true);
  }, [clearError]);

  return {
    isEditing,
    loading,
    saving,
    errors,
    titulo,
    setTitulo: (v: string) => {
      clearError("titulo");
      setTitulo(v);
    },
    dataISO,
    showCalendar,
    setShowCalendar,
    openCalendar,
    selectDate,
    today,
    inicio,
    setInicio: (v: string) => {
      clearError("inicio");
      setInicio(maskTime(v));
    },
    fim,
    setFim: (v: string) => {
      clearError("fim");
      setFim(maskTime(v));
    },
    valorShow,
    setValorShow: (v: string) => setValorShow(maskCurrencyBRL(v)),
    blurValorShow: () => setValorShow((prev) => normalizeCurrencyDisplay(prev)),
    valorIngresso,
    setValorIngresso: (v: string) => setValorIngresso(maskCurrencyBRL(v)),
    blurValorIngresso: () => setValorIngresso((prev) => normalizeCurrencyDisplay(prev)),
    modoVendaIngresso,
    setModoVendaIngresso,
    capacidade,
    setCapacidade: (v: string) => {
      clearError("capacidade");
      setCapacidade(maskDigits(v));
    },
    capaUri,
    generos,
    toggleGenero,
    handleSelectCover,
    handlePublicar,
    goBack: () => navigation.goBack(),
  };
}
