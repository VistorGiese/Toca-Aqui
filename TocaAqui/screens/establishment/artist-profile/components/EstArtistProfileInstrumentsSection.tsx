import React from "react";
import { Text, View } from "react-native";
import EstArtistProfileInstrumentChipList from "./EstArtistProfileInstrumentChipList";
import { styles } from "../styles";

interface Props {
  instrumentos: string[];
}

export default function EstArtistProfileInstrumentsSection({ instrumentos }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Instrumentos</Text>
      <EstArtistProfileInstrumentChipList items={instrumentos} />
    </View>
  );
}
