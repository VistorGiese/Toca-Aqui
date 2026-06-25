import React from "react";
import { ActivityIndicator } from "react-native";
import { DS } from "../constants";
import { styles } from "../styles";

export default function EstSettingsLoadingState() {
  return <ActivityIndicator color={DS.accent} style={styles.loading} />;
}
