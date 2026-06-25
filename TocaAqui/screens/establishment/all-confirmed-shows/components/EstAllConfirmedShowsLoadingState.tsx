import React from "react";
import { ActivityIndicator } from "react-native";
import { DS } from "../constants";
import { styles } from "../styles";

export default function EstAllConfirmedShowsLoadingState() {
  return <ActivityIndicator color={DS.accent} style={styles.loading} />;
}
