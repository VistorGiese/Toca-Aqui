import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArtistStackParamList } from "@/navigation/ArtistNavigator";
import { contractService } from "@/http/contractService";
import { toggleChipSelection } from "./utils";

type NavProp = NativeStackNavigationProp<ArtistStackParamList, "RateEstablishment">;
type RouteType = RouteProp<ArtistStackParamList, "RateEstablishment">;

export function useArtistRateEstablishment() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { contractId, venueName } = route.params;

  const [rating, setRating] = useState(0);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [comentario, setComentario] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState("");

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
      await contractService.avaliarEstabelecimento(contractId, {
        nota: rating,
        comentario: comentario.trim() || undefined,
        tags: selectedChips,
      });
      Alert.alert(
        "Avaliação enviada!",
        "Obrigado pelo seu feedback. Isso ajuda a melhorar a experiência para todos os artistas.",
        [{ text: "OK", onPress: goBack }]
      );
    } catch {
      Alert.alert("Erro", "Não foi possível enviar a avaliação. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }, [rating, comentario, selectedChips, contractId, goBack]);

  return {
    venueName,
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
