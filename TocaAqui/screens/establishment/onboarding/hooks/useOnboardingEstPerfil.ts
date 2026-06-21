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
      const next = draft.estrutura.includes(item)
        ? draft.estrutura.filter((e) => e !== item)
        : [...draft.estrutura, item];
      updateDraft({ estrutura: next });
    },
    [draft.estrutura, updateDraft]
  );

  const goNext = useCallback(() => {
    if (draft.generos.length === 0) {
      setGenerosError("Selecione pelo menos um gênero");
      return;
    }
    setGenerosError("");
    navigation.navigate("OnboardingEstApresentacao");
  }, [draft.generos.length, navigation]);

  return {
    generos: draft.generos,
    generosError,
    temEstrutura: draft.temEstrutura,
    estrutura: draft.estrutura,
    capacidade: draft.capacidade,
    toggleGenero,
    setTemEstrutura: (v: boolean) => updateDraft({ temEstrutura: v }),
    toggleEstruturaItem,
    setCapacidade: (capacidade: string) => updateDraft({ capacidade }),
    goNext,
    goBack: () => navigation.goBack(),
  };
}
