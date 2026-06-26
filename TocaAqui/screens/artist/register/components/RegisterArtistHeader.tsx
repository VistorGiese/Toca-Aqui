import React from "react";
import { Text } from "react-native";
import { styles } from "../styles";

export default function RegisterArtistHeader() {
  return (
    <>
      <Text style={styles.title}>
        CRIAR CONTA{"\n"}
        <Text style={styles.titleAccent}>ARTISTA</Text>
      </Text>
      <Text style={styles.subtitle}>Preencha seus dados para começar</Text>
    </>
  );
}
