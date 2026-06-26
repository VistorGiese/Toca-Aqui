import React from "react";
import { Text, View } from "react-native";
import { styles } from "../styles";

export default function UserTicketsHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.headerTitle}>Meus ingressos</Text>
        <Text style={styles.headerSubtitle}>
          Gerencie suas experiências e prepare-se para o show.
        </Text>
      </View>
    </View>
  );
}
