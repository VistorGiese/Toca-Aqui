import React from "react";
import { Text, View } from "react-native";
import { styles } from "../styles";

interface Props {
  description: string;
}

export default function UserShowDetailAboutSection({ description }: Props) {
  if (!description) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Sobre o show</Text>
      <Text style={styles.aboutText}>{description}</Text>
    </View>
  );
}
