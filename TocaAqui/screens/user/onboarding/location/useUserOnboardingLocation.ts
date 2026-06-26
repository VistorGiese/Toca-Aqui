import { useCallback, useState } from "react";
import { preferenciaService } from "@/http/artistaPublicoService";
import { RADIUS_DEFAULT } from "./constants";
import { UserOnboardingLocationProps } from "./types";
import { decreaseRadius, increaseRadius, toggleVenueInList } from "./utils";

export function useUserOnboardingLocation({ navigation }: UserOnboardingLocationProps) {
  const [city, setCity] = useState("");
  const [useLocation, setUseLocation] = useState(false);
  const [radius, setRadius] = useState(RADIUS_DEFAULT);
  const [selectedVenues, setSelectedVenues] = useState<string[]>([]);
  const [cityError, setCityError] = useState("");

  const toggleVenue = useCallback((venue: string) => {
    setSelectedVenues((prev) => toggleVenueInList(prev, venue));
  }, []);

  const handleCityChange = useCallback((value: string) => {
    setCityError("");
    setCity(value);
  }, []);

  const handleDecreaseRadius = useCallback(() => {
    setRadius((r) => decreaseRadius(r));
  }, []);

  const handleIncreaseRadius = useCallback(() => {
    setRadius((r) => increaseRadius(r));
  }, []);

  const handleStart = useCallback(async () => {
    if (!city.trim()) {
      setCityError("Cidade é obrigatória");
      return;
    }
    setCityError("");
    try {
      await preferenciaService.salvar({
        cidade: city || undefined,
        raio_busca_km: radius,
        tipos_local: selectedVenues.length > 0 ? selectedVenues : undefined,
      });
    } catch {}
    navigation.reset({ index: 0, routes: [{ name: "UserNavigator" as any }] });
  }, [city, navigation, radius, selectedVenues]);

  const handleSkip = useCallback(() => {
    navigation.reset({ index: 0, routes: [{ name: "UserNavigator" as any }] });
  }, [navigation]);

  return {
    city,
    useLocation,
    setUseLocation,
    radius,
    selectedVenues,
    cityError,
    toggleVenue,
    handleCityChange,
    handleDecreaseRadius,
    handleIncreaseRadius,
    handleStart,
    handleSkip,
  };
}
