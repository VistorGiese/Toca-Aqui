import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { CANCELLATION_CLAUSE_TEXT, DS } from "../constants";
import { styles } from "../styles";

export default function EstShowDetailCancellationClause() {
  return (
    <View style={styles.clauseCard}>
      <FontAwesome5 name="exclamation-triangle" size={14} color={DS.danger} />
      <View style={{ flex: 1 }}>
        <Text style={styles.clauseTitle}>CLÁUSULA DE CANCELAMENTO</Text>
        <Text style={styles.clauseText}>{CANCELLATION_CLAUSE_TEXT}</Text>
      </View>
    </View>
  );
}
