import { Alert } from "react-native";

export function confirmDeleteAccount(onConfirm: () => void) {
  Alert.alert(
    "Excluir conta",
    "Esta ação é irreversível. Todos os seus dados serão perdidos. Deseja continuar?",
    [
      { text: "Cancelar", style: "cancel" },
      { text: "Continuar", style: "destructive", onPress: onConfirm },
    ]
  );
}
