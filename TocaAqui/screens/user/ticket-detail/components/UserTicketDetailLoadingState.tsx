import React from "react";
import { View, StatusBar, ActivityIndicator } from "react-native";
import { DS } from "../constants";
import { styles } from "../styles";

export default function UserTicketDetailLoadingState() {
  return (
    <View style={[styles.container, styles.centered]}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />
      <ActivityIndicator size="large" color={DS.accent} />
    </View>
  );
}
