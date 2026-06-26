import { useCallback } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArtistStackParamList } from "@/navigation/ArtistNavigator";

type NavProp = NativeStackNavigationProp<ArtistStackParamList, "Subscription">;

export function useArtistSubscription() {
  const navigation = useNavigation<NavProp>();

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleAssinarPro = useCallback(() => {
    Alert.alert(
      "Em breve!",
      "A integração com pagamentos está sendo finalizada. Em breve você poderá assinar o plano Pro diretamente pelo app!"
    );
  }, []);

  return {
    goBack,
    handleAssinarPro,
  };
}
