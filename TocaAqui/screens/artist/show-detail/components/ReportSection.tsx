import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  onPress: () => void;
}

export default function ReportSection({ onPress }: Props) {
  return (
    <TouchableOpacity style={styles.btnReportar} onPress={onPress} activeOpacity={0.8}>
      <FontAwesome5 name="exclamation-triangle" size={14} color={DS.danger} />
      <Text style={styles.btnReportarText}>REPORTAR PROBLEMA</Text>
    </TouchableOpacity>
  );
}
