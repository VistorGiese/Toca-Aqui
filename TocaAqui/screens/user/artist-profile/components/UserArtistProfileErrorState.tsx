import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles";

interface Props {
  onBack: () => void;
}

export default function UserArtistProfileErrorState({ onBack }: Props) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Artista não encontrado.</Text>
      <TouchableOpacity style={styles.errorBackBtn} onPress={onBack}>
        <Text style={styles.errorBackBtnText}>VOLTAR</Text>
      </TouchableOpacity>
    </View>
  );
}
