import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles";

interface Props {
  message: string;
  onRetry: () => void;
  onBack: () => void;
}

export default function UserEditProfileErrorState({ message, onRetry, onBack }: Props) {
  return (
    <View style={styles.centered}>
      <Text style={styles.errorTitle}>Não foi possível carregar</Text>
      <Text style={styles.errorText}>{message}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.85}>
        <Text style={styles.retryBtnText}>TENTAR NOVAMENTE</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backLink} onPress={onBack}>
        <Text style={styles.backLinkText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}
