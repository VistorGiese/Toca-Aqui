import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

export default function ArtistNotificationsEmptyState() {
  return (
    <View style={styles.emptyWrap}>
      <FontAwesome5 name="bell-slash" size={36} color={DS.textMuted} />
      <Text style={styles.emptyText}>Nenhuma notificação por enquanto.</Text>
    </View>
  );
}
