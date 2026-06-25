import React from "react";
import { Text } from "react-native";
import { EMPTY_MESSAGE } from "../constants";
import { styles } from "../styles";

export default function EstSettingsEmptyState() {
  return <Text style={styles.empty}>{EMPTY_MESSAGE}</Text>;
}
