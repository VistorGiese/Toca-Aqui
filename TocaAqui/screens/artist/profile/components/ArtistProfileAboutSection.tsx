import React from "react";
import { Text, View } from "react-native";
import { styles } from "../styles";

interface Props {
  descricao: string;
}

export default function ArtistProfileAboutSection({ descricao }: Props) {
  if (!descricao.trim()) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Sobre o artista</Text>
      <Text style={styles.bioText}>{descricao}</Text>
    </View>
  );
}
