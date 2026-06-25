import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { formatPropostaValor } from "../utils";
import { styles } from "../styles";

interface Props {
  isBanda: boolean;
  contratadoLabel: string;
  artistName: string;
  valorProposto?: number;
}

export default function EstAcceptContractCandidateCard({
  isBanda,
  contratadoLabel,
  artistName,
  valorProposto,
}: Props) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoRow}>
        <View style={styles.avatar}>
          <FontAwesome5 name={isBanda ? "users" : "user"} size={22} color={DS.accent} />
        </View>
        <View style={styles.infoBody}>
          <Text style={styles.label}>{contratadoLabel}</Text>
          <Text style={styles.value}>{artistName}</Text>
        </View>
      </View>

      <View style={styles.valueSection}>
        <Text style={styles.label}>VALOR PROPOSTO</Text>
        <Text style={[styles.value, styles.valueHighlight]}>
          {formatPropostaValor(valorProposto)}
        </Text>
      </View>
    </View>
  );
}
