import React from "react";
import { ActivityIndicator, View } from "react-native";
import { DS } from "../constants";
import { styles } from "../styles";

export default function ArtistEditBandLoadingState() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={DS.accent} />
    </View>
  );
}
