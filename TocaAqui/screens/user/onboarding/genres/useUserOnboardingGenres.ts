import { useCallback, useState } from "react";
import { preferenciaService } from "@/http/artistaPublicoService";
import { MIN_GENRES } from "./constants";
import { UserOnboardingGenresProps } from "./types";
import { toggleGenreInList } from "./utils";

export function useUserOnboardingGenres({ navigation }: UserOnboardingGenresProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [generosError, setGenerosError] = useState("");

  const toggleGenre = useCallback((key: string) => {
    setGenerosError("");
    setSelected((prev) => toggleGenreInList(prev, key));
  }, []);

  const handleNext = useCallback(async () => {
    if (selected.length < MIN_GENRES) {
      setGenerosError("Selecione pelo menos 2 gêneros");
      return;
    }
    setGenerosError("");
    try {
      await preferenciaService.salvar({ generos_favoritos: selected });
    } catch {}
    (navigation as any).navigate("UserOnboardingLocation", { generos: selected });
  }, [navigation, selected]);

  const handleSkip = useCallback(() => {
    navigation.reset({ index: 0, routes: [{ name: "UserNavigator" as any }] });
  }, [navigation]);

  return {
    selected,
    generosError,
    toggleGenre,
    handleNext,
    handleSkip,
  };
}
