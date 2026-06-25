import React from "react";
import { Text } from "react-native";
import { styles } from "../styles";

export default function EstAllConfirmedShowsEmptyState() {
  return <Text style={styles.emptyText}>Nenhum show confirmado.</Text>;
}
