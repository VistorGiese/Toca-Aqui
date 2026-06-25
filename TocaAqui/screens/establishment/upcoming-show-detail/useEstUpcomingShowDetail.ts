import { useMemo } from "react";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { resolveImageUrl } from "@/utils/adapters";
import { EstUpcomingShowDisplay } from "./types";
import { formatHorario, formatShowDateLong } from "./utils";

type NavProp = NativeStackNavigationProp<EstStackParamList, "EstUpcomingShowDetail">;
type RouteType = RouteProp<EstStackParamList, "EstUpcomingShowDetail">;

export function useEstUpcomingShowDetail() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { nomeEvento, nomeArtista, fotoArtista, horarioInicio, horarioFim, dataShow } =
    route.params;

  const display = useMemo<EstUpcomingShowDisplay>(
    () => ({
      nomeEvento,
      nomeArtista: nomeArtista ?? "",
      fotoUrl: resolveImageUrl(fotoArtista),
      horario: formatHorario(horarioInicio, horarioFim),
      data: formatShowDateLong(dataShow),
    }),
    [nomeEvento, nomeArtista, fotoArtista, horarioInicio, horarioFim, dataShow]
  );

  return {
    display,
    goBack: () => navigation.goBack(),
  };
}
