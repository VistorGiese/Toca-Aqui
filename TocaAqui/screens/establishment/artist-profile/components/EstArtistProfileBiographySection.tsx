import React from "react";
import { Text, View } from "react-native";
import { styles } from "../styles";

interface Props {
  biografia: string;
}

export default function EstArtistProfileBiographySection({ biografia }: Props) {
  if (!biografia) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Biografia</Text>
      <Text style={styles.bodyText}>{biografia}</Text>
    </View>
  );
}
