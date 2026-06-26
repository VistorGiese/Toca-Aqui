import { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { bandService } from "@/http/bandService";
import { ArtistStackParamList } from "@/navigation/ArtistNavigator";
import { Band } from "./types";

type NavProp = NativeStackNavigationProp<ArtistStackParamList>;

export function useArtistMyBands() {
  const navigation = useNavigation<NavProp>();

  const [bands, setBands] = useState<Band[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBands = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await bandService.getMyBands();
      setBands(Array.isArray(data) ? data : []);
    } catch {
      // error handled silently
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBands();
    }, [fetchBands])
  );

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const goToCreateBand = useCallback(() => {
    navigation.navigate("CreateBand");
  }, [navigation]);

  const goToBandDetail = useCallback(
    (bandId: number) => {
      navigation.navigate("BandDetail", { bandId });
    },
    [navigation]
  );

  const refresh = useCallback(() => {
    fetchBands(true);
  }, [fetchBands]);

  return {
    bands,
    loading,
    refreshing,
    goBack,
    goToCreateBand,
    goToBandDetail,
    refresh,
  };
}
