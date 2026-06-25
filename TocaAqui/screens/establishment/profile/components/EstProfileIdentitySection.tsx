import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DS } from "../constants";
import { EstProfileDisplayData } from "../types";
import { styles } from "../styles";

interface Props {
  display: Pick<
    EstProfileDisplayData,
    "nome" | "tipoLabel" | "localizacao" | "telefone" | "isActive"
  >;
}

export default function EstProfileIdentitySection({ display }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.nameRow}>
        <Text style={styles.name}>{display.nome.toUpperCase()}</Text>
        <View style={[styles.dot, display.isActive ? styles.dotGreen : styles.dotRed]} />
      </View>
      <Text style={styles.tipoLabel}>{display.tipoLabel}</Text>
      {display.localizacao ? (
        <View style={styles.row}>
          <Ionicons name="location-outline" size={13} color={DS.textSecondary} />
          <Text style={styles.locationText}>{display.localizacao}</Text>
        </View>
      ) : null}
      {display.telefone ? (
        <View style={styles.row}>
          <Ionicons name="call-outline" size={13} color={DS.textSecondary} />
          <Text style={styles.locationText}>{display.telefone}</Text>
        </View>
      ) : null}
    </View>
  );
}
