import React from "react";
import { Text, View } from "react-native";
import { styles } from "../styles";

export default function ArtistAllConfirmedShowsEmptyState() {
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyText}>Nenhum show confirmado.</Text>
    </View>
  );
}
