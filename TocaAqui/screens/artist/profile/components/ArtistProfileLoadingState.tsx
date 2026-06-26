import React from "react";
import { ActivityIndicator, View } from "react-native";
import { styles } from "../styles";

export default function ArtistProfileLoadingState() {
  return (
    <View style={[styles.root, styles.loading]}>
      <ActivityIndicator size="large" color="#7B61FF" />
    </View>
  );
}
