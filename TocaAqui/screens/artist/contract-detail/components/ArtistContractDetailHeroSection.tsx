import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  refNumber: string;
}

export default function ArtistContractDetailHeroSection({ refNumber }: Props) {
  return (
    <>
      <View style={styles.docIconContainer}>
        <View style={styles.docIconCircle}>
          <FontAwesome5 name="file-contract" size={32} color={DS.accent} />
        </View>
      </View>

      <Text style={styles.contractTitle}>Show Contratado</Text>
      <Text style={styles.contractRef}>Ref. #{refNumber}</Text>

      <View style={styles.statusBadge}>
        <FontAwesome5 name="check" size={11} color={DS.success} />
        <Text style={styles.statusBadgeText}>VOCÊ FOI CONTRATADO(A)</Text>
      </View>
    </>
  );
}
