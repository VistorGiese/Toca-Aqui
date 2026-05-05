import { Alert } from "react-native";

export function showApiError(error: unknown, fallbackMessage: string): void {
  const message =
    (error as any)?.response?.data?.message ||
    (error as any)?.message ||
    fallbackMessage;
  Alert.alert("Erro", message);
}
