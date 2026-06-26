import React from "react";
import { Text } from "react-native";
import { styles } from "../styles";

interface Props {
  venueName: string;
}

export default function TitleSection({ venueName }: Props) {
  return (
    <Text style={styles.title}>
      Como foi o show em{"\n"}
      <Text style={styles.titleAccent}>{venueName}</Text>?
    </Text>
  );
}
