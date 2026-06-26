import { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstablishmentOnboardingStackParamList } from "../EstablishmentOnboardingNavigator";
import { useEstablishmentOnboarding } from "../context/EstablishmentOnboardingContext";

type NavProp = NativeStackNavigationProp<EstablishmentOnboardingStackParamList, "OnboardingEstPerfil">;

export function useOnboardingEstPerfil() {
  const navigation = useNavigation<NavProp>();
  const { draft, updateDraft } = useEstablishmentOnboarding();
  const [generosError, setGenerosError] = useState("");
  const [estruturaError, setEstruturaError] = useState("");
  const [capacidadeError, setCapacidadeError] = useState("");

  const toggleGenero = useCallback(
    (label: string) => {
      setGenerosError("");
      const next = draft.generos.includes(label)
        ? draft.generos.filter((g) => g !== label)
        : [...draft.generos, label];
      updateDraft({ generos: next });
    },
    [draft.generos, updateDraft]
  );

  const toggleEstruturaItem = useCallback(
    (item: string) => {
      setEstruturaError("");
      const next = draft.estrutura.includes(item)
        ? draft.estrutura.filter((e) => e !== item)
        : [...draft.estrutura, item];
      updateDraft({ estrutura: next });
    },
    [draft.estrutura, updateDraft]
  );

  const goNext = useCallback(() => {
    let hasError = false;

    if (draft.generos.length === 0) {
      setGenerosError("Selecione pelo menos um gênero");
      hasError = true;
    } else {
      setGenerosError("");
    }

    if (draft.temEstrutura && draft.estrutura.length === 0) {
      setEstruturaError("Selecione pelo menos um equipamento da estrutura");
      hasError = true;
    } else {
      setEstruturaError("");
    }

    const capacidadeTrimmed = draft.capacidade.trim();
    if (!capacidadeTrimmed) {
      setCapacidadeError("Capacidade é obrigatória");
      hasError = true;
    } else {
      const capacidadeNum = Number(capacidadeTrimmed);
      if (!Number.isFinite(capacidadeNum) || capacidadeNum < 1) {
        setCapacidadeError("Informe uma capacidade válida (mínimo 1 pessoa)");
        hasError = true;
      } else {
        setCapacidadeError("");
      }
    }

    if (hasError) return;

    navigation.navigate("OnboardingEstApresentacao");
  }, [
    draft.capacidade,
    draft.estrutura.length,
    draft.generos.length,
    draft.temEstrutura,
    navigation,
  ]);

  return {
    generos: draft.generos,
    generosError,
    estruturaError,
    capacidadeError,
    temEstrutura: draft.temEstrutura,
    estrutura: draft.estrutura,
    capacidade: draft.capacidade,
    toggleGenero,
    setTemEstrutura: (v: boolean) => {
      setEstruturaError("");
      updateDraft({ temEstrutura: v, ...(v ? {} : { estrutura: [] }) });
    },
    toggleEstruturaItem,
    setCapacidade: (capacidade: string) => {
      setCapacidadeError("");
      updateDraft({ capacidade: capacidade.replace(/\D/g, "") });
    },
    goNext,
    goBack: () => navigation.goBack(),
  };
}
