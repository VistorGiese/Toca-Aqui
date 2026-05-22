import { useCallback } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstablishmentOnboardingStackParamList } from "../EstablishmentOnboardingNavigator";
import { useEstablishmentOnboarding } from "../context/EstablishmentOnboardingContext";

type NavProp = NativeStackNavigationProp<EstablishmentOnboardingStackParamList, "OnboardingEstPerfil">;

export function useOnboardingEstPerfil() {
  const navigation = useNavigation<NavProp>();
  const { draft, updateDraft } = useEstablishmentOnboarding();

  const toggleGenero = useCallback(
    (label: string) => {
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
      Alert.alert("Atenção", "Selecione pelo menos um gênero.");
      return;
    }
    navigation.navigate("OnboardingEstApresentacao");
  }, [draft.generos.length, navigation]);

  return {
    generos: draft.generos,
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
