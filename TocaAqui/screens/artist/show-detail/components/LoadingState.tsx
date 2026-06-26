import React from "react";
import { ActivityIndicator, View } from "react-native";
import { DS } from "../constants";
import { loadingStyles } from "../styles";

export default function LoadingState() {
  return (
    <View style={loadingStyles.container}>
      <ActivityIndicator size="large" color={DS.accent} />
    </View>
  );
}
