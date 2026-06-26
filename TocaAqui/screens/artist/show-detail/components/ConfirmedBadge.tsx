import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

export default function ConfirmedBadge() {
  return (
    <View style={styles.confirmedBadge}>
      <FontAwesome5 name="check" size={12} color={DS.success} />
      <Text style={styles.confirmedBadgeText}>SHOW CONFIRMADO</Text>
    </View>
  );
}
