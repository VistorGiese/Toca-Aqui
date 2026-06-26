import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "@/contexts/AuthContext";
import { contractService, Contract } from "@/http/contractService";
import { ArtistStackParamList } from "@/navigation/ArtistNavigator";

type NavProp = NativeStackNavigationProp<ArtistStackParamList, "MyContracts">;

export function useArtistMyContracts() {
  const navigation = useNavigation<NavProp>();
  const { signOut } = useAuth();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const result = await contractService.getMyContracts();
      setContracts(Array.isArray(result) ? result : []);
    } catch {
      // error handled silently
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleLogout = useCallback(() => {
    Alert.alert("Sair", "Deseja sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: signOut },
    ]);
  }, [signOut]);

  const goToContractDetail = useCallback(
    (contractId: number) => {
      navigation.navigate("ContractDetail", { contractId });
    },
    [navigation]
  );

  return {
    contracts,
    loading,
    refreshing,
    refresh: () => load(true),
    handleLogout,
    goToContractDetail,
  };
}
