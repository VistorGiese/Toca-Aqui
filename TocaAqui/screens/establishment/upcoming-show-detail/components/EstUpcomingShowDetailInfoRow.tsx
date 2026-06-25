import React from "react";
import { Text, View } from "react-native";
import { styles } from "../styles";

interface Props {
  label: string;
  value: string;
}

export default function EstUpcomingShowDetailInfoRow({ label, value }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}
