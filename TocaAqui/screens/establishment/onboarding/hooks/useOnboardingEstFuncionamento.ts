import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstablishmentOnboardingStackParamList } from "../EstablishmentOnboardingNavigator";
import { useEstablishmentOnboarding } from "../context/EstablishmentOnboardingContext";
import { IbgeCidade, IbgeEstado } from "../context/types";
import { LocationPickerMode } from "../components/LocationPickerModal";

type NavProp = NativeStackNavigationProp<EstablishmentOnboardingStackParamList, "OnboardingEstFuncionamento">;

export function useOnboardingEstFuncionamento() {
  const navigation = useNavigation<NavProp>();
  const { draft, updateDraft, setWeekSchedule } = useEstablishmentOnboarding();

  const [estados, setEstados] = useState<IbgeEstado[]>([]);
  const [cidades, setCidades] = useState<IbgeCidade[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(false);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [pickerMode, setPickerMode] = useState<LocationPickerMode>(null);
  const [searchText, setSearchText] = useState("");

  const selectedEstado: IbgeEstado | null = draft.estado
    ? { sigla: draft.estado, nome: draft.estadoNome || draft.estado }
    : null;
  const selectedCidade: IbgeCidade | null = draft.cidade
    ? { id: 0, nome: draft.cidade }
    : null;

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
    if (!draft.estado) {
      setCidades([]);
      return;
    }
    setLoadingCidades(true);
    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${draft.estado}/municipios?orderBy=nome`
    )
      .then((r) => r.json())
      .then((data: Array<{ id: number; nome: string }>) => {
        setCidades(data.map((c) => ({ id: c.id, nome: c.nome })));
      })
      .catch(() => Alert.alert("Erro", "Não foi possível carregar as cidades."))
      .finally(() => setLoadingCidades(false));
  }, [draft.estado]);

  const openPicker = useCallback((mode: LocationPickerMode) => {
    setSearchText("");
    setPickerMode(mode);
  }, []);

  const closePicker = useCallback(() => setPickerMode(null), []);

  const selectEstado = useCallback(
    (estado: IbgeEstado) => {
      updateDraft({ estado: estado.sigla, estadoNome: estado.nome, cidade: "" });
      setPickerMode(null);
    },
    [updateDraft]
  );

  const selectCidade = useCallback(
    (cidade: IbgeCidade) => {
      updateDraft({ cidade: cidade.nome });
      setPickerMode(null);
    },
    [updateDraft]
  );

  const toggleDay = useCallback(
    (id: string) => {
      const current = draft.diasHorarios[id];
      if (!current) return;
      setWeekSchedule({
        ...draft.diasHorarios,
        [id]: { ...current, ativo: !current.ativo },
      });
    },
    [draft.diasHorarios, setWeekSchedule]
  );

  const updateTime = useCallback(
    (id: string, field: "inicio" | "fim", value: string) => {
      const current = draft.diasHorarios[id];
      if (!current) return;
      setWeekSchedule({
        ...draft.diasHorarios,
        [id]: { ...current, [field]: value },
      });
    },
    [draft.diasHorarios, setWeekSchedule]
  );

  const goNext = useCallback(() => {
    if (!draft.estado) {
      Alert.alert("Atenção", "Selecione o estado.");
      return;
    }
    if (!draft.cidade) {
      Alert.alert("Atenção", "Selecione a cidade.");
      return;
    }
    if (!draft.endereco.trim()) {
      Alert.alert("Atenção", "Informe o nome da rua.");
      return;
    }
    if (!draft.numero.trim()) {
      Alert.alert("Atenção", "Informe o número do estabelecimento.");
      return;
    }
    navigation.navigate("OnboardingEstPerfil");
  }, [draft, navigation]);

  return {
    draft,
    estados,
    cidades,
    selectedEstado,
    selectedCidade,
    pickerMode,
    searchText,
    setSearchText,
    openPicker,
    closePicker,
    selectEstado,
    selectCidade,
    toggleDay,
    updateTime,
    goNext,
    goBack: () => navigation.goBack(),
    loadingEstados,
    loadingCidades,
    setEndereco: (endereco: string) => updateDraft({ endereco }),
    setNumero: (numero: string) => updateDraft({ numero }),
  };
}
