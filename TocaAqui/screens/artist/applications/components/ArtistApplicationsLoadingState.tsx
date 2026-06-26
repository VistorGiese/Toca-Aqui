import React from "react";
import { ActivityIndicator, View } from "react-native";
import { DS } from "../constants";
import { styles } from "../styles";

export default function ArtistApplicationsLoadingState() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#A78BFA" />
    </View>
  );
}
