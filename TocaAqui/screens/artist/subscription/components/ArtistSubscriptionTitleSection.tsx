import React from "react";
import { Text } from "react-native";
import { styles } from "../styles";

export default function ArtistSubscriptionTitleSection() {
  return (
    <>
      <Text style={styles.title}>
        Eleve sua{"\n"}
        <Text style={styles.titleAccent}>Carreira</Text>
        {"\n"}Musical
      </Text>
      <Text style={styles.subtitle}>
        Escolha o plano ideal para o seu momento e maximize suas oportunidades no Toca Aqui.
      </Text>
    </>
  );
}
