import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS, HIRING_INFO_TEXT } from "../constants";
import { styles } from "../styles";

export default function EstAcceptContractHiringInfoCard() {
  return (
    <View style={styles.warningCard}>
      <FontAwesome5 name="info-circle" size={16} color={DS.cyan} />
      <View style={styles.warningBody}>
        <Text style={styles.warningTitle}>SOBRE A CONTRATAÇÃO</Text>
        <Text style={styles.warningText}>{HIRING_INFO_TEXT}</Text>
      </View>
    </View>
  );
}
