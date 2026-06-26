import React from "react";
import { Text, View } from "react-native";
import { GREETING_SUBTEXT } from "../constants";
import { styles } from "../styles";

interface Props {
  greetingName: string;
}

export default function ArtistHomeGreetingSection({ greetingName }: Props) {
  return (
    <View style={styles.greetingBlock}>
      <Text style={styles.greetingText}>Bem-vindo de volta,</Text>
      <Text style={styles.greetingName}>{greetingName}</Text>
      <Text style={styles.greetingSub}>{GREETING_SUBTEXT}</Text>
    </View>
  );
}
