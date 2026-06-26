import { useCallback } from "react";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArtistStackParamList } from "@/navigation/ArtistNavigator";
import { resolveImageUrl } from "@/utils/adapters";
import { UpcomingShowDisplay } from "./types";
import { formatHorario, formatShowDate } from "./utils";

type NavProp = NativeStackNavigationProp<ArtistStackParamList>;
type RouteType = RouteProp<ArtistStackParamList, "ArtistUpcomingShowDetail">;

export function useArtistUpcomingShowDetail() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { nomeEvento, nomeArtista, fotoArtista, horarioInicio, horarioFim, dataShow } = route.params;

  const display: UpcomingShowDisplay = {
    nomeEvento,
    nomeArtista,
    fotoArtista,
    horarioInicio,
    horarioFim,
    dataShow,
    horario: formatHorario(horarioInicio, horarioFim),
    data: formatShowDate(dataShow),
    fotoUrl: resolveImageUrl(fotoArtista),
  };

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return { display, goBack };
}
