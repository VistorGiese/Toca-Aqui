import React from "react";
import { Text } from "react-native";
import { styles } from "../styles";

interface Props {
  description: string;
}

export default function ArtistEventDetailDescriptionSection({ description }: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>Descrição</Text>
      <Text style={styles.descriptionText}>{description}</Text>
    </>
  );
}
