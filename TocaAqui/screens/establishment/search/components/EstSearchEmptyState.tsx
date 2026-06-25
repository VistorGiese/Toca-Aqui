import React from "react";
import { Text } from "react-native";
import { styles } from "../styles";

export default function EstSearchEmptyState() {
  return <Text style={styles.empty}>Nenhum artista encontrado.</Text>;
}
