import React from "react";
import { ActivityIndicator, StatusBar, View } from "react-native";
import { DS } from "../constants";
import { styles } from "../styles";

export default function UserCheckoutLoadingState() {
  return (
    <View style={[styles.container, styles.centered]}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />
      <ActivityIndicator size="large" color={DS.accent} />
    </View>
  );
}
