import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

export default function UserNotificationsEmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <FontAwesome5 name="bell-slash" size={40} color={DS.textDis} />
      <Text style={styles.emptyText}>Nenhuma notificação por enquanto.</Text>
    </View>
  );
}
