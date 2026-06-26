import { useState } from "react";
import { Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { avaliacaoService } from "@/http/avaliacaoService";
import {
  ARTIST_RATING_ERROR,
  MAX_COMMENT,
  SUBMIT_ERROR_MESSAGE,
  SUBMIT_ERROR_TITLE,
  SUCCESS_MESSAGE,
  SUCCESS_TITLE,
} from "./constants";
import { UserRateShowProps } from "./types";
import { toggleChip } from "./utils";

export function useUserRateShow() {
  const { showId, showTitle, venueName } =
    useRoute<UserRateShowProps["route"]>().params;
  const navigation = useNavigation<UserRateShowProps["navigation"]>();

  const [artistRating, setArtistRating] = useState(0);
  const [venueRating, setVenueRating] = useState(0);
  const [artistChips, setArtistChips] = useState<string[]>([]);
  const [venueChips, setVenueChips] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [artistRatingError, setArtistRatingError] = useState("");

  const goBack = () => navigation.goBack();

  function toggleArtistChip(item: string) {
    setArtistChips((prev) => toggleChip(prev, item));
  }

  function toggleVenueChip(item: string) {
    setVenueChips((prev) => toggleChip(prev, item));
  }

  function setCommentText(text: string) {
    setComment(text.slice(0, MAX_COMMENT));
  }

  function clearArtistRatingError() {
    setArtistRatingError("");
  }

  async function handlePublish() {
    if (artistRating === 0) {
      setArtistRatingError(ARTIST_RATING_ERROR);
      return;
    }
    setArtistRatingError("");
    try {
      setLoading(true);
      await avaliacaoService.criarAvaliacao({
        agendamento_id: showId,
        nota_artista: artistRating,
        nota_local: venueRating,
        comentario: comment || undefined,
        tags_artista: artistChips.length > 0 ? artistChips : undefined,
        tags_local: venueChips.length > 0 ? venueChips : undefined,
      });
      Alert.alert(SUCCESS_TITLE, SUCCESS_MESSAGE, [
        { text: "OK", onPress: goBack },
      ]);
    } catch {
      Alert.alert(SUBMIT_ERROR_TITLE, SUBMIT_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  }

  return {
    showTitle,
    venueName,
    artistRating,
    setArtistRating,
    venueRating,
    setVenueRating,
    artistChips,
    venueChips,
    comment,
    setCommentText,
    loading,
    artistRatingError,
    clearArtistRatingError,
    toggleArtistChip,
    toggleVenueChip,
    handlePublish,
    handleSkip: goBack,
    goBack,
    maxComment: MAX_COMMENT,
  };
}
