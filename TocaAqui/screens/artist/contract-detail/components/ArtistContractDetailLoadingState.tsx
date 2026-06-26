import React from "react";
import { ActivityIndicator, View } from "react-native";
import { styles } from "../styles";

export default function ArtistContractDetailLoadingState() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#A78BFA" />
    </View>
  );
}
