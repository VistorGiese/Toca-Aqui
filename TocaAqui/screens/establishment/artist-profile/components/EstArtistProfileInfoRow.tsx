import React from "react";
import { Text, View } from "react-native";
import { styles } from "../styles";

interface Props {
  label: string;
  value: string;
}

export default function EstArtistProfileInfoRow({ label, value }: Props) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}
