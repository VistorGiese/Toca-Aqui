import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

export default function EstGigsEmptyState() {
  return (
    <View style={styles.empty}>
      <FontAwesome5 name="inbox" size={32} color={DS.border} />
      <Text style={styles.emptyText}>Criar nova oportunidade</Text>
    </View>
  );
}
