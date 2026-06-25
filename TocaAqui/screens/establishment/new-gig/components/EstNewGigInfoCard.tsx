import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

export default function EstNewGigInfoCard() {
  return (
    <View style={styles.infoCard}>
      <FontAwesome5 name="rocket" size={16} color={DS.accent} style={styles.infoIcon} />
      <Text style={styles.infoText}>
        Com base no seu perfil e filtros selecionados, esta data será notificada para artistas
        qualificados na sua região.
      </Text>
    </View>
  );
}
