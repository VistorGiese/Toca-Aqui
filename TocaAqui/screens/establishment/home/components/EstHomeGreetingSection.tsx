import React from "react";
import { Text, View } from "react-native";
import { styles } from "../styles";

interface Props {
  greetingName: string;
}

export default function EstHomeGreetingSection({ greetingName }: Props) {
  return (
    <View>
      <Text style={styles.greeting}>Olá, {greetingName}!</Text>
      <Text style={styles.greetingSub}>Sua agenda está movimentada esta semana.</Text>
    </View>
  );
}
