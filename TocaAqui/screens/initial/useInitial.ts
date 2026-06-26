import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/Navigate";

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export function useInitial() {
  const navigation = useNavigation<NavProp>();

  const goToLogin = useCallback(() => navigation.navigate("Login"), [navigation]);
  const goToRegister = useCallback(() => navigation.navigate("Register"), [navigation]);

  return { goToLogin, goToRegister };
}
