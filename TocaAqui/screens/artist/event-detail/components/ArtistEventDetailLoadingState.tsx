import React from "react";
import { ActivityIndicator, View } from "react-native";
import { styles } from "../styles";

export default function ArtistEventDetailLoadingState() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#6C5CE7" />
    </View>
  );
}
