import React from "react";
import { Text, View } from "react-native";
import { styles } from "../styles";

interface Props {
  telefone: string;
}

export default function UserEstablishmentProfileContactSection({ telefone }: Props) {
  if (!telefone) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Contato</Text>
      <Text style={styles.description}>{telefone}</Text>
    </View>
  );
}
