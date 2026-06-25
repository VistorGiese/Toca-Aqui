import React from "react";
import { Text } from "react-native";
import { styles } from "../styles";

export default function EstGigApplicationsEmptyState() {
  return <Text style={styles.empty}>Nenhuma candidatura encontrada.</Text>;
}
