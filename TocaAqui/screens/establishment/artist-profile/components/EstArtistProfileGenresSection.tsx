import React from "react";
import { Text, View } from "react-native";
import EstArtistProfileChipList from "./EstArtistProfileChipList";
import { styles } from "../styles";

interface Props {
  generos: string[];
}

export default function EstArtistProfileGenresSection({ generos }: Props) {
  if (generos.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Gêneros musicais</Text>
      <EstArtistProfileChipList items={generos} />
    </View>
  );
}
