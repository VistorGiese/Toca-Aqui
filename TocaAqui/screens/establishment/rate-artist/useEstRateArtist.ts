import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { establishmentService } from "@/http/establishmentService";
import { formatShowDateLong, toggleChipSelection } from "./utils";

type NavProp = NativeStackNavigationProp<EstStackParamList, "EstRateArtist">;
type RouteType = RouteProp<EstStackParamList, "EstRateArtist">;

export function useEstRateArtist() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { contractId, artistName, showDate } = route.params;

  const [rating, setRating] = useState(0);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [comentario, setComentario] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState("");

  const formattedDate = useMemo(() => formatShowDateLong(showDate), [showDate]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const selectRating = useCallback((value: number) => {
    setRatingError("");
    setRating(value);
  }, []);

  const toggleChip = useCallback((label: string) => {
    setSelectedChips((prev) => toggleChipSelection(prev, label));
  }, []);

  const submit = useCallback(async () => {
    if (rating === 0) {
      setRatingError("Selecione uma avaliação em estrelas");
      return;
    }

    setRatingError("");
    setSubmitting(true);
    try {
      await establishmentService.rateArtist(contractId, {
        nota: rating,
        comentario: comentario.trim() || undefined,
        tags: selectedChips,
      });
      Alert.alert(
        "Avaliação enviada!",
        "Obrigado pelo feedback. Isso ajuda artistas a melhorarem.",
        [{ text: "OK", onPress: goBack }]
      );
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Não foi possível enviar a avaliação.";
      Alert.alert("Erro", message);
    } finally {
      setSubmitting(false);
    }
  }, [rating, comentario, selectedChips, contractId, goBack]);

  return {
    artistName,
    formattedDate,
    rating,
    ratingError,
    selectedChips,
    comentario,
    submitting,
    setComentario,
    selectRating,
    toggleChip,
    submit,
    goBack,
  };
}
