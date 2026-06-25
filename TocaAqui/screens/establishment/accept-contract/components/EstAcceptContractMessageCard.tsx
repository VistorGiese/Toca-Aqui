import React from "react";
import { Text, View } from "react-native";
import { styles } from "../styles";

interface Props {
  message: string;
}

export default function EstAcceptContractMessageCard({ message }: Props) {
  return (
    <View style={styles.messageCard}>
      <Text style={styles.label}>MENSAGEM DO CANDIDATO</Text>
      <Text style={styles.messageText}>{message}</Text>
    </View>
  );
}
