import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { bandApplicationService } from "@/http/bandApplicationService";
import { artistaPublicoService } from "@/http/artistaPublicoService";
import { useAuth } from "@/contexts/AuthContext";
import { ArtistStackParamList } from "@/navigation/ArtistNavigator";
import { SUCCESS_MESSAGE, SUCCESS_TITLE } from "./constants";
import { ApplyFormErrors, ApplyProfilePreview, ApplySummaryDisplay } from "./types";
import {
  formatArtistLocation,
  getApiErrorMessage,
  getFirstName,
  validateApplyForm,
} from "./utils";

type NavProp = NativeStackNavigationProp<ArtistStackParamList>;
type RouteType = RouteProp<ArtistStackParamList, "ApplyConfirmation">;

export function useArtistApplyConfirmation() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { eventId, eventName, date, time, cache } = route.params;
  const { user } = useAuth();

  const [mensagem, setMensagem] = useState("");
  const [valorProposto, setValorProposto] = useState("");
  const [loading, setLoading] = useState(false);
  const [mediaArtista, setMediaArtista] = useState(0);
  const [cidadeArtista, setCidadeArtista] = useState("");
  const [errors, setErrors] = useState<ApplyFormErrors>({});

  useEffect(() => {
    if (!user?.perfilArtistaId) return;
    artistaPublicoService
      .getPerfilPublico(user.perfilArtistaId)
      .then((profile) => {
        setMediaArtista(profile.media_nota ?? 0);
        setCidadeArtista(formatArtistLocation(profile.cidade, profile.estado));
      })
      .catch(() => {});
  }, [user?.perfilArtistaId]);

  const summary = useMemo<ApplySummaryDisplay>(
    () => ({ eventName, date, time, cache }),
    [eventName, date, time, cache]
  );

  const profilePreview = useMemo<ApplyProfilePreview>(
    () => ({
      nome: user?.nome_completo || "Artista",
      mediaArtista,
      cidadeArtista: cidadeArtista || "Brasil",
    }),
    [user?.nome_completo, mediaArtista, cidadeArtista]
  );

  const messagePlaceholder = useMemo(
    () => `Olá! Sou ${getFirstName(user?.nome_completo)} e gostaria de me candidatar para este show...`,
    [user?.nome_completo]
  );

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const updateMensagem = useCallback((value: string) => {
    setErrors((prev) => ({ ...prev, mensagem: undefined }));
    setMensagem(value);
  }, []);

  const updateValorProposto = useCallback((value: string) => {
    setErrors((prev) => ({ ...prev, valorProposto: undefined }));
    setValorProposto(value);
  }, []);

  const submit = useCallback(async () => {
    const { errors: nextErrors, valorNum } = validateApplyForm(mensagem, valorProposto);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      await bandApplicationService.applyToEvent({
        evento_id: eventId,
        mensagem: mensagem.trim(),
        valor_proposto: valorNum!,
      });

      Alert.alert(SUCCESS_TITLE, SUCCESS_MESSAGE, [
        { text: "OK", onPress: () => navigation.popToTop() },
      ]);
    } catch (err) {
      Alert.alert("Erro", getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [eventId, mensagem, navigation, valorProposto]);

  return {
    summary,
    profilePreview,
    mensagem,
    valorProposto,
    messagePlaceholder,
    errors,
    loading,
    goBack,
    updateMensagem,
    updateValorProposto,
    submit,
  };
}
