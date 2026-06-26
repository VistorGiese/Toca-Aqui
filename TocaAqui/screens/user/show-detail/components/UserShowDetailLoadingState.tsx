import React from "react";
import { ActivityIndicator, StatusBar, View } from "react-native";
import { DS } from "../constants";
import { styles } from "../styles";

export default function UserShowDetailLoadingState() {
  return (
    <View style={styles.loadingContainer}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />
      <ActivityIndicator size="large" color={DS.accent} />
    </View>
  );
}
