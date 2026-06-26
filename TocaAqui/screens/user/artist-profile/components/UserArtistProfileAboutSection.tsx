import React from "react";
import { Text, View } from "react-native";
import { styles } from "../styles";

interface Props {
  biografia?: string;
}

export default function UserArtistProfileAboutSection({ biografia }: Props) {
  if (!biografia?.trim()) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Sobre</Text>
      <Text style={styles.bodyText}>{biografia}</Text>
    </View>
  );
}
