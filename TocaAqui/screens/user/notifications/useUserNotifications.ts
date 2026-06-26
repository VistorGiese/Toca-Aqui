import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";

export function useUserNotifications() {
  const navigation = useNavigation();

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  return { goBack };
}
