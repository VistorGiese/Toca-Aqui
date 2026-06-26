import { useCallback, useEffect, useState } from "react";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { artistService } from "@/http/artistService";
import { ArtistStackParamList } from "@/navigation/ArtistNavigator";
import { showApiError } from "@/utils/errorHandler";
import { BandDetailData } from "./types";

type NavProp = NativeStackNavigationProp<ArtistStackParamList, "BandDetail">;
type RouteType = RouteProp<ArtistStackParamList, "BandDetail">;

export function useArtistBandDetail() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { bandId } = route.params;

  const [band, setBand] = useState<BandDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBand = useCallback(async () => {
    try {
      const data = await artistService.getBandById(bandId);
      setBand(data);
    } catch (error) {
      showApiError(error, "Erro ao carregar banda.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [bandId, navigation]);

  useEffect(() => {
    loadBand();
  }, [loadBand]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const goHome = useCallback(() => {
    navigation.navigate("ArtistTabs", { screen: "ArtistHome" } as never);
  }, [navigation]);

  const goToEdit = useCallback(() => {
    if (!band) return;
    navigation.navigate("EditBand", { bandId: band.id });
  }, [band, navigation]);

  return {
    band,
    loading,
    goBack,
    goHome,
    goToEdit,
  };
}
