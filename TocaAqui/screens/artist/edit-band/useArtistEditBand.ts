import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useForm } from "react-hook-form";
import { artistService } from "@/http/artistService";
import { bandService } from "@/http/bandService";
import { ArtistStackParamList } from "@/navigation/ArtistNavigator";
import { showApiError } from "@/utils/errorHandler";
import { DELETE_ALERT } from "./constants";
import { EditBandForm } from "./types";
import { toggleGenreSelection } from "./utils";

type NavProp = NativeStackNavigationProp<ArtistStackParamList, "EditBand">;
type RouteType = RouteProp<ArtistStackParamList, "EditBand">;

export function useArtistEditBand() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { bandId } = route.params;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [generosError, setGenerosError] = useState("");

  const { control, handleSubmit, setValue } = useForm<EditBandForm>({
    mode: "onTouched",
  });

  const loadBand = useCallback(async () => {
    try {
      const band = await artistService.getBandById(bandId);
      setValue("nome_banda", band.nome_banda);
      setValue("descricao", band.descricao || "");
      setSelectedGenres(band.generos_musicais || []);
    } catch (error) {
      showApiError(error, "Erro ao carregar banda.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [bandId, navigation, setValue]);

  useEffect(() => {
    loadBand();
  }, [loadBand]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const goHome = useCallback(() => {
    navigation.navigate("ArtistTabs", { screen: "ArtistHome" } as never);
  }, [navigation]);

  const toggleGenre = useCallback((genre: string) => {
    setGenerosError("");
    setSelectedGenres((prev) => toggleGenreSelection(prev, genre));
  }, []);

  const onSubmit = useCallback(
    async (data: EditBandForm) => {
      if (selectedGenres.length === 0) {
        setGenerosError("Selecione pelo menos um gênero");
        return;
      }
      setGenerosError("");

      setIsSubmitting(true);
      try {
        await bandService.updateBand(bandId, {
          nome_banda: data.nome_banda,
          descricao: data.descricao || undefined,
          generos_musicais: selectedGenres,
        });
        navigation.goBack();
      } catch (error) {
        showApiError(error, "Erro ao atualizar banda.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [bandId, navigation, selectedGenres]
  );

  const handleDelete = useCallback(() => {
    Alert.alert(DELETE_ALERT.title, DELETE_ALERT.message, [
      { text: DELETE_ALERT.cancel, style: "cancel" },
      {
        text: DELETE_ALERT.confirm,
        style: "destructive",
        onPress: async () => {
          try {
            await bandService.deleteBand(bandId);
            navigation.goBack();
          } catch (error) {
            showApiError(error, "Erro ao excluir banda.");
          }
        },
      },
    ]);
  }, [bandId, navigation]);

  return {
    control,
    handleSubmit,
    loading,
    isSubmitting,
    selectedGenres,
    generosError,
    goBack,
    goHome,
    toggleGenre,
    onSubmit,
    handleDelete,
  };
}
