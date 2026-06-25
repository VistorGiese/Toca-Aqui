import React from "react";
import { ActivityIndicator, View } from "react-native";
import { DS } from "../constants";
import { styles } from "../styles";

export default function EstShowDetailLoadingState() {
  return (
    <View style={[styles.root, styles.center]}>
      <ActivityIndicator size="large" color={DS.accent} />
    </View>
  );
}
