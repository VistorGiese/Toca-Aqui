import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

export default function ArtistMyContractsEmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <FontAwesome5 name="file-contract" size={52} color={DS.textDis} />
      <Text style={styles.emptyTitle}>Sem contratos</Text>
      <Text style={styles.emptyText}>
        Seus contratos aparecerão aqui quando suas candidaturas forem aceitas
      </Text>
    </View>
  );
}
